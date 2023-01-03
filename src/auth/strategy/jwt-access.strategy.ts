import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/entities/user.entity';
import { JwtPayload } from 'src/types/jwt-payload.interface';
import { Repository } from 'typeorm';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  private logger: Logger = new Logger(this.name);

  async validate(jwtPayload: JwtPayload) {
    return {
      sub: jwtPayload.sub,
      email: jwtPayload.email,
    };
  }
}
