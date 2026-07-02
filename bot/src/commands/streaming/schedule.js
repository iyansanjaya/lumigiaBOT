/**
 * LumigiaBOT — Perintah /schedule
 * Mengelola jadwal streaming mingguan untuk server.
 * Subperintah: set, remove, show, auto-post, clear.
 * Membutuhkan izin ManageGuild.
 */

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventEntityType,
} from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { createServiceLogger } from '../../utils/Logger.js';
import ScheduleService from '../../modules/schedule/ScheduleService.js';
import {
  DEFAULT_SCHEDULE_TIMEZONE,
  getNextScheduleOccurrenceIso,
} from '../../../../shared/contracts.js';

const log = createServiceLogger('schedule-command');

/**
 * Helper mendapatkan Date berikutnya untuk hari & jam tertentu.
 * @param {number} dayOfWeek (0=Minggu, 1=Senin, ..., 6=Sabtu)
 * @param {string} timeStr (HH:MM)
 * @returns {Date}
 */
function getNextDateForDay(dayOfWeek, timeStr) {
  const iso = getNextScheduleOccurrenceIso(dayOfWeek, timeStr, DEFAULT_SCHEDULE_TIMEZONE);
  return iso ? new Date(iso) : new Date();
}

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

        const nextDate = getNextDateForDay(dayOfWeek, time);
        const endDate = new Date(nextDate.getTime() + 2 * 60 * 60 * 1000); // Durasi 2 jam default
        
        let eventId = null;
        try {
          const createdEvent = await interaction.guild.scheduledEvents.create({
            name: title,
            description: description || 'Stream Terjadwal',
            scheduledStartTime: nextDate,
            scheduledEndTime: endDate,
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: { location: 'Stream' },
          });
          eventId = createdEvent.id;
        } catch (err) {
          log.error('discord_event_create_failed', {
            guildId: interaction.guildId,
            dayOfWeek,
            time,
          }, err);
        }

        // Simpan ke database
        client.db.schedule.addSchedule(
          interaction.guildId,
          dayOfWeek,
          time,
          DEFAULT_SCHEDULE_TIMEZONE,
          title,
          description,
          eventId
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

        const dayName = ScheduleService.formatDay(dayOfWeek);
        const entry = client.db.schedule.removeSchedule(interaction.guildId, dayOfWeek, time);
        
        if (entry) {
          if (entry.event_id) {
            try {
              await interaction.guild.scheduledEvents.delete(entry.event_id);
            } catch (err) {
              log.error('discord_event_delete_failed', {
                guildId: interaction.guildId,
                eventId: entry.event_id,
                dayOfWeek,
                time,
              }, err);
            }
          }

          await interaction.reply({
            embeds: [successEmbed(`✅ Jadwal pada **${dayName}** pukul \`${time}\` berhasil dihapus.`)],
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
            const allEntries = client.db.schedule.getByGuild(interaction.guildId);
            
            for (const entry of allEntries) {
              if (entry.event_id) {
                try {
                  await interaction.guild.scheduledEvents.delete(entry.event_id);
                } catch (e) {
                  // Ignore delete errors for individual events
                }
              }
            }

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

    log.info('command_executed', {
      guildId: interaction.guildId,
      userId: interaction.user.id,
      subcommand,
    });
  } catch (error) {
    log.error('command_failed', {
      guildId: interaction.guildId,
      userId: interaction.user.id,
      subcommand,
    }, error);
    await interaction.reply({
      embeds: [errorEmbed('❌ Terjadi kesalahan saat memproses perintah jadwal.')],
      ephemeral: true,
    }).catch(() => {});
  }
}
