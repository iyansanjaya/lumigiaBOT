import 'next-auth';

type AuthSessionError = 'RefreshTokenError';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    accessTokenExpiresAt?: number;
    error?: AuthSessionError;
  }
}

import 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    accessTokenExpiresAt?: number;
    refreshToken?: string;
    error?: AuthSessionError;
  }
}
