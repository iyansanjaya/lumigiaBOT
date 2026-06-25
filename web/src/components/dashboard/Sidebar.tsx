'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Server,
  Shield,
  Zap,
  Ticket,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Servers', href: '/dashboard/servers', icon: Server },
];

function getGuildNavItems(guildId: string): NavItem[] {
  return [
    { label: 'Overview', href: `/dashboard/servers/${guildId}`, icon: LayoutDashboard },
    { label: 'Moderation', href: `/dashboard/servers/${guildId}/moderation`, icon: Shield },
    { label: 'AutoMod', href: `/dashboard/servers/${guildId}/automod`, icon: Zap },
    { label: 'Tickets', href: `/dashboard/servers/${guildId}/tickets`, icon: Ticket },
    { label: 'Logs', href: `/dashboard/servers/${guildId}/logs`, icon: ScrollText },
    { label: 'Settings', href: `/dashboard/servers/${guildId}/settings`, icon: Settings },
  ];
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isGuildContext = pathname.includes('/servers/');
  const guildId = isGuildContext
    ? pathname.split('/servers/')[1]?.split('/')[0] ?? ''
    : '';

  const navItems = isGuildContext && guildId
    ? getGuildNavItems(guildId)
    : mainNavItems;

  const isActive = (href: string) => {
    if (isGuildContext && href === `/dashboard/servers/${guildId}`) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-background-secondary border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <Shield className="h-7 w-7 shrink-0 text-primary" />
        {!collapsed && (
          <span className="text-lg font-bold text-foreground whitespace-nowrap">
            LumigiaBOT
          </span>
        )}
      </div>

      {/* Navigasi */}
      <nav className="flex-1 space-y-1 p-3">
        {!collapsed && isGuildContext && (
          <div className="mb-2">
            <Link
              href="/dashboard/servers"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
              Back to Servers
            </Link>
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/20 text-primary'
                  : 'text-foreground-muted hover:bg-background-tertiary hover:text-foreground',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Tombol Lipat */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted hover:bg-background-tertiary hover:text-foreground transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
