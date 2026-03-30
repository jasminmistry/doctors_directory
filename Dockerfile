# syntax=docker/dockerfile:1.7

FROM node:lts-alpine3.23 AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
	if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM base AS builder
# Declare build-time variable so Next.js bakes it into the bundle.
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NODE_OPTIONS=--max-old-space-size=4096
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:lts-alpine3.23 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV NODE_OPTIONS=--max-old-space-size=1024

# Install PM2 globally before switching to non-root user
RUN npm install -g pm2 && apk add --no-cache curl

# Use non-root runtime user for safer container execution.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js
COPY ecosystem.config.js ./ecosystem.config.js
COPY server.js ./server.js

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=10s --start-period=60s --retries=5 \
	CMD ["curl", "-fLs", "http://localhost:3000/directory/api/healthz/"]

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
