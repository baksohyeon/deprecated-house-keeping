import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { dayToMilisecond } from 'src/util/time-transform.util';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategy/google-strategy';
import { JwtAuthStrategy } from './strategy/jwt-auth.strategy';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          signOptions: {
            expiresIn: dayToMilisecond(
              configService.get<number>('JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS'),
            ),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtAuthStrategy],
})
export class AuthModule {}
