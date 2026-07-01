"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  ScrollText,
  Ticket,
  ShieldAlert,
  Megaphone,
  Save,
  Check,
  Loader2,
} from "lucide-react";
import { ChannelSelect } from "@/components/dashboard/ChannelSelect";
import { RoleSelect } from "@/components/dashboard/RoleSelect";
import { LANGUAGE_OPTIONS, WARN_ESCALATION_PRESETS } from "@/lib/contracts";

interface GuildSettings {
  guild_id: string;
  language: string | null;
  mod_log_channel: string | null;
  automod_log_channel: string | null;
  ticket_category: string | null;
  ticket_support_role: string | null;
  ticket_log_channel: string | null;
  ticket_max_open: number | null;
  ticket_auto_close_hours: number | null;
  warn_escalation: string | null;
  anti_raid_enabled: number | null;
  anti_raid_threshold: number | null;
  anti_raid_timeframe: number | null;
  welcome_enabled: number | null;
  welcome_channel: string | null;
  welcome_message: string | null;
}

interface Props {
  guildId: string;
  initialSettings: GuildSettings | null;
}

type SaveState = "idle" | "saving" | "saved" | "error";

function normalizeEscalationValue(value: string | null | undefined) {
  if (value === "none") return "{}";
  if (value === "mute") return "{\"3\":\"mute\"}";
  if (value === "kick") return "{\"3\":\"mute\",\"5\":\"kick\"}";
  if (value === "ban") return "{\"3\":\"mute\",\"5\":\"kick\",\"7\":\"ban\"}";
  return value;
}

// ─── Save helper ───
async function saveSetting(
  guildId: string,
  field: string,
  value: string | number | null,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/guilds/${guildId}/settings`, {
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
  options: readonly { value: string; label: string }[];
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
          placeholder={placeholder || "Belum dikonfigurasi"}
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
export function SettingsForm({ guildId, initialSettings }: Props) {
  const s = initialSettings;


  const maxOpenOptions = [
    { value: "1", label: "1 tiket per user" },
    { value: "2", label: "2 tiket per user" },
    { value: "3", label: "3 tiket per user" },
    { value: "4", label: "4 tiket per user" },
    { value: "5", label: "5 tiket per user" },
  ];

  const autoCloseOptions = [
    { value: "12", label: "12 jam" },
    { value: "24", label: "24 jam (1 hari)" },
    { value: "48", label: "48 jam (2 hari)" },
    { value: "72", label: "72 jam (3 hari)" },
    { value: "168", label: "168 jam (7 hari)" },
  ];

  const raidThresholdOptions = [
    { value: "5", label: "5 member baru" },
    { value: "10", label: "10 member baru" },
    { value: "15", label: "15 member baru" },
    { value: "20", label: "20 member baru" },
    { value: "30", label: "30 member baru" },
  ];

  const raidTimeframeOptions = [
    { value: "5", label: "5 detik" },
    { value: "10", label: "10 detik" },
    { value: "15", label: "15 detik" },
    { value: "30", label: "30 detik" },
    { value: "60", label: "60 detik (1 menit)" },
  ];


  return (
    <div className="space-y-6">
      {/* General */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Umum</h2>
          </div>
          <p className="text-sm text-foreground-muted">Pengaturan umum bot untuk server ini.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput
              label="Bahasa Bot"
              field="language"
              value={s?.language === "en" ? "en-US" : s?.language}
              guildId={guildId}
              options={LANGUAGE_OPTIONS}
              placeholder="— Pilih bahasa —"
            />
          </div>
        </CardContent>
      </Card>

      {/* Welcome */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Sambutan</h2>
          </div>
          <p className="text-sm text-foreground-muted">
            Kirim pesan sambutan otomatis ketika member baru bergabung ke server.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToggleInput
              label="Aktifkan Pesan Sambutan"
              field="welcome_enabled"
              value={s?.welcome_enabled}
              guildId={guildId}
            />
            <ChannelSelect
              guildId={guildId}
              label="Channel Sambutan"
              field="welcome_channel"
              value={s?.welcome_channel}
              hint="Channel tempat pesan sambutan dikirim."
              channelType="text"
            />
          </div>
          <TextInput
            label="Pesan Sambutan"
            field="welcome_message"
            value={s?.welcome_message}
            guildId={guildId}
            placeholder="Selamat datang {user} di {server}!"
            hint="Tulis pesan sambutan. Gunakan {user} untuk mention member baru, dan {server} untuk nama server."
          />
        </CardContent>
      </Card>

      {/* Logging */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <ScrollText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Log</h2>
          </div>
          <p className="text-sm text-foreground-muted">
            Channel untuk mencatat aktivitas moderasi dan automod. Bot akan mengirim log ke channel yang dipilih.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ChannelSelect
              guildId={guildId}
              label="Channel Log Moderasi"
              field="mod_log_channel"
              value={s?.mod_log_channel}
              hint="Channel tempat log ban, kick, mute, dan warning dikirim."
              channelType="text"
            />
            <ChannelSelect
              guildId={guildId}
              label="Channel Log AutoMod"
              field="automod_log_channel"
              value={s?.automod_log_channel}
              hint="Channel tempat log filter automod (spam, link, kata terlarang, dll) dikirim."
              channelType="text"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Ticket className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Tiket</h2>
          </div>
          <p className="text-sm text-foreground-muted">
            Pengaturan sistem tiket support. User bisa membuat tiket untuk menghubungi staff server.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ChannelSelect
              guildId={guildId}
              label="Kategori Tiket"
              field="ticket_category"
              value={s?.ticket_category}
              hint="Folder (kategori) tempat channel tiket baru dibuat. Jika kosong, tiket dibuat tanpa kategori."
              channelType="category"
            />
            <RoleSelect
              guildId={guildId}
              label="Role Support"
              field="ticket_support_role"
              value={s?.ticket_support_role}
              hint="Role yang bisa melihat dan menangani tiket."
            />
            <ChannelSelect
              guildId={guildId}
              label="Channel Log Tiket"
              field="ticket_log_channel"
              value={s?.ticket_log_channel}
              hint="Channel tempat bot mengirim notifikasi saat tiket dibuka/ditutup."
              channelType="text"
            />
            <SelectInput
              label="Maks Tiket Terbuka"
              field="ticket_max_open"
              value={s?.ticket_max_open}
              guildId={guildId}
              options={maxOpenOptions}
              placeholder="— Default (1 tiket) —"
            />
            <SelectInput
              label="Tutup Otomatis Setelah"
              field="ticket_auto_close_hours"
              value={s?.ticket_auto_close_hours}
              guildId={guildId}
              options={autoCloseOptions}
              placeholder="— Default (48 jam) —"
            />
          </div>
        </CardContent>
      </Card>

      {/* Anti-Raid */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Anti-Raid</h2>
          </div>
          <p className="text-sm text-foreground-muted">
            Proteksi otomatis dari serangan raid (banyak akun bergabung secara bersamaan).
            Jika jumlah member baru melebihi batas dalam waktu tertentu, bot akan mengaktifkan lockdown.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToggleInput
              label="Aktifkan Anti-Raid"
              field="anti_raid_enabled"
              value={s?.anti_raid_enabled}
              guildId={guildId}
            />
            <SelectInput
              label="Batas Member Baru"
              field="anti_raid_threshold"
              value={s?.anti_raid_threshold}
              guildId={guildId}
              options={raidThresholdOptions}
              placeholder="— Default (10 member) —"
            />
            <SelectInput
              label="Dalam Waktu"
              field="anti_raid_timeframe"
              value={s?.anti_raid_timeframe}
              guildId={guildId}
              options={raidTimeframeOptions}
              placeholder="— Default (10 detik) —"
            />
          </div>
        </CardContent>
      </Card>

      {/* Warning Escalation */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Eskalasi Warning</h2>
          </div>
          <p className="text-sm text-foreground-muted">
            Tindakan otomatis yang diambil ketika user mendapat terlalu banyak warning.
            Contoh: setelah 3 warning, user otomatis di-mute.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput
              label="Tindakan Eskalasi"
              field="warn_escalation"
              value={normalizeEscalationValue(s?.warn_escalation)}
              guildId={guildId}
              options={WARN_ESCALATION_PRESETS}
              placeholder="— Tidak ada —"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
