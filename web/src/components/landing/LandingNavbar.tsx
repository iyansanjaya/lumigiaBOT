'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Commands', href: '/commands' },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">LumigiaBOT</span>
        </Link>

        {/* Navigasi Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/api/auth/signin"
            className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Login
          </Link>
        </div>

        {/* Tombol Menu Mobile */}
        <button
          className="md:hidden text-foreground-muted hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu Mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground-muted hover:text-foreground transition-colors py-1"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/api/auth/signin"
              className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-medium text-center transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
