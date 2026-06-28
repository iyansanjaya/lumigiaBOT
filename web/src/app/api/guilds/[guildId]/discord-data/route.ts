import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canManageGuild } from '@/lib/discord-api';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  position: number;
  parent_id: string | null;
}

interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
}

// ── In-memory cache (60 detik) ──
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 60_000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expires) return entry.data as T;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

// Discord channel types
const CHANNEL_TYPE = {
  GUILD_TEXT: 0,
  GUILD_VOICE: 2,
  GUILD_CATEGORY: 4,
  GUILD_ANNOUNCEMENT: 5,
  GUILD_STAGE_VOICE: 13,
  GUILD_FORUM: 15,
} as const;

const BOT_TOKEN = process.env.DISCORD_TOKEN;

/**
 * GET /api/guilds/[guildId]/discord-data
 * Fetch channels & roles dari Discord API menggunakan Bot Token.
 * Response: { channels, roles }
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guildId } = await params;
    if (!/^\d{17,20}$/.test(guildId)) {
      return NextResponse.json({ error: 'Invalid guild ID format' }, { status: 400 });
    }

    // 2. Permission check
    const hasAccess = await canManageGuild(session.accessToken, guildId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    // 3. Check cache
    const cacheKey = `guild-data:${guildId}`;
    const cached = getCached<{ channels: unknown[]; roles: unknown[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // 4. Fetch dari Discord API (parallel)
    const headers = { Authorization: `Bot ${BOT_TOKEN}` };

    const [channelsRes, rolesRes] = await Promise.all([
      fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, { headers, cache: 'no-store' }),
      fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, { headers, cache: 'no-store' }),
    ]);

    if (!channelsRes.ok || !rolesRes.ok) {
      const errText = !channelsRes.ok
        ? await channelsRes.text().catch(() => 'unknown')
        : await rolesRes.text().catch(() => 'unknown');
      console.error('[discord-data] Discord API error:', errText);
      return NextResponse.json({ error: 'Failed to fetch from Discord' }, { status: 502 });
    }

    const rawChannels: DiscordChannel[] = await channelsRes.json();
    const rawRoles: DiscordRole[] = await rolesRes.json();

    // 5. Filter & format channels
    const allowedTypes: Set<number> = new Set([
      CHANNEL_TYPE.GUILD_TEXT,
      CHANNEL_TYPE.GUILD_VOICE,
      CHANNEL_TYPE.GUILD_CATEGORY,
      CHANNEL_TYPE.GUILD_ANNOUNCEMENT,
      CHANNEL_TYPE.GUILD_STAGE_VOICE,
      CHANNEL_TYPE.GUILD_FORUM,
    ]);

    const channels = rawChannels
      .filter((ch) => allowedTypes.has(ch.type))
      .sort((a, b) => a.position - b.position)
      .map((ch) => ({
        id: ch.id,
        name: ch.name,
        type: ch.type,
        parent_id: ch.parent_id,
      }));

    // 6. Filter & format roles (hilangkan @everyone dan bot-managed roles)
    const roles = rawRoles
      .filter((r) => r.name !== '@everyone' && !r.managed)
      .sort((a, b) => b.position - a.position)
      .map((r) => ({
        id: r.id,
        name: r.name,
        color: r.color,
      }));

    const result = { channels, roles };
    setCache(cacheKey, result);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API discord-data GET]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
