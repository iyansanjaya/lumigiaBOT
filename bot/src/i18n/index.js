/**
 * LumigiaBOT — Inisialisasi i18n
 * Mengatur i18next dengan terjemahan Bahasa Inggris dan Indonesia.
 */

import i18next from 'i18next';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GUILD_SETTINGS_DEFAULTS, normalizeLanguage } from '../../../shared/contracts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Menginisialisasi i18next dengan file bahasa.
 * @returns {Promise<void>}
 */
export async function initI18n() {
  const enUS = JSON.parse(readFileSync(join(__dirname, 'locales', 'en-US.json'), 'utf-8'));
  const id = JSON.parse(readFileSync(join(__dirname, 'locales', 'id.json'), 'utf-8'));

  await i18next.init({
    lng: normalizeLanguage(process.env.DEFAULT_LANGUAGE),
    fallbackLng: GUILD_SETTINGS_DEFAULTS.language,
    interpolation: {
      escapeValue: false, // Discord menangani escaping-nya sendiri
    },
    resources: {
      'en-US': { translation: enUS },
      'id': { translation: id },
    },
  });
}

export default i18next;
