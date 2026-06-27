/**
 * LumigiaBOT — Event Anggota Keluar Guild
 * Melacak anggota yang keluar untuk analytics dashboard.
 */

export const name = 'guildMemberRemove';
export const once = false;

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(member, client) {
  // Analytics tracking
  try { client.db?.analytics?.trackMemberLeave(member.guild.id); } catch { /* silent */ }
}
