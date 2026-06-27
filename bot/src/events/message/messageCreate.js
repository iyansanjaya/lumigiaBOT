/**
 * LumigiaBOT — Event Pembuatan Pesan
 * Memproses pesan melalui mesin auto-moderasi.
 */

export const name = 'messageCreate';
export const once = false;

export async function execute(message, client) {
  // Abaikan bot, DM, dan pesan sistem
  if (message.author.bot || !message.guild || message.system) return;

  // Jalankan auto-moderasi jika tersedia
  if (client.autoModEngine) {
    await client.autoModEngine.process(message);
  }

  // Jika pesan dihapus oleh automod, jangan proses XP
  if (message.deletable === false && message.deleted) return;

  // ── Leveling XP ──
  try {
    const { LevelingService } = await import('../../modules/leveling/LevelingService.js');
    await LevelingService.processMessage(client, message);
  } catch { /* silent */ }

  // Analytics tracking
  try {
    client.db?.analytics?.trackMessage(message.guild.id);
    client.db?.analytics?.trackChannelMessage(message.guild.id, message.channel.id);
  } catch { /* silent */ }
}
