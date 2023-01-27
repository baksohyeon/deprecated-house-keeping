import { FreshTokens, Tokens } from './tokens.interface';

export interface ReissuedTokenResult {
  statusCode: number;
  message: string;
  userId?: string;
  reissuedTokens?: Tokens;
}
