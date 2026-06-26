import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateAutoModFilter } from '@/lib/database';
import { getUserGuilds, getManageableGuilds } from '@/lib/discord-api';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  // ── Auth check ──
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { guildId } = await params;

  // ── Permission check: user harus punya MANAGE_GUILD di server ini ──
  try {
    const allGuilds = await getUserGuilds(session.accessToken);
    const manageable = getManageableGuilds(allGuilds);
    const hasAccess = manageable.some((g) => g.id === guildId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden — you do not have Manage Server permission' },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json({ error: 'Failed to verify permissions' }, { status: 500 });
  }

  // ── Parse & validate body ──
  let body: { filter_name: string; enabled: boolean; action: string };
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

  // ── Update database ──
  try {
    const success = updateAutoModFilter(guildId, body.filter_name, body.enabled, body.action);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update filter' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
