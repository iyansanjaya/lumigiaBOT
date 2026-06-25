import { Settings, Globe, ScrollText, Ticket, ShieldAlert, Megaphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getGuildSettings } from '@/lib/database';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

function SettingField({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  let displayValue: string;

  if (value === null || value === undefined) {
    displayValue = 'Not configured';
  } else if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  } else {
    displayValue = String(value);
  }

  const isUnconfigured = value === null || value === undefined;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-foreground-muted text-sm">{label}</span>
      <span className={isUnconfigured ? 'text-foreground-muted italic' : 'text-foreground'}>
        {displayValue}
      </span>
    </div>
  );
}

export default async function SettingsPage({ params }: PageProps) {
  const { guildId } = await params;

  let settings: Awaited<ReturnType<typeof getGuildSettings>> | null = null;

  try {
    settings = await getGuildSettings(guildId);
  } catch {
    // Gunakan nilai cadangan
  }

  if (!settings) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Server Settings</h1>
          <p className="mt-1 text-foreground-muted">
            View the current configuration for this server.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Settings className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Settings Configured</h2>
          <p className="mt-2 text-foreground-muted">
            This server hasn&apos;t been configured yet. Use bot commands to set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Server Settings</h1>
        <p className="mt-1 text-foreground-muted">
          Current configuration for this server (read-only).
        </p>
      </div>

      {/* Umum */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">General</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingField label="Language" value={settings.language} />
          </div>
        </CardContent>
      </Card>

      {/* Pencatatan */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <ScrollText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Logging</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingField label="Mod Log Channel" value={settings.modLogChannel} />
            <SettingField label="AutoMod Log Channel" value={settings.autoModLogChannel} />
          </div>
        </CardContent>
      </Card>

      {/* Tiket */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Ticket className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Tickets</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SettingField label="Category" value={settings.ticketCategory} />
            <SettingField label="Support Role" value={settings.ticketSupportRole} />
            <SettingField label="Log Channel" value={settings.ticketLogChannel} />
            <SettingField label="Max Open" value={settings.ticketMaxOpen} />
            <SettingField label="Auto Close Hours" value={settings.ticketAutoCloseHours} />
          </div>
        </CardContent>
      </Card>

      {/* Anti-Serangan */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Anti-Raid</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SettingField label="Enabled" value={settings.antiRaidEnabled} />
            <SettingField label="Threshold" value={settings.antiRaidThreshold} />
            <SettingField label="Timeframe" value={settings.antiRaidTimeframe} />
          </div>
        </CardContent>
      </Card>

      {/* Selamat Datang */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Welcome</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingField label="Enabled" value={settings.welcomeEnabled} />
            <SettingField label="Channel" value={settings.welcomeChannel} />
          </div>
          <SettingField label="Message" value={settings.welcomeMessage} />
        </CardContent>
      </Card>
    </div>
  );
}
