import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { DiffieHellmanGroup } from 'crypto';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/entities/user.entity';
import { ReissuedTokenResult } from 'src/interfaces/reissued-token-result';
import {
  accessTokenCookieExtractor,
  refreshTokenCookieExtractor,
} from 'src/util/cookie-extractor.util';
import { AuthService } from '../auth.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: refreshTokenCookieExtractor,
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }
  private readonly logger = new Logger(JwtRefreshStrategy.name);

  //TODO: strategy 로직 수정
  async validate(req: Request, payload: any): Promise<ReissuedTokenResult> {
    if (!req.cookies) {
      throw new HttpException('cookie 못읽어옴', HttpStatus.NOT_FOUND);
    }
    // 해당 refresh token 유효한지 확인하고 유효한 경우 유저 id를 반환한다.
    const refreshToken: string = refreshTokenCookieExtractor(req);
    const accessToken = accessTokenCookieExtractor(req);
    const reissuedTokensResult = await this.authService.reissueAccessToken(
      accessToken,
      refreshToken,
    );
    // user redis 에 등록해준다.
    return reissuedTokensResult;
  }
}
