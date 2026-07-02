import { DISCORD_SNOWFLAKE_PATTERN } from '@/lib/contracts';

export interface DiscordIdentity {
  id: string;
  name: string;
}

interface GuildChannel {
  id: string;
  name: string;
  type: number;
}

interface GuildRole {
  id: string;
  name: string;
  color: number;
}

interface GuildMember {
  nick?: string | null;
  user?: {
    id: string;
    username?: string | null;
    global_name?: string | null;
  };
}

interface IdentityRequest {
  channelIds?: Array<string | null | undefined>;
  roleIds?: Array<string | null | undefined>;
  userIds?: Array<string | null | undefined>;
}

export interface GuildIdentityMaps {
  channels: Map<string, DiscordIdentity>;
  roles: Map<string, DiscordIdentity>;
  users: Map<string, DiscordIdentity>;
}

const DISCORD_API_URL = 'https://discord.com/api/v10';
const TOKEN = process.env.DISCORD_TOKEN;
const CACHE_TTL_MS = 60_000;
const USER_LOOKUP_BATCH_SIZE = 10;
const DISCORD_SNOWFLAKE_RE = new RegExp(DISCORD_SNOWFLAKE_PATTERN);

const channelsCache = new Map<string, { expires: number; value: Map<string, DiscordIdentity> }>();
const rolesCache = new Map<string, { expires: number; value: Map<string, DiscordIdentity> }>();
const userCache = new Map<string, { expires: number; value: DiscordIdentity | null }>();

function uniqueSnowflakes(ids: Array<string | null | undefined>) {
  return [...new Set(ids.filter((id): id is string => typeof id === 'string' && DISCORD_SNOWFLAKE_RE.test(id)))];
}

async function discordFetch<T>(path: string): Promise<T | null> {
  if (!TOKEN) return null;

  const res = await fetch(`${DISCORD_API_URL}${path}`, {
    headers: { Authorization: `Bot ${TOKEN}` },
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return (await res.json()) as T;
}

async function getGuildChannels(guildId: string) {
  const cached = channelsCache.get(guildId);
  if (cached && Date.now() < cached.expires) return cached.value;

  const channels = await discordFetch<GuildChannel[]>(`/guilds/${guildId}/channels`);
  const value = new Map<string, DiscordIdentity>();

  for (const channel of channels ?? []) {
    value.set(channel.id, { id: channel.id, name: channel.name });
  }

  channelsCache.set(guildId, { value, expires: Date.now() + CACHE_TTL_MS });
  return value;
}

async function getGuildRoles(guildId: string) {
  const cached = rolesCache.get(guildId);
  if (cached && Date.now() < cached.expires) return cached.value;

  const roles = await discordFetch<GuildRole[]>(`/guilds/${guildId}/roles`);
  const value = new Map<string, DiscordIdentity>();

  for (const role of roles ?? []) {
    value.set(role.id, { id: role.id, name: role.name });
  }

  rolesCache.set(guildId, { value, expires: Date.now() + CACHE_TTL_MS });
  return value;
}

async function getGuildUser(guildId: string, userId: string) {
  const cacheKey = `${guildId}:${userId}`;
  const cached = userCache.get(cacheKey);
  if (cached && Date.now() < cached.expires) return cached.value;

  const member = await discordFetch<GuildMember>(`/guilds/${guildId}/members/${userId}`);
  const user = member?.user;
  const name = member?.nick || user?.global_name || user?.username || null;
  const value = name ? { id: userId, name } : null;

  userCache.set(cacheKey, { value, expires: Date.now() + CACHE_TTL_MS });
  return value;
}

async function getGuildUsers(guildId: string, userIds: string[]) {
  const results: Array<readonly [string, DiscordIdentity | null]> = [];

  for (let index = 0; index < userIds.length; index += USER_LOOKUP_BATCH_SIZE) {
    const batch = userIds.slice(index, index + USER_LOOKUP_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (id) => [id, await getGuildUser(guildId, id)] as const),
    );
    results.push(...batchResults);
  }

  return results;
}

export async function getGuildIdentityMaps(
  guildId: string,
  request: IdentityRequest,
): Promise<GuildIdentityMaps> {
  const channelIds = uniqueSnowflakes(request.channelIds ?? []);
  const roleIds = uniqueSnowflakes(request.roleIds ?? []);
  const userIds = uniqueSnowflakes(request.userIds ?? []);

  const [allChannels, allRoles, userResults] = await Promise.all([
    channelIds.length > 0 ? getGuildChannels(guildId) : Promise.resolve(new Map<string, DiscordIdentity>()),
    roleIds.length > 0 ? getGuildRoles(guildId) : Promise.resolve(new Map<string, DiscordIdentity>()),
    getGuildUsers(guildId, userIds),
  ]);

  const channels = new Map<string, DiscordIdentity>();
  const roles = new Map<string, DiscordIdentity>();
  const users = new Map<string, DiscordIdentity>();

  for (const id of channelIds) {
    const channel = allChannels.get(id);
    if (channel) channels.set(id, channel);
  }

  for (const id of roleIds) {
    const role = allRoles.get(id);
    if (role) roles.set(id, role);
  }

  for (const [id, user] of userResults) {
    if (user) users.set(id, user);
  }

  return { channels, roles, users };
}
