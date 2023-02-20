import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './module/auth/auth.module';
import { databaseConfiguration } from './config/database.config';
import { googleConfiguration } from './config/google.config';
import { TypeOrmConfigService } from './config/typeorm.config';
import { UserModule } from './module/user/user.module';
import { RedisCacheModule } from './module/auth/redis/redis.module';
import tokenConfig from './config/token.config';
import { redisStore } from 'cache-manager-redis-yet';
import { HouseModule } from './module/house/house.module';
import { MemberModule } from './module/member/member.module';
import { HouseworkModule } from './module/housework/housework.module';
import { TaskModule } from './module/task/task.module';

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

    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
          ttl: 5000,
        }),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),

    HouseModule,

    MemberModule,

    HouseworkModule,

    TaskModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
