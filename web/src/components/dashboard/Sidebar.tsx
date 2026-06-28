"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Mic,
  Tags,
  Gift,
  Calendar,
  TrendingUp,
  Radio,
  Image,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  section?: string;
}

const mainNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Servers", href: "/dashboard/servers", icon: Server },
];

function getGuildNavItems(guildId: string): NavItem[] {
  return [
    // ── Core ──
    {
      label: "Overview",
      href: `/dashboard/servers/${guildId}`,
      icon: LayoutDashboard,
      section: "Core",
    },
    {
      label: "Moderation",
      href: `/dashboard/servers/${guildId}/moderation`,
      icon: Shield,
      section: "Core",
    },
    {
      label: "AutoMod",
      href: `/dashboard/servers/${guildId}/automod`,
      icon: Zap,
      section: "Core",
    },
    {
      label: "Tickets",
      href: `/dashboard/servers/${guildId}/tickets`,
      icon: Ticket,
      section: "Core",
    },
    {
      label: "Logs",
      href: `/dashboard/servers/${guildId}/logs`,
      icon: ScrollText,
      section: "Core",
    },

    // ── Config ──
    {
      label: "Settings",
      href: `/dashboard/servers/${guildId}/settings`,
      icon: Settings,
      section: "Config",
    },

    // ── Streamer ──
    {
      label: "Voice Channels",
      href: `/dashboard/servers/${guildId}/voice`,
      icon: Mic,
      section: "Streamer",
    },
    {
      label: "Reaction Roles",
      href: `/dashboard/servers/${guildId}/roles`,
      icon: Tags,
      section: "Streamer",
    },
    {
      label: "Giveaways",
      href: `/dashboard/servers/${guildId}/giveaways`,
      icon: Gift,
      section: "Streamer",
    },
    {
      label: "Schedule",
      href: `/dashboard/servers/${guildId}/schedule`,
      icon: Calendar,
      section: "Streamer",
    },
    {
      label: "Leveling",
      href: `/dashboard/servers/${guildId}/leveling`,
      icon: TrendingUp,
      section: "Streamer",
    },
    {
      label: "Stream Alerts",
      href: `/dashboard/servers/${guildId}/streams`,
      icon: Radio,
      section: "Streamer",
    },
    {
      label: "Fan Art",
      href: `/dashboard/servers/${guildId}/fanart`,
      icon: Image,
      section: "Streamer",
    },
    {
      label: "Analytics",
      href: `/dashboard/servers/${guildId}/analytics`,
      icon: BarChart3,
      section: "Streamer",
    },
  ];
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isGuildContext = pathname.includes("/servers/");
  const guildId = isGuildContext
    ? (pathname.split("/servers/")[1]?.split("/")[0] ?? "")
    : "";

  const navItems =
    isGuildContext && guildId ? getGuildNavItems(guildId) : mainNavItems;

  const isActive = (href: string) => {
    // Overview items (baik main nav maupun guild nav) harus exact match saja
    if (
      href === "/dashboard" ||
      (isGuildContext && href === `/dashboard/servers/${guildId}`)
    ) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Group items by section
  const sections =
    isGuildContext && guildId
      ? [
          {
            name: null,
            items: navItems.filter((i) => !i.section || i.section === "Core"),
          },
          {
            name: "Streamer",
            items: navItems.filter((i) => i.section === "Streamer"),
          },
          { name: null, items: navItems.filter((i) => i.section === "Config") },
        ]
      : [{ name: null, items: navItems }];

  return (
    <aside
      className={cn(
        "flex flex-col bg-background-secondary border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
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
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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

        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.name && !collapsed && (
              <div className="mt-4 mb-1.5 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted/50">
                  {section.name}
                </span>
              </div>
            )}
            {section.name && collapsed && (
              <div className="my-2 mx-3 border-t border-border/50" />
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/20 text-primary"
                      : "text-foreground-muted hover:bg-background-tertiary hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Tombol Lipat */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted hover:bg-background-tertiary hover:text-foreground transition-colors",
            collapsed && "justify-center px-0",
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
