import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canManageGuild } from '@/lib/discord-api';
import { getDataDir } from '@/lib/env';
import { buildRateLimitKey, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface RouteParams {
  params: Promise<{ guildId: string; ticketId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { guildId, ticketId } = await params;

  if (!/^\d{17,20}$/.test(guildId) || !/^\d+$/.test(ticketId)) {
    return NextResponse.json({ error: 'Invalid transcript path' }, { status: 400 });
  }

  if (!session.accessToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rateLimit = checkRateLimit(
    buildRateLimitKey(req, `guild:${guildId}:transcripts`, session.accessToken),
    { limit: 120 },
  );
  if (!rateLimit.ok) return rateLimitResponse(rateLimit);

  if (!(await canManageGuild(session.accessToken, guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Path ke file transkrip
  const filePath = join(getDataDir(), 'transcripts', guildId, `ticket-${ticketId}.html`);

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: 'Transcript not found. Transcripts are only available for tickets closed after this feature was enabled.' },
      { status: 404 },
    );
  }

  const html = readFileSync(filePath, 'utf-8');
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
