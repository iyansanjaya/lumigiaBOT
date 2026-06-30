import path from 'path';

const PLACEHOLDER_VALUES = new Set([
  'your_bot_token_here',
  'your_client_id_here',
  'your_client_secret_here',
  'generate_a_random_secret_here',
]);

export const REQUIRED_WEB_ENV = [
  'AUTH_SECRET',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'DISCORD_TOKEN',
] as const;

type RequiredWebEnv = (typeof REQUIRED_WEB_ENV)[number];

export interface EnvCheck {
  ok: boolean;
  missing: string[];
  placeholders: string[];
}

function clean(value: string | undefined) {
  return typeof value === 'string' ? value.trim() : '';
}

function isPlaceholder(value: string) {
  return PLACEHOLDER_VALUES.has(value);
}

export function getDatabasePath() {
  return process.env.DATABASE_PATH ||
    (process.env.NODE_ENV === 'production'
      ? '/app/data/lumigiabot.db'
      : path.join(process.cwd(), '..', 'data', 'lumigiabot.db'));
}

export function checkRequiredWebEnv(names: readonly RequiredWebEnv[] = REQUIRED_WEB_ENV): EnvCheck {
  const missing: string[] = [];
  const placeholders: string[] = [];

  for (const name of names) {
    const value = clean(process.env[name]);

    if (!value) {
      missing.push(name);
    } else if (isPlaceholder(value)) {
      placeholders.push(name);
    }
  }

  return {
    ok: missing.length === 0 && placeholders.length === 0,
    missing,
    placeholders,
  };
}
