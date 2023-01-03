import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { User } from 'src/entities/user.entity';
import { AuthService } from './auth.service';
import { UserInfoDto } from './dto/user-info.dto';
import { GoogleOauthGaurd } from './guards/google-oauth.guard';
import { JwtAuthGaurd } from './guards/jwt-access.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  private logger: Logger = new Logger(AuthController.name);

  @UseGuards(GoogleOauthGaurd)
  @Get('google/login')
  handleLogin() {
    // Guard redirects
  }

  @UseGuards(GoogleOauthGaurd)
  @Get('google/redirect')
  async googleAuthCallback(
    @RequestUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const tokenConfig = await this.authService.getAccessTokenCookieConfig(
        user,
      );
      const { token, ...options } = tokenConfig;
      res.cookie('access_token', token, options);
      this.logger.log('token', token);
      res.status(HttpStatus.OK);
    } catch (e: any) {
      this.logger.error(e.message);
      throw new InternalServerErrorException(e.message ?? 'error has occurred');
    }
  }

  @UseGuards(JwtAuthGaurd)
  async logOut(@Res({ passthrough: true }) res: Request) {
    const tokenConfig = await this.authService.resetAuthCookiesForLogOut();
    const { token, ...options } = tokenConfig;
    res.cookies('access_token', token, options);
  }

  @UseGuards(JwtAuthGaurd)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Get('test')
  test() {
    return 'hello';
  }
}
