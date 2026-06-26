'use client';

import Link from 'next/link';
import {
  Shield,
  Zap,
  Ticket,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
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
    description: 'Deteksi spam, filter link, filter kata dengan regex, dan pembatasan caps/emoji/mention secara otomatis.',
  },
  {
    icon: Ticket,
    title: 'Tiket Support',
    description: 'Sistem tiket dengan kategori, klaim staff, auto-close timer, dan log transkrip lengkap.',
  },
  {
    icon: ShieldAlert,
    title: 'Anti-Raid',
    description: 'Deteksi raid real-time, lockdown otomatis, konfigurasi threshold, dan notifikasi instan ke staff.',
  },
];

const highlights = [
  'Gratis & open source',
  'Setup dalam hitungan menit',
  'Dashboard web yang mudah digunakan',
  'Multi-bahasa (ID & EN)',
  'Ringan & cepat',
  'Update rutin',
];

/* ═══════════════════════ HALAMAN UTAMA ═══════════════════════ */
export default function LandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        {/* Glow halus di belakang */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background-secondary px-4 py-1.5 text-sm text-foreground-muted mb-8">
            <Shield className="h-4 w-4 text-primary" />
            Discord Moderation Bot
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
            Jaga komunitasmu
            <br />
            <span className="text-primary">tetap aman</span>
          </h1>

          <p className="text-lg text-foreground-muted max-w-xl mx-auto mb-10 leading-relaxed">
            LumigiaBOT adalah bot Discord all-in-one untuk moderasi, auto-mod,
            tiket support, dan proteksi anti-raid. Gratis dan mudah digunakan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="https://discord.com/oauth2/authorize"
              className={cn(
                'inline-flex items-center gap-2',
                'bg-primary hover:bg-primary-hover text-white',
                'rounded-lg px-6 py-3 text-sm font-medium transition-colors',
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
                'rounded-lg px-6 py-3 text-sm font-medium transition-colors',
              )}
            >
              Buka Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Fitur ── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Semua yang kamu butuhkan
            </h2>
            <p className="text-foreground-muted max-w-lg mx-auto">
              Kelola dan lindungi server Discord-mu dengan fitur-fitur lengkap dalam satu bot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl bg-card border border-border p-6 hover:border-border-hover transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 rounded-lg bg-primary/10 p-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1.5">{feature.title}</h3>
                      <p className="text-sm text-foreground-muted leading-relaxed">
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

      {/* ── Highlights ── */}
      <section className="py-20 border-t border-border bg-background-secondary">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Kenapa LumigiaBOT?
              </h2>
              <p className="text-foreground-muted leading-relaxed">
                Dibangun untuk komunitas Discord Indonesia. Mudah di-setup,
                kaya fitur, dan terus diperbarui.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Siap melindungi servermu?
          </h2>
          <p className="text-foreground-muted mb-8">
            Tambahkan LumigiaBOT ke server Discord-mu sekarang. Gratis, tanpa syarat.
          </p>
          <Link
            href="https://discord.com/oauth2/authorize"
            className={cn(
              'inline-flex items-center gap-2',
              'bg-primary hover:bg-primary-hover text-white',
              'rounded-lg px-6 py-3 text-sm font-medium transition-colors',
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
