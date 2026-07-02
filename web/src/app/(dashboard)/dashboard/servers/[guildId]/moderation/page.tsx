import { Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getGuildWarnings } from '@/lib/database';
import { getGuildIdentityMaps } from '@/lib/discord-identity';
import { DiscordEntityLabel } from '@/components/dashboard/DiscordEntityLabel';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function ModerationPage({ params }: PageProps) {
  const { guildId } = await params;

  let warnings: Awaited<ReturnType<typeof getGuildWarnings>> = [];

  try {
    warnings = await getGuildWarnings(guildId, 100);
  } catch {
    // Gunakan nilai cadangan
  }

  const identities = await getGuildIdentityMaps(guildId, {
    userIds: warnings.flatMap((warning) => [warning.user_id, warning.moderator_id]),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Moderasi</h1>
        <p className="mt-1 text-foreground-muted">
          Lihat warning yang pernah diberikan di server ini.
        </p>
      </div>

      {/* Statistik */}
      <Card>
        <CardContent className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/20 p-3">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{warnings.length}</p>
            <p className="text-sm text-foreground-muted">Total Warning</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Peringatan */}
      {warnings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shield className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Belum Ada Warning</h2>
          <p className="mt-2 text-foreground-muted">
            Server ini belum memiliki warning yang tercatat.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Moderator</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warnings.map((warning) => (
                  <TableRow key={warning.id}>
                    <TableCell className="font-mono text-xs">{warning.id}</TableCell>
                    <TableCell>
                      <DiscordEntityLabel
                        id={warning.user_id}
                        name={identities.users.get(warning.user_id)?.name}
                        type="user"
                      />
                    </TableCell>
                    <TableCell>
                      <DiscordEntityLabel
                        id={warning.moderator_id}
                        name={identities.users.get(warning.moderator_id)?.name}
                        type="user"
                      />
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {warning.reason ?? 'Tidak ada alasan'}
                    </TableCell>
                    <TableCell className="text-foreground-muted whitespace-nowrap">
                      {new Date(warning.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
