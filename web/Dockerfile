# ---- Dependensi ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --frozen-lockfile || npm install

# ---- Bangun ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Jalankan ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Gunakan user 'node' bawaan Alpine (UID 1000) —
# sama dengan bot container agar bisa baca/tulis database bersama
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3412
ENV PORT=3412
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
