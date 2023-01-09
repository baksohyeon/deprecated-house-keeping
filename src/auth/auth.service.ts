import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { CookieOptions } from 'express';
import { User } from 'src/entities/user.entity';
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
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import { AccessTokenUserPayload } from 'src/types/access-token-user-payload.interface';
import { FreshTokens } from 'src/types/fresh-tokens.interface';
import { AccessTokenPayload } from 'src/types/type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  private generateRefreshToken(payload: AccessTokenUserPayload) {
    // include the necessary data in the token payload
    const refreshTokenPayload = {
      userId: payload.userId,
      tokenType: 'refresh',
    };

    // generate a unique identifier for this refresh token
    const jti = uuidv4();
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: ms(
        this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS'),
      ),
      issuer: 'dorito',
      audience: [this.configService.get<string>('FRONTEND_URL')],
      jwtid: jti,
    });
    return {
      token: refreshToken,
      jti,
    };
  }

  private generateAccessToken(
    payload: AccessTokenUserPayload,
    refreshTokenId: string,
  ) {
    // used to revoke individual tokens
    const jti = uuidv4();
    const accessTokenPayload = {
      ...payload,
      refreshTokenId,
      tokenType: 'access',
    };
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: ms(
        this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES'),
      ),
      issuer: 'dorito',
      audience: [this.configService.get<string>('FRONTEND_URL')],
      jwtid: jti,
    });
    return {
      token: accessToken,
      jti,
    };
  }

  generateTokens(payload: AccessTokenUserPayload): FreshTokens {
    const refreshToken = this.generateRefreshToken(payload);
    const accessToken = this.generateAccessToken(payload, refreshToken.jti);
    return {
      accessToken,
      refreshToken,
    };
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  private getTokenSignOptions(tokenType: 'access' | 'refresh'): JwtSignOptions {
    if (tokenType === 'access') {
      const accessJwtSignOptions: JwtSignOptions = {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: ms(
          this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES'),
        ),
      };
      return accessJwtSignOptions;
    }
    if (tokenType === 'refresh') {
      const jti = uuidv4();
      const refreshJwtSignOptions: JwtSignOptions = {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: ms(
          this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS'),
        ),
        issuer: 'dorito',
        audience: [this.configService.get<string>('FRONTEND_URL')],
        jwtid: jti,
      };
      return refreshJwtSignOptions;
    }
  }

  private getCookieOptions(
    tokenType: 'access' | 'refresh' | 'reset',
  ): CookieOptions {
    if (tokenType === 'access') {
      const accessCookieOptions: CookieOptions = {
        maxAge: ms(
          this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES'),
        ),
        sameSite: 'lax',
        secure: false,
        httpOnly: false,
      };
      return accessCookieOptions;
    }
    if ((tokenType = 'refresh')) {
      const refreshCookieOptions: CookieOptions = {
        maxAge: ms(
          this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS'),
        ),
        sameSite: true,
        secure: false,
      };
      return refreshCookieOptions;
    }
    if ((tokenType = 'reset')) {
      const resetCookieOptions: CookieOptions = {
        maxAge: 0,
        sameSite: true,
        secure: false,
      };
      return resetCookieOptions;
    }
  }

  async getAccessTokenCookieConfig(user: User): Promise<AccessCookieConfig> {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const accessTokenOptions = this.getTokenSignOptions('access');
    const accessToken = this.jwtService.sign(payload, accessTokenOptions);
    const accessCookieOptions: CookieOptions = this.getCookieOptions('access');
    return {
      accessToken: accessToken,
      accessCookieOptions,
    } as AccessCookieConfig;
  }

  async getRefreshTokenCookieConfig(user: User): Promise<RefreshCookieConfig> {
    const payload = {
      sub: user.id,
      tokenType: 'refresh',
    };

    const refreshTokenOptions: JwtSignOptions =
      this.getTokenSignOptions('refresh');
    const refreshToken = this.jwtService.sign(payload, refreshTokenOptions);
    const refreshCookieOptions: CookieOptions =
      this.getCookieOptions('refresh');

    return {
      refreshToken: refreshToken,
      refreshCookieOptions,
    } as RefreshCookieConfig;
  }

  resetCookieOptions(): CookieOptions {
    return this.getCookieOptions('reset');
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
