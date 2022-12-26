import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import googleConfig from 'src/config/google.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [googleConfig],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
