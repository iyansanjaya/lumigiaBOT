import { Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getGuildGiveaways } from '@/lib/database';
import { getGuildIdentityMaps } from '@/lib/discord-identity';
import { DiscordEntityLabel } from '@/components/dashboard/DiscordEntityLabel';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function GiveawaysPage({ params }: PageProps) {
  const { guildId } = await params;

  let giveaways: Awaited<ReturnType<typeof getGuildGiveaways>> = [];

  try {
    giveaways = getGuildGiveaways(guildId);
  } catch {
    // Gunakan nilai cadangan
  }

  const identities = await getGuildIdentityMaps(guildId, {
    userIds: giveaways.map((giveaway) => giveaway.host_id),
    channelIds: giveaways.map((giveaway) => giveaway.channel_id),
  });

  const activeCount = giveaways.filter((g) => g.ended === 0).length;
  const endedCount = giveaways.filter((g) => g.ended === 1).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Giveaway</h1>
        <p className="mt-1 text-foreground-muted">
          Pantau semua giveaway yang tercatat di server ini.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/20 p-3">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{giveaways.length}</p>
              <p className="text-sm text-foreground-muted">Total Giveaway</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-green-500/20 p-3">
              <Gift className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-sm text-foreground-muted">Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-gray-500/20 p-3">
              <Gift className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{endedCount}</p>
              <p className="text-sm text-foreground-muted">Berakhir</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Giveaways Table */}
      {giveaways.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Gift className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Belum Ada Giveaway</h2>
          <p className="mt-2 text-foreground-muted">
            Belum ada giveaway yang dibuat di server ini.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hadiah</TableHead>
                  <TableHead>Pemenang</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Berakhir Pada</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {giveaways.map((giveaway) => (
                  <TableRow key={giveaway.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {giveaway.prize}
                    </TableCell>
                    <TableCell>{giveaway.winners_count}</TableCell>
                    <TableCell>
                      <DiscordEntityLabel
                        id={giveaway.host_id}
                        name={identities.users.get(giveaway.host_id)?.name}
                        type="user"
                      />
                    </TableCell>
                    <TableCell>
                      <DiscordEntityLabel
                        id={giveaway.channel_id}
                        name={identities.channels.get(giveaway.channel_id)?.name}
                        type="channel"
                      />
                    </TableCell>
                    <TableCell className="text-foreground-muted whitespace-nowrap">
                      {new Date(giveaway.ends_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      {giveaway.ended === 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                          Berakhir
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
