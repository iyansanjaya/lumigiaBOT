"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, Save, Check, Loader2 } from "lucide-react";
import { ChannelSelect } from "@/components/dashboard/ChannelSelect";
import type { FanArtSettings } from "@/types/streamer";

interface Props {
  guildId: string;
  initialSettings: FanArtSettings | null;
}

type SaveState = "idle" | "saving" | "saved" | "error";

// ─── Save helper ───
async function saveSetting(
  guildId: string,
  field: string,
  value: string | number | null,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/guilds/${guildId}/fanart`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value }),
    });
    return res.ok;
  } catch {
    return false;
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

  async function toggle() {
    const newVal = enabled ? 0 : 1;
    setEnabled(!enabled);
    setSaveState("saving");
    const ok = await saveSetting(guildId, field, newVal);
    setSaveState(ok ? "saved" : "error");
    if (!ok) setEnabled(enabled);
    setTimeout(() => setSaveState("idle"), 2000);
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
          {enabled ? "Enabled" : "Disabled"}
        </span>
        {saveState === "saving" && (
          <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />
        )}
        {saveState === "saved" && <Check className="h-4 w-4 text-green-500" />}
        {saveState === "error" && (
          <span className="text-xs text-red-400">Gagal</span>
        )}
      </div>
    </div>
  );
}

// ─── Text Input with Save Button ───
function TextInput({
  label,
  field,
  value,
  guildId,
  placeholder,
  hint,
}: {
  label: string;
  field: string;
  value: string | number | null | undefined;
  guildId: string;
  placeholder?: string;
  hint?: string;
}) {
  const [currentValue, setCurrentValue] = useState(String(value ?? ""));
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const save = useCallback(async () => {
    setSaveState("saving");
    const sendValue = currentValue === "" ? null : currentValue;
    const ok = await saveSetting(guildId, field, sendValue);
    setSaveState(ok ? "saved" : "error");
    setTimeout(() => setSaveState("idle"), ok ? 2000 : 3000);
  }, [currentValue, field, guildId]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground-muted text-sm">{label}</label>
      {hint && <p className="text-xs text-foreground-muted/70">{hint}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          value={currentValue}
          onChange={(e) => {
            setCurrentValue(e.target.value);
            if (saveState !== "idle") setSaveState("idle");
          }}
          placeholder={placeholder || "Not configured"}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={save}
          disabled={saveState === "saving"}
          className="flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 px-3 py-2 text-sm font-medium text-white transition-colors"
        >
          {saveState === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saveState === "saved" ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </button>
      </div>
      {saveState === "error" && (
        <span className="text-xs text-red-400">
          Gagal menyimpan. Coba lagi.
        </span>
      )}
    </div>
  );
}

// ─── Main Form ───
export function FanArtSettingsForm({ guildId, initialSettings }: Props) {
  const s = initialSettings;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Pengaturan Fan Art Gallery
          </h2>
        </div>
        <p className="text-sm text-foreground-muted">
          Kelola pengaturan galeri fan art untuk server ini.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToggleInput
            label="Aktifkan Fan Art Gallery"
            field="enabled"
            value={s?.enabled}
            guildId={guildId}
          />
          <ToggleInput
            label="Approval Wajib"
            field="approval_required"
            value={s?.approval_required}
            guildId={guildId}
          />
          <ChannelSelect
            guildId={guildId}
            label="Channel Submit"
            field="submit_channel"
            value={s?.submit_channel}
            hint="Channel tempat penggemar mengirim fan art untuk review."
            channelType="text"
            apiEndpoint={`/api/guilds/${guildId}/fanart`}
          />
          <ChannelSelect
            guildId={guildId}
            label="Channel Gallery"
            field="gallery_channel"
            value={s?.gallery_channel}
            hint="Channel tempat fan art yang disetujui ditampilkan."
            channelType="text"
            apiEndpoint={`/api/guilds/${guildId}/fanart`}
          />
          <TextInput
            label="Emoji Vote"
            field="vote_emoji"
            value={s?.vote_emoji}
            guildId={guildId}
            placeholder="⭐"
            hint="Emoji yang digunakan untuk voting fan art."
          />
        </div>
      </CardContent>
    </Card>
  );
}
