import { cn } from '@/lib/utils';

interface DiscordEntityLabelProps {
  id: string | null | undefined;
  name?: string | null;
  type: 'channel' | 'role' | 'user';
  emptyLabel?: string;
  className?: string;
}

const TYPE_PREFIX = {
  channel: '#',
  role: '@',
  user: '@',
};

const FALLBACK_LABEL = {
  channel: 'Channel tidak ditemukan',
  role: 'Role tidak ditemukan',
  user: 'User tidak ditemukan',
};

export function DiscordEntityLabel({
  id,
  name,
  type,
  emptyLabel = '—',
  className,
}: DiscordEntityLabelProps) {
  if (!id) {
    return <span className="text-foreground-muted">{emptyLabel}</span>;
  }

  const displayName = name ? `${TYPE_PREFIX[type]}${name}` : FALLBACK_LABEL[type];

  return (
    <span className={cn('inline-flex min-w-0 flex-col gap-0.5', className)}>
      <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
      <span className="font-mono text-[11px] leading-none text-foreground-muted">ID: {id}</span>
    </span>
  );
}
