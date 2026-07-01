'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Check, Hash, Volume2, FolderOpen, Megaphone } from 'lucide-react';
import {
  clearGuildDiscordDataCache,
  getGuildDiscordData,
  type DiscordChannel,
} from './discordDataClient';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

// Channel type constants
const CH_TEXT = 0;
const CH_VOICE = 2;
const CH_CATEGORY = 4;
const CH_ANNOUNCEMENT = 5;
const CH_STAGE = 13;
const CH_FORUM = 15;

// Map filter prop ke channel types
const TYPE_FILTER: Record<string, number[]> = {
  text: [CH_TEXT, CH_ANNOUNCEMENT, CH_FORUM],
  voice: [CH_VOICE, CH_STAGE],
  category: [CH_CATEGORY],
  all: [CH_TEXT, CH_VOICE, CH_CATEGORY, CH_ANNOUNCEMENT, CH_STAGE, CH_FORUM],
};

// Channel type icon
function ChannelIcon({ type }: { type: number }) {
  switch (type) {
    case CH_VOICE:
    case CH_STAGE:
      return <Volume2 className="h-3.5 w-3.5 text-foreground-muted shrink-0" />;
    case CH_CATEGORY:
      return <FolderOpen className="h-3.5 w-3.5 text-foreground-muted shrink-0" />;
    case CH_ANNOUNCEMENT:
      return <Megaphone className="h-3.5 w-3.5 text-foreground-muted shrink-0" />;
    default:
      return <Hash className="h-3.5 w-3.5 text-foreground-muted shrink-0" />;
  }
}

interface ChannelSelectProps {
  guildId: string;
  label: string;
  field: string;
  value: string | null | undefined;
  hint?: string;
  /** Filter channel type: 'text' | 'voice' | 'category' | 'all' */
  channelType?: 'text' | 'voice' | 'category' | 'all';
  /** API endpoint untuk save. Default: /api/guilds/{guildId}/settings */
  apiEndpoint?: string;
}

export function ChannelSelect({
  guildId,
  label,
  field,
  value,
  hint,
  channelType = 'text',
  apiEndpoint,
}: ChannelSelectProps) {
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentValue, setCurrentValue] = useState(value ?? '');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);

    getGuildDiscordData(guildId)
      .then(({ channels: ch }) => {
        if (cancelled) return;
        const allowed = TYPE_FILTER[channelType] ?? TYPE_FILTER.all;
        setChannels(ch.filter((c) => allowed.includes(c.type)));
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [guildId, channelType, retryKey]);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newVal = e.target.value;
      setCurrentValue(newVal);
      setSaveState('saving');

      const endpoint = apiEndpoint ?? `/api/guilds/${guildId}/settings`;
      try {
        const res = await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, value: newVal || null }),
        });
        setSaveState(res.ok ? 'saved' : 'error');
      } catch {
        setSaveState('error');
      }
      setTimeout(() => setSaveState('idle'), 2000);
    },
    [guildId, field, apiEndpoint],
  );

  if (error) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-foreground-muted text-sm">{label}</label>
        <span className="text-xs text-red-400">Gagal memuat channel Discord. Coba lagi, atau pastikan bot masih ada di server.</span>
        <button
          type="button"
          onClick={() => {
            clearGuildDiscordDataCache(guildId);
            setRetryKey((key) => key + 1);
          }}
          className="w-fit text-xs font-medium text-primary hover:text-primary-light"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground-muted text-sm">{label}</label>
      {hint && <p className="text-xs text-foreground-muted/70">{hint}</p>}
      <div className="flex items-center gap-2">
        <select
          value={currentValue}
          onChange={handleChange}
          disabled={loading}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        >
          <option value="">
            {loading ? 'Memuat channel...' : '— Pilih channel —'}
          </option>
          {channels.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.type === CH_CATEGORY ? `📁 ${ch.name.toUpperCase()}` : `# ${ch.name}`}
            </option>
          ))}
        </select>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />}
        {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />}
        {saveState === 'saved' && <Check className="h-4 w-4 text-green-500" />}
        {saveState === 'error' && <span className="text-xs text-red-400">Gagal</span>}
      </div>
    </div>
  );
}
