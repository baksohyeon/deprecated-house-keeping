import { ConfigType } from '@nestjs/config';
import tokenConfig from 'src/config/token.config';

export const mockTokenConfig: ConfigType<typeof tokenConfig> = {
  access: {
    secret: 'access-secret-test',
    expiresIn: 1,
  },
  refresh: {
    secret: 'refresh-secret-test',
    expiresIn: 10,
  },
};
