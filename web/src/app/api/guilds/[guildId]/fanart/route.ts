import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateFanArtSetting } from '@/lib/database';
import { canManageGuild } from '@/lib/discord-api';
import { buildRateLimitKey, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guildId } = await params;
    if (!/^\d{17,20}$/.test(guildId)) {
      return NextResponse.json({ error: 'Invalid guild ID format' }, { status: 400 });
    }

    const rateLimit = checkRateLimit(
      buildRateLimitKey(req, `guild:${guildId}:fanart`, session.accessToken),
    );
    if (!rateLimit.ok) return rateLimitResponse(rateLimit);

    const hasAccess = await canManageGuild(session.accessToken, guildId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: { field: string; value: string | number | null };
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.field || typeof body.field !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid field' }, { status: 400 });
    }

    if (typeof body.value === 'string') {
      body.value = body.value.trim();
      if (body.value === '') body.value = null;
    }

    const success = updateFanArtSetting(guildId, body.field, body.value);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update fan art setting' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API fanart PATCH]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

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

    const rateLimit = checkRateLimit(
      buildRateLimitKey(req, `guild:${guildId}:fanart`, session.accessToken),
      { limit: 30 },
    );
    if (!rateLimit.ok) return rateLimitResponse(rateLimit);

    const hasAccess = await canManageGuild(session.accessToken, guildId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '', 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Dynamic import to avoid circular dependency issues if any
    const { deleteFanArt } = await import('@/lib/database');
    const success = deleteFanArt(id, guildId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete fan art' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API fanart DELETE]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
