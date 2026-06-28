'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Check } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  color: number;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

// ── Cache roles per guild (shared dengan ChannelSelect fetch) ──
const roleCache = new Map<string, { data: Role[]; expires: number }>();

async function fetchRoles(guildId: string): Promise<Role[]> {
  const cached = roleCache.get(guildId);
  if (cached && Date.now() < cached.expires) return cached.data;

  const res = await fetch(`/api/guilds/${guildId}/discord-data`);
  if (!res.ok) throw new Error('Gagal memuat roles');
  const { roles } = await res.json();
  roleCache.set(guildId, { data: roles, expires: Date.now() + 60_000 });
  return roles;
}

/** Konversi Discord int color ke hex CSS string */
function colorToHex(color: number): string {
  if (!color) return '#99aab5'; // Discord default gray
  return `#${color.toString(16).padStart(6, '0')}`;
}

interface RoleSelectProps {
  guildId: string;
  label: string;
  field: string;
  value: string | null | undefined;
  hint?: string;
  /** API endpoint untuk save. Default: /api/guilds/{guildId}/settings */
  apiEndpoint?: string;
}

export function RoleSelect({
  guildId,
  label,
  field,
  value,
  hint,
  apiEndpoint,
}: RoleSelectProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentValue, setCurrentValue] = useState(value ?? '');
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    fetchRoles(guildId)
      .then((r) => {
        setRoles(r);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [guildId]);

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
        <span className="text-xs text-red-400">Gagal memuat roles. Pastikan bot sudah ada di server.</span>
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
            {loading ? 'Memuat roles...' : '— Pilih role —'}
          </option>
          {roles.map((r) => (
            <option key={r.id} value={r.id} style={{ color: colorToHex(r.color) }}>
              @ {r.name}
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
