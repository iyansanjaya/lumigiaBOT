/**
 * LumigiaBOT — Generator Transkrip Tiket
 * Menghasilkan transkrip HTML profesional dari pesan channel tiket.
 * Menggunakan tema gelap mirip Discord dengan gelembung pesan bergaya.
 */

import { logger } from '../../utils/Logger.js';

/**
 * Mengambil semua pesan dari channel, menangani paginasi.
 * @param {import('discord.js').TextChannel} channel
 * @returns {Promise<import('discord.js').Message[]>}
 */
async function fetchAllMessages(channel) {
  const allMessages = [];
  let lastId = null;

  // Paginasi pesan 100 sekaligus
  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;

    const messages = await channel.messages.fetch(options);
    if (messages.size === 0) break;

    allMessages.push(...messages.values());
    lastId = messages.last().id;

    // Keamanan: batasi pada 1000 pesan untuk mencegah masalah memori
    if (allMessages.length >= 1000) break;
  }

  // Urutkan dari yang terlama
  return allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
}

/**
 * Meng-escape karakter khusus HTML untuk mencegah XSS.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Mengkonversi markdown Discord dasar ke HTML.
 * @param {string} content
 * @returns {string}
 */
function markdownToHtml(content) {
  if (!content) return '';

  let html = escapeHtml(content);

  // Tebal: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Miring: *text* atau _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  // Garis bawah: __text__
  html = html.replace(/__(.+?)__/g, '<u>$1</u>');
  // Coret: ~~text~~
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  // Blok kode: ```text```
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  // Kode sebaris: `text`
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  // Baris baru
  html = html.replace(/\n/g, '<br>');

  return html;
}

/**
 * Memformat timestamp untuk ditampilkan.
 * @param {Date} date
 * @returns {string}
 */
function formatTimestamp(date) {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Menghasilkan transkrip HTML profesional dari pesan channel.
 *
 * @param {import('discord.js').TextChannel} channel
 * @returns {Promise<Buffer>} Transkrip HTML sebagai Buffer
 */
export async function generateTranscript(channel) {
  const messages = await fetchAllMessages(channel);

  const guildName = escapeHtml(channel.guild.name);
  const channelName = escapeHtml(channel.name);
  const messageCount = messages.length;
  const firstDate = messages.length > 0 ? formatTimestamp(messages[0].createdAt) : 'N/A';
  const lastDate = messages.length > 0 ? formatTimestamp(messages[messages.length - 1].createdAt) : 'N/A';
  const generatedAt = formatTimestamp(new Date());

  // Bangun HTML pesan
  let messagesHtml = '';
  for (const msg of messages) {
    const avatarUrl = msg.author.displayAvatarURL({ extension: 'png', size: 64 });
    const username = escapeHtml(msg.author.tag);
    const timestamp = formatTimestamp(msg.createdAt);
    const content = markdownToHtml(msg.content);
    const isBot = msg.author.bot;

    // Bangun bagian lampiran
    let attachmentsHtml = '';
    if (msg.attachments.size > 0) {
      attachmentsHtml = '<div class="attachments">';
      for (const [, attachment] of msg.attachments) {
        const fileName = escapeHtml(attachment.name || 'attachment');
        const fileUrl = escapeHtml(attachment.url);
        const isImage = attachment.contentType?.startsWith('image/');

        if (isImage) {
          attachmentsHtml += `<div class="attachment-img"><img src="${fileUrl}" alt="${fileName}" loading="lazy"><div class="attachment-name">${fileName}</div></div>`;
        } else {
          attachmentsHtml += `<div class="attachment-file"><a href="${fileUrl}" target="_blank">📎 ${fileName}</a></div>`;
        }
      }
      attachmentsHtml += '</div>';
    }

    // Bangun bagian embed (disederhanakan)
    let embedsHtml = '';
    if (msg.embeds.length > 0) {
      for (const embed of msg.embeds) {
        const embedTitle = embed.title ? `<div class="embed-title">${escapeHtml(embed.title)}</div>` : '';
        const embedDesc = embed.description ? `<div class="embed-description">${markdownToHtml(embed.description)}</div>` : '';
        const embedColor = embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '#5865F2';

        let fieldsHtml = '';
        if (embed.fields?.length > 0) {
          fieldsHtml = '<div class="embed-fields">';
          for (const field of embed.fields) {
            const inlineClass = field.inline ? ' embed-field-inline' : '';
            fieldsHtml += `<div class="embed-field${inlineClass}"><div class="embed-field-name">${escapeHtml(field.name)}</div><div class="embed-field-value">${markdownToHtml(field.value)}</div></div>`;
          }
          fieldsHtml += '</div>';
        }

        embedsHtml += `<div class="embed" style="border-left-color: ${embedColor}">${embedTitle}${embedDesc}${fieldsHtml}</div>`;
      }
    }

    const botBadge = isBot ? '<span class="bot-badge">BOT</span>' : '';

    messagesHtml += `
      <div class="message">
        <div class="message-avatar">
          <img src="${avatarUrl}" alt="avatar" loading="lazy">
        </div>
        <div class="message-body">
          <div class="message-header">
            <span class="message-author">${username}</span>
            ${botBadge}
            <span class="message-timestamp">${timestamp}</span>
          </div>
          ${content ? `<div class="message-content">${content}</div>` : ''}
          ${attachmentsHtml}
          ${embedsHtml}
        </div>
      </div>`;
  }

  // Bangun dokumen HTML lengkap
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transcript — #${channelName}</title>
  <style>
    /* ===== Reset & Dasar ===== */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
      background-color: #36393f;
      color: #dcddde;
      line-height: 1.5;
      min-height: 100vh;
    }

    /* ===== Kepala ===== */
    .header {
      background: linear-gradient(135deg, #5865F2, #7C3AED);
      padding: 32px 24px;
      text-align: center;
      border-bottom: 3px solid #4752c4;
    }

    .header h1 {
      font-size: 24px;
      color: #fff;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .header .subtitle {
      color: rgba(255,255,255,0.8);
      font-size: 14px;
    }

    .header .meta {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .header .meta-item {
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      color: rgba(255,255,255,0.9);
    }

    .header .meta-item strong {
      color: #fff;
    }

    /* ===== Wadah Pesan ===== */
    .messages {
      max-width: 900px;
      margin: 0 auto;
      padding: 16px;
    }

    /* ===== Pesan Tunggal ===== */
    .message {
      display: flex;
      gap: 16px;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.1s;
    }

    .message:hover {
      background-color: #32353b;
    }

    .message-avatar img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-top: 4px;
      object-fit: cover;
    }

    .message-body {
      flex: 1;
      min-width: 0;
    }

    .message-header {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 2px;
    }

    .message-author {
      font-weight: 600;
      font-size: 15px;
      color: #fff;
    }

    .message-timestamp {
      font-size: 12px;
      color: #72767d;
    }

    .bot-badge {
      background-color: #5865F2;
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 3px;
      text-transform: uppercase;
      vertical-align: middle;
    }

    .message-content {
      font-size: 15px;
      color: #dcddde;
      word-wrap: break-word;
    }

    .message-content code {
      background: #2f3136;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: "Consolas", "Monaco", monospace;
      font-size: 13px;
    }

    .message-content pre {
      background: #2f3136;
      padding: 12px;
      border-radius: 4px;
      margin: 4px 0;
      overflow-x: auto;
    }

    .message-content pre code {
      background: transparent;
      padding: 0;
    }

    .message-content strong { color: #fff; }

    /* ===== Lampiran ===== */
    .attachments {
      margin-top: 8px;
    }

    .attachment-img {
      margin-top: 4px;
    }

    .attachment-img img {
      max-width: 400px;
      max-height: 300px;
      border-radius: 4px;
      cursor: pointer;
    }

    .attachment-name {
      font-size: 12px;
      color: #72767d;
      margin-top: 2px;
    }

    .attachment-file {
      margin-top: 4px;
    }

    .attachment-file a {
      color: #00b0f4;
      text-decoration: none;
      font-size: 14px;
    }

    .attachment-file a:hover {
      text-decoration: underline;
    }

    /* ===== Embed ===== */
    .embed {
      background: #2f3136;
      border-left: 4px solid #5865F2;
      border-radius: 4px;
      padding: 12px 16px;
      margin-top: 8px;
      max-width: 520px;
    }

    .embed-title {
      font-weight: 700;
      font-size: 15px;
      color: #fff;
      margin-bottom: 4px;
    }

    .embed-description {
      font-size: 14px;
      color: #dcddde;
    }

    .embed-fields {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .embed-field {
      flex: 1 1 100%;
    }

    .embed-field-inline {
      flex: 1 1 30%;
    }

    .embed-field-name {
      font-weight: 700;
      font-size: 13px;
      color: #fff;
      margin-bottom: 2px;
    }

    .embed-field-value {
      font-size: 13px;
      color: #b9bbbe;
    }

    /* ===== Kaki ===== */
    .footer {
      text-align: center;
      padding: 24px;
      color: #72767d;
      font-size: 12px;
      border-top: 1px solid #2f3136;
      margin-top: 24px;
    }

    /* ===== Responsif ===== */
    @media (max-width: 600px) {
      .header .meta { flex-direction: column; gap: 8px; }
      .messages { padding: 8px; }
      .message { padding: 8px; gap: 10px; }
      .attachment-img img { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>#${channelName}</h1>
    <div class="subtitle">${guildName}</div>
    <div class="meta">
      <div class="meta-item"><strong>${messageCount}</strong> messages</div>
      <div class="meta-item"><strong>From:</strong> ${firstDate}</div>
      <div class="meta-item"><strong>To:</strong> ${lastDate}</div>
    </div>
  </div>

  <div class="messages">
    ${messagesHtml || '<div style="text-align:center;padding:40px;color:#72767d;">No messages found.</div>'}
  </div>

  <div class="footer">
    Generated by LumigiaBOT &bull; ${generatedAt}
  </div>
</body>
</html>`;

  logger.info(`Generated transcript for #${channel.name} with ${messageCount} messages`);
  return Buffer.from(html, 'utf-8');
}
