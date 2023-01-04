import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { DiffieHellmanGroup } from 'crypto';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/entities/user.entity';
import { JwtPayload } from 'src/types/jwt-payload.interface';
import {
  accessTokenCookieExtractor,
  refreshTokenCookieExtractor,
} from 'src/util/cookie-extractor.util';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    readonly configService: ConfigService,
    private molduleRef: ModuleRef,
  ) {
    super({
      jwtFromRequest: refreshTokenCookieExtractor,
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }
  private readonly logger = new Logger(JwtRefreshStrategy.name);

  async validate(req: Request, payload: JwtPayload): Promise<User> {
    if (!req.cookies) {
      throw new HttpException('cookie 못읽어옴', HttpStatus.NOT_FOUND);
    }

    const contextId = ContextIdFactory.getByRequest(req);
    const authService = await this.molduleRef.resolve(AuthService, contextId);
    this.logger.log(payload);
    const refreshToken: string = refreshTokenCookieExtractor(req);

    return authService.checkRefreshGetUser(refreshToken, payload.sub);
  }
}
