# Database Contract

Bot dan dashboard membaca SQLite yang sama, jadi schema database harus dianggap sebagai API internal bersama.

Sumber kebenaran schema ada di:

- `bot/src/database/migrations/*.sql` untuk struktur fisik database.
- `shared/contracts.js` untuk daftar tabel dan nilai kontrak yang dipakai lintasan bot/web.

## Table Contracts

`shared/contracts.js` mengekspor:

- `DATABASE_TABLES`: daftar semua tabel, dikelompokkan per area fitur.
- `ALL_DATABASE_TABLES`: daftar datar semua tabel yang harus dibuat oleh migrasi.
- `REQUIRED_DATABASE_TABLES`: subset tabel kritikal yang dicek oleh `/api/health`.

## Change Rules

Saat menambah tabel baru:

1. Tambahkan migrasi SQL baru di `bot/src/database/migrations`.
2. Tambahkan nama tabel ke `DATABASE_TABLES`.
3. Tambahkan ke `REQUIRED_DATABASE_TABLES` hanya jika dashboard/bot tidak boleh dianggap sehat tanpa tabel itu.
4. Jika tabel menyimpan data per guild (`guild_id`) atau menjadi child dari data guild, tambahkan cleanup-nya ke `Database.deleteGuildData(guildId)`.
5. Jalankan smoke test bot agar migrasi, contract, dan lifecycle cleanup tetap cocok.

## Guild Data Lifecycle

Saat LumigiaBOT keluar dari server, `bot/src/events/guild/guildDelete.js` memanggil `Database.deleteGuildData(guildId)`.

Cleanup ini harus:

- Berjalan dalam transaksi.
- Menghapus child rows sebelum parent rows, misalnya `fanart_votes`, `giveaway_entries`, dan `reaction_role_entries`.
- Menghapus semua tabel yang menyimpan data operasional guild target.
- Tidak menyentuh data guild lain.
- Dijaga oleh smoke test di `bot/scripts/smoke-tests.mjs`.

Saat menambah enum, action, field whitelist, atau default value:

1. Simpan nilai kontrak di `shared/contracts.js`.
2. Re-export di `web/src/lib/contracts.ts` bila dibutuhkan dashboard.
3. Pakai kontrak yang sama di repository bot dan API web.
4. Tambahkan smoke assertion untuk nilai yang berisiko.

## Verification

Gunakan perintah berikut sebelum commit:

```bash
cd bot && npm run check && npm run smoke
cd ../web && pnpm run smoke && pnpm build
```
