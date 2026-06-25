export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

const MANAGE_GUILD = 0x20;

export async function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch guilds');
  }

  return res.json();
}

export function getManageableGuilds(guilds: DiscordGuild[]): DiscordGuild[] {
  return guilds.filter(
    (guild) => (parseInt(guild.permissions) & MANAGE_GUILD) === MANAGE_GUILD || guild.owner
  );
}

export function getGuildIconUrl(guild: DiscordGuild, size = 128): string {
  if (guild.icon) {
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=${size}`;
  }
  return `https://cdn.discordapp.com/embed/avatars/${parseInt(guild.id) % 5}.png`;
}
