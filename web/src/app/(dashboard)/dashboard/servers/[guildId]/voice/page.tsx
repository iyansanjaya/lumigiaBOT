import { Mic } from 'lucide-react';
import { getVoiceSettings } from '@/lib/database';
import { VoiceSettingsForm } from '@/components/dashboard/VoiceSettingsForm';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function VoicePage({ params }: PageProps) {
  const { guildId } = await params;

  let settings: Awaited<ReturnType<typeof getVoiceSettings>> = undefined;

  try {
    settings = getVoiceSettings(guildId);
  } catch {
    // Gunakan nilai cadangan
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Voice Sementara</h1>
        <p className="mt-1 text-foreground-muted">
          Pengaturan temporary voice channel untuk server ini.
        </p>
      </div>

      <VoiceSettingsForm guildId={guildId} initialSettings={settings ?? null} />
    </div>
  );
}
