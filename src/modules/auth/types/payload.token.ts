export interface TokenPayload {
  sub: number;
  email: string;
  role?: 'user';
  iat?: any;
  exp?: any;
}

export interface RefreshTokenPayload {
  sub: number;
  email: string;
  iat?: any;
  exp?: any;
}
