'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldAlert,
  Zap,
  Ticket,
  ChevronDown,
  Server,
  Users,
  TicketCheck,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────── Hook useInView ─────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

/* ─────────────────────── Hook Penghitung ─────────────────────── */
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, start]);

  return count;
}

/* ─────────────────────── Data Kartu Fitur ─────────────────────── */
const features = [
  {
    icon: Shield,
    color: 'primary',
    title: 'Advanced Moderation',
    description:
      'Powerful warning system with auto-escalation, configurable kick and ban thresholds, and comprehensive moderation logging.',
  },
  {
    icon: Zap,
    color: 'accent',
    title: 'Smart Auto-Mod',
    description:
      'Intelligent spam detection, link filtering, custom word filters with regex support, and rate-limiting protection.',
  },
  {
    icon: Ticket,
    color: 'success',
    title: 'Ticketing System',
    description:
      'Organized support tickets with customizable categories, staff claiming, auto-close timers, and full ticket logs.',
  },
  {
    icon: ShieldAlert,
    color: 'warning',
    title: 'Anti-Raid Protection',
    description:
      'Real-time raid detection with configurable join-rate monitoring, automatic server lockdown, and instant alert notifications.',
  },
];

const colorMap: Record<string, { text: string; bg: string }> = {
  primary: { text: 'text-primary', bg: 'bg-primary/10' },
  accent: { text: 'text-accent', bg: 'bg-accent/10' },
  success: { text: 'text-success', bg: 'bg-success/10' },
  warning: { text: 'text-warning', bg: 'bg-warning/10' },
};

/* ═══════════════════════ BAGIAN HERO ═══════════════════════ */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Blob gradien animasi */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Perisai Bercahaya */}
        <div className="relative mx-auto mb-8 w-fit">
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-150" />
          <Shield className="relative h-20 w-20 text-primary animate-pulse" />
        </div>

        {/* Judul */}
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary-light via-primary to-accent bg-clip-text text-transparent">
          LumigiaBOT
        </h1>

        {/* Slogan */}
        <p className="text-xl md:text-2xl text-foreground-muted mb-4">
          Your All-in-One Discord Guardian
        </p>

        {/* Subjudul */}
        <p className="text-foreground-muted mb-10 max-w-2xl mx-auto leading-relaxed">
          Protect your community with advanced moderation, intelligent auto-mod, seamless ticketing,
          and real-time anti-raid defense — all in one powerful bot.
        </p>

        {/* Tombol CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="https://discord.com/oauth2/authorize"
            className={cn(
              'bg-gradient-to-r from-primary to-primary-hover text-white',
              'rounded-xl px-8 py-4 text-lg font-semibold',
              'hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-300',
              'hover:scale-105'
            )}
          >
            Invite to Server
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              'border border-border hover:border-primary',
              'rounded-xl px-8 py-4 text-lg text-foreground',
              'transition-all duration-300 hover:bg-primary/5'
            )}
          >
            Open Dashboard
          </Link>
        </div>
      </div>

      {/* Indikator Gulir */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ChevronDown className="h-8 w-8 text-foreground-muted animate-bounce" />
      </div>
    </section>
  );
}

/* ═══════════════════════ BAGIAN FITUR ═══════════════════════ */
function FeaturesSection() {
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="py-24">
      <div className="container max-w-6xl mx-auto px-6">
        {/* Judul Bagian */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto">
            Everything you need to manage and protect your Discord server, all in one place.
          </p>
        </div>

        {/* Grid Kartu Fitur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const colors = colorMap[feature.color];
            return (
              <div
                key={feature.title}
                className={cn(
                  'group bg-card backdrop-blur-sm border border-glass-border rounded-xl p-6',
                  'transition-all duration-700 hover:border-primary/40 hover:scale-[1.02]',
                  'hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]',
                  isInView
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={cn(colors.bg, 'rounded-lg p-3 w-fit mb-4')}>
                  <feature.icon className={cn('h-6 w-6', colors.text)} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ BAGIAN STATISTIK ═══════════════════════ */
function StatsSection() {
  const { ref, isInView } = useInView();

  const stats = [
    { icon: Server, label: 'Servers', target: 500, suffix: '+' },
    { icon: Users, label: 'Users Protected', target: 50000, suffix: '+' },
    { icon: TicketCheck, label: 'Tickets Resolved', target: 10000, suffix: '+' },
  ];

  return (
    <section ref={ref} className="py-24 bg-background-secondary">
      <div className="container max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} started={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatItem({
  icon: Icon,
  label,
  target,
  suffix,
  started,
}: {
  icon: typeof Server;
  label: string;
  target: number;
  suffix: string;
  started: boolean;
}) {
  const count = useCounter(target, 2000, started);

  return (
    <div className="flex flex-col items-center gap-3">
      <Icon className="h-8 w-8 text-primary/70" />
      <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="text-foreground-muted text-sm">{label}</span>
    </div>
  );
}

/* ═══════════════════════ BAGIAN SHOWCASE PERINTAH ═══════════════════════ */
function CommandShowcaseSection() {
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="py-24">
      <div className="container max-w-6xl mx-auto px-6">
        {/* Judul Bagian */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            See It In Action
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto">
            Watch LumigiaBOT handle moderation and tickets effortlessly.
          </p>
        </div>

        {/* Kartu Obrolan Discord */}
        <div
          className={cn(
            'max-w-2xl mx-auto bg-background-secondary rounded-2xl border border-border overflow-hidden',
            'transition-all duration-700',
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          {/* Bilah Judul */}
          <div className="h-8 bg-background-tertiary flex items-center px-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <div className="w-3 h-3 rounded-full bg-warning/80" />
              <div className="w-3 h-3 rounded-full bg-success/80" />
            </div>
          </div>

          {/* Pesan Obrolan */}
          <div className="p-6 space-y-5">
            {/* Pesan Pengguna 1 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-accent" />
              </div>
              <div>
                <span className="text-sm font-semibold text-accent">Admin</span>
                <p className="text-foreground text-sm mt-0.5">
                  <span className="bg-background-tertiary rounded px-2 py-0.5 font-mono text-xs">
                    /warn @user Spamming
                  </span>
                </p>
              </div>
            </div>

            {/* Respons Bot 1 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-primary">LumigiaBOT</span>
                <div className="mt-1 border-l-4 border-primary bg-background-tertiary/60 rounded-r-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">⚠️ Warning Issued</p>
                  <p className="text-xs text-foreground-muted">
                    <strong className="text-foreground">User:</strong> @user
                  </p>
                  <p className="text-xs text-foreground-muted">
                    <strong className="text-foreground">Reason:</strong> Spamming
                  </p>
                  <p className="text-xs text-foreground-muted">
                    <strong className="text-foreground">Warnings:</strong> 2/3
                  </p>
                </div>
              </div>
            </div>

            {/* Pesan Pengguna 2 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-accent" />
              </div>
              <div>
                <span className="text-sm font-semibold text-accent">Admin</span>
                <p className="text-foreground text-sm mt-0.5">
                  <span className="bg-background-tertiary rounded px-2 py-0.5 font-mono text-xs">
                    /ticket create Need help with roles
                  </span>
                </p>
              </div>
            </div>

            {/* Respons Bot 2 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-primary">LumigiaBOT</span>
                <div className="mt-1 border-l-4 border-success bg-background-tertiary/60 rounded-r-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">🎫 Ticket Created</p>
                  <p className="text-xs text-foreground-muted">
                    <strong className="text-foreground">Channel:</strong> #ticket-0042
                  </p>
                  <p className="text-xs text-foreground-muted">
                    <strong className="text-foreground">Topic:</strong> Need help with roles
                  </p>
                  <p className="text-xs text-foreground-muted">
                    <strong className="text-foreground">Status:</strong>{' '}
                    <span className="text-success">Open</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Indikator Mengetik */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex gap-1 items-center px-3 py-2 bg-background-tertiary/60 rounded-full">
                <span className="w-2 h-2 bg-foreground-muted rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-foreground-muted rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-foreground-muted rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ BAGIAN CTA ═══════════════════════ */
function CTASection() {
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Blob gradien dekoratif */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div
        className={cn(
          'relative z-10 text-center px-6 max-w-3xl mx-auto',
          'transition-all duration-700',
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-light via-primary to-accent bg-clip-text text-transparent">
          Ready to Protect Your Server?
        </h2>
        <p className="text-foreground-muted mb-10 max-w-xl mx-auto leading-relaxed">
          Join thousands of server admins who trust LumigiaBOT to keep their communities safe.
          Set up takes less than two minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="https://discord.com/oauth2/authorize"
            className={cn(
              'bg-gradient-to-r from-primary to-primary-hover text-white',
              'rounded-xl px-8 py-4 text-lg font-semibold',
              'hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-300',
              'hover:scale-105'
            )}
          >
            Invite to Server
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              'border border-border hover:border-primary',
              'rounded-xl px-8 py-4 text-lg text-foreground',
              'transition-all duration-300 hover:bg-primary/5'
            )}
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ HALAMAN ═══════════════════════ */
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CommandShowcaseSection />
      <CTASection />
    </>
  );
}
