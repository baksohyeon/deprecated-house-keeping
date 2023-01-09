export interface AccessTokenUserPayload {
  // the "user" part of our access tokens
  isVerified: boolean;
  username: string;
  userId: string;
}
