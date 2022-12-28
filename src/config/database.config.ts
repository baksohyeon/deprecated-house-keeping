import { registerAs } from '@nestjs/config';

export const databaseConfiguration = registerAs('database', () => ({
  host: process.env.TYPEORM_HOST,
  port: +process.env.TYPEORM_PORT || 5432,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
}));
