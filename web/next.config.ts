import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.NEXT_STANDALONE === 'true'
    ? {
        output: 'standalone' as const,
        outputFileTracingRoot: path.join(process.cwd(), '..'),
        outputFileTracingIncludes: {
          '/*': ['../shared/**/*'],
        },
      }
    : {}),
  serverExternalPackages: ['better-sqlite3'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
    ],
  },
};

export default nextConfig;
