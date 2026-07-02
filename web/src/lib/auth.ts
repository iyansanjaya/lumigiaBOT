import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import type { JWT } from 'next-auth/jwt';

const DISCORD_TOKEN_ENDPOINT = 'https://discord.com/api/oauth2/token';
const ACCESS_TOKEN_REFRESH_BUFFER_SECONDS = 60;

interface DiscordRefreshResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

async function refreshDiscordAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: 'RefreshTokenError' };
  }

  try {
    const response = await fetch(DISCORD_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord token refresh failed with status ${response.status}`);
    }

    const refreshedTokens = (await response.json()) as DiscordRefreshResponse;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown refresh error';
    console.error('[auth] Failed to refresh Discord access token:', message);
    return { ...token, error: 'RefreshTokenError' };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify guilds',
        },
      },
      checks: ['state'],
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        if (!account.access_token) {
          return { ...token, error: 'RefreshTokenError' };
        }

        token.accessToken = account.access_token;
        token.accessTokenExpiresAt = account.expires_at;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        token.error = undefined;
      }

      if (
        token.accessTokenExpiresAt &&
        Date.now() < (token.accessTokenExpiresAt - ACCESS_TOKEN_REFRESH_BUFFER_SECONDS) * 1000
      ) {
        return token;
      }

      if (token.refreshToken) {
        return refreshDiscordAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.error ? undefined : token.accessToken;
      session.accessTokenExpiresAt = token.accessTokenExpiresAt;
      session.error = token.error;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Setelah login, arahkan ke dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }
      // Jika URL internal, izinkan
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
});
