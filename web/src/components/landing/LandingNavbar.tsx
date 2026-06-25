'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-glass/80 backdrop-blur-xl border-b border-glass-border'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LumigiaBOT
          </span>
        </Link>

        {/* Tautan Navigasi Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/features"
            className="text-foreground-muted hover:text-foreground transition-colors duration-200"
          >
            Features
          </Link>
          <Link
            href="/commands"
            className="text-foreground-muted hover:text-foreground transition-colors duration-200"
          >
            Commands
          </Link>
          <Link
            href="/api/auth/signin"
            className={cn(
              'bg-gradient-to-r from-primary to-primary-hover text-white',
              'rounded-lg px-5 py-2 text-sm font-semibold',
              'hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300'
            )}
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
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Dropdown Mobile */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          'bg-glass/95 backdrop-blur-xl border-b border-glass-border',
          mobileOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          <Link
            href="/features"
            className="text-foreground-muted hover:text-foreground transition-colors duration-200"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/commands"
            className="text-foreground-muted hover:text-foreground transition-colors duration-200"
            onClick={() => setMobileOpen(false)}
          >
            Commands
          </Link>
          <Link
            href="/api/auth/signin"
            className={cn(
              'bg-gradient-to-r from-primary to-primary-hover text-white',
              'rounded-lg px-5 py-2 text-sm font-semibold text-center',
              'hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300'
            )}
            onClick={() => setMobileOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
