# 🤖 LumigiaBOT

**Bot Penjaga Discord Serba Guna** — Bot Discord modern dan modular dengan Web Dashboard, dibuat untuk komunitas segala ukuran.

[![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Siap-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Lisensi](https://img.shields.io/badge/Lisensi-MIT-green.svg)](LICENSE)

---

## ✨ Fitur

### 🛡️ Moderasi

Perangkat moderasi lengkap dengan pemeriksaan hierarki role, notifikasi DM, dan auto-eskalasi.

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

Enam filter yang bisa dikonfigurasi dengan pengaturan per-guild dan dukungan whitelist.

- **Filter Spam** — Deteksi pesan beruntun & konten duplikat
- **Filter Link** — Blokir undangan Discord & URL mencurigakan
- **Filter Kata** — Daftar hitam kata kustom dengan dukungan regex
- **Filter Huruf Kapital** — Deteksi huruf kapital berlebihan (>70%)
- **Filter Emoji** — Deteksi spam emoji (>5 per pesan)
- **Filter Mention** — Deteksi mention massal (>5 mention)

### 🎫 Sistem Tiket

Sistem tiket profesional dengan manajemen siklus hidup lengkap.

- 📩 Pembuatan tiket satu klik dengan pemilihan kategori
- 📝 Form modal untuk detail tiket
- 👋 Sistem klaim staff
- 📄 Pembuatan transkrip HTML (tema gelap mirip Discord)
- ⏰ Auto-tutup setelah tidak aktif (bisa dikonfigurasi)
- 📊 Dashboard statistik tiket

### 🛡️ Perlindungan Anti-Raid

- Pemantauan kecepatan join dengan ambang batas yang bisa dikonfigurasi
- Verifikasi umur akun
- Lockdown server otomatis
- Notifikasi peringatan untuk staff

### 🎨 Web Dashboard

Dashboard modern dan cantik dibuat dengan Next.js 15 + Tailwind CSS + Coss UI.

- **Halaman Landing** — Halaman marketing memukau dengan animasi
- **Dashboard** — Login Discord OAuth2, manajemen server
- **Manajemen Server** — Moderasi, AutoMod, Tiket, Log, Pengaturan

### 🌐 Dukungan Dua Bahasa

Dukungan penuh Bahasa Indonesia 🇮🇩 dan Bahasa Inggris 🇬🇧, bisa dikonfigurasi per server.

---

## 🚀 Mulai Cepat

### Prasyarat

- [Node.js 22+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (direkomendasikan untuk produksi)
- Sebuah [Aplikasi Discord](https://discord.com/developers/applications) dengan Bot Token

### 1. Clone & Konfigurasi

```bash
git clone https://github.com/iyansanjaya/lumigiabot.git
cd lumigiabot
cp .env.example .env
```

Edit `.env` dengan kredensial Anda:

```env
DISCORD_TOKEN=token_bot_anda
DISCORD_CLIENT_ID=client_id_anda
DISCORD_CLIENT_SECRET=client_secret_anda
NEXTAUTH_SECRET=secret_acak_anda
NEXTAUTH_URL=http://localhost:3000
DATABASE_PATH=./data/lumigiabot.db
DEFAULT_LANGUAGE=id
BOT_OWNER_ID=id_discord_anda
```

### 2A. Jalankan dengan Docker (Direkomendasikan) 🐳

```bash
docker-compose up -d
```

Selesai! Bot dan dashboard akan berjalan otomatis.

- **Bot**: Berjalan di background
- **Dashboard**: http://localhost:3000

### 2B. Jalankan Lokal (Pengembangan)

```bash
# Instal dependensi bot
cd bot && npm install

# Instal dependensi dashboard
cd ../web && npm install

# Jalankan bot (terminal 1)
cd bot && npm run dev

# Jalankan dashboard (terminal 2)
cd web && npm run dev
```

### 3. Daftarkan Slash Command

```bash
# Dengan Docker
docker exec lumigiabot node deploy-commands.js

# Tanpa Docker
cd bot && npm run deploy
```

---

## 📁 Struktur Proyek

```
lumigiabot/
├── bot/                    # 🤖 Bot Discord (Node.js, discord.js v14)
│   ├── src/
│   │   ├── commands/       # Slash command (moderasi, automod, tiket, admin, utilitas)
│   │   ├── components/     # Handler tombol, modal, select menu
│   │   ├── config/         # Konstanta, level permission
│   │   ├── core/           # BotClient, handler, manajer cooldown
│   │   ├── database/       # SQLite, migrasi, repository (DAO)
│   │   ├── events/         # Event gateway Discord
│   │   ├── i18n/           # Terjemahan (en-US, id)
│   │   ├── modules/        # Logika bisnis (moderasi, automod, tiket, antiraid)
│   │   └── utils/          # Logger, validator, formatter
│   ├── deploy-commands.js
│   ├── Dockerfile
│   └── package.json
│
├── web/                    # 🎨 Dashboard (Next.js 15, Tailwind CSS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (landing)/  # Halaman marketing
│   │   │   ├── (dashboard)/ # Dashboard admin
│   │   │   └── api/        # Rute API NextAuth
│   │   ├── components/     # Komponen UI, landing, dashboard
│   │   ├── lib/            # Auth, database, utilitas
│   │   └── types/          # Interface TypeScript
│   ├── Dockerfile
│   └── package.json
│
├── data/                   # 📁 Database SQLite (volume Docker)
├── docker-compose.yml      # 🐳 Orkestrasi
├── .env.example            # 📋 Template environment
└── README.md
```

---

## 🔒 Keamanan

- **Validasi Permission** pada setiap command
- **Pemeriksaan Hierarki Role** untuk mencegah eskalasi privilege
- **Sanitasi Input** (pemblokiran @everyone/@here)
- **Rate Limiting** cooldown per-command
- **Pencegahan SQL Injection** via query terparameterisasi
- **Autentikasi OAuth2** untuk akses dashboard
- **Kontainer Docker Non-root** (`USER node`)
- **Volume DB Baca-saja** untuk kontainer dashboard
- **Variabel Environment** untuk semua rahasia (tidak pernah di-hardcode)
- **Mode WAL** SQLite untuk akses konkuren yang aman
- **Error Handler Global** mencegah crash loop

---

## ⚙️ Konfigurasi

### Pengaturan Per-Server

Gunakan `/setup` di Discord untuk menjalankan wizard konfigurasi interaktif, atau gunakan command individual:

```
/settings language id          # Atur ke Bahasa Indonesia
/settings mod-log #mod-log     # Atur channel log moderasi
/automod-config spam true warn # Aktifkan filter spam
/automod-logs #automod-log     # Atur channel log automod
/ticket-setup #support         # Pasang panel tiket
/ticket-config support-role @Support
```

### Dashboard

Akses web dashboard untuk mengatur pengaturan secara visual:

1. Kunjungi URL dashboard Anda
2. Login dengan Discord
3. Pilih server yang Anda kelola
4. Konfigurasikan modul melalui UI

---

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur: `git checkout -b fitur/fitur-saya`
3. Commit perubahan: `git commit -m 'Tambah fitur saya'`
4. Push ke branch: `git push origin fitur/fitur-saya`
5. Buka Pull Request

### Panduan Pengembangan

- Gunakan ES Modules (`import/export`)
- Ikuti struktur kode yang sudah ada
- Tambahkan terjemahan i18n untuk kedua bahasa `en-US` dan `id`
- Gunakan pola repository untuk akses database
- Tambahkan komentar JSDoc pada semua fungsi
- Uji pemeriksaan permission dan penanganan error

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.

---

<div align="center">
  <strong>LumigiaBOT</strong> — Dibuat dengan ❤️ untuk komunitas Discord
</div>
