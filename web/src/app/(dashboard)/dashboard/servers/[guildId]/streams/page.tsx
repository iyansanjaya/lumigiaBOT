import { Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getStreamNotifications } from '@/lib/database';
import { StreamAlertsManager } from '@/components/dashboard/StreamAlertsManager';

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

      {/* Stream Alerts Manager */}
      <StreamAlertsManager guildId={guildId} initialNotifications={notifications} />
    </div>
  );
}
