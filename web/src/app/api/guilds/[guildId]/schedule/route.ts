import { NextRequest, NextResponse } from 'next/server';
import { requireGuildManager } from '@/lib/api-guard';
import { SCHEDULE_DAY_NAMES } from '@/lib/contracts';
import { addScheduleEntry, deleteScheduleEntry } from '@/lib/database';
import { createDiscordScheduledEvent, deleteDiscordScheduledEvent } from '@/lib/discord-events';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireGuildManager(req, params, { scope: 'schedule', limit: 20 });
    if (!guard.ok) return guard.response;

    let body: {
      day_of_week: number;
      time: string;
      timezone: string;
      title: string;
      description?: string | null;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (
      typeof body.day_of_week !== 'number' ||
      !Object.prototype.hasOwnProperty.call(SCHEDULE_DAY_NAMES, body.day_of_week)
    ) {
      return NextResponse.json({ error: 'Hari harus 0 (Minggu) - 6 (Sabtu)' }, { status: 400 });
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

    const eventId = await createDiscordScheduledEvent(
      guard.guildId,
      body.title,
      body.description || null,
      body.day_of_week,
      body.time,
    );

    const success = addScheduleEntry(
      guard.guildId,
      body.day_of_week,
      body.time.trim(),
      body.timezone.trim(),
      body.title.trim(),
      body.description?.trim() || null,
      eventId,
    );
    if (!success) {
      if (eventId) {
        await deleteDiscordScheduledEvent(guard.guildId, eventId);
      }

      return NextResponse.json({ error: 'Gagal menambah jadwal' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API schedule POST]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireGuildManager(req, params, { scope: 'schedule', limit: 30 });
    if (!guard.ok) return guard.response;

    let body: { id: number };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.id || typeof body.id !== 'number') {
      return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });
    }

    const entry = deleteScheduleEntry(body.id, guard.guildId);
    if (!entry) {
      return NextResponse.json({ error: 'Failed to delete schedule entry or not found' }, { status: 500 });
    }

    if (entry.event_id) {
      await deleteDiscordScheduledEvent(guard.guildId, entry.event_id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API schedule DELETE]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
