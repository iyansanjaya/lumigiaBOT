"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import type { StreamScheduleEntry } from "@/types/streamer";

// ─── Constants ───
const DAY_NAMES: Record<number, string> = {
  0: "Senin",
  1: "Selasa",
  2: "Rabu",
  3: "Kamis",
  4: "Jumat",
  5: "Sabtu",
  6: "Minggu",
};

const DAY_ORDER = [0, 1, 2, 3, 4, 5, 6];

const DAY_OPTIONS = DAY_ORDER.map((i) => ({
  value: String(i),
  label: DAY_NAMES[i],
}));

// ─── Props ───
interface Props {
  guildId: string;
  initialSchedule: StreamScheduleEntry[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

// ─── Main Component ───
export function ScheduleManager({ guildId, initialSchedule }: Props) {
  const router = useRouter();

  // Schedule entries (mutable local state)
  const [entries, setEntries] = useState<StreamScheduleEntry[]>(initialSchedule);

  // Delete state per entry id
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Add form state
  const [adding, setAdding] = useState(false);
  const [addState, setAddState] = useState<SaveState>("idle");
  const [addError, setAddError] = useState("");

  // Form fields
  const [dayOfWeek, setDayOfWeek] = useState("0");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // ─── Delete handler ───
  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/guilds/${guildId}/schedule`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      // silent fail
    } finally {
      setDeletingId(null);
    }
  }

  // ─── Add handler ───
  async function handleAdd() {
    // Validate
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      setAddError("Format waktu harus HH:MM (contoh: 20:00)");
      return;
    }
    if (!timezone.trim()) {
      setAddError("Timezone wajib diisi");
      return;
    }
    if (!title.trim()) {
      setAddError("Judul wajib diisi");
      return;
    }

    setAddError("");
    setAddState("saving");

    try {
      const res = await fetch(`/api/guilds/${guildId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_of_week: Number(dayOfWeek),
          time: time.trim(),
          timezone: timezone.trim(),
          title: title.trim(),
          description: description.trim() || null,
        }),
      });

      if (res.ok) {
        setAddState("saved");
        // Reset form
        setTime("");
        setTimezone("");
        setTitle("");
        setDescription("");
        setDayOfWeek("0");
        setAdding(false);
        // Refresh server data
        router.refresh();
        setTimeout(() => setAddState("idle"), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setAddError(data.error || "Gagal menambah jadwal. Coba lagi.");
        setAddState("error");
        setTimeout(() => setAddState("idle"), 3000);
      }
    } catch {
      setAddError("Gagal menambah jadwal. Coba lagi.");
      setAddState("error");
      setTimeout(() => setAddState("idle"), 3000);
    }
  }

  // Group entries by day
  const grouped: Record<number, StreamScheduleEntry[]> = {};
  for (const entry of entries) {
    if (!grouped[entry.day_of_week]) {
      grouped[entry.day_of_week] = [];
    }
    grouped[entry.day_of_week].push(entry);
  }

  return (
    <div className="space-y-6">
      {/* ── Existing Schedule ── */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Jadwal Streaming
            </h2>
          </div>
          <p className="text-sm text-foreground-muted">
            Jadwal streaming mingguan untuk server ini.
          </p>

          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="h-10 w-10 text-foreground-muted mb-3" />
              <p className="text-foreground-muted">
                Belum ada jadwal streaming. Tambahkan jadwal pertama Anda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {DAY_ORDER.map((day) => {
                const dayEntries = grouped[day];
                if (!dayEntries || dayEntries.length === 0) return null;

                return (
                  <div key={day} className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
                      {DAY_NAMES[day]}
                    </h3>
                    <div className="space-y-2">
                      {dayEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 rounded-lg bg-background-tertiary/50 px-4 py-3"
                        >
                          <Clock className="h-4 w-4 text-foreground-muted flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {entry.title}
                            </p>
                            {entry.description && (
                              <p className="text-xs text-foreground-muted mt-0.5 truncate">
                                {entry.description}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-mono text-foreground-muted flex-shrink-0">
                            {entry.time} {entry.timezone}
                          </span>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                            className="flex-shrink-0 rounded-lg p-1.5 text-foreground-muted hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                            title="Hapus jadwal"
                          >
                            {deletingId === entry.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add New Schedule Entry ── */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Plus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Tambah Jadwal Baru
            </h2>
          </div>
          <p className="text-sm text-foreground-muted">
            Tambahkan jadwal streaming baru ke daftar mingguan.
          </p>

          {!adding ? (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-foreground-muted hover:border-primary hover:text-primary transition-colors w-full justify-center"
            >
              <Plus className="h-4 w-4" />
              Tambah Jadwal Baru
            </button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hari */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-foreground-muted text-sm">Hari</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {DAY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Waktu */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-foreground-muted text-sm">Waktu</label>
                  <p className="text-xs text-foreground-muted/70">
                    Format 24 jam HH:MM
                  </p>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="20:00"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Timezone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-foreground-muted text-sm">Timezone</label>
                  <p className="text-xs text-foreground-muted/70">
                    Zona waktu, contoh: WIB, WITA, WIT, UTC
                  </p>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="WIB"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Judul */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-foreground-muted text-sm">Judul</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Streaming Valorant"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Deskripsi (full width) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-foreground-muted text-sm">
                  Deskripsi{" "}
                  <span className="text-foreground-muted/50">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ranking bareng viewer!"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Error message */}
              {addError && (
                <span className="text-xs text-red-400">{addError}</span>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={addState === "saving"}
                  className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
                >
                  {addState === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Tambah Jadwal
                </button>
                <button
                  onClick={() => {
                    setAdding(false);
                    setAddError("");
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
