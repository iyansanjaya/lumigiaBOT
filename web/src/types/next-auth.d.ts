import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

import 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
  }
}
