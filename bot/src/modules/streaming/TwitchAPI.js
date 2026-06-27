/**
 * LumigiaBOT — Twitch Helix API Wrapper
 * Menangani autentikasi Client Credentials dan request ke Twitch Helix API.
 * Membutuhkan env vars TWITCH_CLIENT_ID dan TWITCH_CLIENT_SECRET.
 * Jika env vars tidak diset, fitur Twitch dinonaktifkan secara graceful.
 */

import { logger } from '../../utils/Logger.js';

/** Base URLs Twitch */
const AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const HELIX_URL = 'https://api.twitch.tv/helix';

/** Cache token akses */
let cachedToken = null;
let tokenExpiresAt = 0;

export default class TwitchAPI {
  /**
   * Mengecek apakah kredensial Twitch sudah dikonfigurasi.
   * @returns {boolean}
   */
  static isConfigured() {
    return !!(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);
  }

  /**
   * Mendapatkan access token via Client Credentials flow.
   * Token di-cache sampai mendekati waktu kedaluwarsa.
   * @returns {Promise<string|null>} Access token atau null jika tidak dikonfigurasi
   */
  static async getAccessToken() {
    if (!TwitchAPI.isConfigured()) {
      logger.warn('Twitch API not configured: TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET missing.');
      return null;
    }

    // Gunakan cache jika token masih valid (buffer 60 detik)
    if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
      return cachedToken;
    }

    try {
      const params = new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      });

      const response = await fetch(AUTH_URL, {
        method: 'POST',
        body: params,
      });

      if (!response.ok) {
        logger.error(`Twitch OAuth failed: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      cachedToken = data.access_token;
      tokenExpiresAt = Date.now() + data.expires_in * 1000;

      logger.info('Twitch access token acquired successfully.');
      return cachedToken;
    } catch (error) {
      logger.error('Failed to get Twitch access token:', error);
      return null;
    }
  }

  /**
   * Melakukan request ke Twitch Helix API dengan penanganan rate limit.
   * @param {string} endpoint - Path endpoint (tanpa base URL)
   * @returns {Promise<object|null>} Data response atau null jika gagal
   */
  static async helixRequest(endpoint) {
    const token = await TwitchAPI.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(`${HELIX_URL}${endpoint}`, {
        headers: {
          'Client-Id': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
        },
      });

      // Tangani rate limit
      const remaining = response.headers.get('ratelimit-remaining');
      const resetTimestamp = response.headers.get('ratelimit-reset');

      if (response.status === 429) {
        const resetMs = resetTimestamp ? (Number(resetTimestamp) * 1000) - Date.now() : 5000;
        const waitTime = Math.max(resetMs, 1000);
        logger.warn(`Twitch rate limited. Waiting ${waitTime}ms before retry.`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return TwitchAPI.helixRequest(endpoint); // Retry sekali
      }

      if (remaining !== null && Number(remaining) < 5) {
        logger.warn(`Twitch rate limit low: ${remaining} requests remaining.`);
      }

      if (!response.ok) {
        // Token invalid/expired — reset cache dan coba ulang
        if (response.status === 401) {
          cachedToken = null;
          tokenExpiresAt = 0;
          logger.warn('Twitch token expired, re-authenticating...');
          return TwitchAPI.helixRequest(endpoint);
        }
        logger.error(`Twitch Helix error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      logger.error(`Twitch Helix request failed [${endpoint}]:`, error);
      return null;
    }
  }

  /**
   * Mendapatkan data stream untuk username tertentu.
   * @param {string} username - Twitch username
   * @returns {Promise<object|null>} Objek stream atau null jika offline/error
   */
  static async getStream(username) {
    const data = await TwitchAPI.helixRequest(
      `/streams?user_login=${encodeURIComponent(username.toLowerCase())}`,
    );
    if (!data || !data.data || data.data.length === 0) return null;
    return data.data[0];
  }

  /**
   * Mendapatkan data user Twitch (profil, avatar, dll).
   * @param {string} username - Twitch username
   * @returns {Promise<object|null>} Objek user atau null jika tidak ditemukan
   */
  static async getUser(username) {
    const data = await TwitchAPI.helixRequest(
      `/users?login=${encodeURIComponent(username.toLowerCase())}`,
    );
    if (!data || !data.data || data.data.length === 0) return null;
    return data.data[0];
  }
}
