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
  warn_escalation: string | null;
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

// ─── Save helper ───
async function saveSetting(guildId: string, field: string, value: string | number | null): Promise<boolean> {
  try {
    const res = await fetch(`/api/guilds/${guildId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, value }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Toggle Input ───
function ToggleInput({
  label, field, value, guildId,
}: {
  label: string; field: string; value: number | null | undefined; guildId: string;
}) {
  const [enabled, setEnabled] = useState(value === 1);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  async function toggle() {
    const newVal = enabled ? 0 : 1;
    setEnabled(!enabled);
    setSaveState('saving');
    const ok = await saveSetting(guildId, field, newVal);
    setSaveState(ok ? 'saved' : 'error');
    if (!ok) setEnabled(enabled);
    setTimeout(() => setSaveState('idle'), 2000);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-foreground-muted text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            enabled ? 'bg-primary' : 'bg-background-tertiary'
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
        <span className="text-sm text-foreground">{enabled ? 'Enabled' : 'Disabled'}</span>
        {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />}
        {saveState === 'saved' && <Check className="h-4 w-4 text-green-500" />}
        {saveState === 'error' && <span className="text-xs text-red-400">Gagal</span>}
      </div>
    </div>
  );
}

// ─── Select Input (Dropdown) ───
function SelectInput({
  label, field, value, guildId, options, placeholder,
}: {
  label: string; field: string; value: string | number | null | undefined; guildId: string;
  options: { value: string; label: string }[]; placeholder?: string;
}) {
  const [currentValue, setCurrentValue] = useState(String(value ?? ''));
  const [saveState, setSaveState] = useState<SaveState>('idle');

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newVal = e.target.value;
    setCurrentValue(newVal);
    setSaveState('saving');
    const sendVal = newVal === '' ? null : newVal;
    const ok = await saveSetting(guildId, field, sendVal);
    setSaveState(ok ? 'saved' : 'error');
    setTimeout(() => setSaveState('idle'), 2000);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground-muted text-sm">{label}</label>
      <div className="flex items-center gap-2">
        <select
          value={currentValue}
          onChange={handleChange}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">{placeholder || '— Not configured —'}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />}
        {saveState === 'saved' && <Check className="h-4 w-4 text-green-500" />}
        {saveState === 'error' && <span className="text-xs text-red-400">Gagal</span>}
      </div>
    </div>
  );
}

// ─── Text/Number Input with Save Button ───
function TextInput({
  label, field, value, guildId, type = 'text', placeholder, hint,
}: {
  label: string; field: string; value: string | number | null | undefined; guildId: string;
  type?: 'text' | 'number'; placeholder?: string; hint?: string;
}) {
  const [currentValue, setCurrentValue] = useState(String(value ?? ''));
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const save = useCallback(async () => {
    setSaveState('saving');
    const sendValue = type === 'number'
      ? (currentValue === '' ? null : Number(currentValue))
      : (currentValue === '' ? null : currentValue);
    const ok = await saveSetting(guildId, field, sendValue);
    setSaveState(ok ? 'saved' : 'error');
    setTimeout(() => setSaveState('idle'), ok ? 2000 : 3000);
  }, [currentValue, field, guildId, type]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground-muted text-sm">{label}</label>
      {hint && <p className="text-xs text-foreground-muted/70">{hint}</p>}
      <div className="flex gap-2">
        <input
          type={type}
          value={currentValue}
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
      {saveState === 'error' && <span className="text-xs text-red-400">Gagal menyimpan. Coba lagi.</span>}
    </div>
  );
}

// ─── Main Form ───
export function SettingsForm({ guildId, initialSettings }: Props) {
  const s = initialSettings;

  const languageOptions = [
    { value: 'en', label: '🇬🇧 English' },
    { value: 'id', label: '🇮🇩 Bahasa Indonesia' },
  ];

  const maxOpenOptions = [
    { value: '1', label: '1 tiket' },
    { value: '2', label: '2 tiket' },
    { value: '3', label: '3 tiket' },
    { value: '4', label: '4 tiket' },
    { value: '5', label: '5 tiket' },
  ];

  const autoCloseOptions = [
    { value: '12', label: '12 jam' },
    { value: '24', label: '24 jam (1 hari)' },
    { value: '48', label: '48 jam (2 hari)' },
    { value: '72', label: '72 jam (3 hari)' },
    { value: '168', label: '168 jam (7 hari)' },
  ];

  const raidThresholdOptions = [
    { value: '5', label: '5 joins' },
    { value: '10', label: '10 joins' },
    { value: '15', label: '15 joins' },
    { value: '20', label: '20 joins' },
    { value: '30', label: '30 joins' },
  ];

  const raidTimeframeOptions = [
    { value: '5', label: '5 detik' },
    { value: '10', label: '10 detik' },
    { value: '15', label: '15 detik' },
    { value: '30', label: '30 detik' },
    { value: '60', label: '60 detik' },
  ];

  const escalationOptions = [
    { value: 'none', label: 'None — hanya warning' },
    { value: 'mute', label: 'Mute setelah batas' },
    { value: 'kick', label: 'Kick setelah batas' },
    { value: 'ban', label: 'Ban setelah batas' },
  ];

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
            <SelectInput label="Language" field="language" value={s?.language} guildId={guildId} options={languageOptions} placeholder="— Select language —" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Mod Log Channel" field="mod_log_channel" value={s?.mod_log_channel} guildId={guildId} placeholder="Channel ID" hint="Klik kanan channel → Copy Channel ID" />
            <TextInput label="AutoMod Log Channel" field="automod_log_channel" value={s?.automod_log_channel} guildId={guildId} placeholder="Channel ID" hint="Klik kanan channel → Copy Channel ID" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextInput label="Category ID" field="ticket_category" value={s?.ticket_category} guildId={guildId} placeholder="Category ID" hint="Klik kanan kategori → Copy ID" />
            <TextInput label="Support Role ID" field="ticket_support_role" value={s?.ticket_support_role} guildId={guildId} placeholder="Role ID" hint="Klik kanan role → Copy Role ID" />
            <TextInput label="Log Channel ID" field="ticket_log_channel" value={s?.ticket_log_channel} guildId={guildId} placeholder="Channel ID" hint="Klik kanan channel → Copy Channel ID" />
            <SelectInput label="Max Open Tickets" field="ticket_max_open" value={s?.ticket_max_open} guildId={guildId} options={maxOpenOptions} placeholder="— Default (1) —" />
            <SelectInput label="Auto Close Timeout" field="ticket_auto_close_hours" value={s?.ticket_auto_close_hours} guildId={guildId} options={autoCloseOptions} placeholder="— Default (48 jam) —" />
          </div>
        </CardContent>
      </Card>

      {/* Moderation */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Anti-Raid</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToggleInput label="Anti-Raid" field="anti_raid_enabled" value={s?.anti_raid_enabled} guildId={guildId} />
            <SelectInput label="Threshold" field="anti_raid_threshold" value={s?.anti_raid_threshold} guildId={guildId} options={raidThresholdOptions} placeholder="— Default (10) —" />
            <SelectInput label="Timeframe" field="anti_raid_timeframe" value={s?.anti_raid_timeframe} guildId={guildId} options={raidTimeframeOptions} placeholder="— Default (10s) —" />
          </div>
        </CardContent>
      </Card>

      {/* Warning Escalation */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Warning Escalation</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput label="Escalation Action" field="warn_escalation" value={s?.warn_escalation} guildId={guildId} options={escalationOptions} placeholder="— None —" />
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
            <ToggleInput label="Welcome" field="welcome_enabled" value={s?.welcome_enabled} guildId={guildId} />
            <TextInput label="Welcome Channel ID" field="welcome_channel" value={s?.welcome_channel} guildId={guildId} placeholder="Channel ID" hint="Klik kanan channel → Copy Channel ID" />
          </div>
          <TextInput label="Welcome Message" field="welcome_message" value={s?.welcome_message} guildId={guildId} placeholder="Welcome {user} to {server}!" hint="Gunakan {user} untuk mention user, {server} untuk nama server" />
        </CardContent>
      </Card>
    </div>
  );
}
