import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateGuildSetting } from '@/lib/database';
import { canManageGuild } from '@/lib/discord-api';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    // ── 1. Auth check ──
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized — please log in again' }, { status: 401 });
    }

    const { guildId } = await params;

    // ── 2. Validate guildId format (hanya angka, keamanan) ──
    if (!/^\d{17,20}$/.test(guildId)) {
      return NextResponse.json({ error: 'Invalid guild ID format' }, { status: 400 });
    }

    // ── 3. Permission check via Discord API ──
    const hasAccess = await canManageGuild(session.accessToken, guildId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden — you do not have Manage Server permission' },
        { status: 403 },
      );
    }

    // ── 4. Parse & validate body ──
    let body: { field: string; value: string | number | null };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.field || typeof body.field !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid field' }, { status: 400 });
    }

    // Sanitize value — strip leading/trailing whitespace on strings
    if (typeof body.value === 'string') {
      body.value = body.value.trim();
      if (body.value === '') body.value = null;
    }

    // ── 5. Update database (whitelist validation inside) ──
    const success = updateGuildSetting(guildId, body.field, body.value);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API settings PATCH]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
