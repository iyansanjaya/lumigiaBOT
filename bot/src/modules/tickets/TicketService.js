/**
 * LumigiaBOT — Layanan Tiket
 * Logika bisnis inti untuk sistem tiket.
 * Menangani pembuatan, penutupan, pengklaiman, dan pembukaan kembali tiket.
 */

import {
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} from 'discord.js';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { t } from '../../i18n/helpers.js';
import { createEmbed } from '../../utils/EmbedBuilder.js';
import { TicketDefaults } from '../../config/constants.js';
import { logger } from '../../utils/Logger.js';
import { generateTranscript } from './TicketTranscript.js';

/**
 * Membuat channel tiket dukungan baru.
 *
 * @param {import('../../core/BotClient.js').default} client
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').User} user
 * @param {string} category - Kategori tiket (contoh: 'general', 'support')
 * @param {string} reason - Alasan membuka tiket
 * @returns {Promise<import('discord.js').TextChannel>} Channel tiket yang dibuat
 */
export async function createTicket(client, guild, user, category, reason) {
  const settings = client.db.guildSettings.get(guild.id);
  const maxOpen = settings?.ticket_max_open || TicketDefaults.MAX_OPEN;

  // --- Periksa batas tiket ---
  const openCount = client.db.tickets.countOpenByUser(guild.id, user.id);
  if (openCount >= maxOpen) {
    throw new Error('TICKET_LIMIT_REACHED');
  }

  // --- Bangun pengaturan izin ---
  const overwrites = [
    // Tolak @everyone dari melihat
    {
      id: guild.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    // Izinkan pembuat tiket
    {
      id: user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    // Izinkan bot
    {
      id: client.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];

  // Izinkan role dukungan jika dikonfigurasi
  if (settings?.ticket_support_role) {
    overwrites.push({
      id: settings.ticket_support_role,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    });
  }

  // --- Tentukan channel kategori induk ---
  const parentId = settings?.ticket_category || null;

  // --- Masukkan ke DB terlebih dahulu untuk mendapatkan ID tiket ---
  const result = client.db.tickets.create(guild.id, 'pending', user.id, category, reason);
  const ticketId = result.lastInsertRowid;

  // --- Buat channel ---
  const channel = await guild.channels.create({
    name: `ticket-${ticketId}`,
    type: ChannelType.GuildText,
    parent: parentId,
    topic: `Ticket #${ticketId} | ${user.tag} | ${category}`,
    permissionOverwrites: overwrites,
  });

  // Perbarui DB dengan ID channel sebenarnya (kita menggunakan placeholder 'pending')
  client.db.tickets.close(channel.id, null); // Sementara, kita butuh pembaruan yang tepat
  // Sebenarnya, mari gunakan pembaruan DB langsung karena repo tidak memiliki method updateChannel
  // Kita akan menutup dan membuka kembali entri 'pending' — tapi lebih baik langsung jalankan raw update.
  // Pendekatan paling bersih: perbarui channel_id secara langsung
  client.db.db.prepare('UPDATE tickets SET channel_id = ? WHERE id = ?').run(channel.id, ticketId);

  // --- Bangun embed selamat datang ---
  const welcomeEmbed = createEmbed('ticket')
    .setTitle(`📩 Ticket #${ticketId}`)
    .setDescription(
      t(client, guild.id, 'commands.ticket.panel_description')
    )
    .addFields(
      { name: '👤 Opened By', value: `${user}`, inline: true },
      { name: '📁 Category', value: category, inline: true },
      { name: '📝 Reason', value: reason || 'No reason provided' },
    );

  // --- Tombol kontrol ---
  const controlRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('Close')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('ticket_claim')
      .setLabel('Claim')
      .setEmoji('👋')
      .setStyle(ButtonStyle.Primary),
  );

  await channel.send({ embeds: [welcomeEmbed], components: [controlRow] });

  // --- Log audit ---
  client.db.auditLogs.add(guild.id, 'TICKET_CREATE', user.id, user.id, reason, {
    ticketId,
    category,
    channelId: channel.id,
  });

  logger.info(`Ticket #${ticketId} created by ${user.tag} in ${guild.name}`);
  return channel;
}

/**
 * Menutup channel tiket — menghasilkan transkrip dan menghapus channel.
 *
 * @param {import('../../core/BotClient.js').default} client
 * @param {import('discord.js').TextChannel} channel
 * @param {import('discord.js').User} closedBy
 */
export async function closeTicket(client, channel, closedBy) {
  const ticket = client.db.tickets.getByChannel(channel.id);
  if (!ticket) {
    throw new Error('TICKET_NOT_FOUND');
  }

  const settings = client.db.guildSettings.get(channel.guild.id);

  // --- Buat transkrip ---
  let transcriptBuffer;
  try {
    transcriptBuffer = await generateTranscript(channel);
  } catch (err) {
    logger.error('Failed to generate transcript:', err);
  }

  // --- Simpan transkrip ke disk ---
  if (transcriptBuffer) {
    try {
      const dataDir = process.env.DATABASE_PATH
        ? dirname(process.env.DATABASE_PATH)
        : join(process.cwd(), 'data');
      const transcriptsDir = join(dataDir, 'transcripts', channel.guild.id);

      if (!existsSync(transcriptsDir)) {
        mkdirSync(transcriptsDir, { recursive: true });
      }

      writeFileSync(
        join(transcriptsDir, `ticket-${ticket.id}.html`),
        transcriptBuffer,
      );
      logger.info(`Transcript saved to disk: ticket-${ticket.id}.html`);
    } catch (err) {
      logger.error('Failed to save transcript to disk:', err);
    }
  }

  // --- Kirim transkrip ke channel log ---
  if (transcriptBuffer && settings?.ticket_log_channel) {
    try {
      const logChannel = await channel.guild.channels.fetch(settings.ticket_log_channel);
      if (logChannel) {
        const logEmbed = createEmbed('ticket')
          .setTitle(`📄 Ticket #${ticket.id} — Transcript`)
          .addFields(
            { name: '👤 Opened By', value: `<@${ticket.user_id}>`, inline: true },
            { name: '🔒 Closed By', value: `${closedBy}`, inline: true },
            { name: '📁 Category', value: ticket.category, inline: true },
          );

        const attachment = new AttachmentBuilder(transcriptBuffer, {
          name: `transcript-ticket-${ticket.id}.html`,
        });

        await logChannel.send({ embeds: [logEmbed], files: [attachment] });
      }
    } catch (err) {
      logger.error('Failed to send transcript to log channel:', err);
    }
  }

  // --- Perbarui DB ---
  client.db.tickets.close(channel.id, closedBy.id);

  // --- Log audit ---
  client.db.auditLogs.add(
    channel.guild.id, 'TICKET_CLOSE', closedBy.id, ticket.user_id,
    `Ticket #${ticket.id} closed`, { ticketId: ticket.id },
  );

  // --- Kirim pesan penutupan ---
  const closeEmbed = createEmbed('warning')
    .setDescription(
      t(client, channel.guild.id, 'commands.ticket.closed', { user: closedBy.tag })
    )
    .addFields({ name: '⏳', value: 'This channel will be deleted in 5 seconds...' });

  await channel.send({ embeds: [closeEmbed] });

  // --- Hapus channel setelah penundaan ---
  setTimeout(async () => {
    try {
      await channel.delete(`Ticket #${ticket.id} closed by ${closedBy.tag}`);
    } catch (err) {
      logger.error(`Failed to delete ticket channel ${channel.id}:`, err);
    }
  }, TicketDefaults.DELETE_DELAY_MS);

  logger.info(`Ticket #${ticket.id} closed by ${closedBy.tag}`);
}

/**
 * Mengklaim tiket — menugaskan anggota staf.
 *
 * @param {import('../../core/BotClient.js').default} client
 * @param {import('discord.js').TextChannel} channel
 * @param {import('discord.js').GuildMember} staff
 */
export async function claimTicket(client, channel, staff) {
  const ticket = client.db.tickets.getByChannel(channel.id);
  if (!ticket) {
    throw new Error('TICKET_NOT_FOUND');
  }

  // --- Update DB ---
  client.db.tickets.claim(channel.id, staff.id);

  // --- Perbarui topik channel ---
  const newTopic = `Ticket #${ticket.id} | <@${ticket.user_id}> | ${ticket.category} | Claimed by ${staff.user.tag}`;
  await channel.setTopic(newTopic).catch(() => {});

  // --- Kirim embed klaim ---
  const claimEmbed = createEmbed('ticket')
    .setDescription(
      t(client, channel.guild.id, 'commands.ticket.claimed', { user: staff.user.tag })
    );

  await channel.send({ embeds: [claimEmbed] });

  // --- Audit log ---
  client.db.auditLogs.add(
    channel.guild.id, 'TICKET_CLAIM', staff.id, ticket.user_id,
    `Ticket #${ticket.id} claimed`, { ticketId: ticket.id },
  );

  logger.info(`Ticket #${ticket.id} claimed by ${staff.user.tag}`);
}

/**
 * Membuka kembali tiket yang sudah ditutup.
 *
 * @param {import('../../core/BotClient.js').default} client
 * @param {import('discord.js').TextChannel} channel
 * @param {import('discord.js').User} user
 */
export async function reopenTicket(client, channel, user) {
  const ticket = client.db.tickets.getByChannel(channel.id);
  if (!ticket) {
    throw new Error('TICKET_NOT_FOUND');
  }

  // --- Update DB ---
  client.db.tickets.reopen(channel.id);

  // --- Kirim embed pembukaan kembali dengan tombol kontrol ---
  const reopenEmbed = createEmbed('ticket')
    .setDescription(
      t(client, channel.guild.id, 'commands.ticket.reopened', { user: user.tag })
    );

  const controlRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('Close')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('ticket_claim')
      .setLabel('Claim')
      .setEmoji('👋')
      .setStyle(ButtonStyle.Primary),
  );

  await channel.send({ embeds: [reopenEmbed], components: [controlRow] });

  // --- Audit log ---
  client.db.auditLogs.add(
    channel.guild.id, 'TICKET_REOPEN', user.id, ticket.user_id,
    `Ticket #${ticket.id} reopened`, { ticketId: ticket.id },
  );

  logger.info(`Ticket #${ticket.id} reopened by ${user.tag}`);
}
