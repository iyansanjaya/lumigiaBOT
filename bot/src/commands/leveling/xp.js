/**
 * LumigiaBOT — Perintah /xp
 * Mengelola sistem leveling & XP server.
 * Subperintah: enable, role-reward, remove-reward, rewards, ignore-channel,
 *              multiplier, settings, reset-user.
 * Memerlukan izin ManageGuild.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from 'discord.js';
import { LevelingService } from '../../modules/leveling/LevelingService.js';
import { successEmbed, errorEmbed, createEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

/** Warna embed leveling */
const COLORS = {
  SUCCESS: 0x43B581,
  INFO: 0x5865F2,
};

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('xp')
  .setDescription('Manage the leveling & XP system')
  .addSubcommand((sub) =>
    sub
      .setName('enable')
      .setDescription('Enable or disable the XP system')
      .addBooleanOption((option) =>
        option
          .setName('enabled')
          .setDescription('Enable or disable')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('role-reward')
      .setDescription('Add a role reward for reaching a level')
      .addIntegerOption((option) =>
        option
          .setName('level')
          .setDescription('Level to award the role at (1-100)')
          .setMinValue(1)
          .setMaxValue(100)
          .setRequired(true),
      )
      .addRoleOption((option) =>
        option
          .setName('role')
          .setDescription('Role to award')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('remove-reward')
      .setDescription('Remove a role reward for a level')
      .addIntegerOption((option) =>
        option
          .setName('level')
          .setDescription('Level to remove reward from')
          .setMinValue(1)
          .setMaxValue(100)
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub.setName('rewards').setDescription('List all role rewards'),
  )
  .addSubcommand((sub) =>
    sub
      .setName('ignore-channel')
      .setDescription('Toggle a channel as ignored for XP')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('Channel to toggle')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('multiplier')
      .setDescription('Set the XP multiplier')
      .addNumberOption((option) =>
        option
          .setName('multiplier')
          .setDescription('Multiplier value (1.0-5.0)')
          .setMinValue(1.0)
          .setMaxValue(5.0)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('duration')
          .setDescription('Duration (e.g. 24h, 48h). Leave empty for permanent')
          .setRequired(false),
      ),
  )
  .addSubcommand((sub) =>
    sub.setName('settings').setDescription('Show current XP settings'),
  )
  .addSubcommand((sub) =>
    sub
      .setName('reset-user')
      .setDescription('Reset a user\'s XP data')
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('User to reset')
          .setRequired(true),
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * Mem-parsing string durasi (contoh: '24h', '48h') ke milidetik.
 * @param {string} duration - String durasi
 * @returns {number|null} Durasi dalam milidetik, atau null jika format salah
 */
function parseDuration(duration) {
  const match = duration.match(/^(\d+)\s*(h|hour|hours)$/i);
  if (match) return parseInt(match[1], 10) * 60 * 60 * 1000;

  const matchMin = duration.match(/^(\d+)\s*(m|min|minutes)$/i);
  if (matchMin) return parseInt(matchMin[1], 10) * 60 * 1000;

  const matchDay = duration.match(/^(\d+)\s*(d|day|days)$/i);
  if (matchDay) return parseInt(matchDay[1], 10) * 24 * 60 * 60 * 1000;

  return null;
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();
  const guildId = interaction.guildId;

  try {
    switch (subcommand) {
      // --- Enable / Disable ---
      case 'enable': {
        const enabled = interaction.options.getBoolean('enabled');
        client.db.leveling.setEnabled(guildId, enabled);
        await interaction.reply({
          embeds: [successEmbed(`✅ Leveling system has been **${enabled ? 'enabled' : 'disabled'}**.`)],
          ephemeral: true,
        });
        break;
      }

      // --- Role Reward ---
      case 'role-reward': {
        const level = interaction.options.getInteger('level');
        const role = interaction.options.getRole('role');

        // Cek apakah role bisa di-manage oleh bot
        if (role.managed || role.id === interaction.guild.roles.everyone.id) {
          return interaction.reply({
            embeds: [errorEmbed('❌ Cannot use that role as a reward. It\'s either managed by an integration or is @everyone.')],
            ephemeral: true,
          });
        }

        client.db.leveling.addReward(guildId, level, role.id);
        await interaction.reply({
          embeds: [successEmbed(`✅ Role ${role} will be awarded at **Level ${level}**.`)],
          ephemeral: true,
        });
        break;
      }

      // --- Remove Reward ---
      case 'remove-reward': {
        const level = interaction.options.getInteger('level');
        const removed = client.db.leveling.removeReward(guildId, level);

        if (!removed) {
          return interaction.reply({
            embeds: [errorEmbed(`❌ No role reward found for Level ${level}.`)],
            ephemeral: true,
          });
        }

        await interaction.reply({
          embeds: [successEmbed(`✅ Role reward for **Level ${level}** has been removed.`)],
          ephemeral: true,
        });
        break;
      }

      // --- List Rewards ---
      case 'rewards': {
        const rewards = client.db.leveling.getRewards(guildId);

        if (rewards.length === 0) {
          return interaction.reply({
            embeds: [errorEmbed('📭 No role rewards configured. Use `/xp role-reward` to add one.')],
            ephemeral: true,
          });
        }

        const lines = rewards.map(
          (r) => `**Level ${r.level}** → <@&${r.role_id}>`,
        );

        const embed = new EmbedBuilder()
          .setColor(COLORS.INFO)
          .setTitle('🎁 Level Role Rewards')
          .setDescription(lines.join('\n'))
          .setTimestamp()
          .setFooter({ text: 'LumigiaBOT • Leveling System' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      // --- Ignore Channel ---
      case 'ignore-channel': {
        const channel = interaction.options.getChannel('channel');

        // Pastikan settings ada
        const settings = client.db.leveling.getSettings(guildId);
        if (!settings) {
          client.db.leveling.setEnabled(guildId, false);
        }

        const currentSettings = client.db.leveling.getSettings(guildId);
        let ignoredChannels = [];
        try {
          ignoredChannels = JSON.parse(currentSettings.ignored_channels || '[]');
        } catch {
          ignoredChannels = [];
        }

        const idx = ignoredChannels.indexOf(channel.id);
        if (idx > -1) {
          // Hapus dari daftar ignore
          ignoredChannels.splice(idx, 1);
          client.db.leveling.updateSetting(guildId, 'ignored_channels', JSON.stringify(ignoredChannels));
          await interaction.reply({
            embeds: [successEmbed(`✅ ${channel} will now **earn XP** again.`)],
            ephemeral: true,
          });
        } else {
          // Tambahkan ke daftar ignore
          ignoredChannels.push(channel.id);
          client.db.leveling.updateSetting(guildId, 'ignored_channels', JSON.stringify(ignoredChannels));
          await interaction.reply({
            embeds: [successEmbed(`✅ ${channel} is now **ignored** for XP.`)],
            ephemeral: true,
          });
        }
        break;
      }

      // --- Multiplier ---
      case 'multiplier': {
        const multiplier = interaction.options.getNumber('multiplier');
        const duration = interaction.options.getString('duration');

        // Pastikan settings ada
        const settings = client.db.leveling.getSettings(guildId);
        if (!settings) {
          client.db.leveling.setEnabled(guildId, false);
        }

        client.db.leveling.updateSetting(guildId, 'multiplier', multiplier);

        if (duration) {
          const durationMs = parseDuration(duration);
          if (!durationMs) {
            return interaction.reply({
              embeds: [errorEmbed('❌ Invalid duration format. Use formats like `24h`, `48h`, `7d`.')],
              ephemeral: true,
            });
          }

          const expiresAt = new Date(Date.now() + durationMs).toISOString();
          client.db.leveling.updateSetting(guildId, 'multiplier_expires', expiresAt);

          await interaction.reply({
            embeds: [successEmbed(`✅ XP multiplier set to **${multiplier}x** for **${duration}**.`)],
            ephemeral: true,
          });
        } else {
          client.db.leveling.updateSetting(guildId, 'multiplier_expires', null);
          await interaction.reply({
            embeds: [successEmbed(`✅ XP multiplier set to **${multiplier}x** permanently.`)],
            ephemeral: true,
          });
        }
        break;
      }

      // --- Settings ---
      case 'settings': {
        const settings = client.db.leveling.getSettings(guildId);

        if (!settings) {
          return interaction.reply({
            embeds: [errorEmbed('📭 Leveling system has not been configured yet. Use `/xp enable` to get started.')],
            ephemeral: true,
          });
        }

        let ignoredChannels = [];
        let ignoredRoles = [];
        try { ignoredChannels = JSON.parse(settings.ignored_channels || '[]'); } catch { /* noop */ }
        try { ignoredRoles = JSON.parse(settings.ignored_roles || '[]'); } catch { /* noop */ }

        const multiplierDisplay = settings.multiplier !== 1.0
          ? `${settings.multiplier}x${settings.multiplier_expires ? ` (expires <t:${Math.floor(new Date(settings.multiplier_expires + 'Z').getTime() / 1000)}:R>)` : ' (permanent)'}`
          : '1.0x (default)';

        const embed = new EmbedBuilder()
          .setColor(COLORS.INFO)
          .setTitle('⚙️ Leveling Settings')
          .addFields(
            { name: '📊 Status', value: settings.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '⏱️ XP Cooldown', value: `${settings.xp_cooldown ?? 60}s`, inline: true },
            { name: '✨ Multiplier', value: multiplierDisplay, inline: true },
            {
              name: '📢 Announce Channel',
              value: settings.announce_channel ? `<#${settings.announce_channel}>` : '*Same as message channel*',
              inline: true,
            },
            {
              name: '🔇 Ignored Channels',
              value: ignoredChannels.length > 0
                ? ignoredChannels.map((id) => `<#${id}>`).join(', ')
                : '*None*',
            },
            {
              name: '🚫 Ignored Roles',
              value: ignoredRoles.length > 0
                ? ignoredRoles.map((id) => `<@&${id}>`).join(', ')
                : '*None*',
            },
          )
          .setTimestamp()
          .setFooter({ text: 'LumigiaBOT • Leveling System' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      // --- Reset User ---
      case 'reset-user': {
        const user = interaction.options.getUser('user');

        // Cek apakah user punya data XP
        const userData = client.db.leveling.getUser(guildId, user.id);
        if (!userData) {
          return interaction.reply({
            embeds: [errorEmbed(`❌ ${user} has no XP data to reset.`)],
            ephemeral: true,
          });
        }

        // Konfirmasi reset
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xF04747)
              .setTitle('⚠️ Confirm XP Reset')
              .setDescription(
                `Are you sure you want to reset all XP data for ${user}?\n\n` +
                `**Current Stats:**\n` +
                `• Level: ${LevelingService.calculateLevel(userData.xp)}\n` +
                `• XP: ${userData.xp.toLocaleString()}\n` +
                `• Messages: ${userData.messages.toLocaleString()}\n\n` +
                `⚠️ This action cannot be undone. Type \`confirm\` within 15 seconds to proceed.`,
              )
              .setTimestamp()
              .setFooter({ text: 'LumigiaBOT' }),
          ],
          ephemeral: true,
        });

        // Tunggu konfirmasi via message
        try {
          const filter = (m) => m.author.id === interaction.user.id && m.content.toLowerCase() === 'confirm';
          const collected = await interaction.channel.awaitMessages({
            filter,
            max: 1,
            time: 15_000,
            errors: ['time'],
          });

          // Hapus pesan konfirmasi
          const confirmMsg = collected.first();
          if (confirmMsg?.deletable) await confirmMsg.delete().catch(() => {});

          // Reset user
          client.db.leveling.resetUser(guildId, user.id);

          await interaction.followUp({
            embeds: [successEmbed(`✅ XP data for ${user} has been reset.`)],
            ephemeral: true,
          });
        } catch {
          await interaction.followUp({
            embeds: [errorEmbed('⏱️ Reset cancelled — confirmation timed out.')],
            ephemeral: true,
          });
        }
        break;
      }
    }

    logger.info(`XP config updated: ${subcommand} by ${interaction.user.tag} in ${guildId}`);
  } catch (error) {
    logger.error('XP command error:', error);
    await interaction.reply({
      embeds: [errorEmbed('❌ An error occurred while processing the command.')],
      ephemeral: true,
    }).catch(() => {
      interaction.followUp({
        embeds: [errorEmbed('❌ An error occurred while processing the command.')],
        ephemeral: true,
      }).catch(() => {});
    });
  }
}
