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
  Tokens,
  TokenType,
} from 'src/interfaces/tokens.interface';

import { Cache } from 'cache-manager';
import { REDIS_CACHE } from 'src/module/redis/redis.module';
import tokenConfig from 'src/config/token.config';
import { ReissuedTokenResult } from 'src/interfaces/reissued-token-result';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(tokenConfig.KEY)
    private readonly tokenOpts: ConfigType<typeof tokenConfig>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async generateTokensAndSaveToRedis(userId: string): Promise<Tokens> {
    const refreshToken = await this.generateRefreshToken(userId);
    const accessToken = await this.generateAccessToken(
      userId,
      refreshToken.jti,
    );
    await this.setWhiteListRefreshToken(userId, refreshToken.jti);
    return {
      accessToken: accessToken.encoded,
      refreshToken: refreshToken.encoded,
    };
  }
  // check if the refresh token has the same id as the refreshTokenId field in the decoded access token.
  async reissueTokensAndSaveToRedis(
    expiredToken: string,
    refreshToken: string,
    userId: string,
  ): Promise<ReissuedTokenResult> {
    try {
      const isValidTokens = await this.validateTokens(
        expiredToken,
        refreshToken,
        userId,
      );
      if (isValidTokens) {
        const freshTokens: Tokens = await this.generateTokensAndSaveToRedis(
          userId,
        );

        return {
          statusCode: HttpStatus.ACCEPTED,
          message: 'tokens are reissued',
          userId,
          reissuedTokens: freshTokens,
        };
      }
    } catch (e) {
      return {
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: e.message,
      };
    }
  }

  // revoke all of user's refresh tokens
  async revokeEveryTokenByUser(userId: string): Promise<void> {
    const pattern = `userId:${userId}*`;
    await this.redisService.deleteByKeys(pattern);
  }

  private async generateRefreshToken(userId: string): Promise<Token> {
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
      jwtid: jti,
    });

    return {
      encoded: refreshToken,
      jti,
    };
  }

  private async generateAccessToken(
    userId: string,
    refreshTokenId: string,
  ): Promise<Token> {
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
      jwtid: jti,
    });
    return {
      encoded: accessToken,
      jti,
    };
  }

  private async validateTokens(
    accessToken: string,
    refreshToken: string,
    userId: string,
  ) {
    const refreshTokenPayload: RefreshTokenPayload = this.jwtService.verify(
      refreshToken,
      {
        secret: this.tokenOpts.refresh.secret,
      },
    );
    const accessTokenPayload: AccessTokenPayload = this.jwtService.verify(
      accessToken,
      {
        secret: this.tokenOpts.access.secret,
        ignoreExpiration: true,
      },
    );

    const isAcceptableRefreshToken = await this.checkExistAndDeleteRefreshToken(
      userId,
      refreshTokenPayload.jti,
    );

    if (!isAcceptableRefreshToken) {
      throw new NotAcceptableException('유효하지 않은 리프레시 토큰입니다.');
    }

    const isAcceptableAccessToken = await this.checkNotExistAndSaveAccessToken(
      userId,
      accessTokenPayload.jti,
    );

    if (!isAcceptableAccessToken) {
      throw new NotAcceptableException('유효하지 않은 액세스 토큰입니다.');
    }

    const isMatchedTokenWithJti =
      accessTokenPayload.refreshTokenId === refreshTokenPayload.jti;

    if (!isMatchedTokenWithJti) {
      throw new NotAcceptableException('유효하지 않은 토큰 요청입니다.');
    }

    return (
      isAcceptableAccessToken &&
      isAcceptableRefreshToken &&
      isMatchedTokenWithJti
    );
  }

  private async setBlackListAccessToken(userId: string, tokenJti: string) {
    await this.redisService.save(
      `userId:${userId}:accessToken-jti:${tokenJti}`,

      true,
      this.tokenOpts.access.expiresIn,
    );
  }

  private async setWhiteListRefreshToken(userId: string, tokenJti: string) {
    // key: refresh token - jti
    // value: { isAcive boolean }
    await this.redisService.save(
      `userId:${userId}:refreshToken-jti:${tokenJti}`,

      true,
      this.tokenOpts.refresh.expiresIn,
    );
  }

  private async checkExistAndDeleteRefreshToken(userId: string, jti: string) {
    // 레디스에 존재하지 않는 경우 인증 오류 발생 (whitelist)
    // 레디스에 존재하는 경우 레디스에서 삭제
    const redisKey = `userId:${userId}:refreshToken-jti:${jti}`;
    const isExists = await this.redisService.getValue<boolean>(redisKey);
    if (isExists) {
      await this.redisService.delete(redisKey);
      return true;
    }
    return false;
  }

  private async checkNotExistAndSaveAccessToken(userId: string, jti: string) {
    // 레디스에 존재하는 경우 인증 오류 발생 (blacklist)
    // 레디스에 존재하지 않는 경우 레디스에 저장
    const redisKey = `userId:${userId}:accessToken-jti:${jti}`;
    const isExists = await this.redisService.getValue<boolean>(redisKey);
    if (isExists === undefined) {
      await this.setBlackListAccessToken(userId, jti);
      return true;
    }
    return false;
  }
}
