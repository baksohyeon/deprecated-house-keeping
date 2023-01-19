import { CookieOptions } from 'express';

export interface AccessCookieConfig {
  accessToken: string;
  accessCookieOptions: Record<string, CookieOptions>;
}

export interface RefreshCookieConfig {
  refreshToken: string;
  refreshCookieOptions: Record<string, CookieOptions>;
}

export interface CookieOptionsInterface {
  maxAge: number;
  secure: boolean;
  sameSite: boolean | string;
}
