# ---- Build Stage ----
FROM node:22-alpine AS builder

# تثبيت التبعيات المطلوبة لـ sharp
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev \
    build-base \
    libc6-compat

WORKDIR /app

# نسخ ملفات package
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت التبعيات مع دعم sharp للـ Alpine
RUN npm ci --legacy-peer-deps --include=optional
RUN npm install sharp@0.33.2 --platform=linuxmusl --arch=x64 --legacy-peer-deps
RUN npx prisma generate

# نسخ باقي الملفات
COPY . .

# بناء التطبيق
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine AS runner

# تثبيت التبعيات المطلوبة لـ sharp في الإنتاج
RUN apk add --no-cache \
    vips \
    libc6-compat

WORKDIR /app

# نسخ الملفات المطلوبة من مرحلة البناء
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"] 