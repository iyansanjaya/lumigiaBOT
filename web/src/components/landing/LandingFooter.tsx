import Link from "next/link";
import { Shield } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const footerSections: Record<string, FooterLink[]> = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Commands", href: "/commands" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Resources: [
    {
      label: "Support Server",
      href: "https://https://discord.com/ZwrgK2r",
      external: true,
    },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background-secondary">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo & Deskripsi */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">LumigiaBOT</span>
            </Link>
            <p className="text-foreground-muted text-sm leading-relaxed">
              Bot Discord all-in-one untuk moderasi, auto-mod, tiket, dan
              proteksi anti-raid.
            </p>
          </div>

          {/* Kolom Tautan */}
          {Object.entries(footerSections).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                      >
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-foreground-muted hover:text-foreground transition-colors"
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

        {/* Garis Bawah */}
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-foreground-muted text-xs text-center">
            © {new Date().getFullYear()} LumigiaBOT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
