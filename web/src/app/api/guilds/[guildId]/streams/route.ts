import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addStreamNotification, deleteStreamNotification } from '@/lib/database';
import { canManageGuild } from '@/lib/discord-api';

interface RouteParams {
  params: Promise<{ guildId: string }>;
}

/** Tambah stream notification config */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guildId } = await params;
    if (!/^\d{17,20}$/.test(guildId)) {
      return NextResponse.json({ error: 'Invalid guild ID format' }, { status: 400 });
    }

    const hasAccess = await canManageGuild(session.accessToken, guildId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: {
      platform: string;
      platform_user: string;
      notify_channel: string;
      ping_role?: string | null;
      custom_message?: string | null;
    };
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Validasi field wajib
    if (!body.platform || !['twitch', 'youtube'].includes(body.platform)) {
      return NextResponse.json({ error: 'Platform harus twitch atau youtube' }, { status: 400 });
    }
    if (body.platform === 'twitch' && !(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET)) {
      return NextResponse.json(
        { error: 'Twitch notifications are not enabled on this bot instance.' },
        { status: 400 },
      );
    }
    if (!body.platform_user || typeof body.platform_user !== 'string') {
      return NextResponse.json({ error: 'Username/Channel ID wajib diisi' }, { status: 400 });
    }
    if (!body.notify_channel || !/^\d{17,20}$/.test(body.notify_channel)) {
      return NextResponse.json({ error: 'Notify channel ID tidak valid' }, { status: 400 });
    }

    // Sanitize optional fields
    const platformUser = body.platform_user.trim();
    const pingRole = body.ping_role?.trim() || null;
    const customMessage = body.custom_message?.trim() || null;

    if (!platformUser) {
      return NextResponse.json({ error: 'Username/Channel ID wajib diisi' }, { status: 400 });
    }

    if (body.platform === 'youtube' && (!platformUser.startsWith('UC') || platformUser.length < 20)) {
      return NextResponse.json({ error: 'YouTube Channel ID tidak valid' }, { status: 400 });
    }

    if (pingRole && !/^\d{17,20}$/.test(pingRole)) {
      return NextResponse.json({ error: 'Ping role ID tidak valid' }, { status: 400 });
    }

    if (customMessage && customMessage.length > 1800) {
      return NextResponse.json({ error: 'Pesan kustom terlalu panjang' }, { status: 400 });
    }

    const success = addStreamNotification(
      guildId, body.platform, platformUser,
      body.notify_channel, pingRole, customMessage,
    );
    if (!success) {
      return NextResponse.json({ error: 'Gagal menambah notifikasi' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API streams POST]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** Hapus stream notification config */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guildId } = await params;
    if (!/^\d{17,20}$/.test(guildId)) {
      return NextResponse.json({ error: 'Invalid guild ID format' }, { status: 400 });
    }

    const hasAccess = await canManageGuild(session.accessToken, guildId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: { id: number };
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.id || typeof body.id !== 'number') {
      return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });
    }

    const success = deleteStreamNotification(body.id, guildId);
    if (!success) {
      return NextResponse.json({ error: 'Notifikasi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API streams DELETE]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
