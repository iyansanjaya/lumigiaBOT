import { existsSync, mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));
const botDir = resolve(configDir, '..', '..');
const rootDir = resolve(botDir, '..');

const PLACEHOLDER_VALUES = new Set([
  'your_bot_token_here',
  'your_client_id_here',
  'your_client_secret_here',
  'your_discord_user_id_here',
  'generate_a_random_secret_here',
]);

const SUPPORTED_LANGUAGES = new Set(['id', 'en-US', 'en']);
const SUPPORTED_LOG_LEVELS = new Set(['DEBUG', 'INFO', 'WARN', 'ERROR']);

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isPlaceholder(value) {
  return PLACEHOLDER_VALUES.has(clean(value));
}

function readRequired(name, errors) {
  const value = clean(process.env[name]);

  if (!value) {
    errors.push(`${name} is required.`);
    return '';
  }

  if (isPlaceholder(value)) {
    errors.push(`${name} still uses the example placeholder value.`);
    return '';
  }

  return value;
}

function assertSnowflake(name, value, errors) {
  if (value && !/^\d{17,20}$/.test(value)) {
    errors.push(`${name} must be a Discord snowflake ID.`);
  }
}

function buildError(errors) {
  return new Error(`Invalid environment configuration:\n- ${errors.join('\n- ')}`);
}

export function getDatabasePath() {
  const configuredPath = process.env.DATABASE_PATH || './data/lumigiabot.db';

  if (isAbsolute(configuredPath)) {
    return configuredPath;
  }

  const candidates = [
    resolve(process.cwd(), configuredPath),
    resolve(rootDir, configuredPath),
    resolve(botDir, configuredPath),
  ];

  return candidates.find((candidate) => (
    existsSync(candidate) || existsSync(dirname(candidate))
  )) || candidates[0];
}

export function validateBotEnv() {
  const errors = [];
  const discordToken = readRequired('DISCORD_TOKEN', errors);
  const databasePath = getDatabasePath();
  const defaultLanguage = clean(process.env.DEFAULT_LANGUAGE) || 'id';
  const ownerId = clean(process.env.BOT_OWNER_ID);
  const logLevel = clean(process.env.LOG_LEVEL).toUpperCase();

  if (!SUPPORTED_LANGUAGES.has(defaultLanguage)) {
    errors.push('DEFAULT_LANGUAGE must be one of: id, en-US, en.');
  }

  if (ownerId && !isPlaceholder(ownerId)) {
    assertSnowflake('BOT_OWNER_ID', ownerId, errors);
  }

  if (logLevel && !SUPPORTED_LOG_LEVELS.has(logLevel)) {
    errors.push('LOG_LEVEL must be one of: DEBUG, INFO, WARN, ERROR.');
  }

  try {
    mkdirSync(dirname(databasePath), { recursive: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`DATABASE_PATH directory cannot be created: ${message}`);
  }

  if (errors.length > 0) {
    throw buildError(errors);
  }

  return {
    databasePath,
    discordToken,
  };
}

export function validateDeployEnv() {
  const errors = [];
  const discordToken = readRequired('DISCORD_TOKEN', errors);
  const discordClientId = readRequired('DISCORD_CLIENT_ID', errors);

  assertSnowflake('DISCORD_CLIENT_ID', discordClientId, errors);

  if (errors.length > 0) {
    throw buildError(errors);
  }

  return {
    discordClientId,
    discordToken,
  };
}
