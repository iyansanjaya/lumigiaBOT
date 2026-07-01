import { NextRequest, NextResponse } from 'next/server';
import { requireGuildManager } from '@/lib/api-guard';
import { validateFanArtSettingValue } from '@/lib/contracts';
import { deleteFanArt, updateFanArtSetting } from '@/lib/database';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireGuildManager(req, params, { scope: 'fanart' });
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

    const validation = validateFanArtSettingValue(body.field, body.value);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const success = updateFanArtSetting(guard.guildId, body.field, validation.value);
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
    const guard = await requireGuildManager(req, params, { scope: 'fanart', limit: 30 });
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(req.url);
    const id = Number.parseInt(searchParams.get('id') || '', 10);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const success = deleteFanArt(id, guard.guildId);
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
