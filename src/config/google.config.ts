import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
}));
