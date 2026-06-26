'use client';

import { Shield, Zap, Ticket, ShieldAlert } from 'lucide-react';

const modules = [
  {
    icon: Shield,
    color: '#A78BFA',
    bg: 'rgba(124,58,237,0.12)',
    title: 'Moderasi',
    desc: 'Perangkat moderasi lengkap untuk menjaga ketertiban server.',
    items: ['Warn, kick, ban, mute dengan alasan', 'Sistem eskalasi otomatis (warn → mute → ban)', 'Purge pesan massal hingga 100 pesan', 'Pencatatan log moderasi ke channel khusus', 'Riwayat peringatan per-user'],
  },
  {
    icon: Zap,
    color: '#22D3EE',
    bg: 'rgba(6,182,212,0.12)',
    title: 'Auto-Moderation',
    desc: 'Filter otomatis 24/7 untuk menjaga kualitas percakapan.',
    items: ['Deteksi & hapus spam otomatis', 'Filter link dengan whitelist domain', 'Filter kata terlarang (mendukung regex)', 'Pembatasan caps lock berlebihan', 'Pembatasan emoji & mention spam', 'Konfigurasi aksi per-filter'],
  },
  {
    icon: Ticket,
    color: '#4ADE80',
    bg: 'rgba(34,197,94,0.12)',
    title: 'Sistem Tiket',
    desc: 'Kelola permintaan bantuan anggota server secara terorganisir.',
    items: ['Buat tiket dengan kategori kustom', 'Klaim tiket oleh staff', 'Auto-close setelah waktu tertentu', 'Batas jumlah tiket terbuka per user', 'Log & statistik tiket lengkap'],
  },
  {
    icon: ShieldAlert,
    color: '#FACC15',
    bg: 'rgba(234,179,8,0.12)',
    title: 'Anti-Raid',
    desc: 'Proteksi otomatis terhadap serangan raid pada server.',
    items: ['Deteksi join-rate abnormal real-time', 'Lockdown server otomatis saat terdeteksi', 'Konfigurasi threshold & timeframe', 'Notifikasi instan ke channel staff'],
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
