'use client';

import Link from 'next/link';
import {
  Shield,
  Zap,
  Ticket,
  ShieldAlert,
  ArrowRight,
  Terminal,
  LayoutDashboard,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────── Data Fitur ─────────────────────── */
const features = [
  {
    icon: Shield,
    color: '#7C3AED',
    title: 'Moderasi',
    description: 'Warn, kick, ban, mute, dan purge dengan sistem eskalasi otomatis.',
    tags: ['Warn System', 'Auto-Escalation', 'Mod Logs'],
  },
  {
    icon: Zap,
    color: '#06B6D4',
    title: 'Auto-Mod',
    description: 'Spam detection, link filter, word filter dengan regex support.',
    tags: ['Spam Filter', 'Link Filter', 'Regex'],
  },
  {
    icon: Ticket,
    color: '#22C55E',
    title: 'Tiket Support',
    description: 'Sistem tiket lengkap dengan kategori, klaim, dan auto-close.',
    tags: ['Categories', 'Staff Claim', 'Transcripts'],
  },
  {
    icon: ShieldAlert,
    color: '#EAB308',
    title: 'Anti-Raid',
    description: 'Deteksi raid real-time dengan lockdown otomatis.',
    tags: ['Rate Detection', 'Auto Lock', 'Alerts'],
  },
];

const capabilities = [
  { icon: Terminal, title: '23+ Slash Commands', desc: 'Semua fitur mudah diakses via slash commands.' },
  { icon: LayoutDashboard, title: 'Web Dashboard', desc: 'Kelola bot dari browser, tanpa perlu perintah.' },
  { icon: Globe, title: 'Multi-Bahasa', desc: 'Mendukung Bahasa Indonesia dan English.' },
];

/* ═══════════════════════ HALAMAN UTAMA ═══════════════════════ */
export default function LandingPage() {
  return (
    <>
      {/* ══════ HERO ══════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[180px] pointer-events-none" />
        {/* Top fade */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-background to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground-muted mb-10">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Online &mdash; Melayani 500+ server
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
            <span className="text-foreground">Jaga komunitasmu</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
              tetap aman
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            Bot Discord all-in-one untuk moderasi, auto-mod, tiket support,
            dan proteksi anti-raid. Gratis dan open source.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://discord.com/oauth2/authorize"
              className={cn(
                'group inline-flex items-center gap-2.5',
                'bg-primary hover:bg-primary-hover text-white',
                'rounded-xl px-8 py-4 text-base font-semibold',
                'transition-all duration-300',
                'shadow-[0_0_0_1px_rgba(124,58,237,0.3),0_4px_20px_rgba(124,58,237,0.3)]',
                'hover:shadow-[0_0_0_1px_rgba(124,58,237,0.5),0_8px_40px_rgba(124,58,237,0.4)]',
              )}
            >
              Undang ke Server
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                'inline-flex items-center gap-2',
                'bg-card border border-border hover:border-border-hover text-foreground',
                'rounded-xl px-8 py-4 text-base font-medium',
                'transition-all duration-200',
              )}
            >
              Buka Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ FITUR ══════ */}
      <section className="relative py-28 md:py-36">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">Fitur</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Semua yang kamu butuhkan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl bg-card border border-border p-7 hover:border-border-hover transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div
                      className="shrink-0 rounded-xl p-3"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: feature.color }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-[60px]">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-background-tertiary px-2.5 py-1 text-xs text-foreground-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ KEMAMPUAN ══════ */}
      <section className="relative py-28 md:py-36 bg-card/50">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="text-center">
                  <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4 mb-5">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{cap.title}</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ PREVIEW COMMAND ══════ */}
      <section className="relative py-28 md:py-36">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">Preview</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Mudah digunakan
            </h2>
          </div>

          {/* Mock Terminal / Discord */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Titlebar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-background-secondary">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <span className="text-xs text-foreground-muted ml-2 font-mono"># general</span>
            </div>

            {/* Chat messages */}
            <div className="p-6 space-y-5 font-mono text-sm">
              {/* User message */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">A</div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-primary font-semibold text-sm">Admin</span>
                    <span className="text-foreground-muted text-xs">Hari ini pukul 14:32</span>
                  </div>
                  <p className="text-foreground">/warn <span className="text-foreground-muted">@spammer alasan:</span><span className="text-foreground">Spam berulang kali</span></p>
                </div>
              </div>

              {/* Bot response */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-success" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-success font-semibold text-sm">LumigiaBOT</span>
                    <span className="rounded bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 font-sans">BOT</span>
                    <span className="text-foreground-muted text-xs">Hari ini pukul 14:32</span>
                  </div>
                  <div className="rounded-lg border-l-4 border-warning bg-warning/5 p-4 max-w-md">
                    <p className="text-warning font-semibold font-sans text-sm mb-2">⚠️ Peringatan Diberikan</p>
                    <div className="space-y-1 text-foreground-muted text-xs font-sans">
                      <p><span className="text-foreground-muted">User:</span> <span className="text-foreground">@spammer</span></p>
                      <p><span className="text-foreground-muted">Alasan:</span> <span className="text-foreground">Spam berulang kali</span></p>
                      <p><span className="text-foreground-muted">Total Warns:</span> <span className="text-warning">3/5</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Siap melindungi servermu?
          </h2>
          <p className="text-foreground-muted text-lg mb-10">
            Tambahkan LumigiaBOT sekarang. Gratis, tanpa batasan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://discord.com/oauth2/authorize"
              className={cn(
                'group inline-flex items-center gap-2.5',
                'bg-primary hover:bg-primary-hover text-white',
                'rounded-xl px-8 py-4 text-base font-semibold',
                'transition-all duration-300',
                'shadow-[0_0_0_1px_rgba(124,58,237,0.3),0_4px_20px_rgba(124,58,237,0.3)]',
                'hover:shadow-[0_0_0_1px_rgba(124,58,237,0.5),0_8px_40px_rgba(124,58,237,0.4)]',
              )}
            >
              Undang ke Server
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/commands"
              className="text-foreground-muted hover:text-foreground text-sm font-medium transition-colors underline underline-offset-4"
            >
              Lihat semua perintah →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
