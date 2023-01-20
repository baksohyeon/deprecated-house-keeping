import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
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
import { RedisStore } from 'cache-manager-redis-yet';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CACHE)
    private cacheManager: Cache,
    @Inject(tokenConfig.KEY)
    private tokenOpts: ConfigType<typeof tokenConfig>,
    @Inject(CACHE_MANAGER)
    private redisManager: RedisStore
  ) {}


  async setBlackListAccessToken(payload: FreshTokens, userId: string) {
    // key: access token - jti
    // value: { isAcive boolean }
    await this.cacheManager.store.set(
      `userId:${userId}:accessToken-jti:${payload.refreshToken.jti}`,

      false,
      this.tokenOpts.access.expiresIn,
    );

  }

  async setWhiteListRefreshToken(payload: FreshTokens, userId: string) {
    // key: refresh token - jti
    // value: { isAcive boolean }
    await this.cacheManager.set(
      `userId:${userId}:refreshToken-jti:${payload.refreshToken.jti}`,

      true,
      this.tokenOpts.refresh.expiresIn,
    );
  }

  private async getAccessTokenInBlacklist(userId: string, jti: string) {
    // 레디스에 존재하는 경우 인증 오류 발생
    // 레디스에 존재하지 않는 경우 레디스에 저장한다.
    return this.cacheManager.get(`userId:${userId}:accessToken-jti:${jti}`);
  }

  private async getRefreshTokenInWhitelist(userId: string, jti: string) {
    // 레디스에 존재하지 않는 경우 인증 오류 발생
    // 레디스에 존재하는 경우 레디스에 저장한다.
    return this.cacheManager.get(`userId:${userId}:accessToken-jti:${jti}`);
  }

  async revokeTokenByUser(userId: string) {
    this.cacheManager.();
  }

  // async validateAccessTokenWithStatus(
  //   decoded: AccessTokenPayload,
  // ): Promise<boolean> {
  //   // access 토큰의 refresh 토큰이 아직 살아있는지 체크함
  //   // 레디스에서 access 토큰 상태를 확인하고 리턴함
  //   // 만약 레디스 내 access 토큰이 저장되어있지 않으면 -> 401 Forbidden 에러

  //   const refreshTokenActiveState: any = await this.getStatusOfTokenByTokenId(
  //     'refresh',
  //     decoded.refreshTokenId,
  //   );

  //   if (refreshTokenActiveState?.isAcive) {
  //     const accessTokenActiveState: any = await this.getStatusOfTokenByTokenId(
  //       'access',
  //       decoded.jti,
  //     );
  //     return accessTokenActiveState.isAcive;
  //   }
  //   return false;
  // }

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
