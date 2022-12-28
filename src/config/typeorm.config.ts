import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { databaseConfiguration } from './database.config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(databaseConfiguration.KEY)
    private dbConfig: ConfigType<typeof databaseConfiguration>,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.dbConfig.host,
      port: this.dbConfig.port || 5432,
      username: this.dbConfig.username,
      password: this.dbConfig.password,
      database: this.dbConfig.database,
      synchronize: false,
      migrationsRun: false,
      entities: ['dist/**/*.entity{.ts,.js}'],
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}
