'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Shield,
  ShieldAlert,
  Zap,
  Ticket,
  CheckCircle,
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

/* ─────────────────────── Data Modul Fitur ─────────────────────── */
const featureModules = [
  {
    icon: Shield,
    color: 'primary',
    title: 'Moderation',
    description:
      'Take full control of your server with a robust moderation toolkit. Issue warnings, kicks, and bans with automatic escalation based on configurable thresholds. Every action is logged for complete accountability.',
    features: [
      'Configurable warning system',
      'Auto-escalation (warn → mute → kick → ban)',
      'Mod log integration',
      'Bulk message purge',
    ],
  },
  {
    icon: Zap,
    color: 'accent',
    title: 'Auto-Moderation',
    description:
      'Let LumigiaBOT handle the heavy lifting. Intelligent filters detect and neutralize threats in real-time before they become a problem, keeping your chat clean 24/7.',
    features: [
      'Spam detection & rate limiting',
      'Link filtering with whitelist support',
      'Word & regex-based filters',
      'Caps, emoji & mention limits',
    ],
  },
  {
    icon: Ticket,
    color: 'success',
    title: 'Tickets',
    description:
      'Deliver professional support to your community with a fully-featured ticketing system. Organize inquiries by category, assign staff, and keep a complete transcript of every interaction.',
    features: [
      'Category-based ticket routing',
      'Staff claiming & assignment',
      'Auto-close after inactivity',
      'Full ticket logs & transcripts',
    ],
  },
  {
    icon: ShieldAlert,
    color: 'warning',
    title: 'Anti-Raid',
    description:
      'Defend against coordinated attacks with real-time raid detection. LumigiaBOT monitors join rates and automatically locks down your server when suspicious activity is detected.',
    features: [
      'Join-rate monitoring',
      'Automatic server lockdown',
      'Configurable thresholds',
      'Instant staff alerts',
    ],
  },
];

const colorMap: Record<string, { text: string; bg: string; border: string }> = {
  primary: { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  accent: { text: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30' },
  success: { text: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  warning: { text: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
};

/* ═══════════════════════ Kartu Modul Fitur ═══════════════════════ */
function FeatureModule({
  module,
  index,
}: {
  module: (typeof featureModules)[number];
  index: number;
}) {
  const { ref, isInView } = useInView();
  const colors = colorMap[module.color];
  const isReversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={cn(
        'grid grid-cols-1 lg:grid-cols-2 gap-8 items-center',
        'transition-all duration-700',
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
    >
      {/* Konten Teks */}
      <div className={cn(isReversed && 'lg:order-2')}>
        <div className={cn(colors.bg, 'rounded-lg p-3 w-fit mb-4')}>
          <module.icon className={cn('h-7 w-7', colors.text)} />
        </div>
        <h3 className="text-3xl font-bold text-foreground mb-3">{module.title}</h3>
        <p className="text-foreground-muted leading-relaxed mb-6">{module.description}</p>
        <ul className="space-y-3">
          {module.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <CheckCircle className={cn('h-5 w-5 shrink-0', colors.text)} />
              <span className="text-foreground text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Kartu Visual */}
      <div className={cn(isReversed && 'lg:order-1')}>
        <div
          className={cn(
            'bg-card backdrop-blur-sm border border-glass-border rounded-2xl p-8',
            'relative overflow-hidden group',
            'hover:border-primary/30 transition-all duration-500'
          )}
        >
          {/* Gradien dekoratif */}
          <div
            className={cn(
              'absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl',
              colors.bg,
              'opacity-50 group-hover:opacity-80 transition-opacity duration-500'
            )}
          />
          <div className="relative z-10 flex flex-col items-center justify-center py-8">
            <div className={cn('rounded-2xl p-6 mb-4', colors.bg)}>
              <module.icon className={cn('h-16 w-16', colors.text)} />
            </div>
            <p className="text-foreground font-semibold text-lg">{module.title}</p>
            <p className="text-foreground-muted text-sm mt-1">
              {module.features.length} key features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ HALAMAN ═══════════════════════ */
export default function FeaturesPage() {
  return (
    <>
      {/* Banner Hero */}
      <section className="relative py-24 pt-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary-light via-primary to-accent bg-clip-text text-transparent">
            Features
          </h1>
          <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
            Discover every tool LumigiaBOT provides to keep your Discord server safe,
            organized, and thriving.
          </p>
        </div>
      </section>

      {/* Modul Fitur */}
      <section className="py-16 pb-24">
        <div className="container max-w-6xl mx-auto px-6 space-y-24">
          {featureModules.map((module, index) => (
            <FeatureModule key={module.title} module={module} index={index} />
          ))}
        </div>
      </section>
    </>
  );
}
