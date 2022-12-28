import { registerAs } from '@nestjs/config';

export const googleConfiguration = registerAs('googleOauth', () => ({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
}));
