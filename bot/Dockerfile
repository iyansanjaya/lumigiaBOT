# Tahap 1: Instal dependensi
FROM node:22-alpine AS builder
WORKDIR /app/bot
COPY bot/package*.json ./
RUN npm install --omit=dev

# Tahap 2: Runtime produksi
FROM node:22-alpine
WORKDIR /app/bot

# Buat direktori data dan set kepemilikan ke user node.
RUN mkdir -p /app/data && chown -R node:node /app/data

# Salin dependensi, kode sumber, dan kontrak shared repo.
COPY --from=builder /app/bot/node_modules ./node_modules
COPY bot/src/ ./src/
COPY bot/scripts/ ./scripts/
COPY bot/deploy-commands.js ./
COPY bot/package.json ./
COPY shared/ ../shared/

# Jalankan sebagai non-root untuk keamanan.
USER node

CMD ["node", "src/index.js"]
