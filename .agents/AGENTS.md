# LumigiaBOT — Project Context

Bot Discord all-in-one (moderasi, auto-mod, ticketing, anti-raid, streamer features) dengan Web Dashboard interaktif. Dipakai oleh banyak server Discord — setiap server punya konfigurasi independen.

## Tech Stack

| Layer     | Teknologi                                                                       |
| --------- | ------------------------------------------------------------------------------- |
| Bot       | Node.js 22 + discord.js v14, ES Modules (`import`/`export`)                     |
| Dashboard | Next.js 15 (App Router) + React Server Components + Auth.js v5 (Discord OAuth2) |
| Database  | SQLite (better-sqlite3), WAL mode, shared volume `/app/data/lumigiabot.db`      |
| Styling   | Tailwind CSS v4, dark theme (GitHub Dark inspired)                              |
| Fonts     | Bricolage Grotesque (heading, weight 700) + Archivo (body, weight 400)          |
| Deploy    | Docker Compose — 2 container (bot + web), shared `./data` volume                |
| i18n      | i18next — Bahasa Indonesia (id) & English (en-US)                               |

## Arsitektur Bot (`bot/`)

### Entry Point

- `src/index.js` → load env → init `BotClient` → init `Database` → load handlers → login

### Core Pattern

```
BotClient (extends discord.js Client)
├── client.commands    — Collection<string, CommandModule>
├── client.buttons     — Collection<string, Function>
├── client.modals      — Collection<string, Function>
├── client.selectMenus — Collection<string, Function>
├── client.cooldowns   — Collection
├── client.db          — Database instance (akses repo via client.db.xxx)
└── client.t           — i18next translate function
```

### Database Layer (Repository Pattern)

- `Database.js` → buat koneksi SQLite, jalankan migrasi, instantiate semua repository
- Migrasi: `database/migrations/001_xxx.sql` ... `014_xxx.sql` (CREATE TABLE IF NOT EXISTS & ALTER TABLE)
- Akses: `client.db.<repoName>.<method>()` — contoh: `client.db.warnings.add(guildId, userId, ...)`

#### Repositories (14 total)

| Repo              | Akses via                 | Tables                                          |
| ----------------- | ------------------------- | ----------------------------------------------- |
| GuildSettingsRepo | `client.db.guildSettings` | `guild_settings`                                |
| TicketRepo        | `client.db.tickets`       | `tickets`                                       |
| WarnRepo          | `client.db.warnings`      | `warnings`                                      |
| AutoModRepo       | `client.db.automod`       | `automod_filters`, `automod_whitelist`          |
| AuditLogRepo      | `client.db.auditLogs`     | `audit_logs`                                    |
| VoiceRepo         | `client.db.voice`         | `voice_settings`, `temp_channels`               |
| ReactionRoleRepo  | `client.db.reactionRoles` | `reaction_role_panels`, `reaction_role_entries` |
| GiveawayRepo      | `client.db.giveaways`     | `giveaways`, `giveaway_entries`                 |
| ScheduleRepo      | `client.db.schedule`      | `stream_schedule`, `schedule_settings`          |
| CustomEmbedRepo   | `client.db.customEmbeds`  | `custom_embeds`, `social_links`                 |
| LevelingRepo      | `client.db.leveling`      | `user_xp`, `level_rewards`, `leveling_settings` |
| StreamNotifRepo   | `client.db.streamNotif`   | `stream_notifications`                          |
| FanArtRepo        | `client.db.fanArt`        | `fanart_settings`, `fanart_submissions`         |
| AnalyticsRepo     | `client.db.analytics`     | `daily_stats`, `channel_activity`               |

### Command Structure

```
commands/
├── admin/        — setup, settings, audit-log
├── automod/      — automod-config, automod-logs, automod-whitelist
├── moderation/   — ban, kick, mute, warn, purge, slowmode, lockdown
├── tickets/      — ticket-setup, ticket-config, ticket-stats
├── utility/      — help, ping, avatar, userinfo, serverinfo
├── voice/        — voice (8 subcommands)
├── roles/        — reaction-role (6 subcommands)
├── giveaway/     — giveaway (4 subcommands)
├── community/    — schedule (3 subcommands), embed, socials
├── leveling/     — rank, leaderboard, xp (8 subcommands)
├── streaming/    — stream (4 subcommands), fanart (5 subcommands), analytics (2 subcommands)
```

Setiap command file: `export const data = new SlashCommandBuilder(...)`, `export async function execute(interaction)`, optional `export const cooldown = 5000`.

### Module/Service Pattern

```
modules/
├── moderation/   — ModerationService.js (warn escalation, hierarchy checks)
├── automod/      — AutoModEngine.js (6 filters: spam, link, word, caps, emoji, mention)
├── antiraid/     — AntiRaidEngine.js (join rate monitor + lockdown)
├── tickets/      — TicketService.js (lifecycle, transcripts, auto-close)
├── voice/        — VoiceService.js (join-to-create temp channels)
├── reactionroles/— ReactionRoleService.js (panel + button toggle)
├── giveaway/     — GiveawayService.js, GiveawayScheduler.js
├── schedule/     — ScheduleService.js (Native Discord Events Sync)
├── leveling/     — LevelingService.js (XP processing, level-up, progress bar)
├── streaming/    — TwitchAPI.js, YouTubeChecker.js, StreamNotifService.js
├── fanart/       — FanArtService.js (submit, approve, delete, gallery, votes)
├── analytics/    — AnalyticsService.js (message/member tracking)
```

### Event Handlers

- `events/client/ready.js` — Init GiveawayScheduler, StreamNotifService
- `events/interaction/interactionCreate.js` — Route commands, buttons (startsWith matching), modals, selects
- `events/message/messageCreate.js` — AutoMod filter + leveling XP + analytics tracking
- `events/guild/guildMemberAdd.js` — Welcome + anti-raid + analytics
- `events/guild/guildMemberRemove.js` — Analytics
- `events/guild/voiceStateUpdate.js` — Join-to-create voice channels

### Import Convention

Semua module menggunakan `export default class` → import dengan `import ClassName from '...'`.

## Arsitektur Dashboard (`web/`)

### Auth Flow

Auth.js v5 → Discord OAuth2 → JWT strategy → `session.accessToken` (user Bearer token).

### Route Structure

```
app/
├── (landing)/           — Landing page, features, commands, terms, privacy
├── (dashboard)/
│   ├── layout.tsx       — Auth guard + Sidebar + Topbar
│   └── dashboard/
│       ├── servers/     — Server list (with loading.tsx skeleton)
│       └── servers/[guildId]/
│           ├── page.tsx         — Overview
│           ├── loading.tsx      — Skeleton (shared untuk semua sub-routes)
│           ├── moderation/      — Warning history
│           ├── automod/         — AutoMod toggle + action (interactive)
│           ├── tickets/         — Ticket list + transcripts
│           ├── logs/            — Audit logs
│           ├── settings/        — Server config (interactive, auto-save)
│           ├── voice/           — Voice settings (interactive)
│           ├── roles/           — Reaction role panels (read-only)
│           ├── giveaways/       — Giveaway list (read-only)
│           ├── schedule/        — Schedule CRUD (interactive)
│           ├── leveling/        — Leveling config + leaderboard (interactive)
│           ├── streams/         — Stream alerts CRUD (interactive)
│           ├── fanart/          — Fan art config + gallery (interactive)
│           └── analytics/       — Server analytics (read-only)
└── api/guilds/[guildId]/
    ├── settings/route.ts        — PATCH: update guild settings
    ├── automod/route.ts         — PATCH: update automod filter
    ├── voice/route.ts           — PATCH: update voice settings
    ├── leveling/route.ts        — PATCH: update leveling settings
    ├── fanart/route.ts          — PATCH: update fan art settings
    ├── streams/route.ts         — POST + DELETE: stream notification CRUD
    ├── schedule/route.ts        — POST + DELETE: schedule CRUD
    └── discord-data/route.ts    — GET: fetch channels + roles via Bot Token
```

### Dashboard Component Pattern

1. **Page** (Server Component): Fetch data dari database → pass ke Client Component
2. **Client Component** (`'use client'`): Form/toggle/select yang auto-save via fetch ke API route
3. **API Route**: Auth check → guildId validation → permission check (`canManageGuild`) → whitelist → DB write → `{ ok: true }`

### Key Client Components (`components/dashboard/`)

- `SettingsForm.tsx` — Konfigurasi server (inline ToggleInput, SelectInput, TextInput)
- `AutoModCard.tsx` — Toggle + action select per filter
- `ChannelSelect.tsx` — Dropdown channel otomatis dari Discord API
- `RoleSelect.tsx` — Dropdown role otomatis dari Discord API
- `VoiceSettingsForm.tsx`, `LevelingSettingsForm.tsx`, `FanArtSettingsForm.tsx`
- `StreamAlertsManager.tsx`, `ScheduleManager.tsx` — CRUD components
- `Sidebar.tsx` — Navigation menu (3 sections: Core, Streamer, Config)

### Database Access (Web)

`lib/database.ts` — Buka koneksi ke SQLite (`readonly: true` untuk read, normal untuk write). Semua write functions menggunakan field whitelist.

### Discord API Access (Web)

- `lib/discord-api.ts` — `getUserGuilds(accessToken)`, `canManageGuild(accessToken, guildId)` via user OAuth2 token
- `api/discord-data/route.ts` — Fetch channels + roles via `DISCORD_TOKEN` (Bot Token) untuk dropdown picker

## Arsitektur Dokumentasi (`docs/`)

Dokumentasi resmi untuk pemilik server menggunakan Fumadocs.

- **Stack**: Next.js 15 (App Router) + Fumadocs MDX + Tailwind CSS v4.
- **Konfigurasi URL**: Diatur terpusat pada `docs/src/lib/shared.ts` (invite link, dashboard URL, support server).
- **Format Konten**: File `.mdx` di `docs/content/docs/`. Menggunakan komponen dari `fumadocs-ui` (seperti `<Callout>`, `<Steps>`).
- **Deploy**: Di-deploy terpisah ke Vercel dengan **Root Directory** diset ke `docs`.

## Konvensi & Aturan

1. **Bahasa**: Semua UI label, hint, dan error message dalam Bahasa Indonesia
2. **Dependency**: Minimalkan dependensi eksternal. Gunakan yang sudah ada sebelum tambah baru
3. **Git**: JANGAN melakukan `git add`, `git commit`, atau `git push` — itu urusan developer
4. **Keamanan**: Parameterized queries (`?` placeholder), field whitelist, permission checks, non-root Docker
5. **Database**: Gunakan WAL mode, CREATE TABLE IF NOT EXISTS pada migrasi, repository pattern
6. **Export**: Bot modules gunakan `export default class`, diakses via `import ClassName from '...'`
7. **Env Variables**: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `AUTH_SECRET`, `AUTH_URL`, `DATABASE_PATH`, `DEFAULT_LANGUAGE`, `BOT_OWNER_ID`, `TWITCH_CLIENT_ID` (optional), `TWITCH_CLIENT_SECRET` (optional)
