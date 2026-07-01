import { Tags } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getReactionRolePanels, getReactionRoleEntries } from '@/lib/database';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function RolesPage({ params }: PageProps) {
  const { guildId } = await params;

  let panels: Awaited<ReturnType<typeof getReactionRolePanels>> = [];

  try {
    panels = getReactionRolePanels(guildId);
  } catch {
    // Gunakan nilai cadangan
  }

  // Get entry counts for each panel
  const panelsWithCounts = panels.map((panel) => {
    let entries: Awaited<ReturnType<typeof getReactionRoleEntries>> = [];
    try {
      entries = getReactionRoleEntries(panel.id);
    } catch {
      // Gunakan nilai cadangan
    }
    return { ...panel, entryCount: entries.length };
  });

  const modeLabels: Record<string, string> = {
    toggle: 'Toggle',
    single: 'Single',
    verify: 'Verify',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Role Reaksi</h1>
        <p className="mt-1 text-foreground-muted">
          Pantau panel role reaksi dan entry yang sudah dibuat.
        </p>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/20 p-3">
            <Tags className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{panels.length}</p>
            <p className="text-sm text-foreground-muted">Total Panel</p>
          </div>
        </CardContent>
      </Card>

      {/* Panels Table */}
      {panelsWithCounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Tags className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Belum Ada Panel</h2>
          <p className="mt-2 text-foreground-muted">
            Belum ada panel role reaksi yang dibuat.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {panelsWithCounts.map((panel) => (
                  <TableRow key={panel.id}>
                    <TableCell className="font-medium">{panel.title}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary-light">
                        {modeLabels[panel.mode] ?? panel.mode}
                      </span>
                    </TableCell>
                    <TableCell>{panel.entryCount}</TableCell>
                    <TableCell className="font-mono text-xs">{panel.channel_id}</TableCell>
                    <TableCell>
                      {panel.message_id ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Terpasang
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                          Draft
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground-muted whitespace-nowrap">
                      {new Date(panel.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
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
