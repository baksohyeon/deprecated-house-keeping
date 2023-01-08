import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { CookieOptions } from 'express';
import { User } from 'src/entities/user.entity';
import { CookieOptionsInterface } from 'src/types/cookie-options.interface';
import {
  AccessCookieConfig,
  RefreshCookieConfig,
} from 'src/types/cookie-config.interface';
import {
  dayToMilisecond,
  minuteToMilisecond,
} from 'src/util/units-of-time-conversion.util';
import { Repository } from 'typeorm';
import { LoginRequestUserDto } from './dto/login-request.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async getAccessTokenCookieConfig(user: User): Promise<AccessCookieConfig> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // static bean으로 만들어서 모듈에 넣기, 불변 상수들을 쓴다.
    const accessTokenOptions = {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: minuteToMilisecond(
        this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES'),
      ),
    };

    const accessToken = this.jwtService.sign(payload, accessTokenOptions);

    const accessCookieOptions: CookieOptions = {
      maxAge: minuteToMilisecond(
        this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES'),
      ),
      sameSite: 'lax',
      secure: false,
      httpOnly: false,
    };
    return {
      accessToken: accessToken,
      accessCookieOptions,
    } as AccessCookieConfig;
  }

  async getRefreshTokenCookieConfig(user: User): Promise<RefreshCookieConfig> {
    const payload = {
      sub: user.id,
    };

    const refreshTokenOptions = {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: minuteToMilisecond(
        this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS'),
      ),
    };
    const refreshToken = this.jwtService.sign(payload, refreshTokenOptions);
    const refreshCookieOptions: CookieOptions = {
      maxAge: dayToMilisecond(
        this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS'),
      ),
      sameSite: true,
      secure: false,
    };

    return {
      refreshToken: refreshToken,
      refreshCookieOptions,
    } as RefreshCookieConfig;
  }

  resetCookieOptions(): CookieOptions {
    return {
      maxAge: 0,
      sameSite: true,
      secure: false,
    };
  }

  async saveHashedRefreshToken(
    refreshToken: string,
    id: string,
  ): Promise<void> {
    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ hashedRefreshToken: hashedRefreshToken })
      .where('id = :id', { id })
      .execute();
  }

  async checkRefreshGetUser(refreshToken: string, id: string) {
    // TODO: 에러 핸들링
    const user = await this.userRepository.findOneBy({ id });
    const isValidRefreshToken = await compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!isValidRefreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token ');
    }
    return user;
  }

  async resetRefreshToken(id: string): Promise<void> {
    //  유저가 로그아웃 할 때 사용
    // TODO: 에러 핸들링
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ hashedRefreshToken: null })
      .where('id = :id', { id })
      .execute();
  }
}
