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
ENV JWT_SECRET="build-time-secret"
ENV NEXTAUTH_SECRET="build-time-secret"
ENV NEXTAUTH_URL="http://localhost:3000"

# Create the directory for Prisma Client
RUN mkdir -p lib/generated

# Prepare Prisma schema for production
RUN echo "🚀 Preparing Prisma schema for production..." && \
    node scripts/prepare-prisma-for-production.js

# Generate Prisma Client with more verbose output
RUN echo "🔧 Generating Prisma Client..." && \
    npx prisma generate --generator client && \
    echo "✅ Prisma Client generated"

# Build Next.js application using the new build script
RUN echo "🏗️ Building Next.js application..." && \
    chmod +x scripts/digitalocean-build-v3.js && \
    node scripts/digitalocean-build-v3.js

# Verify build output
RUN echo "📁 Verifying build output..." && \
    ls -la && \
    echo "📁 .next directory:" && \
    ls -la .next/ || echo "❌ .next not found" && \
    echo "📁 .next/standalone directory:" && \
    ls -la .next/standalone/ || echo "⚠️ standalone not found"

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public directory
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy the entire app (fallback approach)
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js

# Copy Prisma files
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/lib/generated ./lib/generated

# Copy start script
COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./start.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000

# Use the start script
CMD ["./start.sh"] 