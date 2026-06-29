/**
 * LumigiaBOT — Event Ready
 * Dijalankan sekali saat bot berhasil terhubung ke Discord.
 * Menginisialisasi scheduler dan service yang membutuhkan client.
 */

import { ActivityType } from "discord.js";
import { logger } from "../../utils/Logger.js";
import GiveawayScheduler from "../../modules/giveaway/GiveawayScheduler.js";

export const name = "clientReady";
export const once = true;

export async function execute(client) {
  logger.info(
    `✅ ${client.user.tag} online! Melayani ${client.guilds.cache.size} server.`,
  );

  // Atur aktivitas bot
  client.user.setActivity("🛡️ lumigia.com | top up game", {
    type: ActivityType.Watching,
  });

  // ── Inisialisasi Giveaway Scheduler ──
  try {
    client.giveawayScheduler = new GiveawayScheduler(client);
    client.giveawayScheduler.start();
    logger.info("Giveaway scheduler dimulai.");
  } catch (err) {
    logger.error("Gagal memulai giveaway scheduler:", err);
  }

  // ── Inisialisasi Stream Notification Service ──
  try {
    const { default: StreamNotifService } =
      await import("../../modules/streaming/StreamNotifService.js");
    client.streamNotifService = new StreamNotifService(client);
    client.streamNotifService.start();
    logger.info("Stream notification service dimulai.");
  } catch (err) {
    logger.error("Gagal memulai stream notification service:", err);
  }

  // ── Inisialisasi Anti-Raid Engine ──
  try {
    const { default: AntiRaidEngine } =
      await import("../../modules/antiraid/AntiRaidEngine.js");
    client.antiRaidEngine = new AntiRaidEngine(client);
    logger.info("Anti-raid engine dimulai.");
  } catch (err) {
    logger.error("Gagal memulai anti-raid engine:", err);
  }

  // ── Inisialisasi AutoMod Engine ──
  try {
    const { default: AutoModEngine } =
      await import("../../modules/automod/AutoModEngine.js");
    client.autoModEngine = new AutoModEngine(client);
    logger.info("AutoMod engine dimulai.");

    const { default: PhishingService } = await import("../../modules/automod/PhishingService.js");
    await PhishingService.start();
  } catch (err) {
    logger.error("Gagal memulai automod engine / phishing service:", err);
  }
}
