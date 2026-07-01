"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Check, Loader2 } from "lucide-react";
import type { LevelingSettings } from "@/types/streamer";
import { ChannelSelect } from "@/components/dashboard/ChannelSelect";
import {
  getDashboardErrorMessage,
  patchDashboardField,
  type DashboardFieldValue,
} from "./dashboardApi";

interface Props {
  guildId: string;
  initialSettings: LevelingSettings | null;
}

type SaveState = "idle" | "saving" | "saved" | "error";
type SaveResult = { ok: true } | { ok: false; error: string };

// ─── Save helper ───
async function saveSetting(
  guildId: string,
  field: string,
  value: DashboardFieldValue,
): Promise<SaveResult> {
  try {
    await patchDashboardField(`/api/guilds/${guildId}/leveling`, field, value);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: getDashboardErrorMessage(error, "Gagal menyimpan leveling."),
    };
  }
}

// ─── Toggle Input ───
function ToggleInput({
  label,
  field,
  value,
  guildId,
}: {
  label: string;
  field: string;
  value: number | null | undefined;
  guildId: string;
}) {
  const [enabled, setEnabled] = useState(value === 1);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");

  async function toggle() {
    const newVal = enabled ? 0 : 1;
    setEnabled(!enabled);
    setSaveState("saving");
    setSaveError("");
    const result = await saveSetting(guildId, field, newVal);
    setSaveState(result.ok ? "saved" : "error");
    if (!result.ok) {
      setEnabled(enabled);
      setSaveError(result.error);
    }
    setTimeout(() => {
      setSaveState("idle");
      setSaveError("");
    }, 3000);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-foreground-muted text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-background-tertiary"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-sm text-foreground">
          {enabled ? "Aktif" : "Nonaktif"}
        </span>
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

// ─── Select Input (Dropdown) ───
function SelectInput({
  label,
  field,
  value,
  guildId,
  options,
  placeholder,
}: {
  label: string;
  field: string;
  value: string | number | null | undefined;
  guildId: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [currentValue, setCurrentValue] = useState(String(value ?? ""));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newVal = e.target.value;
    const previousValue = currentValue;
    setCurrentValue(newVal);
    setSaveState("saving");
    setSaveError("");
    const sendVal = newVal === "" ? null : newVal;
    const result = await saveSetting(guildId, field, sendVal);
    setSaveState(result.ok ? "saved" : "error");
    if (!result.ok) {
      setCurrentValue(previousValue);
      setSaveError(result.error);
    }
    setTimeout(() => {
      setSaveState("idle");
      setSaveError("");
    }, 3000);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground-muted text-sm">{label}</label>
      <div className="flex items-center gap-2">
        <select
          value={currentValue}
          onChange={handleChange}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">{placeholder || "— Belum dikonfigurasi —"}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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


// ─── Main Form ───
export function LevelingSettingsForm({ guildId, initialSettings }: Props) {
  const s = initialSettings;

  const xpPerMessageOptions = [
    { value: "5", label: "5 XP" },
    { value: "10", label: "10 XP" },
    { value: "15", label: "15 XP" },
    { value: "20", label: "20 XP" },
    { value: "25", label: "25 XP" },
    { value: "30", label: "30 XP" },
    { value: "50", label: "50 XP" },
  ];

  const xpCooldownOptions = [
    { value: "30", label: "30 detik" },
    { value: "60", label: "60 detik" },
    { value: "90", label: "90 detik" },
    { value: "120", label: "120 detik" },
  ];

  const multiplierOptions = [
    { value: "1", label: "1.0x" },
    { value: "1.5", label: "1.5x" },
    { value: "2", label: "2.0x" },
    { value: "2.5", label: "2.5x" },
    { value: "3", label: "3.0x" },
    { value: "5", label: "5.0x" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Pengaturan Leveling & XP
            </h2>
          </div>
          <p className="text-sm text-foreground-muted">
            Atur sistem XP dan leveling untuk server ini. Member mendapat XP
            dari mengirim pesan dan naik level secara otomatis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToggleInput
              label="Aktifkan Sistem XP"
              field="enabled"
              value={s?.enabled}
              guildId={guildId}
            />
            <SelectInput
              label="XP Per Pesan"
              field="xp_per_message"
              value={s?.xp_per_message}
              guildId={guildId}
              options={xpPerMessageOptions}
              placeholder="— Pilih jumlah XP —"
            />
            <SelectInput
              label="Cooldown XP"
              field="xp_cooldown"
              value={s?.xp_cooldown}
              guildId={guildId}
              options={xpCooldownOptions}
              placeholder="— Pilih cooldown —"
            />
            <SelectInput
              label="Multiplier XP"
              field="multiplier"
              value={s?.multiplier}
              guildId={guildId}
              options={multiplierOptions}
              placeholder="— Pilih multiplier —"
            />
            <ChannelSelect
              guildId={guildId}
              label="Channel Pengumuman Level Up"
              field="announce_channel"
              value={s?.announce_channel}
              hint="Channel tempat pesan level-up dikirim. Kosongkan untuk kirim di channel pesan."
              channelType="text"
              apiEndpoint={`/api/guilds/${guildId}/leveling`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
