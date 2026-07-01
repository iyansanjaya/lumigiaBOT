'use client';

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  parent_id: string | null;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
}

interface DiscordData {
  channels: DiscordChannel[];
  roles: DiscordRole[];
}

const CACHE_TTL_MS = 60_000;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

const cache = new Map<string, { data: DiscordData; expires: number }>();
const inflight = new Map<string, Promise<DiscordData>>();

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readError(res: Response) {
  const payload = await res.json().catch(() => null);
  if (payload && typeof payload.error === 'string') return payload.error;
  return `Gagal memuat data Discord (${res.status})`;
}

async function fetchDiscordData(guildId: string): Promise<DiscordData> {
  let lastError = new Error('Gagal memuat data Discord');

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(`/api/guilds/${guildId}/discord-data`, {
        cache: 'no-store',
      });

      if (res.ok) {
        return (await res.json()) as DiscordData;
      }

      lastError = new Error(await readError(res));
      if (!RETRYABLE_STATUS.has(res.status)) break;
    } catch (error) {
      lastError = error instanceof Error ? error : lastError;
    }

    await wait(300 * (attempt + 1));
  }

  throw lastError;
}

export function getGuildDiscordData(guildId: string): Promise<DiscordData> {
  const cached = cache.get(guildId);
  if (cached && Date.now() < cached.expires) {
    return Promise.resolve(cached.data);
  }

  const pending = inflight.get(guildId);
  if (pending) return pending;

  const request = fetchDiscordData(guildId)
    .then((data) => {
      cache.set(guildId, { data, expires: Date.now() + CACHE_TTL_MS });
      return data;
    })
    .finally(() => {
      inflight.delete(guildId);
    });

  inflight.set(guildId, request);
  return request;
}

export function clearGuildDiscordDataCache(guildId: string) {
  cache.delete(guildId);
}
