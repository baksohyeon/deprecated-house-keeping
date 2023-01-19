import { FreshTokens } from './tokens.interface';

export interface ReissuedTokenResult {
  statusCode: number;
  message: string;
  userId?: string;
  reissuedTokens?: FreshTokens;
}
