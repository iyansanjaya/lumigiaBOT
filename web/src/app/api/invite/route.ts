import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    return new Response('DISCORD_CLIENT_ID not configured', { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    permissions: '8',
    scope: 'bot applications.commands',
  });

  redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
}
