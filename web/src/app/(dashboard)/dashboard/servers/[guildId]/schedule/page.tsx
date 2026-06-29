import { Calendar } from 'lucide-react';
import { getStreamSchedule } from '@/lib/database';
import { ScheduleManager } from '@/components/dashboard/ScheduleManager';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function SchedulePage({ params }: PageProps) {
  const { guildId } = await params;

  let schedule: Awaited<ReturnType<typeof getStreamSchedule>> = [];

  try {
    schedule = getStreamSchedule(guildId);
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


      {/* Schedule Manager (Client Component) */}
      <ScheduleManager guildId={guildId} initialSchedule={schedule} />
    </div>
  );
}
