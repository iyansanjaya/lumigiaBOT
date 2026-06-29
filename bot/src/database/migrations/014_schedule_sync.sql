-- ============================================
-- Migration 014: Schedule Sync Event ID
-- Add event_id to stream_schedule to track Discord Scheduled Events
-- ============================================

-- SQLite tidak mendukung ALTER TABLE ADD COLUMN IF NOT EXISTS secara native.
-- Tapi kita bisa menggunakan PRAGMA table_info untuk mengecek atau cukup gunakan ALTER TABLE dan abaikan error jika sudah ada.
-- Karena ini migrasi, kita bisa langsung ALTER TABLE.

ALTER TABLE stream_schedule ADD COLUMN event_id TEXT;
