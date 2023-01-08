import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { googleConfiguration } from 'src/config/google.config';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { LoginRequestUserDto } from '../dto/login-request.dto';
// import { UserInfoDto } from '../dto/user-info.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleConfiguration.KEY)
    private readonly googleConfig: ConfigType<typeof googleConfiguration>,
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
    const userInfo = {
      email: emails[0].value,
      username: `${name.familyName} ${name.givenName}`,
    } as LoginRequestUserDto;

    const user = await this.userService.findUserByEmail(userInfo.email);
    if (!user) {
      const newUser = await this.userService.createUser(userInfo);
      done(null, newUser);
    }
    done(null, user);
  }
}
