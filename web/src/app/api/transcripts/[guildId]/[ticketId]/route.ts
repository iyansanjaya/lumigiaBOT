import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { requireGuildManager } from '@/lib/api-guard';
import { getDataDir } from '@/lib/env';

interface RouteParams {
  params: Promise<{ guildId: string; ticketId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { guildId, ticketId } = await params;

  if (!/^\d+$/.test(ticketId)) {
    return NextResponse.json({ error: 'Invalid transcript path' }, { status: 400 });
  }

  const guard = await requireGuildManager(req, { guildId }, { scope: 'transcripts', limit: 120 });
  if (!guard.ok) return guard.response;

  const filePath = join(getDataDir(), 'transcripts', guard.guildId, `ticket-${ticketId}.html`);

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
