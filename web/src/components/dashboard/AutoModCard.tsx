'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';

interface AutoModCardProps {
  guildId: string;
  filterKey: string;
  name: string;
  description: string;
  icon: React.ElementType;
  initialEnabled: boolean;
  initialAction: string;
}

const ACTIONS = ['delete', 'warn', 'mute', 'kick', 'ban'];

export function AutoModCard({
  guildId,
  filterKey,
  name,
  description,
  icon: Icon,
  initialEnabled,
  initialAction,
}: AutoModCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [action, setAction] = useState(initialAction);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(newEnabled: boolean, newAction: string) {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/guilds/${guildId}/automod`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter_name: filterKey,
          enabled: newEnabled,
          action: newAction,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Revert on error
      setEnabled(initialEnabled);
      setAction(initialAction);
    } finally {
      setSaving(false);
    }
  }

  function handleToggle() {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    save(newEnabled, action);
  }

  function handleActionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newAction = e.target.value;
    setAction(newAction);
    save(enabled, newAction);
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-2">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{name}</h3>
          </div>

          {/* Toggle switch */}
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              enabled ? 'bg-primary' : 'bg-background-tertiary'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <p className="text-sm text-foreground-muted">{description}</p>

        <div className="flex items-center gap-2">
          <Badge variant={enabled ? 'success' : 'default'}>
            {enabled ? 'Enabled' : 'Disabled'}
          </Badge>

          {enabled && (
            <select
              value={action}
              onChange={handleActionChange}
              disabled={saving}
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </option>
              ))}
            </select>
          )}

          {saving && <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />}
          {saved && <Check className="h-4 w-4 text-green-500" />}
        </div>
      </CardContent>
    </Card>
  );
}
