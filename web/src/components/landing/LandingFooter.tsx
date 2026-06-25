import Link from 'next/link';
import { Shield, Heart, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Commands', href: '/commands' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  Resources: [
    { label: 'Docs', href: '/docs' },
    { label: 'Support Server', href: 'https://discord.gg/lumigiabot', external: true },
    { label: 'Status', href: '/status' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

export function LandingFooter() {
  return (
    <footer className={cn('border-t border-border bg-background-secondary')}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo + Slogan */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Shield className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LumigiaBOT
              </span>
            </Link>
            <p className="text-foreground-muted text-sm leading-relaxed max-w-xs">
              The all-in-one Discord bot for moderation, auto-mod, ticketing, and
              anti-raid protection. Keep your community safe and thriving.
            </p>
          </div>

          {/* Kolom Tautan */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground-muted hover:text-foreground text-sm transition-colors duration-200 flex items-center gap-1"
                      >
                        {link.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-foreground-muted hover:text-foreground text-sm transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bilah Bawah */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground-muted text-sm">
            © 2025 LumigiaBOT. All rights reserved.
          </p>
          <p className="text-foreground-muted text-sm flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" /> for Discord communities
          </p>
        </div>
      </div>
    </footer>
  );
}
