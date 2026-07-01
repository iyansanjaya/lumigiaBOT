/**
 * LumigiaBOT — Logger Terstruktur
 * Menyediakan logging berbasis level dengan timestamp dan output berwarna.
 */

const LEVELS = {
  DEBUG: { priority: 0, color: '\x1b[90m', label: 'DEBUG' },
  INFO:  { priority: 1, color: '\x1b[36m', label: 'INFO ' },
  WARN:  { priority: 2, color: '\x1b[33m', label: 'WARN ' },
  ERROR: { priority: 3, color: '\x1b[31m', label: 'ERROR' },
};

const RESET = '\x1b[0m';
const MIN_LEVEL = LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LEVELS.INFO;
const REDACTED_KEYS = new Set(['authorization', 'password', 'secret', 'token']);

function shouldRedact(key) {
  const normalized = key.toLowerCase();
  return [...REDACTED_KEYS].some((sensitiveKey) => normalized.includes(sensitiveKey));
}

function formatContextValue(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) return JSON.stringify({ name: value.name, message: value.message });

  try {
    return JSON.stringify(value);
  } catch {
    return '"[unserializable]"';
  }
}

function formatContext(context = {}) {
  const entries = Object.entries(context);
  if (entries.length === 0) return '';

  return entries
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${shouldRedact(key) ? '"[redacted]"' : formatContextValue(value)}`)
    .join(' ');
}

/**
 * Memformat pesan log dengan timestamp dan level.
 * @param {object} level
 * @param {string} message
 * @param {any[]} args
 */
function log(level, message, ...args) {
  if (level.priority < MIN_LEVEL.priority) return;

  const timestamp = new Date().toISOString();
  const prefix = `${level.color}[${timestamp}] [${level.label}]${RESET}`;

  if (args.length > 0) {
    console.log(prefix, message, ...args);
  } else {
    console.log(prefix, message);
  }
}

export const logger = {
  debug: (msg, ...args) => log(LEVELS.DEBUG, msg, ...args),
  info:  (msg, ...args) => log(LEVELS.INFO, msg, ...args),
  warn:  (msg, ...args) => log(LEVELS.WARN, msg, ...args),
  error: (msg, ...args) => log(LEVELS.ERROR, msg, ...args),
};

export function createServiceLogger(service) {
  function buildMessage(action, context) {
    const contextText = formatContext({ service, action, ...context });
    return contextText ? `[${contextText}]` : `[service=${service} action=${action}]`;
  }

  return {
    debug: (action, context = {}) => logger.debug(buildMessage(action, context)),
    info: (action, context = {}) => logger.info(buildMessage(action, context)),
    warn: (action, context = {}) => logger.warn(buildMessage(action, context)),
    error: (action, context = {}, error = undefined) => {
      if (error) {
        logger.error(buildMessage(action, context), error);
      } else {
        logger.error(buildMessage(action, context));
      }
    },
  };
}
