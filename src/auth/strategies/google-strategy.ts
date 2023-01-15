import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { googleConfiguration } from 'src/config/google.config';
import { User } from 'src/entities/user.entity';
import { AccessTokenPayload, AccessTokenUserPayload } from 'src/types/type';
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
    const payloadExceptUserId = {
      email: emails[0].value,
      username: `${name.familyName} ${name.givenName}`,
    };

    const userInfo = {
      email: emails[0].value,
      username: `${name.familyName} ${name.givenName}`,
    } as LoginRequestUserDto;

    const user = (await this.userService.findUserByEmail(
      userInfo.email,
    )) as User;
    if (!user) {
      const newUser: User = await this.userService.createUser(userInfo);
      const userPayload = {
        ...payloadExceptUserId,
        userId: newUser.id,
      } as AccessTokenUserPayload;
      const tokens = await this.authService.generateTokens(userPayload);
      //TODO: 더 명시적인 타입과 변수명으로 수정하기
      //TODO: redis에 토큰 저장하기
      await this.authService.setTokenAndIdToRedis(tokens);
      const result = {
        message: 'Create new user and Login successful',
        data: {
          tokens,
          user: newUser,
        },
      };
      done(null, result);
    }
    const userPayload = {
      ...payloadExceptUserId,
      userId: user.id,
    } as AccessTokenUserPayload;
    const tokens = await this.authService.generateTokens(userPayload);
    await this.authService.setTokenAndIdToRedis(tokens);
    await this.authService.setUserAndRefreshTokenIdToRedis(
      user.id,
      tokens.refreshToken.jti,
    );
    const result = {
      user,
      message: 'already signed in user and login successful',
      tokens,
    };
    done(null, result);
  }
}
