/**
 * LumigiaBOT — YouTube Live Checker
 * Mendeteksi live stream YouTube tanpa API key.
 * Menggunakan RSS feed channel dan halaman video untuk mengecek status live.
 */

import { logger } from '../../utils/Logger.js';

/** URL template */
const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=';
const VIDEO_URL = 'https://www.youtube.com/watch?v=';
const CHANNEL_LIVE_URL = 'https://www.youtube.com/channel/';

export default class YouTubeChecker {
  /**
   * Mengecek apakah channel YouTube sedang live.
   * Menggunakan pendekatan gabungan: RSS feed + page check.
   * @param {string} channelId - YouTube channel ID (UCxxxx...)
   * @returns {Promise<{isLive: boolean, videoId: string, title: string, thumbnail: string}|null>}
   */
  static async checkLive(channelId) {
    try {
      // Metode 1: Cek halaman /live channel
      const liveResult = await YouTubeChecker.checkChannelLivePage(channelId);
      if (liveResult && liveResult.isLive) {
        return liveResult;
      }

      // Metode 2: Cek RSS feed untuk video terbaru
      const rssResult = await YouTubeChecker.checkRSSFeed(channelId);
      if (rssResult && rssResult.isLive) {
        return rssResult;
      }

      return { isLive: false, videoId: null, title: null, thumbnail: null };
    } catch (error) {
      logger.warn(`YouTube live check failed for channel ${channelId}:`, error.message);
      return null;
    }
  }

  /**
   * Mengecek halaman /live channel untuk mendeteksi redirect ke stream aktif.
   * @param {string} channelId - YouTube channel ID
   * @returns {Promise<{isLive: boolean, videoId: string|null, title: string|null, thumbnail: string|null}|null>}
   */
  static async checkChannelLivePage(channelId) {
    try {
      const response = await fetch(`${CHANNEL_LIVE_URL}${channelId}/live`, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!response.ok) return null;

      const html = await response.text();
      const finalUrl = response.url;

      // Jika redirect ke halaman watch, artinya sedang live
      const watchMatch = finalUrl.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
      if (!watchMatch) return { isLive: false, videoId: null, title: null, thumbnail: null };

      const videoId = watchMatch[1];

      // Cek apakah halaman mengandung indikator live
      const isLive = html.includes('"isLive":true')
        || html.includes('"isLiveContent":true')
        || html.includes('"isLiveBroadcast":true');

      if (!isLive) return { isLive: false, videoId: null, title: null, thumbnail: null };

      // Ekstrak judul dari HTML
      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      const rawTitle = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'Live Stream';

      return {
        isLive: true,
        videoId,
        title: rawTitle,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    } catch (error) {
      logger.debug(`YouTube channel live page check failed for ${channelId}:`, error.message);
      return null;
    }
  }

  /**
   * Mengecek RSS feed channel untuk video terbaru dan memverifikasi status live.
   * @param {string} channelId - YouTube channel ID
   * @returns {Promise<{isLive: boolean, videoId: string|null, title: string|null, thumbnail: string|null}|null>}
   */
  static async checkRSSFeed(channelId) {
    try {
      const response = await fetch(`${RSS_URL}${channelId}`, {
        headers: { 'User-Agent': 'LumigiaBOT/1.0' },
      });

      if (!response.ok) {
        logger.debug(`YouTube RSS fetch failed for ${channelId}: ${response.status}`);
        return null;
      }

      const xml = await response.text();

      // Ekstrak video terbaru dari RSS feed (entry pertama)
      const entryMatch = xml.match(/<entry>[\s\S]*?<\/entry>/);
      if (!entryMatch) return null;

      const entry = entryMatch[0];
      const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/);

      if (!videoIdMatch) return null;

      const videoId = videoIdMatch[1];
      const title = titleMatch ? titleMatch[1] : 'Live Stream';

      // Cek halaman video untuk status live
      const isLive = await YouTubeChecker.checkVideoIsLive(videoId);

      if (!isLive) return { isLive: false, videoId: null, title: null, thumbnail: null };

      return {
        isLive: true,
        videoId,
        title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    } catch (error) {
      logger.debug(`YouTube RSS check failed for ${channelId}:`, error.message);
      return null;
    }
  }

  /**
   * Memverifikasi apakah video tertentu sedang live.
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<boolean>}
   */
  static async checkVideoIsLive(videoId) {
    try {
      const response = await fetch(`${VIDEO_URL}${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!response.ok) return false;

      const html = await response.text();
      return html.includes('"isLive":true')
        || html.includes('"isLiveContent":true')
        || html.includes('"isLiveBroadcast":true');
    } catch (error) {
      logger.debug(`YouTube video live check failed for ${videoId}:`, error.message);
      return false;
    }
  }
}
