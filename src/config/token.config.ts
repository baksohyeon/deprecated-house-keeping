import { registerAs } from '@nestjs/config';
import { ms } from 'src/util/convert-milliseconds.util';

export default registerAs('token', () => ({
  access: {
    secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    expiresIn: ms.seconds(+process.env.JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES),
  },
  refresh: {
    secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    expiresIn: ms.days(+process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS),
  },
}));
