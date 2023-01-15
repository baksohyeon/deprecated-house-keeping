import { CacheModule, Module, CacheManagerOptions } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { databaseConfiguration } from './config/database.config';
import { googleConfiguration } from './config/google.config';
import { TypeOrmConfigService } from './config/typeorm.config';
import { UserModule } from './user/user.module';
import { redisStore } from 'cache-manager-redis-store';
import { RedisCacheModule } from './redis.module';
import tokenConfig from './config/token.config';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      load: [googleConfiguration, databaseConfiguration, tokenConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    RedisCacheModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
