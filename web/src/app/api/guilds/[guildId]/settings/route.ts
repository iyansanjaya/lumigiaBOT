import { NextRequest, NextResponse } from 'next/server';
import { requireGuildManager } from '@/lib/api-guard';
import { normalizeLanguage } from '@/lib/contracts';
import { updateGuildSetting } from '@/lib/database';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireGuildManager(req, params, { scope: 'settings' });
    if (!guard.ok) return guard.response;

    let body: { field: string; value: string | number | null };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.field || typeof body.field !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid field' }, { status: 400 });
    }

    if (typeof body.value === 'string') {
      body.value = body.value.trim();
      if (body.value === '') body.value = null;
    }

    if (body.field === 'language' && typeof body.value === 'string') {
      body.value = normalizeLanguage(body.value);
    }

    const success = updateGuildSetting(guard.guildId, body.field, body.value);
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
