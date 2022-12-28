import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { googleConfiguration } from 'src/config/google.config';
import { AuthService } from '../auth.service';
import { UserInfoDto } from '../dto/user-info.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleConfiguration.KEY)
    private googleConfig: ConfigType<typeof googleConfiguration>,
    private readonly authService: AuthService,
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
    // done: VerifyCallback,
  ): Promise<any> {
    // const { id, name, emails, photos } = profile;
    // const user = {
    //   provider: 'google',
    //   prividerId: id,
    //   email: emails[0].value,
    //   name: name.givenName,
    //   picture: photos[0].value,
    // };
    const userInfo = {
      email: profile.emails[0].value,
      username: profile.displayName,
    } as UserInfoDto;

    console.log('profile', profile);
    const findByemail = await this.authService.validateUser(userInfo);
    // done(null, user);

    console.log('validate');
    console.log('strategy:', findByemail);
    return findByemail || null;
  }
}
