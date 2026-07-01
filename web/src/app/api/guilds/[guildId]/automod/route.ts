import { NextRequest, NextResponse } from 'next/server';
import { requireGuildManager } from '@/lib/api-guard';
import { updateAutoModFilter } from '@/lib/database';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireGuildManager(req, params, { scope: 'automod' });
    if (!guard.ok) return guard.response;

    let body: { filter_name: string; enabled: boolean; action: string; config?: Record<string, unknown> };
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

    const configString = body.config ? JSON.stringify(body.config) : '{}';
    const success = updateAutoModFilter(
      guard.guildId,
      body.filter_name,
      body.enabled,
      body.action,
      configString,
    );
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
