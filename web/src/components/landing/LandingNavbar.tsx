"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { Shield, Menu, X, LayoutDashboard } from "lucide-react";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Commands", href: "/commands" },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="rounded-lg bg-primary/10 p-1.5 group-hover:bg-primary/15 transition-colors">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="text-base font-bold text-foreground">
            LumigiaBOT
          </span>
        </Link>

        {/* Navigasi Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-card transition-all"
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-3 h-5 w-px bg-border" />

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="ml-3 inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <button
              onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
              className="ml-3 bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors cursor-pointer"
            >
              Login
            </button>
          )}
        </div>

        {/* Tombol Menu Mobile */}
        <button
          className="md:hidden text-foreground-muted hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Menu Mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signIn("discord", { callbackUrl: "/dashboard" });
                }}
                className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2.5 text-sm font-medium text-center transition-colors w-full"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
