import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { User } from 'src/entities/user.entity';
import { JwtPayload } from 'src/types/jwt-payload.interface';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { request, Request } from 'express';
import { accessTokenCookieExtractor } from 'src/util/cookie-extractor.util';
import { AccessTokenUserPayload } from 'src/types/access-token-user-payload.interface';
import { AccessTokenPayload } from 'src/types/type';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      issuer: 'dorito',
    });
  }

  private logger: Logger = new Logger(this.name);

  async validate(jwtPayload: AccessTokenPayload, done: VerifiedCallback) {
    const user = await this.userService.findUserById('1');
    if (!user || jwtPayload.tokenType !== 'access') {
      throw new UnauthorizedException('Token is invalid');
    }
    return done(null, user);
  }
}
