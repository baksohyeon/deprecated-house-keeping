import { ConfigType } from '@nestjs/config';
import tokenConfig from 'src/config/token.config';

export const mockTokenConfig: ConfigType<typeof tokenConfig> = {
  access: {
    secret: 'access-secret-test',
    expiresIn: 3000,
  },
  refresh: {
    secret: 'refresh-secret-test',
    expiresIn: 30000,
  },
};
