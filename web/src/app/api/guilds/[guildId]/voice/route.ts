import { NextRequest, NextResponse } from 'next/server';
import { requireGuildManager } from '@/lib/api-guard';
import { updateVoiceSetting } from '@/lib/database';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireGuildManager(req, params, { scope: 'voice' });
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

    const success = updateVoiceSetting(guard.guildId, body.field, body.value);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update voice setting' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API voice PATCH]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
