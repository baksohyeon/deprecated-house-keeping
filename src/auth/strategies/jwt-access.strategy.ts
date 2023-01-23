import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { request, Request } from 'express';
import { accessTokenCookieExtractor } from 'src/util/cookie-extractor.util';
import { AuthService } from '../auth.service';
import { AccessTokenPayload } from 'src/interfaces/tokens.interface';
import { RedisService } from 'src/auth/redis/redis.service';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    readonly configService: ConfigService,
    private readonly redisService: RedisService,
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
    const userId = jwtPayload.userId;
    done(null, userId);
  }
}
