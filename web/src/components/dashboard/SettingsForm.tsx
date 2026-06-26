'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, ScrollText, Ticket, ShieldAlert, Megaphone, Save, Check, Loader2 } from 'lucide-react';

interface GuildSettings {
  guild_id: string;
  language: string | null;
  mod_log_channel: string | null;
  automod_log_channel: string | null;
  ticket_category: string | null;
  ticket_support_role: string | null;
  ticket_log_channel: string | null;
  ticket_max_open: number | null;
  ticket_auto_close_hours: number | null;
  anti_raid_enabled: number | null;
  anti_raid_threshold: number | null;
  anti_raid_timeframe: number | null;
  welcome_enabled: number | null;
  welcome_channel: string | null;
  welcome_message: string | null;
}

interface Props {
  guildId: string;
  initialSettings: GuildSettings | null;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function SettingInput({
  label,
  field,
  value,
  type = 'text',
  placeholder,
  guildId,
}: {
  label: string;
  field: string;
  value: string | number | null | undefined;
  type?: 'text' | 'number' | 'toggle';
  placeholder?: string;
  guildId: string;
}) {
  const [currentValue, setCurrentValue] = useState(value ?? '');
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const save = useCallback(async () => {
    setSaveState('saving');
    try {
      const sendValue = type === 'number'
        ? (currentValue === '' ? null : Number(currentValue))
        : (currentValue === '' ? null : currentValue);

      const res = await fetch(`/api/guilds/${guildId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: sendValue }),
      });

      if (!res.ok) throw new Error();
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }, [currentValue, field, guildId, type]);

  if (type === 'toggle') {
    const isEnabled = currentValue === 1 || currentValue === '1';
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-foreground-muted text-sm">{label}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              const newVal = isEnabled ? 0 : 1;
              setCurrentValue(newVal);
              setSaveState('saving');
              try {
                const res = await fetch(`/api/guilds/${guildId}/settings`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ field, value: newVal }),
                });
                if (!res.ok) throw new Error();
                setSaveState('saved');
                setTimeout(() => setSaveState('idle'), 2000);
              } catch {
                setSaveState('error');
                setTimeout(() => setSaveState('idle'), 3000);
              }
            }}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isEnabled ? 'bg-primary' : 'bg-background-tertiary'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-sm text-foreground">{isEnabled ? 'Enabled' : 'Disabled'}</span>
          {saveState === 'saved' && <Check className="h-4 w-4 text-green-500" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground-muted text-sm">{label}</label>
      <div className="flex gap-2">
        <input
          type={type}
          value={currentValue ?? ''}
          onChange={(e) => {
            setCurrentValue(e.target.value);
            if (saveState !== 'idle') setSaveState('idle');
          }}
          placeholder={placeholder || 'Not configured'}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={save}
          disabled={saveState === 'saving'}
          className="flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 px-3 py-2 text-sm font-medium text-white transition-colors"
        >
          {saveState === 'saving' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saveState === 'saved' ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </button>
      </div>
      {saveState === 'error' && (
        <span className="text-xs text-red-400">Gagal menyimpan. Coba lagi.</span>
      )}
    </div>
  );
}

export function SettingsForm({ guildId, initialSettings }: Props) {
  const s = initialSettings;

  return (
    <div className="space-y-6">
      {/* General */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">General</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingInput label="Language" field="language" value={s?.language} guildId={guildId} placeholder="en" />
          </div>
        </CardContent>
      </Card>

      {/* Logging */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <ScrollText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Logging</h2>
          </div>
          <p className="text-xs text-foreground-muted">Masukkan Channel ID dari Discord (klik kanan channel → Copy Channel ID)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingInput label="Mod Log Channel" field="mod_log_channel" value={s?.mod_log_channel} guildId={guildId} placeholder="Channel ID" />
            <SettingInput label="AutoMod Log Channel" field="automod_log_channel" value={s?.automod_log_channel} guildId={guildId} placeholder="Channel ID" />
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Ticket className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Tickets</h2>
          </div>
          <p className="text-xs text-foreground-muted">Masukkan ID dari Discord (klik kanan → Copy ID)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SettingInput label="Category ID" field="ticket_category" value={s?.ticket_category} guildId={guildId} placeholder="Category ID" />
            <SettingInput label="Support Role ID" field="ticket_support_role" value={s?.ticket_support_role} guildId={guildId} placeholder="Role ID" />
            <SettingInput label="Log Channel ID" field="ticket_log_channel" value={s?.ticket_log_channel} guildId={guildId} placeholder="Channel ID" />
            <SettingInput label="Max Open Tickets" field="ticket_max_open" value={s?.ticket_max_open} guildId={guildId} type="number" placeholder="1" />
            <SettingInput label="Auto Close (hours)" field="ticket_auto_close_hours" value={s?.ticket_auto_close_hours} guildId={guildId} type="number" placeholder="48" />
          </div>
        </CardContent>
      </Card>

      {/* Anti-Raid */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Anti-Raid</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SettingInput label="Anti-Raid" field="anti_raid_enabled" value={s?.anti_raid_enabled} guildId={guildId} type="toggle" />
            <SettingInput label="Threshold (joins)" field="anti_raid_threshold" value={s?.anti_raid_threshold} guildId={guildId} type="number" placeholder="10" />
            <SettingInput label="Timeframe (seconds)" field="anti_raid_timeframe" value={s?.anti_raid_timeframe} guildId={guildId} type="number" placeholder="10" />
          </div>
        </CardContent>
      </Card>

      {/* Welcome */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Welcome</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingInput label="Welcome" field="welcome_enabled" value={s?.welcome_enabled} guildId={guildId} type="toggle" />
            <SettingInput label="Welcome Channel ID" field="welcome_channel" value={s?.welcome_channel} guildId={guildId} placeholder="Channel ID" />
          </div>
          <SettingInput label="Welcome Message" field="welcome_message" value={s?.welcome_message} guildId={guildId} placeholder="Welcome {user} to {server}!" />
        </CardContent>
      </Card>
    </div>
  );
}
