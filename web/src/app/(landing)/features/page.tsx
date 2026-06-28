'use client';

import {
  Shield,
  Ticket,
  Headphones,
  Users,
  Star,
  Gift,
  Video,
  Palette,
} from 'lucide-react';

const modules = [
  {
    icon: Shield,
    color: '#A78BFA',
    bg: 'rgba(124,58,237,0.12)',
    title: 'Moderasi & Keamanan',
    desc: 'Sistem moderasi dan automod lengkap dengan eskalasi, filter regex, dan perlindungan anti-raid real-time.',
    items: ['Warn, kick, ban, mute dengan alasan', 'Sistem eskalasi otomatis (warn → mute → ban)', 'Purge pesan massal hingga 100 pesan', 'Filter anti-spam & anti-raid otomatis', 'Riwayat peringatan per-user'],
  },
  {
    icon: Ticket,
    color: '#4ADE80',
    bg: 'rgba(34,197,94,0.12)',
    title: 'Tiket Support',
    desc: 'Manajemen dukungan profesional. Kategori tiket, klaim staff, auto-close, dan transkrip HTML.',
    items: ['Buat tiket dengan kategori kustom', 'Klaim tiket oleh staff', 'Auto-close setelah waktu tertentu', 'Batas jumlah tiket terbuka per user', 'Transkrip tiket format HTML otomatis'],
  },
  {
    icon: Headphones,
    color: '#22D3EE',
    bg: 'rgba(6,182,212,0.12)',
    title: 'Temp Voice Channels',
    desc: 'Fitur Join-to-Create otomatis untuk membuat channel suara sementara bagi para anggota yang bergabung.',
    items: ['Join-to-Create channel otomatis', 'Hapus channel otomatis saat kosong', 'Atur batas maksimal user / channel', 'Nama channel custom per user', 'Pengaturan via UI Dashboard web'],
  },
  {
    icon: Users,
    color: '#FACC15',
    bg: 'rgba(234,179,8,0.12)',
    title: 'Reaction Roles',
    desc: 'Memberi role otomatis berdasarkan klik atau reaksi emoji pada pesan dengan panel yang interaktif.',
    items: ['Buat panel peran custom interaktif', 'Mode Toggle (klik untuk tambah/hapus)', 'Mode Single (pilih salah satu)', 'Mode Verify (sistem verifikasi bot)', 'Dukungan Discord Button & Dropdown'],
  },
  {
    icon: Star,
    color: '#F472B6',
    bg: 'rgba(244,114,182,0.12)',
    title: 'Leveling & XP',
    desc: 'Sistem gamifikasi server. Anggota mendapatkan XP dari pesan, naik rank, dan menerima hadiah auto-role.',
    items: ['XP Rate yang bisa disesuaikan di web', 'Multiplier XP untuk role / channel khusus', 'Leaderboard peringkat lokal server', 'Hadiah role otomatis saat naik level', 'Kartu rank profil kustom'],
  },
  {
    icon: Gift,
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.12)',
    title: 'Giveaways',
    desc: 'Kelola acara giveaway otomatis dengan mudah. Termasuk prasyarat role, timer, dan pengacakan pemenang.',
    items: ['Sistem timer dan hitung mundur otomatis', 'Pengacakan pemenang secara adil', 'Syarat role wajib (Role Requirements)', 'Fitur Reroll untuk mencari pemenang baru', 'Notifikasi instan pemenang via ping'],
  },
  {
    icon: Video,
    color: '#FB7185',
    bg: 'rgba(251,113,133,0.12)',
    title: 'Streamer Toolkit',
    desc: 'Notifikasi otomatis Twitch/YouTube, jadwal streaming mingguan, dan integrasi sosmed secara terpusat.',
    items: ['Notifikasi "Going Live" (Twitch & YT)', 'Custom ping (mention role) saat live', 'Pembuat jadwal streaming mingguan', 'Panel pusat profil Social Media', 'Embed Maker kustom dari Discord'],
  },
  {
    icon: Palette,
    color: '#34D399',
    bg: 'rgba(52,211,153,0.12)',
    title: 'Galeri Fan Art',
    desc: 'Sistem pengumpulan dan apresiasi karya seni dari penggemar. Dukungan kurasi moderator dan auto-voting.',
    items: ['Submit art via slash command otomatis', 'Sistem review & persetujuan staff', 'Channel khusus gallery showcase', 'Fitur interaktif upvotes / star', 'Fitur leaderboard karya teratas'],
  },
];

export default function FeaturesPage() {
  return (
    <div>
      {/* Header */}
      <section style={{ padding: '140px 32px 80px', textAlign: 'center' }}>
        <p style={{ color: '#A78BFA', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
          Fitur
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: '#f0f6fc', marginBottom: '16px' }}>
          Semua yang kamu butuhkan
        </h1>
        <p style={{ fontSize: '18px', color: '#8b949e', maxWidth: '520px', margin: '0 auto' }}>
          Kelola dan lindungi server Discord-mu dengan fitur lengkap dalam satu bot.
        </p>
      </section>

      {/* Modules */}
      <section style={{ padding: '0 32px 120px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                style={{
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '16px',
                  padding: '36px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ flexShrink: 0, background: mod.bg, borderRadius: '12px', padding: '12px' }}>
                    <Icon size={24} style={{ color: mod.color }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f6fc', marginBottom: '4px' }}>{mod.title}</h2>
                    <p style={{ fontSize: '14px', color: '#8b949e' }}>{mod.desc}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px 32px' }}>
                  {mod.items.map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ flexShrink: 0, width: '6px', height: '6px', borderRadius: '50%', background: mod.color, marginTop: '7px' }} />
                      <span style={{ fontSize: '14px', color: '#8b949e', lineHeight: 1.6 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
