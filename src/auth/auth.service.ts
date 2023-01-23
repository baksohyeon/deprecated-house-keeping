import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotAcceptableException,
} from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import {
  AccessTokenPayload,
  FreshTokens,
  RefreshTokenPayload,
  Token,
  TokenPayload,
  TokenType,
} from 'src/interfaces/tokens.interface';

import { Cache } from 'cache-manager';
import { REDIS_CACHE } from 'src/auth/redis/redis.module';
import tokenConfig from 'src/config/token.config';
import { ReissuedTokenResult } from 'src/interfaces/reissued-token-result';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(tokenConfig.KEY)
    private readonly tokenOpts: ConfigType<typeof tokenConfig>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  private async generateRefreshToken(userId: string) {
    // include the necessary data in the token payload
    const refreshTokenPayload = {
      userId: userId,
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

  private async generateAccessToken(userId: string, refreshTokenId: string) {
    // used to revoke individual tokens
    const jti = uuidv4();
    const accessTokenPayload = {
      userId,
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

  async generateTokens(userId: string): Promise<FreshTokens> {
    const refreshToken = await this.generateRefreshToken(userId);
    const accessToken = await this.generateAccessToken(
      userId,
      refreshToken.jti,
    );
    return {
      accessToken,
      refreshToken,
    };
  }
  // check if the refresh token has the same id as the refreshTokenId field in the decoded access token.
  async reissueAccessToken(
    expiredToken: string,
    refreshToken: string,
  ): Promise<ReissuedTokenResult> {
    try {
      const refreshTokenPayload: RefreshTokenPayload = this.jwtService.verify(
        refreshToken,
        {
          secret: this.tokenOpts.refresh.secret,
        },
      );
      // get refresh token's state from redis
      const oldAccessTokenPayload: AccessTokenPayload = this.jwtService.verify(
        expiredToken,
        {
          secret: this.tokenOpts.access.secret,
          ignoreExpiration: true,
        },
      );
      const userId = oldAccessTokenPayload.userId;

      const isAcceptableRefreshToken =
        await this.checkNotExistAndSaveAccessToken(
          userId,
          refreshTokenPayload.jti,
        );

      const isMatchedTokenWithJti =
        oldAccessTokenPayload.refreshTokenId === refreshTokenPayload.jti;

      // 만약 해당 refresh 토큰 상태 isActive 가 true 이고,
      // access 토큰에 적힌 refrsh 고유 번호와 해당 refresh 토큰 고유 id끼리 같을 경우 새 토큰들 발급
      // 해당 access token 과 refresh 토큰의 isActive 는 false 로 바꾼다.
      if (isAcceptableRefreshToken && isMatchedTokenWithJti) {
        const freshTokens = await this.generateTokens(userId);

        return {
          statusCode: HttpStatus.ACCEPTED,
          message: 'access token is reissued',
          userId,
          reissuedTokens: freshTokens,
        };
      }
    } catch (e) {
      return {
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: 'Invalid token',
      };
    }
  }

  private async setBlackListAccessToken(token: Token, userId: string) {
    await this.redisService.save(
      `userId:${userId}:accessToken-jti${token.jti}`,

      false,
      this.tokenOpts.access.expiresIn,
    );
  }

  async setWhiteListRefreshToken(token: Token, userId: string) {
    // key: refresh token - jti
    // value: { isAcive boolean }
    await this.redisService.save(
      `userId:${userId}:refreshToken-jti${token.jti}`,

      true,
      this.tokenOpts.refresh.expiresIn,
    );
  }

  async checkExistAndDeleteRefreshToken(userId: string, jti: string) {
    // 레디스에 존재하지 않는 경우 인증 오류 발생 (whitelist)
    // 레디스에 존재하는 경우 레디스에서 삭제
    const redisKey = `userId:${userId}:refreshToken-jti:${jti}`;
    const isExists = await this.redisService.getValue<boolean>(redisKey);
    if (!isExists) {
      throw new NotAcceptableException('유효하지 않은 리프레시 토큰입니다.');
    }
    await this.redisService.delete(redisKey);

    return isExists;
  }

  async checkNotExistAndSaveAccessToken(userId: string, jti: string) {
    // 레디스에 존재하는 경우 인증 오류 발생 (blacklist)
    // 레디스에 존재하지 않는 경우 레디스에 저장
    const redisKey = `userId:${userId}:accessToken-jti:${jti}`;
    const isExists = await this.redisService.getValue<boolean>(redisKey);
    if (isExists) {
      throw new NotAcceptableException('유효하지 않은 액세스 토큰입니다.');
    }

    await this.redisService.save(
      redisKey,
      false,
      this.tokenOpts.access.expiresIn,
    );

    return isExists;
  }

  async dropRefreshTokenAndStatus(jti: string) {
    await this.redisService.delete(`refreshToken-jti:${jti}`);
  }

  // revoke all of user's refresh tokens
  async revokeEveryTokenByUser(userId: string): Promise<void> {
    const pattern = `userId:${userId}*`;
    await this.redisService.deleteByKeys(pattern);
  }
}
