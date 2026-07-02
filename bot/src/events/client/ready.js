/**
 * LumigiaBOT - Event Ready
 * Dijalankan sekali saat bot berhasil terhubung ke Discord.
 * Menginisialisasi scheduler dan service yang membutuhkan client.
 */

import { ActivityType } from "discord.js";
import { createServiceLogger } from "../../utils/Logger.js";
import GiveawayScheduler from "../../modules/giveaway/GiveawayScheduler.js";

export const name = "clientReady";
export const once = true;

const log = createServiceLogger("startup");

export async function execute(client) {
  log.info("bot_online", {
    botTag: client.user.tag,
    guilds: client.guilds.cache.size,
  });

  client.user.setActivity("\u{1f6e1}\ufe0f lumigia.com | top up game", {
    type: ActivityType.Watching,
  });

  try {
    client.giveawayScheduler = new GiveawayScheduler(client);
    client.giveawayScheduler.start();
    log.info("service_started", { serviceName: "giveaway-scheduler" });
  } catch (err) {
    log.error("service_start_failed", { serviceName: "giveaway-scheduler" }, err);
  }

  try {
    const { default: StreamNotifService } =
      await import("../../modules/streaming/StreamNotifService.js");
    client.streamNotifService = new StreamNotifService(client);
    client.streamNotifService.start();
    log.info("service_started", { serviceName: "stream-notifications" });
  } catch (err) {
    log.error("service_start_failed", { serviceName: "stream-notifications" }, err);
  }

  try {
    const { default: AntiRaidEngine } =
      await import("../../modules/antiraid/AntiRaidEngine.js");
    client.antiRaidEngine = new AntiRaidEngine(client);
    log.info("service_started", { serviceName: "anti-raid" });
  } catch (err) {
    log.error("service_start_failed", { serviceName: "anti-raid" }, err);
  }

  try {
    const { default: AutoModEngine } =
      await import("../../modules/automod/AutoModEngine.js");
    client.autoModEngine = new AutoModEngine(client);
    log.info("service_started", { serviceName: "automod" });

    const { default: PhishingService } =
      await import("../../modules/automod/PhishingService.js");
    await PhishingService.start();
    log.info("service_started", { serviceName: "phishing-service" });
  } catch (err) {
    log.error("service_start_failed", { serviceName: "automod_or_phishing-service" }, err);
  }
}
