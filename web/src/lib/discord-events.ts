import {
  DEFAULT_SCHEDULE_TIMEZONE,
  getNextScheduleOccurrenceIso,
} from '@/lib/contracts';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const TOKEN = process.env.DISCORD_TOKEN;

/**
 * dayOfWeek follows JavaScript Date.getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday.
 */
function getNextOccurrenceISO(
  dayOfWeek: number,
  timeStr: string,
  timezone = DEFAULT_SCHEDULE_TIMEZONE,
): string | null {
  return getNextScheduleOccurrenceIso(dayOfWeek, timeStr, timezone);
}

/**
 * Mendapatkan ISO 8601 string 2 jam setelah waktu mulai
 */
function getEndTimeISO(startDateIso: string): string {
  const date = new Date(startDateIso);
  date.setHours(date.getHours() + 2);
  return date.toISOString();
}

/**
 * Membuat Discord Scheduled Event via REST API.
 * Mengembalikan ID event jika sukses, atau null jika gagal.
 */
export async function createDiscordScheduledEvent(
  guildId: string,
  title: string,
  description: string | null,
  dayOfWeek: number,
  timeStr: string,
  timezone = DEFAULT_SCHEDULE_TIMEZONE,
): Promise<string | null> {
  if (!TOKEN) {
    console.error('[discord-events] DISCORD_TOKEN is missing');
    return null;
  }

  const startTime = getNextOccurrenceISO(dayOfWeek, timeStr, timezone);
  if (!startTime) {
    console.error('[discord-events] Invalid scheduled event time:', { dayOfWeek, timeStr, timezone });
    return null;
  }

  const endTime = getEndTimeISO(startTime);

  const payload = {
    name: title,
    description: description || 'Stream Terjadwal',
    scheduled_start_time: startTime,
    scheduled_end_time: endTime,
    privacy_level: 2, // GUILD_ONLY
    entity_type: 3, // EXTERNAL
    entity_metadata: {
      location: 'Stream'
    }
  };

  console.log('[discord-events] Creating event for guild:', guildId, 'payload:', JSON.stringify(payload));

  try {
    const res = await fetch(`${DISCORD_API_URL}/guilds/${guildId}/scheduled-events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[discord-events] Failed to create event:', res.status, errText);
      return null;
    }

    const data = await res.json();
    console.log('[discord-events] Event created successfully:', data.id);
    return data.id;
  } catch (err) {
    console.error('[discord-events] Error creating event:', err);
    return null;
  }
}

/**
 * Menghapus Discord Scheduled Event via REST API.
 */
export async function deleteDiscordScheduledEvent(guildId: string, eventId: string): Promise<boolean> {
  if (!TOKEN) return false;

  try {
    const res = await fetch(`${DISCORD_API_URL}/guilds/${guildId}/scheduled-events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bot ${TOKEN}`
      }
    });

    if (!res.ok && res.status !== 404) {
      const errText = await res.text();
      console.error('[discord-events] Failed to delete event:', res.status, errText);
      return false;
    }

    console.log('[discord-events] Event deleted:', eventId);
    return true;
  } catch (err) {
    console.error('[discord-events] Error deleting event:', err);
    return false;
  }
}
