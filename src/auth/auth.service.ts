import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { FreshTokens } from 'src/types/fresh-tokens.interface';
import {
  AccessTokenPayload,
  AccessTokenUserPayload,
  TokenType,
} from 'src/types/type';
import { Cache } from 'cache-manager';
import { REDIS_CACHE } from 'src/redis.module';
import tokenConfig from 'src/config/token.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REDIS_CACHE)
    private cacheManager: Cache,
    @Inject(tokenConfig.KEY)
    private tokenOpts: ConfigType<typeof tokenConfig>,
    private readonly jwtService: JwtService, // private readonly configService: ConfigService,
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
      secret: this.tokenOpts.refresh.secret,
      expiresIn: this.tokenOpts.refresh.expiresIn,
      issuer: 'dorito',
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
      secret: this.tokenOpts.access.secret,
      expiresIn: this.tokenOpts.access.expiresIn,
      issuer: 'dorito',
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
    const refreshTokenPayload = this.jwtService.decode(refreshToken) as any;
    // get refresh token's state from redis
    const refreshTokenState: any = await this.cacheManager.get(
      refreshTokenPayload.jti,
    );

    const oldAccessTokenPayload: AccessTokenPayload = this.jwtService.verify(
      expiredToken,
      {
        secret: this.tokenOpts.access.secret,
        ignoreExpiration: true,
      },
    );

    const isMatchedToken =
      oldAccessTokenPayload.refreshTokenId === refreshTokenPayload.jti;

    if (refreshTokenState?.isActive && isMatchedToken) {
      const newAccessTokenUserPayload: AccessTokenUserPayload = {
        userId: oldAccessTokenPayload.userId,
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

  async setTokenAndIdToRedis(payload: FreshTokens) {
    //namespace: access token redis bucket
    // key: access token jit
    // value: isAcive boolean
    await this.cacheManager.set(
      `accessToken-jit:${payload.accessToken.jti}`,
      {
        isActive: true,
      },
      this.tokenOpts.access.expiresIn,
    );

    await this.cacheManager.set(
      `refreshToken-jit:${payload.refreshToken.jti}`,
      {
        isActive: true,
      },
      this.tokenOpts.refresh.expiresIn,
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
        tokenIds: [refreshTokenId],
      },
      this.tokenOpts.refresh.expiresIn,
    );
  }

  async getStatusOfTokenByTokenIdFromRedis(tokenType: TokenType, jti: string) {
    return this.cacheManager.get(`${tokenType}Token-jit:${jti}`);
  }

  async getRefreshTokenIdsByUserIdFromRedis(userId: string): Promise<string> {
    return this.cacheManager.get(`loggedInUser:${userId}`);
  }

  async validateAccessTokenWithStatus(
    decoded: AccessTokenPayload,
  ): Promise<boolean> {
    // access 토큰의 refresh 토큰이 아직 살아있는지 체크함
    // 레디스에서 access 토큰 상태를 확인하고 리턴함
    // 만약 레디스 내 access 토큰이 저장되어있지 않으면 -> 401 Forbidden 에러

    const refreshTokenActiveState: any =
      await this.getStatusOfTokenByTokenIdFromRedis(
        'refresh',
        decoded.refreshTokenId,
      );

    if (refreshTokenActiveState?.isAcive) {
      const accessTokenActiveState: any =
        await this.getStatusOfTokenByTokenIdFromRedis('access', decoded.jti);
      return accessTokenActiveState.isAcive;
    }
    return false;
  }

  async dropRefreshTokenAndStatusFromRedis(jti: string) {
    await this.cacheManager.del(`refreshToken-jit:${jti}`);
  }

  // revoke all of user's refresh tokens
  async revokeRefreshTokensAtRedis(userId: string) {
    // value ~ tokens: [refreshTokenId],
    const refreshTokenList: any =
      await this.getRefreshTokenIdsByUserIdFromRedis(`loggedInUser:${userId}`);
    const refreshTokenIds = refreshTokenList.tokenIds;
    for (let refreshTokenId of refreshTokenIds) {
      await this.dropRefreshTokenAndStatusFromRedis(refreshTokenId);
    }
  }
}
