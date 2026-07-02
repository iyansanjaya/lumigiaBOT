"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, Loader2, Radio } from "lucide-react";
import type { StreamNotification } from "@/types/streamer";
import { dashboardRequest, getDashboardErrorMessage } from "./dashboardApi";
import { getGuildDiscordData } from "./discordDataClient";
import { DiscordEntityLabel } from "@/components/dashboard/DiscordEntityLabel";

interface Props {
  guildId: string;
  initialNotifications: StreamNotification[];
}

export function StreamAlertsManager({ guildId, initialNotifications }: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  // ─── Add form state ───
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [platform, setPlatform] = useState<"twitch" | "youtube">("twitch");
  const [platformUser, setPlatformUser] = useState("");
  const [notifyChannel, setNotifyChannel] = useState("");
  const [pingRole, setPingRole] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  // ─── Discord data for selects ───
  const [discordChannels, setDiscordChannels] = useState<{id: string; name: string; type: number}[]>([]);
  const [discordRoles, setDiscordRoles] = useState<{id: string; name: string; color: number}[]>([]);
  const [loadingDiscord, setLoadingDiscord] = useState(true);
  const [discordDataError, setDiscordDataError] = useState("");
  const channelNames = useMemo(
    () => new Map(discordChannels.map((channel) => [channel.id, channel.name])),
    [discordChannels],
  );
  const roleNames = useMemo(
    () => new Map(discordRoles.map((role) => [role.id, role.name])),
    [discordRoles],
  );

  useEffect(() => {
    let cancelled = false;

    setLoadingDiscord(true);
    setDiscordDataError("");
    getGuildDiscordData(guildId)
      .then(({ channels, roles }) => {
        if (cancelled) return;
        setDiscordChannels(channels.filter((c) => c.type === 0 || c.type === 5));
        setDiscordRoles(roles);
      })
      .catch((error) => {
        if (cancelled) return;
        setDiscordChannels([]);
        setDiscordRoles([]);
        setDiscordDataError(getDashboardErrorMessage(error, "Gagal memuat channel dan role Discord."));
      })
      .finally(() => {
        if (!cancelled) setLoadingDiscord(false);
      });

    return () => {
      cancelled = true;
    };
  }, [guildId]);

  // ─── Delete handler ───
  async function handleDelete(id: number) {
    setDeletingId(id);
    setActionError("");
    try {
      await dashboardRequest(`/api/guilds/${guildId}/streams`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      setActionError(getDashboardErrorMessage(error, "Gagal menghapus notifikasi stream."));
    }
    setDeletingId(null);
  }

  // ─── Add handler ───
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");

    if (!platformUser.trim()) {
      setAddError(platform === "twitch" ? "Username Twitch wajib diisi." : "Channel ID YouTube wajib diisi.");
      return;
    }

    if (!notifyChannel.trim()) {
      setAddError("Channel notifikasi wajib dipilih.");
      return;
    }

    setAdding(true);
    try {
      await dashboardRequest(`/api/guilds/${guildId}/streams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          platform_user: platformUser.trim(),
          notify_channel: notifyChannel.trim(),
          ping_role: pingRole.trim() || null,
          custom_message: customMessage.trim() || null,
        }),
      });
      setPlatform("twitch");
      setPlatformUser("");
      setNotifyChannel("");
      setPingRole("");
      setCustomMessage("");
      setAddError("");
      router.refresh();
    } catch (error) {
      setAddError(getDashboardErrorMessage(error, "Gagal menambah notifikasi stream."));
    }
    setAdding(false);
  }

  return (
    <div className="space-y-6">
      {/* Existing Notifications */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Radio className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">
            Belum Ada Notifikasi
          </h2>
          <p className="mt-2 text-foreground-muted">
            Belum ada notifikasi stream. Tambahkan di bawah.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Notifikasi Aktif
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Channel Notifikasi</TableHead>
                    <TableHead>Role Ping</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell>
                        {notif.platform === "twitch" ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                            Twitch
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                            YouTube
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {notif.platform_user}
                      </TableCell>
                      <TableCell>
                        <DiscordEntityLabel
                          id={notif.notify_channel}
                          name={channelNames.get(notif.notify_channel) ?? (loadingDiscord ? "Memuat channel..." : null)}
                          type="channel"
                        />
                      </TableCell>
                      <TableCell>
                        <DiscordEntityLabel
                          id={notif.ping_role}
                          name={notif.ping_role ? roleNames.get(notif.ping_role) ?? (loadingDiscord ? "Memuat role..." : null) : null}
                          type="role"
                          emptyLabel="Tidak ada"
                        />
                      </TableCell>
                      <TableCell>
                        {notif.is_live === 1 ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                            Tidak Live
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleDelete(notif.id)}
                          disabled={deletingId === notif.id}
                          className="rounded-lg p-2 text-foreground-muted hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          {deletingId === notif.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {actionError && (
        <p className="text-sm text-red-400">{actionError}</p>
      )}

      {/* Add New Notification Form */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Plus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Tambah Notifikasi Stream
            </h2>
          </div>
          <p className="text-sm text-foreground-muted">
            Tambahkan konfigurasi baru untuk menerima notifikasi saat streamer
            mulai live.
          </p>
          <form onSubmit={handleAdd} className="space-y-4">
            {discordDataError && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {discordDataError}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Platform Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-foreground-muted text-sm">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) =>
                    setPlatform(e.target.value as "twitch" | "youtube")
                  }
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="twitch">Twitch</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              {/* Username / Channel ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-foreground-muted text-sm">
                  {platform === "twitch"
                    ? "Username"
                    : "Channel ID"}
                </label>
                <p className="text-xs text-foreground-muted/70">
                  {platform === "twitch"
                    ? "Username Twitch streamer."
                    : "Channel ID YouTube streamer."}
                </p>
                <input
                  type="text"
                  value={platformUser}
                  onChange={(e) => setPlatformUser(e.target.value)}
                  placeholder={
                    platform === "twitch"
                      ? "contoh: pokimane"
                      : "contoh: UC..."
                  }
                  required
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Notify Channel */}
              <div className="flex flex-col gap-1.5">
                <label className="text-foreground-muted text-sm">Channel Notifikasi *</label>
                <select
                  value={notifyChannel}
                  onChange={(e) => setNotifyChannel(e.target.value)}
                  disabled={loadingDiscord || Boolean(discordDataError)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                >
                  <option value="">
                    {loadingDiscord
                      ? 'Memuat channel...'
                      : discordDataError
                        ? 'Channel tidak tersedia'
                        : '— Pilih channel —'}
                  </option>
                  {discordChannels.map(ch => (
                    <option key={ch.id} value={ch.id}># {ch.name}</option>
                  ))}
                </select>
              </div>

              {/* Ping Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-foreground-muted text-sm">Role Ping (opsional)</label>
                <select
                  value={pingRole}
                  onChange={(e) => setPingRole(e.target.value)}
                  disabled={loadingDiscord || Boolean(discordDataError)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                >
                  <option value="">
                    {loadingDiscord
                      ? 'Memuat role...'
                      : discordDataError
                        ? 'Role tidak tersedia'
                        : '— Tidak ada —'}
                  </option>
                  {discordRoles.map(r => (
                    <option key={r.id} value={r.id}>@ {r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Message (full width) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground-muted text-sm">
                Pesan Kustom
              </label>
              <p className="text-xs text-foreground-muted/70">
                Pesan opsional yang dikirim bersama notifikasi. Kosongkan untuk
                menggunakan pesan default.
              </p>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Opsional: {user} sedang live streaming!"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {addError && (
              <span className="text-xs text-red-400">{addError}</span>
            )}

            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Tambah
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
