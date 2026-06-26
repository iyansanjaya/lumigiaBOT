'use client';

import {
  Shield,
  Zap,
  Ticket,
  ShieldAlert,
} from 'lucide-react';

/* ─────────────────────── Data Modul Fitur ─────────────────────── */
const modules = [
  {
    icon: Shield,
    color: '#7C3AED',
    title: 'Moderasi',
    description: 'Perangkat moderasi lengkap untuk menjaga ketertiban server.',
    items: [
      'Warn, kick, ban, mute dengan alasan',
      'Sistem eskalasi otomatis (warn → mute → ban)',
      'Purge pesan massal hingga 100 pesan',
      'Pencatatan log moderasi ke channel khusus',
      'Riwayat peringatan per-user',
    ],
  },
  {
    icon: Zap,
    color: '#06B6D4',
    title: 'Auto-Moderation',
    description: 'Filter otomatis 24/7 untuk menjaga kualitas percakapan.',
    items: [
      'Deteksi & hapus spam otomatis',
      'Filter link dengan whitelist domain',
      'Filter kata terlarang (mendukung regex)',
      'Pembatasan caps lock berlebihan',
      'Pembatasan emoji & mention spam',
      'Konfigurasi aksi per-filter (hapus/warn/mute)',
    ],
  },
  {
    icon: Ticket,
    color: '#22C55E',
    title: 'Sistem Tiket',
    description: 'Kelola permintaan bantuan anggota server secara terorganisir.',
    items: [
      'Buat tiket dengan kategori kustom',
      'Klaim tiket oleh staff',
      'Auto-close setelah waktu tertentu',
      'Batas jumlah tiket terbuka per user',
      'Log & statistik tiket lengkap',
    ],
  },
  {
    icon: ShieldAlert,
    color: '#EAB308',
    title: 'Anti-Raid',
    description: 'Proteksi otomatis terhadap serangan raid pada server.',
    items: [
      'Deteksi join-rate abnormal real-time',
      'Lockdown server otomatis saat terdeteksi',
      'Konfigurasi threshold & timeframe',
      'Notifikasi instan ke channel staff',
    ],
  },
];

/* ═══════════════════════ HALAMAN FITUR ═══════════════════════ */
export default function FeaturesPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">Fitur</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Semua yang kamu butuhkan
          </h1>
          <p className="text-lg text-foreground-muted max-w-xl mx-auto">
            Kelola dan lindungi server Discord-mu dengan fitur lengkap dalam satu bot.
          </p>
        </div>
      </section>

      {/* Daftar Modul */}
      <section className="pb-28 md:pb-36">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="rounded-2xl bg-card border border-border p-8 md:p-10 hover:border-border-hover transition-colors"
              >
                <div className="flex items-start gap-5 mb-6">
                  <div
                    className="shrink-0 rounded-xl p-3"
                    style={{ backgroundColor: `${mod.color}15` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: mod.color }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{mod.title}</h2>
                    <p className="text-foreground-muted mt-1">{mod.description}</p>
                  </div>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 ml-1">
                  {mod.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground-muted">
                      <span
                        className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: mod.color }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
