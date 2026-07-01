import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canManageGuild } from '@/lib/discord-api';
import { buildRateLimitKey, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

interface GuildManagerGuardOptions {
  scope: string;
  limit?: number;
  windowMs?: number;
}

type GuildManagerGuardResult =
  | { ok: true; guildId: string; accessToken: string }
  | { ok: false; response: NextResponse };

const DISCORD_SNOWFLAKE_RE = /^\d{17,20}$/;

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function requireGuildManager(
  req: NextRequest,
  params: Promise<{ guildId: string }> | { guildId: string },
  options: GuildManagerGuardOptions,
): Promise<GuildManagerGuardResult> {
  const session = await auth();
  if (!session?.accessToken) {
    return {
      ok: false,
      response: errorResponse('Unauthorized', 401),
    };
  }

  const { guildId } = await Promise.resolve(params);
  if (!DISCORD_SNOWFLAKE_RE.test(guildId)) {
    return {
      ok: false,
      response: errorResponse('Invalid guild ID format', 400),
    };
  }

  const rateLimit = checkRateLimit(
    buildRateLimitKey(req, `guild:${guildId}:${options.scope}`, session.accessToken),
    {
      limit: options.limit,
      windowMs: options.windowMs,
    },
  );
  if (!rateLimit.ok) {
    return {
      ok: false,
      response: rateLimitResponse(rateLimit),
    };
  }

  const hasAccess = await canManageGuild(session.accessToken, guildId);
  if (!hasAccess) {
    return {
      ok: false,
      response: errorResponse('Forbidden', 403),
    };
  }

  return {
    ok: true,
    guildId,
    accessToken: session.accessToken,
  };
}
