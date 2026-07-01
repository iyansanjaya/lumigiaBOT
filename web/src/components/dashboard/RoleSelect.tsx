"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Check } from "lucide-react";
import {
  clearGuildDiscordDataCache,
  getGuildDiscordData,
  type DiscordRole,
} from "./discordDataClient";
import { dashboardRequest, getDashboardErrorMessage } from "./dashboardApi";

type SaveState = "idle" | "saving" | "saved" | "error";

/** Konversi Discord int color ke hex CSS string */
function colorToHex(color: number): string {
  if (!color) return "#99aab5"; // Discord default gray
  return `#${color.toString(16).padStart(6, "0")}`;
}

interface RoleSelectProps {
  guildId: string;
  label: string;
  field: string;
  value: string | null | undefined;
  hint?: string;
  /** API endpoint untuk save. Default: /api/guilds/{guildId}/settings */
  apiEndpoint?: string;
}

export function RoleSelect({
  guildId,
  label,
  field,
  value,
  hint,
  apiEndpoint,
}: RoleSelectProps) {
  const [roles, setRoles] = useState<DiscordRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentValue, setCurrentValue] = useState(value ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);

    getGuildDiscordData(guildId)
      .then(({ roles: r }) => {
        if (!cancelled) setRoles(r);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [guildId, retryKey]);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newVal = e.target.value;
      const previousValue = currentValue;
      setCurrentValue(newVal);
      setSaveState("saving");
      setSaveError("");

      const endpoint = apiEndpoint ?? `/api/guilds/${guildId}/settings`;
      try {
        await dashboardRequest(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field, value: newVal || null }),
        });
        setSaveState("saved");
      } catch (error) {
        setCurrentValue(previousValue);
        setSaveState("error");
        setSaveError(getDashboardErrorMessage(error, "Gagal menyimpan role."));
      }
      setTimeout(() => {
        setSaveState("idle");
        setSaveError("");
      }, 3000);
    },
    [currentValue, guildId, field, apiEndpoint],
  );

  if (error) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-foreground-muted text-sm">{label}</label>
        <span className="text-xs text-red-400">
          Gagal memuat role Discord. Coba lagi, atau pastikan bot masih ada di
          server.
        </span>
        <button
          type="button"
          onClick={() => {
            clearGuildDiscordDataCache(guildId);
            setRetryKey((key) => key + 1);
          }}
          className="w-fit text-xs font-medium text-primary hover:text-primary-light"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground-muted text-sm">{label}</label>
      {hint && <p className="text-xs text-foreground-muted/70">{hint}</p>}
      <div className="flex items-center gap-2">
        <select
          value={currentValue}
          onChange={handleChange}
          disabled={loading}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        >
          <option value="">
            {loading ? "Memuat role..." : "— Pilih role —"}
          </option>
          {roles.map((r) => (
            <option
              key={r.id}
              value={r.id}
              style={{ color: colorToHex(r.color) }}
            >
              @ {r.name}
            </option>
          ))}
        </select>
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />
        )}
        {saveState === "saving" && (
          <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />
        )}
        {saveState === "saved" && <Check className="h-4 w-4 text-green-500" />}
        {saveState === "error" && (
          <span className="text-xs text-red-400">Gagal</span>
        )}
      </div>
      {saveError && <span className="text-xs text-red-400">{saveError}</span>}
    </div>
  );
}
