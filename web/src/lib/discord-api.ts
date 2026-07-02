export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

const ADMINISTRATOR = BigInt(0x8);
const MANAGE_GUILD = BigInt(0x20);
const USER_GUILDS_CACHE_TTL_MS = 30_000;

const userGuildsCache = new Map<string, { guilds: DiscordGuild[]; expires: number }>();
const userGuildsInflight = new Map<string, Promise<DiscordGuild[]>>();

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
  const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
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

/**
 * Cek apakah user punya Manage Guild permission.
 * Menggunakan bitwise check pada permissions field.
 */
export function getManageableGuilds(guilds: DiscordGuild[]): DiscordGuild[] {
  return guilds.filter(hasGuildManagementPermission);
}

/**
 * Cek apakah user bisa manage guild tertentu.
 * Shortcut function untuk API routes.
 */
export async function canManageGuild(accessToken: string, guildId: string): Promise<boolean> {
  try {
    const allGuilds = await getUserGuilds(accessToken);
    const manageable = getManageableGuilds(allGuilds);
    return manageable.some((g) => g.id === guildId);
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
