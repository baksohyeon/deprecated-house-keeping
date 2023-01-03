import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { tokenConfig } from 'src/types/token-config.interface';
import {
  dayToMilisecond,
  minuteToMilisecond,
} from 'src/util/units-of-time-conversion.util';
import { Repository } from 'typeorm';
import { oauthResponseDto } from './dto/oauth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(requestUser: oauthResponseDto): Promise<tokenConfig> {
    if (!requestUser) {
      throw new BadRequestException('Unauthenticated');
    }
    const userByEmail = await this.findUserByEmail(requestUser.email);
    if (!userByEmail) {
      return this.registerUser(requestUser.username, requestUser.email);
    }
    return this.getAccessTokenCookieConfig(userByEmail);
  }

  async registerUser(username: string, email: string): Promise<tokenConfig> {
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

  async getAccessTokenCookieConfig(user: User): Promise<tokenConfig> {
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

    const accessToken = this.jwtService.sign(payload, accessTokenOptions);
    return {
      token: accessToken,
      maxAge: minuteToMilisecond(
        this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES'),
      ),
      sameSite: true,
      secure: false,
    };
  }

  async getRefreshTokenCookieConfig(user: User): Promise<tokenConfig> {
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
    return {
      token: refreshToken,
      maxAge: dayToMilisecond(
        this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS'),
      ),
      sameSite: true,
      secure: false,
    };
  }

  async resetAuthCookiesForLogOut(): Promise<tokenConfig> {
    return {
      token: '',
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

  async isValidRefreshToken(
    refreshToken: string,
    id: number,
  ): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ id });
    // TODO: 에러 핸들링
    return compare(refreshToken, user.refreshToken);
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

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      return null;
    }
    return user;
  }
}
