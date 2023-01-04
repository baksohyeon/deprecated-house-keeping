import { CookieOptions } from 'express';

export interface AccessCookieConfig extends CookieOptions {
  accessToken: string;
}

export interface RefreshCookieConfig extends CookieOptions {
  refreshToken: string;
}
