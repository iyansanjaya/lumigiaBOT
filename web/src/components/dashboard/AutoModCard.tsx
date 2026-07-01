'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check, Loader2,
  MessageSquare, Link2, Type, ShieldAlert, SmilePlus, AtSign,
} from 'lucide-react';
import { AUTOMOD_ACTION_CHOICES } from '@/lib/contracts';

const ICON_MAP: Record<string, React.ElementType> = {
  spam: MessageSquare,
  link: Link2,
  word: Type,
  caps: ShieldAlert,
  emoji: SmilePlus,
  mention: AtSign,
};

interface AutoModCardProps {
  guildId: string;
  filterKey: string;
  name: string;
  description: string;
  initialEnabled: boolean;
  initialAction: string;
  initialConfig?: Record<string, any>;
}

export function AutoModCard({
  guildId,
  filterKey,
  name,
  description,
  initialEnabled,
  initialAction,
  initialConfig = {},
}: AutoModCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [action, setAction] = useState(initialAction);
  const [config, setConfig] = useState<Record<string, any>>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const Icon = ICON_MAP[filterKey] || ShieldAlert;

  async function save(newEnabled: boolean, newAction: string, newConfig: Record<string, any> = config) {
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
          config: newConfig,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
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

  function handleConfigToggle(key: string) {
    const currentValue = config[key] ?? (key === 'blockInvites' || key === 'blockPhishing' ? true : false);
    const newConfig = { ...config, [key]: !currentValue };
    setConfig(newConfig);
    save(enabled, action, newConfig);
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
              {AUTOMOD_ACTION_CHOICES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          )}

          {saving && <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />}
          {saved && <Check className="h-4 w-4 text-green-500" />}
        </div>

        {/* ── Advanced Settings (Link Filter Only) ── */}
        {enabled && filterKey === 'link' && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Advanced Settings</h4>
            
            <label className="flex items-center justify-between text-sm cursor-pointer">
              <span className="text-foreground-muted">Block Discord Invites</span>
              <input 
                type="checkbox" 
                checked={config.blockInvites ?? true}
                onChange={() => handleConfigToggle('blockInvites')}
                disabled={saving}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
              />
            </label>

            <label className="flex items-center justify-between text-sm cursor-pointer">
              <span className="text-foreground-muted">Block Phishing Links (Beta)</span>
              <input 
                type="checkbox" 
                checked={config.blockPhishing ?? true}
                onChange={() => handleConfigToggle('blockPhishing')}
                disabled={saving}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
              />
            </label>

            <label className="flex items-center justify-between text-sm cursor-pointer">
              <span className="text-foreground-muted">Block HTTP Links (Insecure)</span>
              <input 
                type="checkbox" 
                checked={config.blockHttp ?? false}
                onChange={() => handleConfigToggle('blockHttp')}
                disabled={saving}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
              />
            </label>

            <label className="flex items-center justify-between text-sm cursor-pointer">
              <span className="text-foreground-muted">Block All URLs</span>
              <input 
                type="checkbox" 
                checked={config.blockAllUrls ?? false}
                onChange={() => handleConfigToggle('blockAllUrls')}
                disabled={saving}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
              />
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
