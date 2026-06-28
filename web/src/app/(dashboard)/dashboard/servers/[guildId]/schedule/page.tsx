import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getStreamSchedule, getScheduleSettings } from '@/lib/database';
import { ScheduleManager } from '@/components/dashboard/ScheduleManager';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function SchedulePage({ params }: PageProps) {
  const { guildId } = await params;

  let schedule: Awaited<ReturnType<typeof getStreamSchedule>> = [];
  let settings: Awaited<ReturnType<typeof getScheduleSettings>> = undefined;

  try {
    [schedule, settings] = [
      getStreamSchedule(guildId),
      getScheduleSettings(guildId),
    ];
  } catch {
    // Gunakan nilai cadangan
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stream Schedule</h1>
        <p className="mt-1 text-foreground-muted">
          Jadwal streaming mingguan untuk server ini.
        </p>
      </div>

      {/* Auto-Post Settings */}
      <Card>
        <CardContent className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/20 p-3">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-foreground">Auto-Post</p>
            <p className="text-sm text-foreground-muted">
              {settings?.auto_post_channel
                ? `Channel: ${settings.auto_post_channel}`
                : 'Channel belum dikonfigurasi'}
            </p>
          </div>
          {settings?.auto_post_enabled === 1 ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
              Aktif
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
              Nonaktif
            </span>
          )}
        </CardContent>
      </Card>

      {/* Schedule Manager (Client Component) */}
      <ScheduleManager guildId={guildId} initialSchedule={schedule} />
    </div>
  );
}
