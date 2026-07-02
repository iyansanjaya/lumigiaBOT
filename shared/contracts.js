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

export const DATABASE_TABLES = Object.freeze({
  CORE: Object.freeze(['guild_settings', 'warnings', 'audit_logs']),
  TICKETS: Object.freeze(['tickets']),
  AUTOMOD: Object.freeze(['automod_filters', 'automod_whitelist', 'word_filter']),
  VOICE: Object.freeze(['voice_settings', 'temp_channels']),
  REACTION_ROLES: Object.freeze(['reaction_role_panels', 'reaction_role_entries']),
  GIVEAWAYS: Object.freeze(['giveaways', 'giveaway_entries']),
  SCHEDULE: Object.freeze(['stream_schedule', 'schedule_settings']),
  EMBEDS: Object.freeze(['custom_embeds', 'social_links']),
  LEVELING: Object.freeze(['user_xp', 'level_rewards', 'leveling_settings']),
  STREAMS: Object.freeze(['stream_notifications']),
  FANART: Object.freeze(['fanart_settings', 'fanart_submissions', 'fanart_votes']),
  ANALYTICS: Object.freeze(['daily_stats', 'channel_activity']),
});

export const ALL_DATABASE_TABLES = Object.freeze(Object.values(DATABASE_TABLES).flat());
export const REQUIRED_DATABASE_TABLES = Object.freeze([
  'guild_settings',
  'automod_filters',
  'tickets',
  'warnings',
  'audit_logs',
  'stream_notifications',
  'stream_schedule',
  'voice_settings',
  'leveling_settings',
  'fanart_settings',
]);

export const DISCORD_SNOWFLAKE_PATTERN = '^\\d{17,20}$';
export const DASHBOARD_VALIDATION_LIMITS = Object.freeze({
  ticketMaxOpen: { min: 1, max: 5 },
  ticketAutoCloseHours: { min: 1, max: 168 },
  antiRaidThreshold: { min: 1, max: 100 },
  antiRaidTimeframe: { min: 1, max: 300 },
  welcomeMessageMaxLength: 1800,
  voiceDefaultLimit: { min: 0, max: 99 },
  voiceDefaultNameMaxLength: 100,
  xpPerMessage: { min: 1, max: 100 },
  xpCooldown: { min: 1, max: 3600 },
  xpMultiplier: { min: 1, max: 5 },
  fanArtVoteEmojiMaxLength: 100,
});

const DISCORD_SNOWFLAKE_RE = new RegExp(DISCORD_SNOWFLAKE_PATTERN);
const WARN_ESCALATION_ACTIONS = Object.freeze(['mute', 'kick', 'ban']);

/**
 * @template T
 * @param {T} value
 * @returns {{ ok: true, value: T }}
 */
function valid(value) {
  return { ok: true, value };
}

/**
 * @param {string} error
 * @returns {{ ok: false, error: string }}
 */
function invalid(error) {
  return { ok: false, error };
}

function normalizeNullableString(value) {
  if (value === null || value === undefined) return { ok: true, value: null };
  if (typeof value !== 'string') return invalid('Value must be a string or null.');

  const trimmed = value.trim();
  return valid(trimmed === '' ? null : trimmed);
}

function normalizeRequiredString(field, value, maxLength) {
  const normalized = normalizeNullableString(value);
  if (!normalized.ok) return normalized;
  if (!normalized.value) return invalid(`${field} is required.`);
  if (normalized.value.length > maxLength) {
    return invalid(`${field} is too long. Maximum ${maxLength} characters.`);
  }

  return normalized;
}

function normalizeNullableSnowflake(field, value) {
  const normalized = normalizeNullableString(value);
  if (!normalized.ok || normalized.value === null) return normalized;
  if (!DISCORD_SNOWFLAKE_RE.test(normalized.value)) {
    return invalid(`${field} must be a valid Discord ID.`);
  }

  return normalized;
}

function normalizeBooleanNumber(field, value) {
  if (value === true || value === 1 || value === '1') return valid(1);
  if (value === false || value === 0 || value === '0') return valid(0);
  return invalid(`${field} must be 0 or 1.`);
}

function normalizeInteger(field, value, { min, max }, fallback = undefined) {
  if ((value === null || value === undefined || value === '') && fallback !== undefined) {
    return valid(fallback);
  }

  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
    return invalid(`${field} must be an integer between ${min} and ${max}.`);
  }

  return valid(numberValue);
}

function normalizeNumber(field, value, { min, max }, fallback = undefined) {
  if ((value === null || value === undefined || value === '') && fallback !== undefined) {
    return valid(fallback);
  }

  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numberValue) || numberValue < min || numberValue > max) {
    return invalid(`${field} must be a number between ${min} and ${max}.`);
  }

  return valid(numberValue);
}

function normalizeJsonSnowflakeArray(field, value) {
  if (value === null || value === undefined || value === '') return valid('[]');

  let parsed = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return invalid(`${field} must be a JSON array.`);
    }
  }

  if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === 'string' && DISCORD_SNOWFLAKE_RE.test(entry))) {
    return invalid(`${field} must contain only valid Discord IDs.`);
  }

  return valid(JSON.stringify([...new Set(parsed)]));
}

function normalizeWarnEscalation(value) {
  const normalized = normalizeNullableString(value);
  if (!normalized.ok) return normalized;
  if (normalized.value === null) return valid(DEFAULT_WARN_ESCALATION_JSON);

  const legacyValues = {
    none: '{}',
    mute: '{"3":"mute"}',
    kick: '{"3":"mute","5":"kick"}',
    ban: DEFAULT_WARN_ESCALATION_JSON,
  };
  const raw = legacyValues[normalized.value] || normalized.value;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return invalid('warn_escalation must be valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return invalid('warn_escalation must be a JSON object.');
  }

  const entries = Object.entries(parsed)
    .map(([count, action]) => [Number(count), action])
    .sort(([left], [right]) => left - right);
  const cleaned = {};

  for (const [count, action] of entries) {
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      return invalid('warn_escalation counts must be integers between 1 and 100.');
    }
    if (!WARN_ESCALATION_ACTIONS.includes(action)) {
      return invalid('warn_escalation actions must be mute, kick, or ban.');
    }
    cleaned[String(count)] = action;
  }

  return valid(JSON.stringify(cleaned));
}

function normalizeOptionalIsoDate(field, value) {
  const normalized = normalizeNullableString(value);
  if (!normalized.ok || normalized.value === null) return normalized;

  const date = new Date(normalized.value);
  if (Number.isNaN(date.getTime())) {
    return invalid(`${field} must be a valid ISO date.`);
  }

  return valid(date.toISOString());
}

export function isDiscordSnowflake(value) {
  return typeof value === 'string' && DISCORD_SNOWFLAKE_RE.test(value);
}

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

export function validateGuildSettingValue(field, value) {
  if (!GUILD_SETTINGS_FIELDS.includes(field)) return invalid(`Field is not allowed: ${field}`);

  switch (field) {
    case 'language': {
      const normalized = normalizeNullableString(value);
      if (!normalized.ok || normalized.value === null) return invalid('language must be a supported language.');
      const language = LANGUAGE_ALIASES[normalized.value] || normalized.value;
      return SUPPORTED_LANGUAGES.includes(language)
        ? valid(language)
        : invalid('language must be a supported language.');
    }
    case 'mod_log_channel':
    case 'automod_log_channel':
    case 'ticket_category':
    case 'ticket_support_role':
    case 'ticket_log_channel':
    case 'welcome_channel':
      return normalizeNullableSnowflake(field, value);
    case 'ticket_max_open':
      return normalizeInteger(field, value, DASHBOARD_VALIDATION_LIMITS.ticketMaxOpen, GUILD_SETTINGS_DEFAULTS.ticket_max_open);
    case 'ticket_auto_close_hours':
      return normalizeInteger(
        field,
        value,
        DASHBOARD_VALIDATION_LIMITS.ticketAutoCloseHours,
        GUILD_SETTINGS_DEFAULTS.ticket_auto_close_hours,
      );
    case 'warn_escalation':
      return normalizeWarnEscalation(value);
    case 'anti_raid_enabled':
    case 'welcome_enabled':
      return normalizeBooleanNumber(field, value);
    case 'anti_raid_threshold':
      return normalizeInteger(
        field,
        value,
        DASHBOARD_VALIDATION_LIMITS.antiRaidThreshold,
        GUILD_SETTINGS_DEFAULTS.anti_raid_threshold,
      );
    case 'anti_raid_timeframe':
      return normalizeInteger(
        field,
        value,
        DASHBOARD_VALIDATION_LIMITS.antiRaidTimeframe,
        GUILD_SETTINGS_DEFAULTS.anti_raid_timeframe,
      );
    case 'welcome_message': {
      const normalized = normalizeNullableString(value);
      if (!normalized.ok || normalized.value === null) return normalized;
      if (normalized.value.length > DASHBOARD_VALIDATION_LIMITS.welcomeMessageMaxLength) {
        return invalid(`welcome_message is too long. Maximum ${DASHBOARD_VALIDATION_LIMITS.welcomeMessageMaxLength} characters.`);
      }
      return normalized;
    }
    default:
      return invalid(`Field is not supported: ${field}`);
  }
}

export function validateVoiceSettingValue(field, value) {
  if (!VOICE_SETTINGS_FIELDS.includes(field)) return invalid(`Field is not allowed: ${field}`);

  switch (field) {
    case 'enabled':
      return normalizeBooleanNumber(field, value);
    case 'default_limit':
      return normalizeInteger(field, value, DASHBOARD_VALIDATION_LIMITS.voiceDefaultLimit, 0);
    case 'default_name':
      return normalizeRequiredString(field, value, DASHBOARD_VALIDATION_LIMITS.voiceDefaultNameMaxLength);
    case 'hub_channel_id':
    case 'category_id':
      return normalizeNullableSnowflake(field, value);
    default:
      return invalid(`Field is not supported: ${field}`);
  }
}

export function validateLevelingSettingValue(field, value) {
  if (!LEVELING_SETTINGS_FIELDS.includes(field)) return invalid(`Field is not allowed: ${field}`);

  switch (field) {
    case 'enabled':
      return normalizeBooleanNumber(field, value);
    case 'xp_per_message':
      return normalizeInteger(field, value, DASHBOARD_VALIDATION_LIMITS.xpPerMessage, 15);
    case 'xp_cooldown':
      return normalizeInteger(field, value, DASHBOARD_VALIDATION_LIMITS.xpCooldown, 60);
    case 'multiplier':
      return normalizeNumber(field, value, DASHBOARD_VALIDATION_LIMITS.xpMultiplier, 1);
    case 'multiplier_expires':
      return normalizeOptionalIsoDate(field, value);
    case 'announce_channel':
      return normalizeNullableSnowflake(field, value);
    case 'ignored_channels':
    case 'ignored_roles':
      return normalizeJsonSnowflakeArray(field, value);
    default:
      return invalid(`Field is not supported: ${field}`);
  }
}

export function validateFanArtSettingValue(field, value) {
  if (!FANART_SETTINGS_FIELDS.includes(field)) return invalid(`Field is not allowed: ${field}`);

  switch (field) {
    case 'enabled':
    case 'approval_required':
      return normalizeBooleanNumber(field, value);
    case 'submit_channel':
    case 'gallery_channel':
      return normalizeNullableSnowflake(field, value);
    case 'vote_emoji':
      return normalizeRequiredString(
        field,
        value === null || value === undefined || value === '' ? '\u2b50' : value,
        DASHBOARD_VALIDATION_LIMITS.fanArtVoteEmojiMaxLength,
      );
    default:
      return invalid(`Field is not supported: ${field}`);
  }
}
