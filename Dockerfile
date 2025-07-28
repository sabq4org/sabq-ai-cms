# Build stage
FROM node:18-alpine AS builder

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --legacy-peer-deps

# Generate Prisma Client with DigitalOcean fix
RUN echo "🔧 Applying Prisma fix for DigitalOcean..." && \
    echo 'generator client {' > /tmp/generator.txt && \
    echo '  provider        = "prisma-client-js"' >> /tmp/generator.txt && \
    echo '  binaryTargets   = ["native", "linux-musl-openssl-3.0.x"]' >> /tmp/generator.txt && \
    echo '  previewFeatures = ["relationJoins"]' >> /tmp/generator.txt && \
    echo '}' >> /tmp/generator.txt && \
    tail -n +6 prisma/schema.prisma > /tmp/rest.txt && \
    cat /tmp/generator.txt /tmp/rest.txt > prisma/schema.prisma && \
    echo "📄 Updated schema:" && \
    head -5 prisma/schema.prisma && \
    echo "🚀 Generating Prisma client..." && \
    npx prisma generate && \
    echo "✅ Prisma client generated for DigitalOcean"

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Set environment to production
ENV NODE_ENV production
ENV PORT 3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 