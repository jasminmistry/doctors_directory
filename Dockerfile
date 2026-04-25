# syntax=docker/dockerfile:1.7

FROM node:lts-alpine3.23 AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ── deps: install all dependencies (cached layer) ─────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
	if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ── builder: compile the app ──────────────────────────────────────────────────
FROM base AS builder
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NODE_OPTIONS=--max-old-space-size=4096
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ── runner: minimal production image ──────────────────────────────────────────
FROM node:lts-alpine3.23 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV NODE_OPTIONS=--max-old-space-size=1024

RUN npm install -g pm2 && apk add --no-cache curl

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Standalone bundle — only the node_modules actually used at runtime (~100-200 MB
# instead of the full 1.3 GB).  Next.js writes this to .next/standalone/ when
# output: 'standalone' is set in next.config.js.
COPY --from=builder /app/.next/standalone ./

# Static assets are not included in the standalone bundle.
COPY --from=builder /app/.next/static ./.next/static

# Public directory: JSON data files + images served at /directory/…
COPY --from=builder /app/public ./public

# Prisma CLI + all @prisma/* packages are needed at runtime:
#   - `prisma` CLI (devDep) runs migrations via the entrypoint
#   - `@prisma/engines` supplies the native migration + query engine binaries
#   - `@prisma/client` and sibling packages handle DB access at request time
# Copying the full @prisma scope (~206 MB) is the reliable approach; the
# standalone bundle alone does not include the migration engine.
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# PM2 process-manager config and custom pre-warming server.
# server.js intentionally overwrites the default Next.js standalone server so
# that PM2 cluster mode + Redis-backed JSON pre-warming is preserved.
COPY ecosystem.config.js ./ecosystem.config.js
COPY server.js ./server.js
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=10s --start-period=120s --retries=5 \
	CMD ["curl", "-fLs", "http://localhost:3000/directory/api/healthz/"]

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
