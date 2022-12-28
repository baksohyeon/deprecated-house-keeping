import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { databaseConfiguration } from './config/database.config';
import { googleConfiguration } from './config/google.config';
import { TypeOrmConfigService } from './config/typeorm.config';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      load: [googleConfiguration, databaseConfiguration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
