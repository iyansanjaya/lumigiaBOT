'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Check, Hash, Volume2, FolderOpen, Megaphone } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  type: number; // 0=text, 2=voice, 4=category, 5=announcement, 13=stage, 15=forum
  parent_id: string | null;
}

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

// ── Cache channels per guild ──
const channelCache = new Map<string, { data: Channel[]; expires: number }>();

async function fetchChannels(guildId: string): Promise<Channel[]> {
  const cached = channelCache.get(guildId);
  if (cached && Date.now() < cached.expires) return cached.data;

  const res = await fetch(`/api/guilds/${guildId}/discord-data`);
  if (!res.ok) throw new Error('Gagal memuat channel');
  const { channels } = await res.json();
  channelCache.set(guildId, { data: channels, expires: Date.now() + 60_000 });
  return channels;
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
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentValue, setCurrentValue] = useState(value ?? '');
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    fetchChannels(guildId)
      .then((ch) => {
        const allowed = TYPE_FILTER[channelType] ?? TYPE_FILTER.all;
        setChannels(ch.filter((c) => allowed.includes(c.type)));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [guildId, channelType]);

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
        <span className="text-xs text-red-400">Gagal memuat channel. Pastikan bot sudah ada di server.</span>
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
