import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import {
  AccessTokenPayload,
  FreshTokens,
  TokenType,
} from 'src/interfaces/tokens.interface';

import { Cache } from 'cache-manager';
import { REDIS_CACHE } from 'src/auth/redis/redis.module';
import tokenConfig from 'src/config/token.config';
import { ReissuedTokenResult } from 'src/interfaces/reissued-token-result';

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

    const userId = oldAccessTokenPayload.userId;

    const isMatchedTokenWithJti =
      oldAccessTokenPayload.refreshTokenId === refreshTokenPayload.jti;

    // 만약 해당 refresh 토큰 상태 isActive 가 true 이고,
    // access 토큰에 적힌 refrsh 고유 번호와 해당 refresh 토큰 고유 id끼리 같을 경우 새 토큰들 발급
    // 해당 access token 과 refresh 토큰의 isActive 는 false 로 바꾼다.
    if (refreshTokenState?.isActive && isMatchedTokenWithJti) {
      const freshTokens = await this.generateTokens(userId);

      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'access token is reissued',
        userId,
        reissuedTokens: freshTokens,
      };
    }
    return {
      statusCode: HttpStatus.NOT_ACCEPTABLE,
      message: 'Invalid token',
      userId,
    };
  }
}
