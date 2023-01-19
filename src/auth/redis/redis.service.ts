import { Inject, Injectable } from '@nestjs/common';
import {
  AccessTokenPayload,
  FreshTokens,
  TokenType,
} from 'src/interfaces/tokens.interface';
import { REDIS_CACHE } from './redis.module';
import { Cache } from 'cache-manager';
import tokenConfig from 'src/config/token.config';
import { ConfigType } from '@nestjs/config';
import { TokenRedisState } from 'src/interfaces/redis.interface';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CACHE)
    private cacheManager: Cache,
    @Inject(tokenConfig.KEY)
    private tokenOpts: ConfigType<typeof tokenConfig>,
  ) {}

  async setFreshTokens(payload: FreshTokens) {
    // key: access token - jti
    // value: { isAcive boolean }
    await this.cacheManager.set(
      `accessToken-jti:${payload.accessToken.jti}`,

      { isActive: true },
      this.tokenOpts.access.expiresIn,
    );

    // key: refresh token - jti
    // value: { isAcive boolean }
    await this.cacheManager.set(
      `refreshToken-jti:${payload.refreshToken.jti}`,

      { isActive: true },

      this.tokenOpts.refresh.expiresIn,
    );
  }

  async setUserAndRefreshTokenId(userId: string, refreshTokenId: string) {
    // key: loggedInuser - userId
    // value: {tokens: [refreshTokenId]}
    this.cacheManager.set(
      `loggedInUser:${userId}`,
      {
        tokenIds: [refreshTokenId],
      },
      this.tokenOpts.refresh.expiresIn,
    );
  }

  async getStatusOfTokenByTokenId(tokenType: TokenType, jti: string) {
    return this.cacheManager.get(`${tokenType}Token-jti:${jti}`);
  }

  async getRefreshTokenListsByUserId(userId: string) {
    return this.cacheManager.get(`loggedInUser:${userId}`);
  }

  async updateListOfUserOwnedTokens(userId: string) {
    const refreshTokensByUser: any = await this.getRefreshTokenListsByUserId(
      userId,
    );
  }

  async validateAccessTokenWithStatus(
    decoded: AccessTokenPayload,
  ): Promise<boolean> {
    // access 토큰의 refresh 토큰이 아직 살아있는지 체크함
    // 레디스에서 access 토큰 상태를 확인하고 리턴함
    // 만약 레디스 내 access 토큰이 저장되어있지 않으면 -> 401 Forbidden 에러

    const refreshTokenActiveState: any = await this.getStatusOfTokenByTokenId(
      'refresh',
      decoded.refreshTokenId,
    );

    if (refreshTokenActiveState?.isAcive) {
      const accessTokenActiveState: any = await this.getStatusOfTokenByTokenId(
        'access',
        decoded.jti,
      );
      return accessTokenActiveState.isAcive;
    }
    return false;
  }

  async dropRefreshTokenAndStatus(jti: string) {
    await this.cacheManager.del(`refreshToken-jti:${jti}`);
  }

  // revoke all of user's refresh tokens
  async revokeRefreshTokens(userId: string) {
    // value ~ tokens: [refreshTokenId],
    const refreshTokenList: any = await this.getRefreshTokenListsByUserId(
      `loggedInUser:${userId}`,
    );
    const refreshTokenIds = refreshTokenList.tokenIds;
    for (let refreshTokenId of refreshTokenIds) {
      await this.dropRefreshTokenAndStatus(refreshTokenId);
    }
  }
}
