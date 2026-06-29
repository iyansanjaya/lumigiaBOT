import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addScheduleEntry, deleteScheduleEntry } from '@/lib/database';
import { canManageGuild } from '@/lib/discord-api';
import { createDiscordScheduledEvent, deleteDiscordScheduledEvent } from '@/lib/discord-events';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

/** Tambah jadwal streaming */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guildId } = await params;
    if (!/^\d{17,20}$/.test(guildId)) {
      return NextResponse.json({ error: 'Invalid guild ID format' }, { status: 400 });
    }

    const hasAccess = await canManageGuild(session.accessToken, guildId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: {
      day_of_week: number;
      time: string;
      timezone: string;
      title: string;
      description?: string | null;
    };
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Validasi
    if (typeof body.day_of_week !== 'number' || body.day_of_week < 0 || body.day_of_week > 6) {
      return NextResponse.json({ error: 'Hari harus 0 (Senin) - 6 (Minggu)' }, { status: 400 });
    }
    if (!body.time || !/^\d{2}:\d{2}$/.test(body.time)) {
      return NextResponse.json({ error: 'Format waktu harus HH:MM' }, { status: 400 });
    }
    if (!body.timezone || typeof body.timezone !== 'string') {
      return NextResponse.json({ error: 'Timezone wajib diisi' }, { status: 400 });
    }
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 });
    }

    // 1. Buat event di Discord terlebih dahulu
    const eventId = await createDiscordScheduledEvent(guildId, body.title, body.description || null, body.day_of_week, body.time);

    // 2. Simpan ke database beserta event_id
    const success = addScheduleEntry(
      guildId,
      body.day_of_week,
      body.time.trim(),
      body.timezone.trim(),
      body.title.trim(),
      body.description?.trim() || null,
      eventId
    );
    if (!success) {
      return NextResponse.json({ error: 'Gagal menambah jadwal' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API schedule POST]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** Hapus jadwal streaming */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guildId } = await params;
    if (!/^\d{17,20}$/.test(guildId)) {
      return NextResponse.json({ error: 'Invalid guild ID format' }, { status: 400 });
    }

    const hasAccess = await canManageGuild(session.accessToken, guildId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: { id: number };
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.id || typeof body.id !== 'number') {
      return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });
    }

    const entry = deleteScheduleEntry(body.id, guildId);

    if (!entry) {
      return NextResponse.json({ error: 'Failed to delete schedule entry or not found' }, { status: 500 });
    }

    // Jika punya event_id, hapus dari Discord
    if (entry.event_id) {
      await deleteDiscordScheduledEvent(guildId, entry.event_id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API schedule DELETE]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
