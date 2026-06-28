"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Save, Check, Loader2 } from "lucide-react";
import type { VoiceSettings } from "@/types/streamer";

interface Props {
  guildId: string;
  initialSettings: VoiceSettings | null;
}

type SaveState = "idle" | "saving" | "saved" | "error";

// ─── Save helper ───
async function saveSetting(
  guildId: string,
  field: string,
  value: string | number | null,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/guilds/${guildId}/voice`, {
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

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newVal = e.target.value;
    setCurrentValue(newVal);
    setSaveState("saving");
    const sendVal = newVal === "" ? null : newVal;
    const ok = await saveSetting(guildId, field, sendVal);
    setSaveState(ok ? "saved" : "error");
    setTimeout(() => setSaveState("idle"), 2000);
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
          <option value="">{placeholder || "— Not configured —"}</option>
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
    </div>
  );
}

// ─── Text/Number Input with Save Button ───
function TextInput({
  label,
  field,
  value,
  guildId,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  field: string;
  value: string | number | null | undefined;
  guildId: string;
  type?: "text" | "number";
  placeholder?: string;
  hint?: string;
}) {
  const [currentValue, setCurrentValue] = useState(String(value ?? ""));
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const save = useCallback(async () => {
    setSaveState("saving");
    const sendValue =
      type === "number"
        ? currentValue === ""
          ? null
          : Number(currentValue)
        : currentValue === ""
          ? null
          : currentValue;
    const ok = await saveSetting(guildId, field, sendValue);
    setSaveState(ok ? "saved" : "error");
    setTimeout(() => setSaveState("idle"), ok ? 2000 : 3000);
  }, [currentValue, field, guildId, type]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground-muted text-sm">{label}</label>
      {hint && <p className="text-xs text-foreground-muted/70">{hint}</p>}
      <div className="flex gap-2">
        <input
          type={type}
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
export function VoiceSettingsForm({ guildId, initialSettings }: Props) {
  const s = initialSettings;

  const defaultLimitOptions = [
    { value: "0", label: "Tidak terbatas" },
    { value: "2", label: "2 user" },
    { value: "3", label: "3 user" },
    { value: "4", label: "4 user" },
    { value: "5", label: "5 user" },
    { value: "6", label: "6 user" },
    { value: "7", label: "7 user" },
    { value: "8", label: "8 user" },
    { value: "9", label: "9 user" },
    { value: "10", label: "10 user" },
    { value: "15", label: "15 user" },
    { value: "20", label: "20 user" },
    { value: "25", label: "25 user" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mic className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Pengaturan Voice Channel
            </h2>
          </div>
          <p className="text-sm text-foreground-muted">
            Atur sistem voice channel sementara. User bisa membuat channel
            sendiri dengan join ke hub channel.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToggleInput
              label="Aktifkan Voice Channels"
              field="enabled"
              value={s?.enabled}
              guildId={guildId}
            />
            <TextInput
              label="Hub Channel ID"
              field="hub_channel_id"
              value={s?.hub_channel_id}
              guildId={guildId}
              placeholder="Contoh: 123456789012345678"
              hint="Channel yang user harus join untuk membuat voice channel sementara. Klik kanan channel → Copy Channel ID."
            />
            <TextInput
              label="Category ID"
              field="category_id"
              value={s?.category_id}
              guildId={guildId}
              placeholder="Contoh: 123456789012345678"
              hint="Kategori tempat channel sementara dibuat. Klik kanan kategori → Copy Channel ID."
            />
            <TextInput
              label="Nama Default"
              field="default_name"
              value={s?.default_name}
              guildId={guildId}
              placeholder="{user}'s Channel"
            />
            <SelectInput
              label="Batas User Default"
              field="default_limit"
              value={s?.default_limit}
              guildId={guildId}
              options={defaultLimitOptions}
              placeholder="— Pilih batas user —"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
