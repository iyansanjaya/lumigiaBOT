import Link from 'next/link';
import { AlertTriangle, Ticket, ScrollText, Shield, Zap, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getGuildSettings, getTicketStats, getGuildWarnings, getGuildAuditLogs } from '@/lib/database';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function ServerOverviewPage({ params }: PageProps) {
  const { guildId } = await params;

  let warnings: Awaited<ReturnType<typeof getGuildWarnings>> = [];
  let ticketStats = { open: 0, claimed: 0, closed: 0, total: 0 };
  let auditLogs: Awaited<ReturnType<typeof getGuildAuditLogs>> = [];

  try {
    [warnings, ticketStats, auditLogs] = await Promise.all([
      getGuildWarnings(guildId, 5),
      getTicketStats(guildId),
      getGuildAuditLogs(guildId, 5),
    ]);
  } catch {
    // Gunakan nilai cadangan
  }

  const statCards = [
    { label: 'Total Warnings', value: warnings.length, icon: AlertTriangle },
    { label: 'Open Tickets', value: ticketStats.open, icon: Ticket },
    { label: 'Mod Actions', value: auditLogs.length, icon: ScrollText },
  ];

  const quickLinks = [
    { label: 'Moderation', href: `/dashboard/servers/${guildId}/moderation`, icon: Shield },
    { label: 'AutoMod', href: `/dashboard/servers/${guildId}/automod`, icon: Zap },
    { label: 'Tickets', href: `/dashboard/servers/${guildId}/tickets`, icon: Ticket },
    { label: 'Logs', href: `/dashboard/servers/${guildId}/logs`, icon: ScrollText },
    { label: 'Settings', href: `/dashboard/servers/${guildId}/settings`, icon: Settings },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Server Overview</h1>
        <p className="mt-1 text-foreground-muted">
          Quick look at your server&apos;s activity and stats.
        </p>
      </div>

      {/* Baris Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/20 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-foreground-muted">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Aktivitas Terbaru */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          {auditLogs.length === 0 ? (
            <p className="text-foreground-muted text-sm">No recent activity to display.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg bg-background-tertiary/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <ScrollText className="h-4 w-4 text-foreground-muted" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <p className="text-xs text-foreground-muted">
                        {log.reason ?? 'No reason provided'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-foreground-muted">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tautan Cepat */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center gap-2 py-4 text-center">
                    <Icon className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium text-foreground">{link.label}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
