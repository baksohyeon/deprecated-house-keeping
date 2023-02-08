import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { AccessTokenPayload } from 'src/interfaces/tokens.interface';
import { RedisService } from 'src/auth/redis/redis.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  private logger: Logger = new Logger(this.name);

  async validate(jwtPayload: AccessTokenPayload, done: VerifiedCallback) {
    const userId = jwtPayload.userId;
    // TODO: access 토큰이 레디스에 존재하면 오류 반환
    const user = await this.userService.findUserById(userId);
    done(null, user);
  }
}
