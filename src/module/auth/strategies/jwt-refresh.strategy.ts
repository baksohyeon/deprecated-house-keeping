import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { DiffieHellmanGroup } from 'crypto';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/entities/user.entity';
import { ReissuedTokenResult } from 'src/interfaces/reissued-token-result';
import { RefreshTokenPayload, Tokens } from 'src/interfaces/tokens.interface';
import {
  accessTokenCookieExtractor,
  refreshTokenCookieExtractor,
} from 'src/util/cookie-extractor.util';
import { AuthService } from '../auth.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: refreshTokenCookieExtractor,
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }
  private readonly logger = new Logger(JwtRefreshStrategy.name);

  async validate(req: Request, payload: RefreshTokenPayload) {
    if (!req.cookies) {
      throw new HttpException('cookie 못읽어옴', HttpStatus.NOT_FOUND);
    }

    // 토큰들을 긁어와서 디코딩
    const accessToken = req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];
    const result: ReissuedTokenResult =
      await this.authService.reissueTokensAndSaveToRedis(
        accessToken,
        refreshToken,
        payload.userId,
      );
    // user redis 에 등록해준다.
    return result;
  }
}
