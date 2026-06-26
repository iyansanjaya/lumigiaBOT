import { Ticket, ExternalLink } from 'lucide-react';
import Link from 'next/link';
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
import { getTicketStats, getGuildTickets } from '@/lib/database';
import { TicketChart } from '@/components/dashboard/TicketChart';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

function getStatusVariant(status: string): 'success' | 'warning' | 'default' {
  switch (status) {
    case 'open':
      return 'success';
    case 'claimed':
      return 'warning';
    default:
      return 'default';
  }
}

function hasTranscript(guildId: string, ticketId: number): boolean {
  const dataDir = process.env.DATABASE_PATH
    ? join(process.env.DATABASE_PATH, '..', 'transcripts', guildId)
    : join(process.cwd(), '..', 'data', 'transcripts', guildId);

  return existsSync(join(dataDir, `ticket-${ticketId}.html`));
}

export default async function TicketsPage({ params }: PageProps) {
  const { guildId } = await params;

  let ticketStats = { open: 0, claimed: 0, closed: 0, total: 0 };
  let tickets: Awaited<ReturnType<typeof getGuildTickets>> = [];

  try {
    [ticketStats, tickets] = await Promise.all([
      getTicketStats(guildId),
      getGuildTickets(guildId, 50),
    ]);
  } catch {
    // Gunakan nilai cadangan
  }

  const statCards = [
    { label: 'Total Tickets', value: ticketStats.total },
    { label: 'Open', value: ticketStats.open },
    { label: 'Claimed', value: ticketStats.claimed },
    { label: 'Closed', value: ticketStats.closed },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tickets</h1>
        <p className="mt-1 text-foreground-muted">
          View and manage support tickets for this server.
        </p>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-foreground-muted">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grafik Tiket */}
      <Card>
        <CardContent>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Ticket Distribution</h2>
          <TicketChart stats={ticketStats} />
        </CardContent>
      </Card>

      {/* Tabel Tiket */}
      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Ticket className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Tickets</h2>
          <p className="mt-2 text-foreground-muted">
            No tickets have been created in this server yet.
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
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead>Transcript</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => {
                  const transcriptAvailable = ticket.status === 'closed' && hasTranscript(guildId, ticket.id);

                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                      <TableCell className="font-mono text-xs">{ticket.user_id}</TableCell>
                      <TableCell>{ticket.category ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground-muted whitespace-nowrap">
                        {new Date(ticket.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-foreground-muted whitespace-nowrap">
                        {ticket.closed_at
                          ? new Date(ticket.closed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {transcriptAvailable ? (
                          <Link
                            href={`/api/transcripts/${guildId}/${ticket.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </Link>
                        ) : (
                          <span className="text-xs text-foreground-muted">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
