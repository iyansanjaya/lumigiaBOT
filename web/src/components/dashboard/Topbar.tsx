"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between bg-background-secondary/80 backdrop-blur-xl border-b border-border px-6">
      {/* Kiri: Judul Halaman / Breadcrumb */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
      </div>

      {/* Kanan: Info Pengguna + Keluar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? "Avatar pengguna"}
              className="h-8 w-8 rounded-full ring-2 ring-border"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-bold">
              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
          <span className="hidden text-sm font-medium text-foreground sm:inline-block">
            {user.name ?? "Pengguna"}
          </span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
            "text-foreground-muted hover:bg-destructive/20 hover:text-destructive transition-colors",
          )}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline-block cursor-pointer">
            Keluar
          </span>
        </button>
      </div>
    </header>
  );
}
