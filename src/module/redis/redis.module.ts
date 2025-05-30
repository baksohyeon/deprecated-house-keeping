import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const REDIS_CACHE = 'REDIS_CACHE';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CACHE,
      useFactory: async (configService: ConfigService) =>
        await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
        }),
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CACHE],
})
export class RedisCacheModule {}
