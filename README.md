# 🤖 LumigiaBOT

**Bot Penjaga Discord Serba Guna** — Bot Discord modern dan modular dengan Web Dashboard interaktif, dibuat untuk komunitas segala ukuran.

[![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-7C3AED?logo=auth0&logoColor=white)](https://authjs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Fitur

### 🛡️ Moderasi

Perangkat moderasi lengkap dengan pemeriksaan hierarki role, notifikasi DM, dan auto-eskalasi warning.

| Perintah      | Deskripsi                  | Izin              |
| ------------- | -------------------------- | ----------------- |
| `/ban`        | Banned anggota             | `BanMembers`      |
| `/kick`       | Kick anggota               | `KickMembers`     |
| `/mute`       | Timeout anggota (1m–28h)   | `ModerateMembers` |
| `/warn`       | Beri peringatan            | `ModerateMembers` |
| `/warnings`   | Lihat riwayat peringatan   | `ModerateMembers` |
| `/clearwarns` | Hapus peringatan           | `ModerateMembers` |
| `/purge`      | Hapus pesan massal (1–100) | `ManageMessages`  |
| `/slowmode`   | Atur slowmode channel      | `ManageChannels`  |
| `/lockdown`   | Kunci/buka kunci channel   | `ManageChannels`  |

### 🤖 Auto Moderasi

Enam filter yang bisa dikonfigurasi per-server dengan dukungan whitelist (channel/role/user).

| Filter          | Deskripsi                                  |
| --------------- | ------------------------------------------ |
| **Spam**        | Deteksi pesan beruntun & konten duplikat   |
| **Link**        | Blokir undangan Discord & URL mencurigakan |
| **Word**        | Daftar hitam kata kustom + dukungan regex  |
| **Caps Lock**   | Deteksi huruf kapital berlebihan (>70%)    |
| **Emoji**       | Deteksi spam emoji (>5 per pesan)          |
| **Mention**     | Deteksi mention massal (>5 mention)        |

Setiap filter bisa dikonfigurasi action-nya: `delete`, `warn`, `mute`, `kick`, atau `ban`.

### 🎫 Sistem Tiket

Sistem tiket support profesional dengan manajemen siklus hidup lengkap.

- 📩 Pembuatan tiket satu klik dengan pemilihan kategori
- 📝 Form modal untuk detail tiket (alasan)
- 👋 Sistem klaim staff — tiket bisa di-claim oleh support team
- 📄 Transkrip HTML otomatis saat tiket ditutup (tema gelap mirip Discord)
- ⏰ Auto-close setelah tidak aktif (durasi bisa dikonfigurasi)
- 📊 Statistik tiket di dashboard (total, open, claimed, closed)
- 🔄 Reopen — tiket yang ditutup bisa dibuka kembali

### 🛡️ Perlindungan Anti-Raid

- Pemantauan kecepatan join dengan threshold yang bisa dikonfigurasi
- Lockdown server otomatis saat raid terdeteksi
- Notifikasi peringatan untuk staff

### 🎥 Streamer & Komunitas

Paket fitur lengkap yang dirancang khusus untuk Streamer (Twitch/YouTube), Content Creator, dan komunitas yang aktif.

- **🎙️ Temp Voice Channels** — Buat channel suara sementara otomatis saat user bergabung ke channel hub (Join-to-Create).
- **🎭 Reaction Roles** — Berikan role otomatis ke anggota berdasarkan reaksi emoji pada pesan (mode Toggle, Single, atau Verify).
- **⭐ Sistem Leveling & XP** — Gamifikasi server dengan ranking, XP per pesan, multiplier, dan auto-role reward saat naik level. Termasuk perintah `/rank` dan `/leaderboard`.
- **🎁 Giveaway** — Buat, kelola, dan acak ulang pemenang giveaway otomatis. Mendukung prasyarat role.
- **📅 Stream Schedule** — Kelola jadwal streaming mingguan yang terintegrasi penuh secara real-time dengan sistem bawaan **Discord Scheduled Events**.
- **🔴 Live Notifications** — Notifikasi otomatis saat Anda live di Twitch atau YouTube, lengkap dengan embed dan preview.
- **🎨 Custom Embeds & Socials** — Buat embed cantik dan kelola link sosial media streamer melalui command Discord.
- **🖼️ Fan Art Gallery** — Sistem pengumpulan dan voting karya seni dari penggemar, dilengkapi dengan sistem approval moderator dan penghapusan fan art.
- **📊 Server Analytics** — Lacak pertumbuhan server, aktivitas member (join/leave), jumlah pesan harian, dan top channel paling aktif.

### 🎨 Web Dashboard & Dokumentasi

Dashboard modern dibuat dengan **Next.js 15 (App Router)** + **Auth.js v5** + tema gelap premium.
Dokumentasi terintegrasi menggunakan **Fumadocs** dan dapat di-deploy secara mandiri ke Vercel.

| Halaman        | Deskripsi                                                         |
| -------------- | ----------------------------------------------------------------- |
| **Landing**    | Halaman marketing dengan animasi, fitur, daftar command           |
| **Login**      | Discord OAuth2 — otomatis redirect ke dashboard setelah login     |
| **Servers**    | Daftar server yang bisa dikelola (Manage Server/Admin + bot berada di server) |
| **Overview**   | Statistik server yang bisa dikelola — total tiket dan warning      |
| **Moderation** | Lihat riwayat warning                                             |
| **AutoMod**    | Toggle enable/disable filter + pilih action — langsung tersimpan  |
| **Tickets**    | Statistik tiket, daftar status, dan link transkrip HTML untuk tiket closed |
| **Streamer**   | Halaman Voice, Reaction Roles, Giveaways, Schedule, Leveling, Streams, Fan Art, dan Analytics |
| **Logs**       | Audit log aktivitas moderasi bot                                  |
| **Settings**   | Konfigurasi server interaktif (language, channels, roles, dll)    |
| **Terms**      | Terms of Service                                                  |
| **Privacy**    | Privacy Policy                                                    |

> **Dashboard bukan hanya read-only** — pengaturan utama seperti Settings, AutoMod, Voice, Leveling, Streams, Schedule, dan Fan Art bisa diubah dari web. Halaman seperti Tickets, Reaction Roles, Giveaways, Moderation, Logs, dan Analytics berfungsi sebagai monitoring sampai kontrol penuhnya ditambahkan.

### 🎥 Command Streamer & Komunitas

| Perintah           | Deskripsi                               | Izin              |
| ------------------ | --------------------------------------- | ----------------- |
| `/voice`           | Kelola temp voice channel (Join2Create) | `ManageGuild`*    |
| `/reaction-role`   | Buat dan atur panel reaction role       | `ManageRoles`     |
| `/xp`, `/rank`     | Sistem ranking, XP, dan role reward     | `ManageGuild`*    |
| `/giveaway`        | Mulai, end, dan reroll giveaway         | `ManageGuild`     |
| `/schedule`        | Kelola sinkronisasi jadwal streaming    | `ManageGuild`     |
| `/stream`          | Setup notifikasi live (Twitch/YouTube)  | `ManageGuild`     |
| `/fanart`          | Submit, hapus, & moderasi galeri        | `ManageGuild`*    |
| `/embed`, `/socials`| Buat embed kustom & link sosmed        | `ManageGuild`     |
| `/analytics`       | Statistik aktivitas dan pesan server    | `ManageGuild`     |

*(Tanda `*` menandakan beberapa sub-command bisa dipakai user biasa, misalnya `/rank` atau `/fanart submit`)*

### 🔧 Command Admin & Utilitas

| Perintah           | Deskripsi                           | Izin              |
| ------------------ | ----------------------------------- | ----------------- |
| `/setup`           | Wizard konfigurasi interaktif       | `ManageGuild`     |
| `/settings`        | Atur pengaturan per-server          | `ManageGuild`     |
| `/audit-log`       | Lihat log audit moderasi            | `ManageGuild`     |
| `/automod-config`  | Konfigurasi filter automod          | `ManageGuild`     |
| `/automod-logs`    | Atur channel log automod            | `ManageGuild`     |
| `/automod-whitelist` | Kelola whitelist automod          | `ManageGuild`     |
| `/ticket-setup`    | Pasang panel tiket di channel       | `ManageGuild`     |
| `/ticket-config`   | Konfigurasi sistem tiket            | `ManageGuild`     |
| `/ticket-stats`    | Lihat statistik tiket               | `ManageGuild`     |
| `/help`            | Daftar semua command                | —                 |
| `/ping`            | Cek latency bot                     | —                 |
| `/avatar`          | Lihat avatar user                   | —                 |
| `/userinfo`        | Informasi user                      | —                 |
| `/serverinfo`      | Informasi server                    | —                 |

### 🌐 Dukungan Dua Bahasa

Dukungan penuh **Bahasa Indonesia** 🇮🇩 dan **English** 🇬🇧, bisa dikonfigurasi per server via command `/settings language` atau dashboard.

---

## 🚀 Mulai Cepat

### Prasyarat

- [Docker](https://www.docker.com/) (direkomendasikan untuk produksi)
- [Node.js 22+](https://nodejs.org/) (untuk pengembangan lokal)
- Sebuah [Aplikasi Discord](https://discord.com/developers/applications) dengan:
  - **Bot Token**
  - **Client ID & Client Secret** (untuk OAuth2 dashboard)
  - **Redirect URI**: `https://domain-anda.com/api/auth/callback/discord`

### 1. Clone & Konfigurasi

```bash
git clone https://github.com/iyansanjaya/lumigiabot.git
cd lumigiabot
cp .env.example .env
```

Edit `.env` dengan kredensial Anda:

```env
# Bot Discord (Wajib)
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# Dashboard (Wajib)
AUTH_SECRET=generate_a_random_secret_here    # openssl rand -base64 32
AUTH_TRUST_HOST=true
AUTH_URL=https://bot.domain-anda.com         # URL publik dashboard

# Database
DATABASE_PATH=./data/lumigiabot.db

# Pengaturan Bot
DEFAULT_LANGUAGE=id                          # id atau en
BOT_OWNER_ID=your_discord_user_id_here

# Opsional: Twitch API (Untuk Notifikasi Live)
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

Catatan Docker: `compose.yml` akan override `DATABASE_PATH` menjadi `/app/data/lumigiabot.db` di dalam container supaya bot dan dashboard selalu membaca volume database yang sama. Nilai relatif di `.env` tetap cocok untuk mode lokal.

### 2A. Jalankan dengan Docker (Direkomendasikan) 🐳

```bash
docker compose up -d --build
```

Selesai! Bot dan dashboard berjalan otomatis.

- **Bot**: Berjalan di background
- **Dashboard**: `http://localhost:3412` (atau melalui reverse proxy)

### 2B. Jalankan Lokal (Pengembangan)

```bash
# Terminal 1 — Bot
cd bot && npm install && npm run dev

# Terminal 2 — Dashboard
cd web && npm install && npm run dev
```

### 3. Daftarkan Slash Command

```bash
# Dengan Docker
docker exec lumigiabot node deploy-commands.js

# Tanpa Docker
cd bot && npm run deploy
```

### 4. Rebuild Setelah Update

```bash
git pull
docker compose build --no-cache
docker compose down && docker compose up -d
```

### 5. Backup Database

Database SQLite dipakai bersama oleh bot dan dashboard, jadi buat backup sebelum update besar atau migrasi VPS.

```bash
# Dengan Docker, backup dibuat ke /app/data/backups dan terlihat di ./data/backups host
docker exec lumigiabot node scripts/backup-db.mjs

# Lokal, dengan output manual
cd bot
npm run backup -- --output=../data/backups/manual-backup.db
```

Script backup otomatis memverifikasi hasil backup dengan `PRAGMA integrity_check` dan mengecek tabel penting aplikasi.

Untuk restore, hentikan service dulu agar SQLite tidak sedang ditulis:

```bash
docker compose down
cp data/backups/manual-backup.db data/lumigiabot.db
docker compose up -d
```

---

## 📁 Struktur Proyek

```
lumigiabot/
├── bot/                          # 🤖 Bot Discord (Node.js + discord.js v14)
│   ├── src/
│   │   ├── commands/             # Slash commands
│   │   │   ├── admin/            #   setup, settings, audit-log
│   │   │   ├── automod/          #   automod-config, automod-logs, automod-whitelist
│   │   │   ├── moderation/       #   ban, kick, mute, warn, purge, slowmode, lockdown
│   │   │   ├── tickets/          #   ticket-setup, ticket-config, ticket-stats
│   │   │   └── utility/          #   help, ping, avatar, userinfo, serverinfo
│   │   ├── components/           # Handler tombol, modal, select menu
│   │   ├── config/               # Konstanta, level permission
│   │   ├── core/                 # BotClient, handler, manajer cooldown
│   │   ├── database/             # SQLite + migrasi + repository (DAO pattern)
│   │   ├── events/               # Event gateway Discord
│   │   ├── i18n/                 # Terjemahan (en-US, id)
│   │   ├── modules/              # Logika bisnis (moderasi, automod, tiket, antiraid)
│   │   └── utils/                # Logger, validator, formatter, embed builder
│   ├── deploy-commands.js
│   ├── Dockerfile
│   └── package.json
│
├── web/                          # 🎨 Dashboard (Next.js 15 App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (landing)/        # Landing page, features, commands, terms, privacy
│   │   │   ├── (dashboard)/      # Dashboard admin (overview, servers, settings, dll)
│   │   │   └── api/              # API routes (auth, guilds settings/automod, transcripts)
│   │   ├── components/           # UI components (landing, dashboard, shared)
│   │   ├── lib/                  # Auth (Auth.js v5), database, discord-api
│   │   └── types/                # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
│
├── docs/                         # 📚 Dokumentasi Resmi (Next.js 15 + Fumadocs)
│   ├── content/docs/             # File Markdown (MDX) konten dokumentasi
│   ├── src/                      # Komponen dan konfigurasi (Fumadocs)
│   └── package.json
│
├── data/                         # 📁 Database SQLite (shared volume antara bot & web)
├── compose.yml                   # 🐳 Docker Compose orchestration
├── .env.example                  # 📋 Template environment variables
└── README.md
```

---

## 🔒 Keamanan

### Bot & Discord
- **Validasi Permission** — setiap command dicek izinnya sebelum eksekusi
- **Pemeriksaan Hierarki Role** — mencegah moderator menghukum user dengan role lebih tinggi
- **Sanitasi Input** — pemblokiran @everyone/@here dalam input user
- **Rate Limiting** — cooldown per-command untuk mencegah spam
- **Error Handler Global** — mencegah crash loop pada error tak terduga

### Database
- **Parameterized Queries** — semua query menggunakan placeholder `?`, mencegah SQL injection
- **Field Whitelist** — hanya field yang terdaftar yang bisa diubah via dashboard API
- **WAL Mode** — memungkinkan bot dan web mengakses database bersamaan tanpa lock
- **Busy Timeout** — 5 detik timeout untuk menghindari deadlock
- **Guild Lifecycle Cleanup** — saat bot keluar dari server, data operasional guild dan folder transcript terkait dibersihkan lewat cleanup transaksional

### Web Dashboard
- **Discord OAuth2** — login hanya melalui akun Discord yang valid
- **Permission Check** — setiap API request dicek ulang: user harus punya `MANAGE_GUILD`/Administrator dan LumigiaBOT masih berada di server target
- **Bot Presence Check** — daftar server, ringkasan dashboard, halaman guild, dan API guard hanya menerima server yang masih ditempati LumigiaBOT
- **4-Layer Security** pada API write:
  1. **Authentication** — session JWT harus valid
  2. **Guild Validation** — format ID Discord (17-20 digit) divalidasi sebelum query
  3. **Authorization** — verifikasi permission user dan keberadaan bot via Discord API
  4. **Validation** — whitelist ketat pada field names, filter names, dan actions
- **Guild ID Validation** — format ID Discord (17-20 digit) divalidasi sebelum query
- **Input Sanitization** — whitespace di-trim, string kosong dikonversi ke `null`
- **Non-root Container** — container berjalan sebagai user `node` (UID 1000)
- **Environment Variables** — semua secrets disimpan di `.env`, tidak pernah di-hardcode

---

## ⚙️ Konfigurasi

### Via Discord (Slash Commands)

```
/setup                             # Wizard konfigurasi interaktif
/settings language id              # Atur bahasa ke Bahasa Indonesia
/settings mod-log #mod-log         # Atur channel log moderasi
/automod-config spam true warn     # Aktifkan filter spam dengan action warn
/automod-logs #automod-log         # Atur channel log automod
/automod-whitelist add channel #general  # Whitelist channel dari automod
/ticket-setup #support             # Pasang panel tiket di channel
/ticket-config support-role @Support     # Atur role support untuk tiket
```

### Via Web Dashboard

1. Kunjungi URL dashboard Anda (contoh: `https://bot.lumigia.com`)
2. Login dengan akun Discord
3. Pilih server yang ingin dikonfigurasi. Server hanya muncul jika akun Anda punya **Manage Server**/**Administrator** dan LumigiaBOT masih berada di server tersebut.
4. Gunakan halaman **Settings** untuk mengatur:
   - 🌐 Bahasa bot
   - 📢 Channel sambutan + pesan custom
   - 📋 Channel log moderasi & automod
   - 🎫 Kategori tiket, role support, auto-close timeout
   - 🛡️ Anti-raid (threshold, timeframe)
   - ⚠️ Warning escalation (mute/kick/ban otomatis)
5. Gunakan halaman **AutoMod** untuk toggle filter & pilih action
6. Gunakan halaman **Tickets**, **Reaction Roles**, **Giveaways**, **Moderation**, **Logs**, dan **Analytics** untuk monitoring data server

> Perubahan konfigurasi dari dashboard langsung tersimpan dan berlaku tanpa restart bot.

---

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur: `git checkout -b fitur/fitur-baru`
3. Commit perubahan: `git commit -m 'Tambah fitur baru'`
4. Push ke branch: `git push origin fitur/fitur-baru`
5. Buka Pull Request

### Panduan Pengembangan

- Gunakan **ES Modules** (`import`/`export`)
- Ikuti struktur kode dan folder yang sudah ada
- Tambahkan terjemahan i18n untuk kedua bahasa (`en-US` dan `id`)
- Gunakan **repository pattern** untuk akses database
- Tambahkan **JSDoc** pada semua fungsi publik
- Uji validasi permission dan error handling

---

## 🛠️ Troubleshooting (Masalah Umum)

### ❌ Error 500 di Dashboard (SQLITE_READONLY)
Jika Anda menggunakan Docker (terutama di Linux/VPS) dan tidak bisa mengubah pengaturan di Dashboard (Error 500) atau melihat error `attempt to write a readonly database` di log `lumigiabot-web`, ini karena masalah izin folder (permissions).

**Solusi:**
Ubah kepemilikan folder `data` agar bisa ditulis oleh user di dalam container Docker (UID 1000). Jalankan perintah berikut di folder proyek Anda:
```bash
sudo chown -R 1000:1000 data/
```
Setelah itu, coba simpan pengaturan kembali dari Dashboard.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE).

---

<div align="center">
  <strong>LumigiaBOT</strong> — Dibuat dengan ❤️ untuk komunitas Discord
</div>
