import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { googleConfiguration } from 'src/config/google.config';
import { User } from 'src/entities/user.entity';
import { LoginResponse } from 'src/interfaces/login-response.interface';
import { Tokens } from 'src/interfaces/tokens.interface';
import { UserService } from 'src/module/user/user.service';
import { AuthService } from '../auth.service';
import { RequestLoginUserDto } from '../dto/request-login-user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleConfiguration.KEY)
    googleConfig: ConfigType<typeof googleConfiguration>,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackURL,
      scope: ['profile', 'email'],
    });
  }
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;

    const userInfo: RequestLoginUserDto = {
      email: emails[0].value,
      username: `${name.familyName} ${name.givenName}`,
    };

    const user: User = await this.userService.registerUser(userInfo);
    const tokens: Tokens = await this.authService.generateTokensAndSaveToRedis(
      user.id,
    );

    const result: LoginResponse = {
      user,
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
      message: 'login success',
    };
    done(null, result);
  }
}
