# syntax=docker/dockerfile:1.7

FROM node:lts-alpine3.23 AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ── deps: all dependencies for the build ──────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
	npm ci

# ── extras: runtime packages nft can't trace from the app ────────────────────
# `next build` (output: 'standalone') file-traces the app's *imported* runtime
# deps. Two things it misses:
#   1. The Prisma CLI — run as a shell command at container start
#      (`prisma migrate deploy` in docker-entrypoint.sh), never imported.
#   2. ioredis — imported by the custom server.js (cross-worker JSON prewarm),
#      which nft doesn't scan (it traces Next's own server entry, not ours).
# Install both in isolation and let npm resolve their complete, correctly-hoisted
# closures (no manual package enumeration). Merged into node_modules in runner.
FROM base AS extras
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
	PRISMA_VERSION="$(node -p "(require('./package.json').devDependencies.prisma||require('./package.json').dependencies.prisma).replace(/[^0-9.].*/,'')")" && \
	IOREDIS_VERSION="$(node -p "require('./package.json').dependencies.ioredis.replace(/[^0-9.].*/,'')")" && \
	npm install --no-save --omit=dev "prisma@${PRISMA_VERSION}" "ioredis@${IOREDIS_VERSION}"

# ── builder: compile the app ──────────────────────────────────────────────────
FROM base AS builder
ARG NEXT_PUBLIC_DIRECTORY_BASE_URL
ENV NEXT_PUBLIC_DIRECTORY_BASE_URL=$NEXT_PUBLIC_DIRECTORY_BASE_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_MARKETING_BASE_URL
ENV NEXT_PUBLIC_MARKETING_BASE_URL=$NEXT_PUBLIC_MARKETING_BASE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NODE_OPTIONS=--max-old-space-size=4096
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,target=/app/.next/cache \
	npx prisma generate && npm run build

# ── runner: production image ──────────────────────────────────────────────────
FROM node:lts-alpine3.23 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV NODE_OPTIONS=--max-old-space-size=1024

RUN npm install -g pm2 && npm cache clean --force && apk add --no-cache curl

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Next.js standalone bundle: self-contained server + file-traced node_modules.
# Its internal layout mirrors the repo root (./.next, ./node_modules, ./package.json …).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma: generated client (schema-specific) + runtime + the shell-invoked CLI closure.
COPY --from=extras /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Custom server + PM2 config — override the stub server.js emitted inside standalone.
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/next.config.js ./next.config.js
# Real package.json (standalone emits a minimal one without our scripts) — the
# entrypoint runs `npm run db:migrate`.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/ecosystem.config.js ./ecosystem.config.js
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder /app/src/lib/data/directory-page-metas ./src/lib/data/directory-page-metas

RUN chmod +x docker-entrypoint.sh && \
	mkdir -p /app/.next/cache/images && \
	chown -R appuser:appgroup /app/.next && \
	chown -R appuser:appgroup /app/node_modules/.prisma && \
	mkdir -p /app/uploads/verification /app/uploads/images /app/public/images && \
	rm -rf /app/public/images/uploads && \
	ln -sfn /app/uploads/images /app/public/images/uploads && \
	chown -R appuser:appgroup /app/uploads

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=10s --start-period=120s --retries=5 \
	CMD ["curl", "-fLs", "http://localhost:3000/directory/api/healthz/"]

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
