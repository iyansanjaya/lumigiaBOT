/**
 * LumigiaBOT — Perintah /giveaway
 * Mengelola sistem giveaway: start, end, reroll, list.
 * Membutuhkan izin ManageGuild.
 */

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';
import ms from 'ms';
import { successEmbed, errorEmbed, createEmbed } from '../../utils/EmbedBuilder.js';
import GiveawayService from '../../modules/giveaway/GiveawayService.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 5000;


/** Batasan durasi */
const MIN_DURATION_MS = 60_000;         // 1 menit
const MAX_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Manage giveaways')

  // --- start ---
  .addSubcommand((sub) =>
    sub
      .setName('start')
      .setDescription('Start a new giveaway')
      .addStringOption((opt) =>
        opt.setName('prize').setDescription('The prize to give away').setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('duration')
          .setDescription('Duration (e.g. 30m, 24h, 7d)')
          .setRequired(true),
      )
      .addIntegerOption((opt) =>
        opt
          .setName('winners')
          .setDescription('Number of winners (default: 1)')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(20),
      )
      .addChannelOption((opt) =>
        opt
          .setName('channel')
          .setDescription('Channel to host the giveaway (default: current)')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(false),
      )
      .addRoleOption((opt) =>
        opt
          .setName('role')
          .setDescription('Required role to enter')
          .setRequired(false),
      ),
  )

  // --- end ---
  .addSubcommand((sub) =>
    sub
      .setName('end')
      .setDescription('End a giveaway early')
      .addIntegerOption((opt) =>
        opt.setName('id').setDescription('Giveaway ID').setRequired(true).setMinValue(1),
      ),
  )

  // --- reroll ---
  .addSubcommand((sub) =>
    sub
      .setName('reroll')
      .setDescription('Pick new winners for a giveaway')
      .addIntegerOption((opt) =>
        opt.setName('id').setDescription('Giveaway ID').setRequired(true).setMinValue(1),
      ),
  )

  // --- list ---
  .addSubcommand((sub) =>
    sub.setName('list').setDescription('List active giveaways in this server'),
  )

  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      case 'start':
        await handleStart(interaction, client);
        break;
      case 'end':
        await handleEnd(interaction, client);
        break;
      case 'reroll':
        await handleReroll(interaction, client);
        break;
      case 'list':
        await handleList(interaction, client);
        break;
    }

    logger.info(`giveaway ${subcommand} executed by ${interaction.user.tag}`);
  } catch (error) {
    logger.error(`giveaway ${subcommand} error:`, error);

    const payload = { embeds: [errorEmbed('❌ An unexpected error occurred.')], ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
}

// ─── Subcommand Handlers ──────────────────────────────────────

/**
 * Mulai giveaway baru.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleStart(interaction, client) {
  const prize = interaction.options.getString('prize');
  const durationStr = interaction.options.getString('duration');
  const winnersCount = interaction.options.getInteger('winners') ?? 1;
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;
  const requiredRole = interaction.options.getRole('role');

  // Parse durasi
  const duration = ms(durationStr);

  if (!duration || typeof duration !== 'number') {
    return interaction.reply({
      embeds: [errorEmbed('❌ Invalid duration format. Use formats like `30m`, `24h`, `7d`.')],
      ephemeral: true,
    });
  }

  if (duration < MIN_DURATION_MS) {
    return interaction.reply({
      embeds: [errorEmbed('❌ Duration must be at least **1 minute**.')],
      ephemeral: true,
    });
  }

  if (duration > MAX_DURATION_MS) {
    return interaction.reply({
      embeds: [errorEmbed('❌ Duration must be at most **30 days**.')],
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const giveaway = await GiveawayService.createGiveaway(client, interaction, {
    prize,
    winnersCount,
    duration,
    requiredRole: requiredRole?.id ?? null,
    channel,
  });

  const endsAtUnix = Math.floor(new Date(giveaway.ends_at).getTime() / 1000);

  await interaction.editReply({
    embeds: [
      successEmbed(
        `🎉 Giveaway **#${giveaway.id}** started!\n\n` +
        `**Prize:** ${prize}\n` +
        `**Winners:** ${winnersCount}\n` +
        `**Channel:** ${channel}\n` +
        `**Ends:** <t:${endsAtUnix}:R>\n` +
        (requiredRole ? `**Required role:** ${requiredRole}\n` : ''),
      ),
    ],
  });
}

/**
 * Akhiri giveaway lebih awal.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleEnd(interaction, client) {
  const id = interaction.options.getInteger('id');
  const giveaway = client.db.giveaways.get(id);

  if (!giveaway || giveaway.guild_id !== interaction.guildId) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ Giveaway **#${id}** not found in this server.`)],
      ephemeral: true,
    });
  }

  if (giveaway.ended) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ Giveaway **#${id}** has already ended.`)],
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  await GiveawayService.endGiveaway(client, giveaway);

  await interaction.editReply({
    embeds: [successEmbed(`🛑 Giveaway **#${id}** ("${giveaway.prize}") has been ended.`)],
  });
}

/**
 * Reroll pemenang giveaway.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleReroll(interaction, client) {
  const id = interaction.options.getInteger('id');
  const giveaway = client.db.giveaways.get(id);

  if (!giveaway || giveaway.guild_id !== interaction.guildId) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ Giveaway **#${id}** not found in this server.`)],
      ephemeral: true,
    });
  }

  if (!giveaway.ended) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ Giveaway **#${id}** is still active. End it first or wait for it to end.`)],
      ephemeral: true,
    });
  }

  const entries = client.db.giveaways.getEntries(id);
  if (entries.length === 0) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ Giveaway **#${id}** has no entries to reroll.`)],
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  await GiveawayService.rerollGiveaway(client, giveaway);

  await interaction.editReply({
    embeds: [successEmbed(`🔄 Giveaway **#${id}** ("${giveaway.prize}") has been rerolled!`)],
  });
}

/**
 * Tampilkan daftar giveaway aktif di server.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleList(interaction, client) {
  const giveaways = client.db.giveaways.getByGuild(interaction.guildId);
  const active = giveaways.filter(g => !g.ended);

  if (active.length === 0) {
    return interaction.reply({
      embeds: [errorEmbed('📋 No active giveaways in this server.')],
      ephemeral: true,
    });
  }

  const embed = createEmbed('info')
    .setTitle('🎉 Active Giveaways')
    .setColor(0x5865F2);

  const lines = active.map((g) => {
    const entriesCount = client.db.giveaways.countEntries(g.id);
    const endsAtUnix = Math.floor(new Date(g.ends_at).getTime() / 1000);
    const channelMention = `<#${g.channel_id}>`;

    return (
      `**#${g.id}** — ${g.prize}\n` +
      `> 🎟️ ${entriesCount} entries • 🏆 ${g.winners_count} winner(s)\n` +
      `> ⏰ Ends <t:${endsAtUnix}:R> • ${channelMention}`
    );
  });

  embed.setDescription(lines.join('\n\n'));

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
