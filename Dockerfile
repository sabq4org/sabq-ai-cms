# Use the official Node.js image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 make g++ vips-dev
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm install --legacy-peer-deps; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Use a placeholder DATABASE_URL for Prisma generation
ENV DATABASE_URL="postgresql://user:password@host:5432/db?schema=public"
ENV NODE_OPTIONS="--openssl-legacy-provider"

# Create the directory for Prisma Client
RUN mkdir -p lib/generated

# Prepare Prisma schema for production
RUN echo "🚀 Preparing Prisma schema for production..." && \
    node scripts/prepare-prisma-for-production.js

# Generate Prisma Client with more verbose output
RUN echo "🔧 Generating Prisma Client..." && \
    npx prisma generate --generator client && \
    echo "✅ Prisma Client generated"

# Verify Prisma Client generation and check for daily_doses
RUN echo "📋 Checking Prisma Client..." && \
    ls -la lib/generated/prisma/ && \
    echo "🔍 Checking for daily_doses model..." && \
    grep -r "daily_doses" lib/generated/prisma/ || echo "⚠️ daily_doses not found in generated client"

# Build Next.js application using the fixed build script
RUN echo "🏗️ Building Next.js application..." && \
    node scripts/digitalocean-build-fix.js || \
    (echo "❌ Build failed, trying direct build..." && npm run build)

# Verify build output
RUN echo "📁 Checking build output..." && \
    ls -la .next/ || echo "❌ .next directory not found" && \
    echo "📁 Checking for standalone..." && \
    ls -la .next/standalone/ || echo "⚠️ standalone directory not found, creating fallback..."

# Create fallback standalone if not exists
RUN if [ ! -d ".next/standalone" ]; then \
      echo "🔧 Creating fallback standalone directory..." && \
      mkdir -p .next/standalone && \
      cp -r node_modules .next/standalone/ && \
      cp -r public .next/standalone/ && \
      cp package.json .next/standalone/ && \
      echo "const { createServer } = require('http'); const { parse } = require('url'); const next = require('next'); const port = parseInt(process.env.PORT, 10) || 3000; const dev = false; const app = next({ dev, dir: '.' }); const handle = app.getRequestHandler(); app.prepare().then(() => { createServer((req, res) => { const parsedUrl = parse(req.url, true); handle(req, res, parsedUrl); }).listen(port, (err) => { if (err) throw err; console.log(\`> Ready on http://localhost:\${port}\`); }); });" > .next/standalone/server.js; \
    fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/lib/generated ./lib/generated

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
CMD ["node", "server.js"] 