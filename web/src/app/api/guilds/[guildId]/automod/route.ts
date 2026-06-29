import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateAutoModFilter } from '@/lib/database';
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
    let body: { filter_name: string; enabled: boolean; action: string; config?: Record<string, any> };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.filter_name || typeof body.filter_name !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid filter_name' }, { status: 400 });
    }
    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json({ error: 'Missing or invalid enabled (boolean)' }, { status: 400 });
    }
    if (!body.action || typeof body.action !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid action' }, { status: 400 });
    }

    // Convert config to JSON string if present
    const configString = body.config ? JSON.stringify(body.config) : '{}';

    // ── 5. Update database (whitelist validation inside) ──
    const success = updateAutoModFilter(guildId, body.filter_name, body.enabled, body.action, configString);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update filter' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API automod PATCH]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
