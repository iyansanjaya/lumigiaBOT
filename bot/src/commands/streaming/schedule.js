/**
 * LumigiaBOT — Perintah /schedule
 * Mengelola jadwal streaming mingguan untuk server.
 * Subperintah: set, remove, show, auto-post, clear.
 * Membutuhkan izin ManageGuild.
 */

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';
import ScheduleService from '../../modules/schedule/ScheduleService.js';

/** Pilihan hari: label Indonesia, value Inggris */
const DAY_CHOICES = [
  { name: 'Senin', value: 'monday' },
  { name: 'Selasa', value: 'tuesday' },
  { name: 'Rabu', value: 'wednesday' },
  { name: 'Kamis', value: 'thursday' },
  { name: 'Jumat', value: 'friday' },
  { name: 'Sabtu', value: 'saturday' },
  { name: 'Minggu', value: 'sunday' },
];

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('Kelola jadwal streaming mingguan')
  // ── set ──
  .addSubcommand((sub) =>
    sub
      .setName('set')
      .setDescription('Tambah atau perbarui jadwal streaming')
      .addStringOption((opt) =>
        opt
          .setName('day')
          .setDescription('Hari streaming')
          .setRequired(true)
          .addChoices(...DAY_CHOICES),
      )
      .addStringOption((opt) =>
        opt
          .setName('time')
          .setDescription('Waktu streaming (format HH:MM, contoh: 20:00)')
          .setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('title')
          .setDescription('Judul streaming')
          .setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('description')
          .setDescription('Deskripsi streaming (opsional)')
          .setRequired(false),
      ),
  )
  // ── remove ──
  .addSubcommand((sub) =>
    sub
      .setName('remove')
      .setDescription('Hapus jadwal streaming tertentu')
      .addStringOption((opt) =>
        opt
          .setName('day')
          .setDescription('Hari yang akan dihapus')
          .setRequired(true)
          .addChoices(...DAY_CHOICES),
      )
      .addStringOption((opt) =>
        opt
          .setName('time')
          .setDescription('Waktu yang akan dihapus (format HH:MM)')
          .setRequired(true),
      ),
  )
  // ── show ──
  .addSubcommand((sub) =>
    sub.setName('show').setDescription('Tampilkan jadwal streaming minggu ini'),
  )
  // ── auto-post ──
  .addSubcommand((sub) =>
    sub
      .setName('auto-post')
      .setDescription('Atur channel auto-post jadwal')
      .addChannelOption((opt) =>
        opt
          .setName('channel')
          .setDescription('Channel untuk auto-post jadwal')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true),
      )
      .addBooleanOption((opt) =>
        opt
          .setName('enabled')
          .setDescription('Aktifkan auto-post? (default: true)')
          .setRequired(false),
      ),
  )
  // ── clear ──
  .addSubcommand((sub) =>
    sub.setName('clear').setDescription('Hapus semua jadwal streaming server ini'),
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
      // ── Tambah / Perbarui Jadwal ──
      case 'set': {
        const dayValue = interaction.options.getString('day');
        const time = interaction.options.getString('time');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description') ?? null;

        // Validasi format waktu
        if (!ScheduleService.validateTime(time)) {
          await interaction.reply({
            embeds: [errorEmbed('❌ Format waktu tidak valid. Gunakan format **HH:MM** (contoh: `20:00`).')],
            ephemeral: true,
          });
          return;
        }

        // Konversi nama hari ke nomor
        const dayOfWeek = ScheduleService.parseDay(dayValue);
        if (dayOfWeek === null) {
          await interaction.reply({
            embeds: [errorEmbed('❌ Hari tidak valid.')],
            ephemeral: true,
          });
          return;
        }

        const dayName = ScheduleService.formatDay(dayOfWeek);

        // Simpan ke database
        client.db.schedule.addSchedule(
          interaction.guildId,
          dayOfWeek,
          time,
          'Asia/Jakarta',
          title,
          description,
        );

        const descLine = description ? `\n📝 ${description}` : '';
        await interaction.reply({
          embeds: [
            successEmbed(
              `✅ Jadwal berhasil ditambahkan!\n\n📌 **${dayName}** pukul \`${time}\`\n🎬 ${title}${descLine}`,
            ),
          ],
          ephemeral: true,
        });
        break;
      }

      // ── Hapus Jadwal ──
      case 'remove': {
        const dayValue = interaction.options.getString('day');
        const time = interaction.options.getString('time');

        if (!ScheduleService.validateTime(time)) {
          await interaction.reply({
            embeds: [errorEmbed('❌ Format waktu tidak valid. Gunakan format **HH:MM** (contoh: `20:00`).')],
            ephemeral: true,
          });
          return;
        }

        const dayOfWeek = ScheduleService.parseDay(dayValue);
        if (dayOfWeek === null) {
          await interaction.reply({
            embeds: [errorEmbed('❌ Hari tidak valid.')],
            ephemeral: true,
          });
          return;
        }

        const removed = client.db.schedule.removeSchedule(interaction.guildId, dayOfWeek, time);
        const dayName = ScheduleService.formatDay(dayOfWeek);

        if (removed) {
          await interaction.reply({
            embeds: [successEmbed(`✅ Jadwal **${dayName}** pukul \`${time}\` berhasil dihapus.`)],
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            embeds: [errorEmbed(`❌ Tidak ditemukan jadwal pada **${dayName}** pukul \`${time}\`.`)],
            ephemeral: true,
          });
        }
        break;
      }

      // ── Tampilkan Jadwal ──
      case 'show': {
        const schedules = client.db.schedule.getByGuild(interaction.guildId);
        const embed = ScheduleService.buildScheduleEmbed(schedules, interaction.guild.name);

        await interaction.reply({ embeds: [embed] });
        break;
      }

      // ── Auto-Post ──
      case 'auto-post': {
        const channel = interaction.options.getChannel('channel');
        const enabled = interaction.options.getBoolean('enabled') ?? true;

        client.db.schedule.setSettings(interaction.guildId, channel.id, enabled);

        const status = enabled ? 'diaktifkan ✅' : 'dinonaktifkan ❌';
        await interaction.reply({
          embeds: [
            successEmbed(
              `📢 Auto-post jadwal ${status}\n📍 Channel: ${channel}`,
            ),
          ],
          ephemeral: true,
        });
        break;
      }

      // ── Hapus Semua ──
      case 'clear': {
        // Minta konfirmasi sebelum menghapus
        const confirmRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('schedule_clear_confirm')
            .setLabel('Ya, Hapus Semua')
            .setEmoji('🗑️')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('schedule_clear_cancel')
            .setLabel('Batal')
            .setStyle(ButtonStyle.Secondary),
        );

        const confirmMsg = await interaction.reply({
          embeds: [
            errorEmbed(
              '⚠️ **Apakah kamu yakin ingin menghapus SEMUA jadwal streaming?**\n\nTindakan ini tidak dapat dibatalkan.',
            ),
          ],
          components: [confirmRow],
          ephemeral: true,
          fetchReply: true,
        });

        // Tunggu respons tombol (30 detik timeout)
        try {
          const buttonInteraction = await confirmMsg.awaitMessageComponent({
            componentType: ComponentType.Button,
            filter: (i) => i.user.id === interaction.user.id,
            time: 30_000,
          });

          if (buttonInteraction.customId === 'schedule_clear_confirm') {
            client.db.schedule.clearAll(interaction.guildId);
            await buttonInteraction.update({
              embeds: [successEmbed('✅ Semua jadwal streaming berhasil dihapus.')],
              components: [],
            });
          } else {
            await buttonInteraction.update({
              embeds: [successEmbed('↩️ Penghapusan jadwal dibatalkan.')],
              components: [],
            });
          }
        } catch {
          // Timeout — hapus tombol
          await interaction.editReply({
            embeds: [errorEmbed('⏱️ Waktu konfirmasi habis. Tidak ada jadwal yang dihapus.')],
            components: [],
          }).catch(() => {});
        }
        break;
      }
    }

    logger.info(`Schedule "${subcommand}" executed by ${interaction.user.tag} in ${interaction.guild.name}`);
  } catch (error) {
    logger.error('schedule command error:', error);
    await interaction.reply({
      embeds: [errorEmbed('❌ Terjadi kesalahan saat memproses perintah jadwal.')],
      ephemeral: true,
    }).catch(() => {});
  }
}
