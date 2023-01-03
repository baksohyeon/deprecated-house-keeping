import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { dayToMilisecond } from 'src/util/units-of-time-conversion.util';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategy/google-strategy';
import { JwtAuthStrategy } from './strategy/jwt-access.strategy';
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
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtAuthStrategy],
})
export class AuthModule {}
