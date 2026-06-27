import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getStreamSchedule, getScheduleSettings } from '@/lib/database';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

const DAY_NAMES: Record<number, string> = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

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

  // Group entries by day
  const grouped: Record<number, typeof schedule> = {};
  for (const entry of schedule) {
    if (!grouped[entry.day_of_week]) {
      grouped[entry.day_of_week] = [];
    }
    grouped[entry.day_of_week].push(entry);
  }

  // Sorted day keys (Senin=1 through Minggu=0, display Senin first)
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stream Schedule</h1>
        <p className="mt-1 text-foreground-muted">
          Weekly stream schedule for this server.
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
                : 'Channel not configured'}
            </p>
          </div>
          {settings?.auto_post_enabled === 1 ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
              Enabled
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
              Disabled
            </span>
          )}
        </CardContent>
      </Card>

      {/* Schedule by Day */}
      {schedule.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Schedule</h2>
          <p className="mt-2 text-foreground-muted">
            No stream schedule has been set up for this server.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dayOrder.map((day) => {
            const entries = grouped[day];
            if (!entries || entries.length === 0) return null;

            return (
              <Card key={day}>
                <CardContent className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    {DAY_NAMES[day]}
                  </h2>
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 rounded-lg bg-background-tertiary/50 px-4 py-3"
                      >
                        <Clock className="h-4 w-4 text-foreground-muted flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {entry.title}
                          </p>
                          {entry.description && (
                            <p className="text-xs text-foreground-muted mt-0.5">
                              {entry.description}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-mono text-foreground-muted">
                          {entry.time} {entry.timezone}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
