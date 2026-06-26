'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────── Data Perintah ─────────────────────── */
interface Command {
  name: string;
  description: string;
  permission: string;
}

const categories: { name: string; commands: Command[] }[] = [
  {
    name: 'Moderasi',
    commands: [
      { name: '/warn', description: 'Beri peringatan ke anggota', permission: 'Moderator' },
      { name: '/kick', description: 'Keluarkan anggota dari server', permission: 'Moderator' },
      { name: '/ban', description: 'Ban anggota dari server', permission: 'Admin' },
      { name: '/unban', description: 'Hapus ban anggota', permission: 'Admin' },
      { name: '/mute', description: 'Bisukan anggota sementara', permission: 'Moderator' },
      { name: '/unmute', description: 'Batalkan bisu anggota', permission: 'Moderator' },
      { name: '/warnings', description: 'Lihat daftar peringatan anggota', permission: 'Moderator' },
      { name: '/clearwarns', description: 'Hapus semua peringatan anggota', permission: 'Admin' },
      { name: '/purge', description: 'Hapus banyak pesan sekaligus', permission: 'Moderator' },
    ],
  },
  {
    name: 'Auto-Mod',
    commands: [
      { name: '/automod-config', description: 'Konfigurasi filter auto-moderasi', permission: 'Admin' },
      { name: '/automod-whitelist', description: 'Kelola whitelist auto-mod', permission: 'Admin' },
      { name: '/automod-logs', description: 'Lihat log aktivitas auto-mod', permission: 'Moderator' },
    ],
  },
  {
    name: 'Tiket',
    commands: [
      { name: '/ticket-setup', description: 'Setup sistem tiket di server', permission: 'Admin' },
      { name: '/ticket-config', description: 'Konfigurasi pengaturan tiket', permission: 'Admin' },
      { name: '/ticket-stats', description: 'Lihat statistik tiket server', permission: 'Staff' },
    ],
  },
  {
    name: 'Utilitas',
    commands: [
      { name: '/ping', description: 'Cek latensi dan status bot', permission: 'Everyone' },
      { name: '/help', description: 'Lihat daftar perintah yang tersedia', permission: 'Everyone' },
      { name: '/serverinfo', description: 'Informasi detail tentang server', permission: 'Everyone' },
      { name: '/userinfo', description: 'Informasi detail tentang user', permission: 'Everyone' },
      { name: '/avatar', description: 'Lihat avatar user dalam ukuran besar', permission: 'Everyone' },
    ],
  },
];

const permissionColors: Record<string, string> = {
  Everyone: 'bg-success/15 text-success',
  Staff: 'bg-accent/15 text-accent',
  Moderator: 'bg-warning/15 text-warning',
  Admin: 'bg-destructive/15 text-destructive',
};

/* ═══════════════════════ HALAMAN PERINTAH ═══════════════════════ */
export default function CommandsPage() {
  const [query, setQuery] = useState('');

  // Filter command berdasarkan pencarian
  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        commands: cat.commands.filter(
          (cmd) => cmd.name.includes(q) || cmd.description.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.commands.length > 0);
  }, [query]);

  return (
    <>
      {/* Header + Pencarian */}
      <section className="pt-32 pb-12 border-b border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Daftar Perintah
          </h1>
          <p className="text-foreground-muted mb-8">
            Semua slash command yang tersedia di LumigiaBOT.
          </p>

          {/* Kotak Pencarian */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cari perintah..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                'w-full rounded-lg bg-card border border-border pl-10 pr-4 py-2.5 text-sm text-foreground',
                'placeholder:text-foreground-muted',
                'focus:outline-none focus:border-primary transition-colors',
              )}
            />
          </div>
        </div>
      </section>

      {/* Daftar Perintah */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {filtered.length === 0 ? (
            <p className="text-center text-foreground-muted py-12">
              Tidak ada perintah yang cocok dengan pencarian.
            </p>
          ) : (
            filtered.map((cat) => (
              <div key={cat.name}>
                <h2 className="text-lg font-semibold text-foreground mb-3">{cat.name}</h2>
                <div className="rounded-xl border border-border overflow-hidden">
                  {cat.commands.map((cmd, i) => (
                    <div
                      key={cmd.name}
                      className={cn(
                        'flex items-center justify-between px-5 py-3.5',
                        'hover:bg-card transition-colors',
                        i !== cat.commands.length - 1 && 'border-b border-border',
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <code className="text-sm font-mono text-primary shrink-0">{cmd.name}</code>
                        <span className="text-sm text-foreground-muted truncate">{cmd.description}</span>
                      </div>
                      <span className={cn(
                        'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ml-3',
                        permissionColors[cmd.permission] ?? 'bg-border text-foreground-muted',
                      )}>
                        {cmd.permission}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
