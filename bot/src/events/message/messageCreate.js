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
}
