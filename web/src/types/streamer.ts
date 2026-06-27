// ── Voice Channels ──
export interface VoiceSettings {
  guild_id: string;
  hub_channel_id: string | null;
  category_id: string | null;
  default_limit: number;
  default_name: string;
  enabled: number;
}

export interface TempChannel {
  channel_id: string;
  guild_id: string;
  owner_id: string;
  name: string | null;
  user_limit: number;
  locked: number;
  created_at: string;
}

// ── Reaction Roles ──
export interface ReactionRolePanel {
  id: number;
  guild_id: string;
  channel_id: string;
  message_id: string | null;
  title: string;
  description: string | null;
  color: string;
  mode: 'toggle' | 'single' | 'verify';
  created_at: string;
}

export interface ReactionRoleEntry {
  id: number;
  panel_id: number;
  role_id: string;
  emoji: string | null;
  label: string;
  description: string | null;
  style: string;
}

// ── Giveaways ──
export interface Giveaway {
  id: number;
  guild_id: string;
  channel_id: string;
  message_id: string | null;
  prize: string;
  winners_count: number;
  required_role: string | null;
  host_id: string;
  ends_at: string;
  ended: number;
  winner_ids: string | null;
  created_at: string;
}

// ── Stream Schedule ──
export interface StreamScheduleEntry {
  id: number;
  guild_id: string;
  day_of_week: number;
  time: string;
  timezone: string;
  title: string;
  description: string | null;
}

export interface ScheduleSettings {
  guild_id: string;
  auto_post_channel: string | null;
  auto_post_enabled: number;
}

// ── Custom Embeds & Socials ──
export interface CustomEmbed {
  id: number;
  guild_id: string;
  name: string;
  channel_id: string | null;
  message_id: string | null;
  embed_data: string;
  created_at: string;
}

export interface SocialLinks {
  guild_id: string;
  twitch: string | null;
  youtube: string | null;
  tiktok: string | null;
  twitter: string | null;
  instagram: string | null;
  website: string | null;
}

// ── Leveling ──
export interface UserXP {
  guild_id: string;
  user_id: string;
  xp: number;
  level: number;
  messages: number;
  last_xp_at: string | null;
}

export interface LevelReward {
  id: number;
  guild_id: string;
  level: number;
  role_id: string;
}

export interface LevelingSettings {
  guild_id: string;
  enabled: number;
  xp_per_message: number;
  xp_cooldown: number;
  multiplier: number;
  multiplier_expires: string | null;
  announce_channel: string | null;
  ignored_channels: string;
  ignored_roles: string;
}

// ── Stream Notifications ──
export interface StreamNotification {
  id: number;
  guild_id: string;
  platform: 'twitch' | 'youtube';
  platform_user: string;
  notify_channel: string;
  ping_role: string | null;
  custom_message: string | null;
  last_stream_id: string | null;
  is_live: number;
  created_at: string;
}

// ── Fan Art ──
export interface FanArtSettings {
  guild_id: string;
  enabled: number;
  submit_channel: string | null;
  gallery_channel: string | null;
  approval_required: number;
  vote_emoji: string;
}

export interface FanArtSubmission {
  id: number;
  guild_id: string;
  user_id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  message_id: string | null;
  gallery_message_id: string | null;
  votes: number;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
}

// ── Analytics ──
export interface DailyStats {
  guild_id: string;
  date: string;
  messages: number;
  members_joined: number;
  members_left: number;
  active_users: number;
}

export interface ChannelActivity {
  channel_id: string;
  total_messages: number;
}
