/**
 * LumigiaBOT — Event Anggota Baru Guild
 * Memantau anggota baru bergabung untuk deteksi anti-raid.
 */

export const name = 'guildMemberAdd';
export const once = false;

export async function execute(member, client) {
  // Kirim ke mesin anti-raid jika tersedia
  if (client.antiRaidEngine) {
    await client.antiRaidEngine.onMemberJoin(member);
  }
}
