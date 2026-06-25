export interface GuildSettings {
  guild_id: string;
  language: string;
  mod_log_channel: string | null;
  automod_log_channel: string | null;
  ticket_category: string | null;
  ticket_support_role: string | null;
  ticket_log_channel: string | null;
  ticket_max_open: number;
  ticket_auto_close_hours: number;
  warn_escalation: string;
  anti_raid_enabled: number;
  anti_raid_threshold: number;
  anti_raid_timeframe: number;
  welcome_enabled: number;
  welcome_channel: string | null;
  welcome_message: string | null;
  created_at: string;
  updated_at: string;
}
