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
    title: 'Moderasi',
    description: 'Perangkat moderasi lengkap untuk menjaga ketertiban server.',
    items: [
      'Warn, kick, ban, mute dengan alasan',
      'Sistem eskalasi otomatis (warn → mute → ban)',
      'Purge pesan massal',
      'Pencatatan log moderasi lengkap',
      'Daftar peringatan per-user',
    ],
  },
  {
    icon: Zap,
    title: 'Auto-Moderation',
    description: 'Filter otomatis untuk menjaga kualitas percakapan.',
    items: [
      'Deteksi & hapus spam otomatis',
      'Filter link dengan whitelist',
      'Filter kata terlarang (mendukung regex)',
      'Pembatasan caps lock berlebihan',
      'Pembatasan emoji & mention spam',
      'Konfigurasi aksi per-filter (hapus/warn/mute)',
    ],
  },
  {
    icon: Ticket,
    title: 'Sistem Tiket',
    description: 'Kelola permintaan bantuan dari anggota server secara terorganisir.',
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
    title: 'Anti-Raid',
    description: 'Proteksi otomatis terhadap serangan raid pada server.',
    items: [
      'Deteksi join-rate abnormal secara real-time',
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
      <section className="pt-32 pb-16 border-b border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Fitur Lengkap
          </h1>
          <p className="text-foreground-muted max-w-lg mx-auto">
            Semua yang kamu butuhkan untuk mengelola dan melindungi server Discord.
          </p>
        </div>
      </section>

      {/* Daftar Modul */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="rounded-xl bg-card border border-border p-6 md:p-8"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="shrink-0 rounded-lg bg-primary/10 p-2.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{mod.title}</h2>
                    <p className="text-sm text-foreground-muted mt-1">{mod.description}</p>
                  </div>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pl-1">
                  {mod.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-foreground-muted">
                      <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
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
