/**
 * LumigiaBOT — Client Discord yang Diperluas
 * Hub pusat yang menyimpan semua state bot: perintah, komponen, cooldown, dan database.
 */

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

export default class BotClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
      ],
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
      ],
    });

    /** @type {Collection<string, object>} Slash command yang diindeks berdasarkan nama */
    this.commands = new Collection();

    /** @type {Collection<string, Function>} Handler tombol yang diindeks berdasarkan customId */
    this.buttons = new Collection();

    /** @type {Collection<string, Function>} Handler modal yang diindeks berdasarkan customId */
    this.modals = new Collection();

    /** @type {Collection<string, Function>} Handler select menu yang diindeks berdasarkan customId */
    this.selectMenus = new Collection();

    /** @type {Collection<string, Collection>} Cooldown per perintah */
    this.cooldowns = new Collection();

    /** @type {import('../database/Database.js').default|null} Instance database */
    this.db = null;

    /** @type {Function|null} Fungsi terjemahan i18n */
    this.t = null;
  }
}
