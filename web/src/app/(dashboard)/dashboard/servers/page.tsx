import Link from 'next/link';
import Image from 'next/image';
import { Server, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getUserGuilds, getManageableBotGuilds, getGuildIconUrl } from '@/lib/discord-api';
import { Card, CardContent } from '@/components/ui/card';

export default async function ServersPage() {
  const session = await auth();

  let guilds: Awaited<ReturnType<typeof getManageableBotGuilds>> = [];
  let error: string | null = null;

  try {
    if (!session?.accessToken) {
      throw new Error('Missing Discord access token');
    }

    const allGuilds = await getUserGuilds(session.accessToken);
    guilds = await getManageableBotGuilds(allGuilds);
  } catch {
    error = 'Gagal mengambil daftar server. Sesi Anda mungkin sudah kedaluwarsa. Coba keluar lalu login kembali.';
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Server Anda</h1>
        <Card>
          <CardContent className="flex items-center gap-4 text-destructive">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (guilds.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Server Anda</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Server className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Belum Ada Server yang Bisa Dikelola</h2>
          <p className="mt-2 max-w-md text-foreground-muted">
            Anda belum memiliki permission Manage Server di server mana pun, atau LumigiaBOT belum ditambahkan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Server Anda</h1>
        <p className="mt-1 text-foreground-muted">
          Pilih server untuk mengelola pengaturan dan fiturnya.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {guilds.map((guild) => {
          const iconUrl = getGuildIconUrl(guild);

          return (
            <Card key={guild.id}>
              <CardContent className="flex flex-col items-center gap-4 text-center">
                {iconUrl ? (
                  <Image
                    src={iconUrl}
                    alt={guild.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full ring-2 ring-border"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary text-xl font-bold ring-2 ring-border">
                    {guild.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-foreground truncate max-w-[200px]">
                    {guild.name}
                  </h3>
                </div>

                <Link
                  href={`/dashboard/servers/${guild.id}`}
                  prefetch={false}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-hover transition-colors"
                >
                  Kelola
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
