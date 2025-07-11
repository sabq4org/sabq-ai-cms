# Multi-stage build للحصول على حجم أصغر
FROM node:20-alpine AS deps
# تثبيت libc6-compat مطلوب للألبين
RUN apk add --no-cache libc6-compat
WORKDIR /app

# نسخ ملفات التبعيات
COPY package.json package-lock.json ./
COPY prisma ./prisma/
# نسخ السكريبتات المطلوبة لـ postinstall
COPY scripts ./scripts/
# إنشاء مجلد lib/generated المطلوب لـ Prisma
RUN mkdir -p lib/generated

# تثبيت التبعيات مع إصلاح مشاكل التبعيات
# نحتاج لتثبيت كل التبعيات أولاً لتشغيل postinstall
RUN npm install --legacy-peer-deps
# بعد تشغيل postinstall، نحذف devDependencies
RUN npm prune --production

# مرحلة البناء
FROM node:20-alpine AS builder
WORKDIR /app

# نسخ التبعيات من المرحلة السابقة
COPY --from=deps /app/node_modules ./node_modules
# نسخ السكريبتات أولاً
COPY scripts ./scripts
COPY . .

# متغيرات البيئة للبناء
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1

# إضافة DATABASE_URL مؤقت للبناء إذا لم يكن موجوداً
ENV DATABASE_URL=${DATABASE_URL:-mysql://build:build@localhost:3306/build?ssl={"rejectUnauthorized":false}}

# تشغيل سكريبت التحضير للبناء على DigitalOcean
RUN node scripts/digitalocean-build.js || echo "No build script found, continuing..."

# توليد Prisma Client مع fallback
RUN npx prisma generate || node scripts/fix-prisma-generation.js || echo "Prisma generation failed, using fallback"

# البناء
RUN npm run build

# مرحلة الإنتاج
FROM node:20-alpine AS runner
WORKDIR /app

# إنشاء مستخدم غير root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# نسخ الملفات الضرورية فقط
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# نسخ ملفات Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# نسخ Prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# التبديل للمستخدم غير root
USER nextjs

# المنفذ
EXPOSE 3000

# متغيرات البيئة
ENV PORT=3000
ENV NODE_ENV=production

# البدء
CMD ["node", "server.js"] 