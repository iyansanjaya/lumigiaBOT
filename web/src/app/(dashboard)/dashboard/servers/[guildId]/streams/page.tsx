import { Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getStreamNotifications } from '@/lib/database';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function StreamsPage({ params }: PageProps) {
  const { guildId } = await params;

  let notifications: Awaited<ReturnType<typeof getStreamNotifications>> = [];

  try {
    notifications = getStreamNotifications(guildId);
  } catch {
    // Gunakan nilai cadangan
  }

  const liveCount = notifications.filter((n) => n.is_live === 1).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stream Notifications</h1>
        <p className="mt-1 text-foreground-muted">
          Stream notification configurations for this server.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/20 p-3">
              <Radio className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
              <p className="text-sm text-foreground-muted">Total Configs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-green-500/20 p-3">
              <Radio className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{liveCount}</p>
              <p className="text-sm text-foreground-muted">Currently Live</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Radio className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Notifications</h2>
          <p className="mt-2 text-foreground-muted">
            No stream notifications have been configured yet.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Notify Channel</TableHead>
                  <TableHead>Ping Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notif) => (
                  <TableRow key={notif.id}>
                    <TableCell>
                      {notif.platform === 'twitch' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                          Twitch
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          YouTube
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{notif.platform_user}</TableCell>
                    <TableCell className="font-mono text-xs">{notif.notify_channel}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {notif.ping_role ?? 'None'}
                    </TableCell>
                    <TableCell>
                      {notif.is_live === 1 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Live
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                          Offline
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
