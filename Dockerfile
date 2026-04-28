# syntax=docker/dockerfile:1.7

FROM node:lts-alpine3.23 AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ── deps: all dependencies for the build ──────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
	npm ci

# ── prod-deps: production-only dependencies for the runtime image ──────────────
# Excludes @playwright/test (browsers), jest, typescript, @types/*, etc.
FROM base AS prod-deps
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
	npm ci --omit=dev

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

# ── runner: production image ──────────────────────────────────────────────────
FROM node:lts-alpine3.23 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV NODE_OPTIONS=--max-old-space-size=1024

RUN npm install -g pm2 && apk add --no-cache curl

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/prisma ./prisma
# Production-only node_modules — dev deps (Playwright, Jest, TypeScript …) excluded
COPY --from=prod-deps /app/node_modules ./node_modules
# Prisma generates its client into node_modules/.prisma at build time — copy it over
# since prod-deps never ran `prisma generate`
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
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
