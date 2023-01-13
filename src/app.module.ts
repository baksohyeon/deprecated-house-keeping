import { CacheModule, CACHE_MANAGER, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { databaseConfiguration } from './config/database.config';
import { googleConfiguration } from './config/google.config';
import { TypeOrmConfigService } from './config/typeorm.config';
import { UserModule } from './user/user.module';
import * as redisStore from 'cache-manager-redis-store';
import { CacheManagerOptions } from '@nestjs/common';
import type { ClientOpts as RedisClientOptions } from 'redis';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      load: [googleConfiguration, databaseConfiguration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
      }),
      isGlobal: true,
    }),
    // CacheModule.register({
    //   isGlobal: true,
    //   store: redisCacheStore,
    //   clusterConfig: {
    //     nodes: [{ host: 'localhost', port: 6379 }],
    //     options: { ttl: 10 },
    //   },
    // }),
    // RedisModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (
    //     configService: ConfigService,
    //   ): Promise<RedisModuleOptions> => {
    //     return {
    //       readyLog: true,
    //       config: {
    //         host: 'localhost',
    //         port: 6379,
    //       },
    //     };
    //   },
    // }),
    // CacheModule.register<ClientOpts>({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     store: redisStore,
    //     host: configService.get<string>('REDIS_HOST'),
    //     port: configService.get<number>('REDIS_PORT'),
    //   }),

    //   isGlobal: true,
    // }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
