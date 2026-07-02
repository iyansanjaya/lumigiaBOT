import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DISCORD_SNOWFLAKE_PATTERN } from '@/lib/contracts';
import { canManageGuild } from '@/lib/discord-api';

interface GuildDashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ guildId: string }>;
}

const DISCORD_SNOWFLAKE_RE = new RegExp(DISCORD_SNOWFLAKE_PATTERN);

export default async function GuildDashboardLayout({
  children,
  params,
}: GuildDashboardLayoutProps) {
  const session = await auth();
  if (!session?.accessToken) redirect('/');

  const { guildId } = await params;
  if (!DISCORD_SNOWFLAKE_RE.test(guildId)) redirect('/dashboard/servers');

  const hasAccess = await canManageGuild(session.accessToken, guildId);
  if (!hasAccess) redirect('/dashboard/servers');

  return children;
}
