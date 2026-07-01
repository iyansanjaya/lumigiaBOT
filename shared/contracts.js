export const DEFAULT_WARN_ESCALATION = Object.freeze({
  3: 'mute',
  5: 'kick',
  7: 'ban',
});

export const DEFAULT_WARN_ESCALATION_JSON = JSON.stringify(DEFAULT_WARN_ESCALATION);

export const SUPPORTED_LANGUAGES = Object.freeze(['id', 'en-US']);
export const LANGUAGE_ALIASES = Object.freeze({ en: 'en-US' });
export const SUPPORTED_LANGUAGE_INPUTS = Object.freeze([
  ...SUPPORTED_LANGUAGES,
  ...Object.keys(LANGUAGE_ALIASES),
]);
export const LANGUAGE_OPTIONS = Object.freeze([
  { value: 'en-US', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
]);

export const GUILD_SETTINGS_DEFAULTS = Object.freeze({
  language: 'en-US',
  ticket_max_open: 1,
  ticket_auto_close_hours: 48,
  warn_escalation: DEFAULT_WARN_ESCALATION_JSON,
  anti_raid_enabled: 0,
  anti_raid_threshold: 10,
  anti_raid_timeframe: 30,
  welcome_enabled: 0,
});

export const GUILD_SETTINGS_FIELDS = Object.freeze([
  'language',
  'mod_log_channel',
  'automod_log_channel',
  'ticket_category',
  'ticket_support_role',
  'ticket_log_channel',
  'ticket_max_open',
  'ticket_auto_close_hours',
  'warn_escalation',
  'anti_raid_enabled',
  'anti_raid_threshold',
  'anti_raid_timeframe',
  'welcome_enabled',
  'welcome_channel',
  'welcome_message',
]);

export const AUTOMOD_DEFAULT_ACTION = 'delete';
export const AUTOMOD_ACTIONS = Object.freeze(['delete', 'warn', 'mute', 'kick', 'ban']);
export const AUTOMOD_ACTION_CHOICES = Object.freeze([
  { name: 'Delete Message', label: 'Delete', value: 'delete' },
  { name: 'Warn User', label: 'Warn', value: 'warn' },
  { name: 'Mute User', label: 'Mute', value: 'mute' },
  { name: 'Kick User', label: 'Kick', value: 'kick' },
  { name: 'Ban User', label: 'Ban', value: 'ban' },
]);

export const AUTOMOD_FILTERS = Object.freeze([
  {
    key: 'spam',
    name: 'Spam',
    dashboardName: 'Spam Detection',
    description: 'Automatically detect and remove spam messages.',
  },
  {
    key: 'link',
    name: 'Link',
    dashboardName: 'Link Filter',
    description: 'Block or restrict links from being posted.',
  },
  {
    key: 'word',
    name: 'Word',
    dashboardName: 'Word Filter',
    description: 'Filter messages containing banned words or phrases.',
  },
  {
    key: 'caps',
    name: 'Caps',
    dashboardName: 'Caps Lock Filter',
    description: 'Prevent excessive use of capital letters.',
  },
  {
    key: 'emoji',
    name: 'Emoji',
    dashboardName: 'Emoji Spam Filter',
    description: 'Limit excessive emoji usage in messages.',
  },
  {
    key: 'mention',
    name: 'Mention',
    dashboardName: 'Mention Spam Filter',
    description: 'Prevent mass mention abuse.',
  },
]);

export const AUTOMOD_FILTER_KEYS = Object.freeze(AUTOMOD_FILTERS.map((filter) => filter.key));

export const AUTOMOD_WHITELIST_TYPES = Object.freeze(['user', 'role', 'channel']);

export const VOICE_SETTINGS_FIELDS = Object.freeze([
  'enabled',
  'default_limit',
  'default_name',
  'hub_channel_id',
  'category_id',
]);

export const LEVELING_SETTINGS_FIELDS = Object.freeze([
  'enabled',
  'xp_per_message',
  'xp_cooldown',
  'multiplier',
  'multiplier_expires',
  'announce_channel',
  'ignored_channels',
  'ignored_roles',
]);

export const FANART_SETTINGS_FIELDS = Object.freeze([
  'enabled',
  'submit_channel',
  'gallery_channel',
  'approval_required',
  'vote_emoji',
]);

export const SCHEDULE_DAY_NAMES = Object.freeze({
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
});

export const SCHEDULE_DAY_ORDER = Object.freeze([1, 2, 3, 4, 5, 6, 0]);
export const SCHEDULE_DAY_OPTIONS = Object.freeze(
  SCHEDULE_DAY_ORDER.map((day) => ({
    value: String(day),
    label: SCHEDULE_DAY_NAMES[day],
  })),
);

export const STREAM_PLATFORMS = Object.freeze(['twitch', 'youtube']);

export const WARN_ESCALATION_PRESETS = Object.freeze([
  { value: '{}', label: 'Tidak ada - hanya beri warning' },
  { value: '{"3":"mute"}', label: 'Mute otomatis pada 3 warning' },
  { value: '{"3":"mute","5":"kick"}', label: 'Mute pada 3, kick pada 5 warning' },
  {
    value: DEFAULT_WARN_ESCALATION_JSON,
    label: 'Mute pada 3, kick pada 5, ban pada 7 warning',
  },
]);

export function normalizeLanguage(value, fallback = GUILD_SETTINGS_DEFAULTS.language) {
  const normalized = LANGUAGE_ALIASES[value] || value;
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : fallback;
}

export function isAllowedField(fields, field) {
  return fields.includes(field);
}

export function isValidAutomodFilter(filterName) {
  return AUTOMOD_FILTER_KEYS.includes(filterName);
}

export function isValidAutomodAction(action) {
  return AUTOMOD_ACTIONS.includes(action);
}

export function isValidStreamPlatform(platform) {
  return STREAM_PLATFORMS.includes(platform);
}
