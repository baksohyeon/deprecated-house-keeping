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
import { oauthResponseDto } from './dto/oauth.dto';
import { GoogleOauthGaurd } from './guards/google-oauth.guard';
import { JwtAuthGaurd } from './guards/jwt-auth.guard';

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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const requestUser = req.user as oauthResponseDto;
      const token = await this.authService.signIn(requestUser);
      this.logger.log('token: ', token);
      res.cookie('access_token', token, {
        maxAge: 259200000,
        sameSite: true,
        secure: false,
      });
      res.status(HttpStatus.OK);
      return {
        accesToken: token,
      };
    } catch (e: any) {
      this.logger.error(e.message);
      throw new InternalServerErrorException(e.message ?? 'error has occurred');
    }
  }

  async logOut() {
    return {};
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
