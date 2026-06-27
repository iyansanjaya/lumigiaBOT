import { Mic } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getVoiceSettings } from '@/lib/database';

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

  if (!settings) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Voice Channels</h1>
          <p className="mt-1 text-foreground-muted">
            Temporary voice channel settings for this server.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Mic className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Not Configured</h2>
          <p className="mt-2 text-foreground-muted">
            Voice channel settings have not been configured for this server.
          </p>
        </div>
      </div>
    );
  }

  const isEnabled = settings.enabled === 1;

  const settingItems = [
    { label: 'Status', value: isEnabled ? 'Enabled' : 'Disabled' },
    { label: 'Hub Channel', value: settings.hub_channel_id ?? 'Not set' },
    { label: 'Category', value: settings.category_id ?? 'Not set' },
    { label: 'Default Name', value: settings.default_name || 'Not set' },
    { label: 'Default Limit', value: settings.default_limit === 0 ? 'Unlimited' : `${settings.default_limit} users` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Voice Channels</h1>
        <p className="mt-1 text-foreground-muted">
          Temporary voice channel settings for this server.
        </p>
      </div>

      {/* Status */}
      <Card>
        <CardContent className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/20 p-3">
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold text-foreground">Voice System</p>
            {isEnabled ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                Active
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                Disabled
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Grid */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Configuration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settingItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg bg-background-tertiary/50 px-4 py-3"
              >
                <p className="text-xs text-foreground-muted uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground font-mono">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
