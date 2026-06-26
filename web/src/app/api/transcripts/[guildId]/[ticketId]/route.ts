import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

  // Path ke file transkrip
  const dataDir = process.env.DATABASE_PATH
    ? join(process.env.DATABASE_PATH, '..', 'transcripts', guildId)
    : join(process.cwd(), '..', 'data', 'transcripts', guildId);

  const filePath = join(dataDir, `ticket-${ticketId}.html`);

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
