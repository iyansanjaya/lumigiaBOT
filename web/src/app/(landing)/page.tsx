'use client';

import Link from 'next/link';
import {
  Shield,
  Zap,
  Ticket,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────── Data Fitur ─────────────────────── */
const features = [
  {
    icon: Shield,
    title: 'Moderasi',
    description: 'Warn, kick, ban, mute, dan purge. Dilengkapi sistem eskalasi otomatis serta pencatatan lengkap.',
  },
  {
    icon: Zap,
    title: 'Auto-Mod',
    description: 'Deteksi spam, filter link, filter kata dengan regex, dan pembatasan caps/emoji/mention otomatis.',
  },
  {
    icon: Ticket,
    title: 'Tiket Support',
    description: 'Sistem tiket dengan kategori, klaim staff, auto-close timer, dan log transkrip lengkap.',
  },
  {
    icon: ShieldAlert,
    title: 'Anti-Raid',
    description: 'Deteksi raid real-time, lockdown otomatis, konfigurasi threshold, dan notifikasi instan.',
  },
];

const highlights = [
  'Gratis & open source',
  'Setup dalam hitungan menit',
  'Dashboard web lengkap',
  'Multi-bahasa (ID & EN)',
  'Ringan & responsif',
  'Update rutin',
];

const stats = [
  { value: '500+', label: 'Server Aktif' },
  { value: '50K+', label: 'User Terlindungi' },
  { value: '99.9%', label: 'Uptime' },
];

/* ═══════════════════════ HALAMAN UTAMA ═══════════════════════ */
export default function LandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background glow halus */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/6 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-accent/4 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background-secondary/80 px-4 py-2 text-sm text-foreground-muted mb-10">
            <Bot className="h-4 w-4 text-primary" />
            <span>Discord Moderation Bot</span>
          </div>

          {/* Judul */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-8">
            Jaga komunitasmu
            <br />
            <span className="text-primary">tetap aman</span>
          </h1>

          {/* Deskripsi */}
          <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            LumigiaBOT adalah bot Discord all-in-one untuk moderasi, auto-mod,
            tiket support, dan proteksi anti-raid. Gratis dan mudah digunakan.
          </p>

          {/* Tombol CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://discord.com/oauth2/authorize"
              className={cn(
                'inline-flex items-center gap-2.5',
                'bg-primary hover:bg-primary-hover text-white',
                'rounded-xl px-8 py-3.5 text-base font-semibold transition-all duration-200',
                'shadow-[0_0_20px_rgba(124,58,237,0.25)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]',
              )}
            >
              Undang ke Server
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                'inline-flex items-center gap-2',
                'border border-border hover:border-border-hover text-foreground',
                'rounded-xl px-8 py-3.5 text-base font-medium transition-colors',
              )}
            >
              Buka Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-t border-border bg-background-secondary/50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid grid-cols-3 divide-x divide-border">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center px-4">
                <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-foreground-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fitur ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Semua yang kamu butuhkan
            </h2>
            <p className="text-foreground-muted text-lg max-w-xl mx-auto">
              Kelola dan lindungi server Discord-mu dengan fitur-fitur lengkap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl bg-card border border-border p-8 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="shrink-0 rounded-xl bg-primary/10 p-3 group-hover:bg-primary/15 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-foreground-muted leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Kenapa LumigiaBOT ── */}
      <section className="py-24 md:py-32 border-t border-border bg-background-secondary/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Kiri: Teks */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Kenapa LumigiaBOT?
              </h2>
              <p className="text-foreground-muted text-lg leading-relaxed mb-8">
                Dibangun khusus untuk komunitas Discord Indonesia.
                Mudah di-setup, kaya fitur, dan terus diperbarui.
              </p>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-medium transition-colors"
              >
                Lihat semua fitur
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Kanan: Checklist */}
            <div className="grid grid-cols-1 gap-4">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-card border border-border px-5 py-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Glow halus */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Siap melindungi servermu?
          </h2>
          <p className="text-foreground-muted text-lg mb-10">
            Tambahkan LumigiaBOT ke server Discord-mu sekarang. Gratis, tanpa syarat.
          </p>
          <Link
            href="https://discord.com/oauth2/authorize"
            className={cn(
              'inline-flex items-center gap-2.5',
              'bg-primary hover:bg-primary-hover text-white',
              'rounded-xl px-8 py-3.5 text-base font-semibold transition-all duration-200',
              'shadow-[0_0_20px_rgba(124,58,237,0.25)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]',
            )}
          >
            Undang ke Server
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
