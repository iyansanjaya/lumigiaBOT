import { ScrollText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getGuildAuditLogs } from '@/lib/database';
import { getGuildIdentityMaps } from '@/lib/discord-identity';
import { DiscordEntityLabel } from '@/components/dashboard/DiscordEntityLabel';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function LogsPage({ params }: PageProps) {
  const { guildId } = await params;

  let auditLogs: Awaited<ReturnType<typeof getGuildAuditLogs>> = [];

  try {
    auditLogs = await getGuildAuditLogs(guildId, 100);
  } catch {
    // Gunakan nilai cadangan
  }

  const identities = await getGuildIdentityMaps(guildId, {
    userIds: auditLogs.flatMap((log) => [log.moderator_id, log.target_id]),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
        <p className="mt-1 text-foreground-muted">
          Lihat semua aksi moderasi dan bot yang tercatat di server ini.
        </p>
      </div>

      {auditLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ScrollText className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Belum Ada Audit Log</h2>
          <p className="mt-2 text-foreground-muted">
            Belum ada aksi yang tercatat di server ini.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Moderator</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.id}</TableCell>
                    <TableCell>
                      <Badge variant="default">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <DiscordEntityLabel
                        id={log.moderator_id}
                        name={identities.users.get(log.moderator_id)?.name}
                        type="user"
                      />
                    </TableCell>
                    <TableCell>
                      <DiscordEntityLabel
                        id={log.target_id}
                        name={log.target_id ? identities.users.get(log.target_id)?.name : null}
                        type="user"
                      />
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {log.reason ?? 'Tidak ada alasan'}
                    </TableCell>
                    <TableCell className="text-foreground-muted whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString('id-ID', {
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
