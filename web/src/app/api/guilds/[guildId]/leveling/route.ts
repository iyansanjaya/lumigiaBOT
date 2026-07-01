import { NextRequest, NextResponse } from 'next/server';
import { requireGuildManager } from '@/lib/api-guard';
import { validateLevelingSettingValue } from '@/lib/contracts';
import { updateLevelingSetting } from '@/lib/database';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireGuildManager(req, params, { scope: 'leveling' });
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

    const validation = validateLevelingSettingValue(body.field, body.value);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const success = updateLevelingSetting(guard.guildId, body.field, validation.value);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update leveling setting' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API leveling PATCH]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
