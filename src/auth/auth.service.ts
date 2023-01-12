import {
  CACHE_MANAGER,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { CookieOptions } from 'express';
import { User } from 'src/entities/user.entity';
import {
  AccessCookieConfig,
  RefreshCookieConfig,
} from 'src/types/cookie-config.interface';
import { Repository } from 'typeorm';
import { LoginRequestUserDto } from './dto/login-request.dto';
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import { FreshTokens } from 'src/types/fresh-tokens.interface';
import {
  AccessTokenPayload,
  AccessTokenUserPayload,
  RefreshTokenPayload,
  TokenRedisState,
  TokenType,
} from 'src/types/type';
import { Cache } from 'cache-manager';
import { json } from 'stream/consumers';
import { redisPayload } from 'src/types/redis.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  private async generateRefreshToken(payload: AccessTokenUserPayload) {
    // include the necessary data in the token payload
    const refreshTokenPayload = {
      userId: payload.userId,
      tokenType: 'refresh',
    };

    // generate a unique identifier for this refresh token
    const jti = uuidv4();
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: ms(
        this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRES_IN'),
      ),
      issuer: 'dorito',
      audience: [this.configService.get<string>('FRONTEND_URL')],
      jwtid: jti,
    });
    return {
      token: refreshToken,
      jti,
    };
  }

  private async generateAccessToken(
    payload: AccessTokenUserPayload,
    refreshTokenId: string,
  ) {
    // used to revoke individual tokens
    const jti = uuidv4();
    const accessTokenPayload = {
      ...payload,
      refreshTokenId,
      tokenType: 'access',
    };
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: ms(
        this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      ),
      issuer: 'dorito',
      audience: [this.configService.get<string>('FRONTEND_URL')],
      jwtid: jti,
    });
    return {
      token: accessToken,
      jti,
    };
  }

  async generateTokens(payload: AccessTokenUserPayload): Promise<FreshTokens> {
    const refreshToken = await this.generateRefreshToken(payload);
    const accessToken = await this.generateAccessToken(
      payload,
      refreshToken.jti,
    );
    return {
      accessToken,
      refreshToken,
    };
  }
  // check if the refresh token has the same id as the refreshTokenId field in the decoded access token.
  async reissueAccessToken(expiredToken: string, refreshToken: string) {
    const refreshTokenPayload = this.jwtService.decode(
      refreshToken,
    ) as RefreshTokenPayload;
    // get refresh token's state from redis
    const refreshTokenState: redisPayload = await this.cacheManager.get(
      refreshTokenPayload.jti,
    );

    const oldAccessTokenPayload: AccessTokenPayload = this.jwtService.verify(
      expiredToken,
      {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        ignoreExpiration: true,
      },
    );

    const isMatchedToken =
      oldAccessTokenPayload.refreshTokenId === refreshTokenPayload.jti;

    if (refreshTokenState?.isActive && isMatchedToken) {
      const newAccessTokenUserPayload: AccessTokenUserPayload = {
        userId: oldAccessTokenPayload.userId,
        isVerified: oldAccessTokenPayload.isVerified,
        username: oldAccessTokenPayload.username,
      };
      const newAccessToken = this.generateAccessToken(
        newAccessTokenUserPayload,
        refreshTokenPayload.jti,
      );
      return {
        status: 'success',
        data: newAccessToken,
      };
    }
    return {
      status: 'fail',
      message: 'Invalid token',
      code: HttpStatus.NOT_ACCEPTABLE,
      errors: [],
    };
  }

  async setAccessTokenAndIdToRedis(payload: any) {
    //namespace: access token redis bucket
    // key: access token jit
    // value: isAcive boolean
    this.cacheManager.set(
      `accessToken-jit:${payload.accessToken.jit}`,
      {
        isActive: true,
      },
      ms(this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET_EXPIRES_IN')) /
        1000,
    );
  }

  // 레디스 관련 로직
  async setRefreshTokenAndIdToRedis(payload: any) {
    //namespace: refresh token redis bucket
    // key: refresh token jit
    // value: isAcive boolean
    this.cacheManager.set(
      `refreshToken-jit:${payload.refreshToken.jit}`,
      {
        isActive: true,
      },
      ms(
        this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET_EXPIRES_IN'),
      ) / 1000,
    );
  }

  async setUserAndRefreshTokenIdToRedis(
    userId: string,
    refreshTokenId: string,
  ) {
    //namespace: loggedInUserToBucket
    // key: userId
    // value: {tokens: [refreshTokenId]}
    this.cacheManager.set(
      `loggedInUser:${userId}`,
      {
        tokens: [refreshTokenId],
      },
      ms(
        this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET_EXPIRES_IN'),
      ) / 1000,
    );
  }

  async getStatusOfTokenFromRedis(tokenType: TokenType, jti: string) {
    return this.cacheManager.get(`${tokenType}Token-jit:${jti}`);
  }

  async getRefreshTokensIdByUserIdRedis(userId: string): Promise<string> {
    return this.cacheManager.get(userId);
  }

  async validateAccessTokenWithStatus(decoded: AccessTokenPayload) {
    // access 토큰의 refresh 토큰이 아직 살아있는지 체크함
    // 레디스에서 access 토큰 상태를 확인하고 리턴함
    // 만약 레디스 내 access 토큰이 저장되어있지 않으면 -> 401 Forbidden 에러

    const refreshTokenActiveState: any = await this.getStatusOfTokenFromRedis(
      'refresh',
      decoded.refreshTokenId,
    );

    if (refreshTokenActiveState?.isAcive) {
      const accessTokenActiveState: any = await this.getStatusOfTokenFromRedis(
        'access',
        decoded.jti,
      );
      return { isValid: accessTokenActiveState.isAcive };
    }
    return { isValid: false };
  }
}
