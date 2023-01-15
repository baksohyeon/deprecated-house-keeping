import { CACHE_MANAGER, Module } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google-strategy';
import { JwtAuthStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import ms from 'ms';
import tokenConfig from 'src/config/token.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: async (tokenOpts: ConfigType<typeof tokenConfig>) => {
        return {
          secret: tokenOpts.access.secret,
          signOptions: {
            expiresIn: tokenOpts.access.expiresIn,
          },
        };
      },
      inject: [tokenConfig.KEY],
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtAuthStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
