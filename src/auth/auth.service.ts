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
} from 'src/types/token-config.interface';
import {
  dayToMilisecond,
  minuteToMilisecond,
} from 'src/util/units-of-time-conversion.util';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/user-info.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(AuthService.name);
  async signIn(requestUser: UserInfoDto): Promise<AccessCookieConfig> {
    if (!requestUser) {
      throw new BadRequestException('Unauthenticated');
    }
    const userByEmail = await this.userRepository.findOneBy({
      email: requestUser.email,
    });
    if (!userByEmail) {
      return this.registerUser(requestUser.username, requestUser.email);
    }
    return this.getAccessTokenCookieConfig(userByEmail);
  }

  async registerUser(
    username: string,
    email: string,
  ): Promise<AccessCookieConfig> {
    try {
      const userInfo = {
        username: username,
        email: email,
      };
      const assignUser = this.userRepository.create(userInfo);
      const newUser = await this.userRepository.save(assignUser);

      return this.getAccessTokenCookieConfig(newUser);
    } catch (e) {
      throw new HttpException(
        'register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAccessTokenCookieConfig(user: User): Promise<AccessCookieConfig> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessTokenOptions = {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: minuteToMilisecond(
        this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES'),
      ),
    };

    const accessToken = {
      accessToken: this.jwtService.sign(payload, accessTokenOptions),
    };
    const cookieOptions: CookieOptions = {
      maxAge: minuteToMilisecond(
        this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES'),
      ),
      sameSite: true,
      secure: false,
    };
    return {
      ...accessToken,
      ...cookieOptions,
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
    const refreshToken = {
      refreshToken: this.jwtService.sign(payload, refreshTokenOptions),
    };
    const refreshCookieOptions: CookieOptions = {
      maxAge: dayToMilisecond(
        this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS'),
      ),
      sameSite: true,
      secure: false,
    };

    return {
      ...refreshToken,
      ...refreshCookieOptions,
    };
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
    id: number,
  ): Promise<void> {
    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ refreshToken: hashedRefreshToken })
      .where('id = :id', { id })
      .execute();
  }

  async checkRefreshGetUser(refreshToken: string, id: number) {
    // TODO: 에러 핸들링
    this.logger.log('refresh token, id:', refreshToken, id);
    const user = await this.userRepository.findOneBy({ id });
    const isValidRefreshToken = await compare(refreshToken, user.refreshToken);
    if (!isValidRefreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token ');
    }
    return user;
  }

  async resetRefreshToken(id: number): Promise<void> {
    //  유저가 로그아웃 할 때 사용
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ refreshToken: null })
      .where('id = :id', { id })
      .execute();
  }
}
