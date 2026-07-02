import Link from 'next/link';
import { Server, Ticket, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { getManageableBotGuilds, getUserGuilds } from '@/lib/discord-api';
import { getDashboardStatsForGuilds, type DashboardStats } from '@/lib/database';

export default async function DashboardPage() {
  let stats: DashboardStats = { totalGuilds: 0, totalTickets: 0, totalWarnings: 0 };
  let overviewError: string | null = null;

  try {
    const session = await auth();
    if (!session?.accessToken) throw new Error('Missing Discord access token');

    const allGuilds = await getUserGuilds(session.accessToken);
    const manageableGuilds = await getManageableBotGuilds(allGuilds);
    stats = getDashboardStatsForGuilds(manageableGuilds.map((guild) => guild.id));
  } catch {
    overviewError = 'Gagal memuat ringkasan server. Sesi Anda mungkin sudah kedaluwarsa. Coba keluar lalu login kembali.';
  }

  const hasManageableGuilds = stats.totalGuilds > 0;

  const statCards = [
    {
      label: 'Server Bisa Dikelola',
      value: stats.totalGuilds,
      icon: Server,
    },
    {
      label: 'Total Tiket',
      value: stats.totalTickets,
      icon: Ticket,
    },
    {
      label: 'Total Warning',
      value: stats.totalWarnings,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ringkasan Dashboard</h1>
        <p className="mt-1 text-foreground-muted">
          Selamat datang kembali. Berikut ringkasan aktivitas server yang bisa Anda kelola.
        </p>
      </div>

      {overviewError && (
        <Card>
          <CardContent className="flex items-center gap-4 text-destructive">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <p className="text-sm">{overviewError}</p>
          </CardContent>
        </Card>
      )}

      {/* Kartu Statistik */}
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

      {/* Bagian Selamat Datang */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            {hasManageableGuilds ? 'Mulai Kelola Server' : 'Belum Ada Server yang Bisa Dikelola'}
          </h2>
          <p className="text-foreground-muted">
            {hasManageableGuilds
              ? 'Kelola server Discord, konfigurasi moderasi, dan pantau aktivitas dari satu tempat.'
              : 'Akun ini belum memiliki permission Manage Server di server mana pun yang dapat dibuka lewat dashboard.'}
          </p>
          <Link
            href="/dashboard/servers"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            <Server className="h-4 w-4" />
            Lihat Server
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
