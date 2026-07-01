import { Settings } from 'lucide-react';
import { getGuildSettings } from '@/lib/database';
import { SettingsForm } from '@/components/dashboard/SettingsForm';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function SettingsPage({ params }: PageProps) {
  const { guildId } = await params;

  let settings: Awaited<ReturnType<typeof getGuildSettings>> | null = null;

  try {
    settings = (await getGuildSettings(guildId)) ?? null;
  } catch {
    // Gunakan nilai cadangan
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pengaturan Server</h1>
        <p className="mt-1 text-foreground-muted">
          Konfigurasi pengaturan server. Perubahan tersimpan secara instan.
        </p>
      </div>

      {!settings ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Settings className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Belum Ada Pengaturan</h2>
          <p className="mt-2 text-foreground-muted">
            Server ini belum dikonfigurasi. Mulai atur dari form di bawah.
          </p>
        </div>
      ) : null}

      <SettingsForm guildId={guildId} initialSettings={settings} />
    </div>
  );
}
