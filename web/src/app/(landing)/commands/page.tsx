'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Shield,
  Zap,
  Ticket,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────── Data Perintah ─────────────────────── */
interface Command {
  name: string;
  description: string;
  permission: string;
}

interface CommandCategory {
  name: string;
  icon: typeof Shield;
  color: string;
  commands: Command[];
}

const categories: CommandCategory[] = [
  {
    name: 'Moderation',
    icon: Shield,
    color: 'primary',
    commands: [
      { name: '/warn', description: 'Issue a warning to a user with a specified reason.', permission: 'Moderator' },
      { name: '/kick', description: 'Kick a user from the server.', permission: 'Moderator' },
      { name: '/ban', description: 'Permanently ban a user from the server.', permission: 'Admin' },
      { name: '/unban', description: 'Remove a ban from a previously banned user.', permission: 'Admin' },
      { name: '/mute', description: 'Temporarily mute a user for a specified duration.', permission: 'Moderator' },
      { name: '/unmute', description: 'Remove a mute from a user.', permission: 'Moderator' },
      { name: '/warnings', description: 'View all active warnings for a user.', permission: 'Moderator' },
      { name: '/clearwarnings', description: 'Clear all warnings for a specific user.', permission: 'Admin' },
      { name: '/purge', description: 'Bulk delete messages from a channel.', permission: 'Moderator' },
    ],
  },
  {
    name: 'Auto-Moderation',
    icon: Zap,
    color: 'accent',
    commands: [
      { name: '/automod enable', description: 'Enable auto-moderation for the server.', permission: 'Admin' },
      { name: '/automod disable', description: 'Disable auto-moderation for the server.', permission: 'Admin' },
      { name: '/automod config', description: 'Configure auto-moderation settings and thresholds.', permission: 'Admin' },
      { name: '/automod whitelist', description: 'Add channels or roles to the auto-mod whitelist.', permission: 'Admin' },
      { name: '/wordfilter add', description: 'Add a word or regex pattern to the filter list.', permission: 'Admin' },
      { name: '/wordfilter remove', description: 'Remove a word or pattern from the filter list.', permission: 'Admin' },
      { name: '/wordfilter list', description: 'View all active word filter entries.', permission: 'Moderator' },
    ],
  },
  {
    name: 'Tickets',
    icon: Ticket,
    color: 'success',
    commands: [
      { name: '/ticket create', description: 'Create a new support ticket with a topic.', permission: 'Everyone' },
      { name: '/ticket close', description: 'Close the current ticket and generate a transcript.', permission: 'Staff' },
      { name: '/ticket claim', description: 'Claim an unclaimed ticket as your own.', permission: 'Staff' },
      { name: '/ticket reopen', description: 'Reopen a previously closed ticket.', permission: 'Staff' },
      { name: '/ticket config', description: 'Configure ticket categories, roles, and settings.', permission: 'Admin' },
    ],
  },
  {
    name: 'Utility',
    icon: Wrench,
    color: 'foreground',
    commands: [
      { name: '/serverinfo', description: 'Display detailed information about the current server.', permission: 'Everyone' },
      { name: '/userinfo', description: 'View profile and moderation info for a user.', permission: 'Everyone' },
      { name: '/help', description: 'Show the list of available commands and categories.', permission: 'Everyone' },
      { name: '/ping', description: 'Check the bot\'s latency and uptime.', permission: 'Everyone' },
      { name: '/language', description: 'Change the bot\'s language for this server.', permission: 'Admin' },
    ],
  },
];

const colorMap: Record<string, { text: string; bg: string; badge: string }> = {
  primary: { text: 'text-primary', bg: 'bg-primary/10', badge: 'bg-primary/20 text-primary' },
  accent: { text: 'text-accent', bg: 'bg-accent/10', badge: 'bg-accent/20 text-accent' },
  success: { text: 'text-success', bg: 'bg-success/10', badge: 'bg-success/20 text-success' },
  foreground: { text: 'text-foreground-muted', bg: 'bg-foreground/5', badge: 'bg-foreground/10 text-foreground-muted' },
};

const permissionColors: Record<string, string> = {
  Everyone: 'bg-success/15 text-success',
  Staff: 'bg-accent/15 text-accent',
  Moderator: 'bg-warning/15 text-warning',
  Admin: 'bg-destructive/15 text-destructive',
};

/* ═══════════════════════ HALAMAN ═══════════════════════ */
export default function CommandsPage() {
  const [query, setQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return categories;

    const q = query.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        commands: cat.commands.filter(
          (cmd) =>
            cmd.name.toLowerCase().includes(q) ||
            cmd.description.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.commands.length > 0);
  }, [query]);

  return (
    <>
      {/* Banner Hero */}
      <section className="relative py-24 pt-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary-light via-primary to-accent bg-clip-text text-transparent">
            Commands
          </h1>
          <p className="text-xl text-foreground-muted max-w-2xl mx-auto mb-10">
            Browse every command LumigiaBOT has to offer. Search by name or description.
          </p>

          {/* Bilah Pencarian */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                'w-full text-foreground bg-background-secondary border border-border',
                'rounded-xl pl-12 pr-6 py-3',
                'placeholder:text-foreground-muted/60',
                'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30',
                'transition-colors duration-200'
              )}
            />
          </div>
        </div>
      </section>

      {/* Kategori Perintah */}
      <section className="py-16 pb-24">
        <div className="container max-w-5xl mx-auto px-6 space-y-10">
          {filteredCategories.length === 0 && (
            <p className="text-center text-foreground-muted py-12">
              No commands found matching &ldquo;{query}&rdquo;
            </p>
          )}

          {filteredCategories.map((cat) => {
            const colors = colorMap[cat.color];
            return (
              <div
                key={cat.name}
                className="bg-card backdrop-blur-sm border border-glass-border rounded-xl overflow-hidden"
              >
                {/* Header Kategori */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50">
                  <div className={cn(colors.bg, 'rounded-lg p-2')}>
                    <cat.icon className={cn('h-5 w-5', colors.text)} />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{cat.name}</h2>
                  <span className="ml-auto text-xs text-foreground-muted">
                    {cat.commands.length} command{cat.commands.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Daftar Perintah */}
                <div className="divide-y divide-border/30">
                  {cat.commands.map((cmd) => (
                    <div
                      key={cmd.name}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-background-secondary/40 transition-colors duration-150"
                    >
                      <code className="font-mono text-sm text-primary shrink-0 min-w-[180px]">
                        {cmd.name}
                      </code>
                      <p className="text-sm text-foreground-muted flex-1">
                        {cmd.description}
                      </p>
                      <span
                        className={cn(
                          'text-xs font-medium rounded-full px-3 py-1 w-fit shrink-0',
                          permissionColors[cmd.permission] ?? 'bg-foreground/10 text-foreground-muted'
                        )}
                      >
                        {cmd.permission}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
