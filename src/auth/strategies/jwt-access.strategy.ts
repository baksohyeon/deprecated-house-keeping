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

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: accessTokenCookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  private logger: Logger = new Logger(this.name);

  async validate(jwtPayload: JwtPayload, done: VerifiedCallback) {
    const { sub } = jwtPayload;
    const user = await this.userService.findUserById(sub);
    if (!user) {
      throw new UnauthorizedException('Token is invalid');
    }
    return done(null, user);
  }
}
