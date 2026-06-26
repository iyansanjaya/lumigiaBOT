'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface Command { name: string; description: string; permission: string; }

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

const permColors: Record<string, { bg: string; text: string }> = {
  Everyone: { bg: 'rgba(63,185,80,0.15)', text: '#3fb950' },
  Staff: { bg: 'rgba(6,182,212,0.15)', text: '#22d3ee' },
  Moderator: { bg: 'rgba(210,153,34,0.15)', text: '#d29922' },
  Admin: { bg: 'rgba(248,81,73,0.15)', text: '#f85149' },
};

export default function CommandsPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.toLowerCase();
    return categories
      .map((cat) => ({ ...cat, commands: cat.commands.filter((c) => c.name.includes(q) || c.description.toLowerCase().includes(q)) }))
      .filter((cat) => cat.commands.length > 0);
  }, [query]);

  return (
    <div>
      {/* Header */}
      <section style={{ padding: '140px 32px 60px', textAlign: 'center' }}>
        <p style={{ color: '#A78BFA', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
          Perintah
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: '#f0f6fc', marginBottom: '16px' }}>
          Daftar Perintah
        </h1>
        <p style={{ fontSize: '18px', color: '#8b949e', marginBottom: '40px' }}>
          Semua slash command yang tersedia di LumigiaBOT.
        </p>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }} />
          <input
            type="text"
            placeholder="Cari perintah..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '12px',
              padding: '12px 16px 12px 44px',
              fontSize: '14px',
              color: '#f0f6fc',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#484f58')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#30363d')}
          />
        </div>
      </section>

      {/* Commands */}
      <section style={{ padding: '0 32px 120px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#8b949e', padding: '60px 0', fontSize: '16px' }}>
              Tidak ada perintah yang cocok.
            </p>
          ) : (
            filtered.map((cat) => (
              <div key={cat.name}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f6fc', marginBottom: '16px' }}>{cat.name}</h2>
                <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '16px', overflow: 'hidden' }}>
                  {cat.commands.map((cmd, i) => (
                    <div
                      key={cmd.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 24px',
                        borderBottom: i < cat.commands.length - 1 ? '1px solid #21262d' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                        <code style={{ fontSize: '14px', color: '#A78BFA', fontWeight: 500, flexShrink: 0 }}>{cmd.name}</code>
                        <span style={{ fontSize: '13px', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cmd.description}</span>
                      </div>
                      <span
                        style={{
                          flexShrink: 0,
                          borderRadius: '999px',
                          padding: '3px 12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          marginLeft: '16px',
                          background: permColors[cmd.permission]?.bg ?? 'rgba(139,148,158,0.15)',
                          color: permColors[cmd.permission]?.text ?? '#8b949e',
                        }}
                      >
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
    </div>
  );
}
