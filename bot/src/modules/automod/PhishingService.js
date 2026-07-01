import { createServiceLogger } from '../../utils/Logger.js';

// Sumber daftar domain phishing. Bisa ditambahkan lebih banyak jika perlu.
const PHISHING_LIST_URLS = [
  'https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt'
];

const log = createServiceLogger('phishing-service');

class PhishingService {
  constructor() {
    /** @type {Set<string>} */
    this.phishingDomains = new Set();
    this.isInitialized = false;
    this.updateInterval = null;
  }

  /**
   * Memulai service dan mengunduh database phishing.
   */
  async start() {
    if (this.isInitialized) return;
    
    log.info('starting', { sources: PHISHING_LIST_URLS.length });
    await this.fetchDatabases();

    // Update setiap 12 jam (12 * 60 * 60 * 1000)
    this.updateInterval = setInterval(() => this.fetchDatabases(), 12 * 60 * 60 * 1000);
    this.isInitialized = true;
  }

  /**
   * Menghentikan service.
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isInitialized = false;
    log.info('stopped');
  }

  /**
   * Mengunduh daftar phishing dari semua URL dan memperbarui cache (Set).
   */
  async fetchDatabases() {
    let newDomains = new Set();
    
    for (const url of PHISHING_LIST_URLS) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          log.warn('fetch_failed', { url, status: response.status, statusText: response.statusText });
          continue;
        }

        const text = await response.text();
        const lines = text.split('\n');

        let count = 0;
        for (let line of lines) {
          line = line.trim().toLowerCase();
          // Abaikan komentar atau baris kosong
          if (line && !line.startsWith('#')) {
            newDomains.add(line);
            count++;
          }
        }
        log.debug('source_loaded', { url, count });
      } catch (error) {
        log.error('fetch_error', { url }, error);
      }
    }

    if (newDomains.size > 0) {
      this.phishingDomains = newDomains;
      log.info('cache_updated', { domains: this.phishingDomains.size });
    } else if (this.phishingDomains.size === 0) {
      log.warn('cache_empty', { sources: PHISHING_LIST_URLS.length });
    }
  }

  /**
   * Mengecek apakah sebuah URL termasuk phishing berdasarkan cache.
   *
   * @param {string} urlString - URL yang akan diperiksa
   * @returns {boolean} - true jika phishing, false jika aman atau tidak valid
   */
  isPhishing(urlString) {
    try {
      // Pastikan string diawali dengan http/https agar URL parser tidak gagal
      const normalizedUrl = urlString.startsWith('http') ? urlString : `http://${urlString}`;
      const parsedUrl = new URL(normalizedUrl);
      const hostname = parsedUrl.hostname.toLowerCase();

      // Cek apakah hostname persis ada di database
      if (this.phishingDomains.has(hostname)) return true;

      // Cek juga parent domain (contoh: sub.phishing.com -> phishing.com)
      const parts = hostname.split('.');
      if (parts.length > 2) {
        // Ambil 2 part terakhir (misal: domain.com)
        const rootDomain = parts.slice(-2).join('.');
        if (this.phishingDomains.has(rootDomain)) return true;
      }

      return false;
    } catch {
      // Jika URL tidak valid, anggap aman dari segi phishing list
      return false;
    }
  }
}

// Ekspor instance singleton
export default new PhishingService();
