import { NextRequest, NextResponse } from 'next/server';
import { requireGuildManager } from '@/lib/api-guard';

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

const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 60_000;

const CHANNEL_TYPE = {
  GUILD_TEXT: 0,
  GUILD_VOICE: 2,
  GUILD_CATEGORY: 4,
  GUILD_ANNOUNCEMENT: 5,
  GUILD_STAGE_VOICE: 13,
  GUILD_FORUM: 15,
} as const;

const BOT_TOKEN = process.env.DISCORD_TOKEN;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expires) return entry.data as T;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireGuildManager(req, params, { scope: 'discord-data', limit: 120 });
    if (!guard.ok) return guard.response;

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    const cacheKey = `guild-data:${guard.guildId}`;
    const cached = getCached<{ channels: unknown[]; roles: unknown[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const headers = { Authorization: `Bot ${BOT_TOKEN}` };

    const [channelsRes, rolesRes] = await Promise.all([
      fetch(`https://discord.com/api/v10/guilds/${guard.guildId}/channels`, { headers, cache: 'no-store' }),
      fetch(`https://discord.com/api/v10/guilds/${guard.guildId}/roles`, { headers, cache: 'no-store' }),
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

    const allowedTypes: Set<number> = new Set([
      CHANNEL_TYPE.GUILD_TEXT,
      CHANNEL_TYPE.GUILD_VOICE,
      CHANNEL_TYPE.GUILD_CATEGORY,
      CHANNEL_TYPE.GUILD_ANNOUNCEMENT,
      CHANNEL_TYPE.GUILD_STAGE_VOICE,
      CHANNEL_TYPE.GUILD_FORUM,
    ]);

    const channels = rawChannels
      .filter((channel) => allowedTypes.has(channel.type))
      .sort((a, b) => a.position - b.position)
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        parent_id: channel.parent_id,
      }));

    const roles = rawRoles
      .filter((role) => role.name !== '@everyone' && !role.managed)
      .sort((a, b) => b.position - a.position)
      .map((role) => ({
        id: role.id,
        name: role.name,
        color: role.color,
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
