import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateGuildSetting } from '@/lib/database';
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
  let body: { field: string; value: string | number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.field || typeof body.field !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid field' }, { status: 400 });
  }

  // ── Update database ──
  try {
    const success = updateGuildSetting(guildId, body.field, body.value);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
