export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

const ADMINISTRATOR = BigInt(0x8);
const MANAGE_GUILD = BigInt(0x20);
const DISCORD_API_URL = 'https://discord.com/api/v10';
const BOT_TOKEN = process.env.DISCORD_TOKEN;
const USER_GUILDS_CACHE_TTL_MS = 30_000;
const BOT_GUILD_CACHE_TTL_MS = 60_000;

const userGuildsCache = new Map<string, { guilds: DiscordGuild[]; expires: number }>();
const userGuildsInflight = new Map<string, Promise<DiscordGuild[]>>();
const botGuildCache = new Map<string, { exists: boolean; expires: number }>();
const botGuildInflight = new Map<string, Promise<boolean>>();

function hasGuildManagementPermission(guild: DiscordGuild) {
  if (guild.owner) return true;

  try {
    const permissions = BigInt(guild.permissions);
    return (
      (permissions & MANAGE_GUILD) === MANAGE_GUILD ||
      (permissions & ADMINISTRATOR) === ADMINISTRATOR
    );
  } catch {
    return false;
  }
}

/**
 * Fetch user guilds dari Discord API.
 * Versi tanpa Next.js cache — untuk dipakai di Route Handlers / API routes.
 */
export async function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  if (!accessToken) throw new Error('Discord access token is missing');

  const cached = userGuildsCache.get(accessToken);
  if (cached && Date.now() < cached.expires) {
    return cached.guilds;
  }

  const pending = userGuildsInflight.get(accessToken);
  if (pending) return pending;

  const request = fetchUserGuilds(accessToken)
    .then((guilds) => {
      userGuildsCache.set(accessToken, {
        guilds,
        expires: Date.now() + USER_GUILDS_CACHE_TTL_MS,
      });
      return guilds;
    })
    .finally(() => {
      userGuildsInflight.delete(accessToken);
    });

  userGuildsInflight.set(accessToken, request);
  return request;
}

async function fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch(`${DISCORD_API_URL}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown');
    throw new Error(`Discord API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function isBotInGuild(guildId: string): Promise<boolean> {
  if (!BOT_TOKEN) return false;

  const cached = botGuildCache.get(guildId);
  if (cached && Date.now() < cached.expires) {
    return cached.exists;
  }

  const pending = botGuildInflight.get(guildId);
  if (pending) return pending;

  const request = fetch(`${DISCORD_API_URL}/guilds/${guildId}`, {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
    },
    cache: 'no-store',
  })
    .then((res) => res.ok)
    .catch(() => false)
    .then((exists) => {
      botGuildCache.set(guildId, {
        exists,
        expires: Date.now() + BOT_GUILD_CACHE_TTL_MS,
      });
      return exists;
    })
    .finally(() => {
      botGuildInflight.delete(guildId);
    });

  botGuildInflight.set(guildId, request);
  return request;
}

/**
 * Cek apakah user punya Manage Guild permission.
 * Menggunakan bitwise check pada permissions field.
 */
export function getManageableGuilds(guilds: DiscordGuild[]): DiscordGuild[] {
  return guilds.filter(hasGuildManagementPermission);
}

export async function getManageableBotGuilds(guilds: DiscordGuild[]): Promise<DiscordGuild[]> {
  const manageableGuilds = getManageableGuilds(guilds);
  const membership = await Promise.all(
    manageableGuilds.map(async (guild) => [guild, await isBotInGuild(guild.id)] as const),
  );

  return membership.filter(([, exists]) => exists).map(([guild]) => guild);
}

/**
 * Cek apakah user bisa manage guild tertentu dan bot masih ada di guild itu.
 * Shortcut function untuk API routes.
 */
export async function canManageGuild(accessToken: string, guildId: string): Promise<boolean> {
  try {
    const allGuilds = await getUserGuilds(accessToken);
    const manageable = getManageableGuilds(allGuilds);
    if (!manageable.some((g) => g.id === guildId)) return false;
    return isBotInGuild(guildId);
  } catch {
    return false;
  }
}

export function getGuildIconUrl(guild: DiscordGuild, size = 128): string {
  if (guild.icon) {
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=${size}`;
  }
  return `https://cdn.discordapp.com/embed/avatars/${parseInt(guild.id) % 5}.png`;
}
