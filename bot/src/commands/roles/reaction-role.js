/**
 * LumigiaBOT — Perintah /reaction-role
 * Mengelola panel reaction role untuk self-assign role via tombol.
 * Subperintah: create, add, remove, send, list, delete.
 * Membutuhkan izin ManageGuild + ManageRoles.
 */

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';
import { successEmbed, errorEmbed, createEmbed } from '../../utils/EmbedBuilder.js';
import ReactionRoleService, { getRepo } from '../../modules/reactionroles/ReactionRoleService.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('reaction-role')
  .setDescription('Manage reaction role panels')

  // --- create ---
  .addSubcommand((sub) =>
    sub
      .setName('create')
      .setDescription('Create a new reaction role panel')
      .addStringOption((opt) =>
        opt.setName('title').setDescription('Panel title').setRequired(true),
      )
      .addStringOption((opt) =>
        opt.setName('description').setDescription('Panel description').setRequired(false),
      )
      .addStringOption((opt) =>
        opt.setName('color').setDescription('Hex color (e.g. #7C3AED)').setRequired(false),
      )
      .addStringOption((opt) =>
        opt
          .setName('mode')
          .setDescription('Role assignment mode')
          .setRequired(false)
          .addChoices(
            { name: 'Toggle — add/remove freely', value: 'toggle' },
            { name: 'Single — one role at a time', value: 'single' },
            { name: 'Verify — one-time, cannot remove', value: 'verify' },
          ),
      )
      .addChannelOption((opt) =>
        opt
          .setName('channel')
          .setDescription('Channel to associate the panel with')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(false),
      ),
  )

  // --- add ---
  .addSubcommand((sub) =>
    sub
      .setName('add')
      .setDescription('Add a role to a panel')
      .addIntegerOption((opt) =>
        opt.setName('panel-id').setDescription('Panel ID').setRequired(true).setMinValue(1),
      )
      .addRoleOption((opt) =>
        opt.setName('role').setDescription('Role to add').setRequired(true),
      )
      .addStringOption((opt) =>
        opt.setName('label').setDescription('Button label').setRequired(true),
      )
      .addStringOption((opt) =>
        opt.setName('emoji').setDescription('Button emoji').setRequired(false),
      )
      .addStringOption((opt) =>
        opt
          .setName('style')
          .setDescription('Button style')
          .setRequired(false)
          .addChoices(
            { name: 'Primary (Blurple)', value: 'primary' },
            { name: 'Secondary (Grey)', value: 'secondary' },
            { name: 'Success (Green)', value: 'success' },
            { name: 'Danger (Red)', value: 'danger' },
          ),
      ),
  )

  // --- remove ---
  .addSubcommand((sub) =>
    sub
      .setName('remove')
      .setDescription('Remove a role from a panel')
      .addIntegerOption((opt) =>
        opt.setName('panel-id').setDescription('Panel ID').setRequired(true).setMinValue(1),
      )
      .addRoleOption((opt) =>
        opt.setName('role').setDescription('Role to remove').setRequired(true),
      ),
  )

  // --- send ---
  .addSubcommand((sub) =>
    sub
      .setName('send')
      .setDescription('Send or resend a panel to a channel')
      .addIntegerOption((opt) =>
        opt.setName('panel-id').setDescription('Panel ID').setRequired(true).setMinValue(1),
      )
      .addChannelOption((opt) =>
        opt
          .setName('channel')
          .setDescription('Target channel (default: current)')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(false),
      ),
  )

  // --- list ---
  .addSubcommand((sub) =>
    sub.setName('list').setDescription('List all reaction role panels in this server'),
  )

  // --- delete ---
  .addSubcommand((sub) =>
    sub
      .setName('delete')
      .setDescription('Delete a reaction role panel')
      .addIntegerOption((opt) =>
        opt.setName('panel-id').setDescription('Panel ID').setRequired(true).setMinValue(1),
      ),
  )

  .setDefaultMemberPermissions(
    PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageRoles,
  );

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();
  const repo = getRepo(client);

  try {
    switch (subcommand) {
      case 'create':
        await handleCreate(interaction, repo);
        break;
      case 'add':
        await handleAdd(interaction, repo);
        break;
      case 'remove':
        await handleRemove(interaction, repo);
        break;
      case 'send':
        await handleSend(interaction, client, repo);
        break;
      case 'list':
        await handleList(interaction, repo);
        break;
      case 'delete':
        await handleDelete(interaction, client, repo);
        break;
    }

    logger.info(`reaction-role ${subcommand} executed by ${interaction.user.tag}`);
  } catch (error) {
    logger.error(`reaction-role ${subcommand} error:`, error);

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
 * Membuat panel reaction role baru.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../database/repositories/ReactionRoleRepo.js').default} repo
 */
async function handleCreate(interaction, repo) {
  const title = interaction.options.getString('title');
  const description = interaction.options.getString('description') || null;
  const color = interaction.options.getString('color') || '#7C3AED';
  const mode = interaction.options.getString('mode') || 'toggle';
  const channel = interaction.options.getChannel('channel') || interaction.channel;

  // Validasi format warna hex
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return interaction.reply({
      embeds: [errorEmbed('❌ Invalid color format. Use hex format like `#7C3AED`.')],
      ephemeral: true,
    });
  }

  const panelId = repo.createPanel(
    interaction.guildId,
    channel.id,
    title,
    description,
    color,
    mode,
  );

  const modeLabels = { toggle: 'Toggle', single: 'Single', verify: 'Verify' };

  await interaction.reply({
    embeds: [
      successEmbed(
        `✅ Panel **#${panelId}** created!\n\n` +
        `**Title:** ${title}\n` +
        `**Mode:** ${modeLabels[mode]}\n` +
        `**Channel:** ${channel}\n\n` +
        `Next steps:\n` +
        `1. Add roles: \`/reaction-role add panel-id:${panelId} role:@Role label:\"Label\"\`\n` +
        `2. Send panel: \`/reaction-role send panel-id:${panelId}\``,
      ),
    ],
    ephemeral: true,
  });
}

/**
 * Menambahkan entri role ke panel.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../database/repositories/ReactionRoleRepo.js').default} repo
 */
async function handleAdd(interaction, repo) {
  const panelId = interaction.options.getInteger('panel-id');
  const role = interaction.options.getRole('role');
  const label = interaction.options.getString('label');
  const emoji = interaction.options.getString('emoji') || null;
  const style = interaction.options.getString('style') || 'secondary';

  // Periksa panel ada dan milik guild ini
  const panel = repo.getPanel(panelId);
  if (!panel || panel.guild_id !== interaction.guildId) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ Panel **#${panelId}** not found in this server.`)],
      ephemeral: true,
    });
  }

  // Periksa role belum ada di panel
  const existing = repo.getEntryByRole(panelId, role.id);
  if (existing) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ ${role} is already in panel **#${panelId}**.`)],
      ephemeral: true,
    });
  }

  // Periksa batas tombol (25 maks)
  const entries = repo.getEntries(panelId);
  if (entries.length >= 25) {
    return interaction.reply({
      embeds: [errorEmbed('❌ This panel already has the maximum of 25 roles.')],
      ephemeral: true,
    });
  }

  // Periksa bot bisa mengelola role ini
  const botMember = interaction.guild.members.me;
  if (role.position >= botMember.roles.highest.position) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ I cannot manage ${role} — it is above my highest role.`)],
      ephemeral: true,
    });
  }

  // Periksa role bukan managed (bot role, integration, dll)
  if (role.managed) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ ${role} is a managed role and cannot be self-assigned.`)],
      ephemeral: true,
    });
  }

  repo.addEntry(panelId, role.id, label, emoji, null, style);

  await interaction.reply({
    embeds: [
      successEmbed(
        `✅ Added ${role} to panel **#${panelId}** with label **${emoji ? emoji + ' ' : ''}${label}**.`,
      ),
    ],
    ephemeral: true,
  });
}

/**
 * Menghapus entri role dari panel.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../database/repositories/ReactionRoleRepo.js').default} repo
 */
async function handleRemove(interaction, repo) {
  const panelId = interaction.options.getInteger('panel-id');
  const role = interaction.options.getRole('role');

  // Periksa panel ada dan milik guild ini
  const panel = repo.getPanel(panelId);
  if (!panel || panel.guild_id !== interaction.guildId) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ Panel **#${panelId}** not found in this server.`)],
      ephemeral: true,
    });
  }

  const entry = repo.getEntryByRole(panelId, role.id);
  if (!entry) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ ${role} is not in panel **#${panelId}**.`)],
      ephemeral: true,
    });
  }

  repo.removeEntry(entry.id);

  await interaction.reply({
    embeds: [successEmbed(`✅ Removed ${role} from panel **#${panelId}**.`)],
    ephemeral: true,
  });
}

/**
 * Mengirim atau mengirim ulang panel ke channel.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 * @param {import('../../database/repositories/ReactionRoleRepo.js').default} repo
 */
async function handleSend(interaction, client, repo) {
  const panelId = interaction.options.getInteger('panel-id');
  const channel = interaction.options.getChannel('channel') || interaction.channel;

  // Periksa panel ada dan milik guild ini
  const panel = repo.getPanel(panelId);
  if (!panel || panel.guild_id !== interaction.guildId) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ Panel **#${panelId}** not found in this server.`)],
      ephemeral: true,
    });
  }

  const entries = repo.getEntries(panelId);
  if (entries.length === 0) {
    return interaction.reply({
      embeds: [errorEmbed('❌ Cannot send an empty panel. Add at least one role first.')],
      ephemeral: true,
    });
  }

  // Defer reply karena pengiriman mungkin butuh waktu
  await interaction.deferReply({ ephemeral: true });

  await ReactionRoleService.sendPanel(client, panel, entries, channel);

  await interaction.editReply({
    embeds: [successEmbed(`✅ Panel **#${panelId}** sent to ${channel}!`)],
  });
}

/**
 * Menampilkan daftar semua panel di server.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../database/repositories/ReactionRoleRepo.js').default} repo
 */
async function handleList(interaction, repo) {
  const panels = repo.getPanelsByGuild(interaction.guildId);

  if (panels.length === 0) {
    return interaction.reply({
      embeds: [errorEmbed('📋 No reaction role panels found in this server.')],
      ephemeral: true,
    });
  }

  const embed = createEmbed('primary').setTitle('📋 Reaction Role Panels');

  const lines = panels.map((panel) => {
    const entries = repo.getEntries(panel.id);
    const status = panel.message_id ? '🟢 Sent' : '🔴 Not sent';
    const channelMention = `<#${panel.channel_id}>`;
    return (
      `**#${panel.id}** — ${panel.title}\n` +
      `> ${status} • ${entries.length} role(s) • Mode: \`${panel.mode}\` • ${channelMention}`
    );
  });

  embed.setDescription(lines.join('\n\n'));

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * Menghapus panel dan semua entri terkait.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 * @param {import('../../database/repositories/ReactionRoleRepo.js').default} repo
 */
async function handleDelete(interaction, client, repo) {
  const panelId = interaction.options.getInteger('panel-id');

  // Periksa panel ada dan milik guild ini
  const panel = repo.getPanel(panelId);
  if (!panel || panel.guild_id !== interaction.guildId) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ Panel **#${panelId}** not found in this server.`)],
      ephemeral: true,
    });
  }

  // Hapus pesan panel dari channel jika masih ada
  if (panel.message_id) {
    try {
      const channel = await client.channels.fetch(panel.channel_id);
      if (channel) {
        const msg = await channel.messages.fetch(panel.message_id);
        if (msg) await msg.delete();
      }
    } catch {
      // Channel atau pesan mungkin sudah dihapus — abaikan
    }
  }

  repo.deletePanel(panelId);

  await interaction.reply({
    embeds: [successEmbed(`🗑️ Panel **#${panelId}** ("${panel.title}") has been deleted.`)],
    ephemeral: true,
  });
}
