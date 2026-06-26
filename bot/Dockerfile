# Tahap 1: Instal dependensi
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Tahap 2: Runtime produksi
FROM node:22-alpine
WORKDIR /app

# Buat direktori data
RUN mkdir -p /app/data

# Salin dependensi dan kode sumber
COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
COPY deploy-commands.js ./
COPY package.json ./

# Jalankan sebagai non-root untuk keamanan
USER node

CMD ["node", "src/index.js"]
