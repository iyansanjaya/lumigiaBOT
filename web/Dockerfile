# ---- Dependensi ----
FROM node:22-alpine AS deps
WORKDIR /app/web
COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate && pnpm install --frozen-lockfile

# ---- Bangun ----
FROM node:22-alpine AS builder
WORKDIR /app/web
COPY --from=deps /app/web/node_modules ./node_modules
COPY web/ ./
COPY shared/ ../shared/
ENV NEXT_STANDALONE=true
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate && pnpm run build

# ---- Jalankan ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# outputFileTracingRoot memakai repo root, jadi server standalone berada di /app/web.
COPY --from=builder /app/web/public ./web/public
COPY --from=builder --chown=node:node /app/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/web/.next/static ./web/.next/static

USER node

EXPOSE 3412
ENV PORT=3412
ENV HOSTNAME="0.0.0.0"

CMD ["node", "web/server.js"]
