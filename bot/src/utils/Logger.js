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
