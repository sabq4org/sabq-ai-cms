## منصة سبق الذكية (Sabq AI CMS)

نظام إدارة محتوى حديث لبناء وتشغيل غرفة أخبار ذكية باللغة العربية، يعتمد على Next.js 15 وPrisma وPostgreSQL، مع تكاملات الذكاء الاصطناعي والتخزين السحابي للصور.

### لماذا هذا المشروع؟
- **تحرير غني** بمحررات متقدمة وبلوكات ذكية.
- **أداء عالٍ** مع تحسينات للواجهة والصور والتخزين المؤقت.
- **قابلية التوسع** بدعم Redis/Kafka/ClickHouse وDocker/K8s.
- **ذكاء اصطناعي** لتحليل المحتوى، التوصيات، والتلخيص.

---

### التقنيات الأساسية
- **الواجهة**: Next.js 15 (App Router)، React 18، TypeScript 5.9، Tailwind CSS.
- **البيانات**: Prisma 6، PostgreSQL (موصى به Supabase للإنتاج).
- **الكاش والوظائف المساعدة**: Redis، PM2 (للـ clustering)، Nginx (عبر Docker Compose).
- **الذكاء الاصطناعي**: تكامل اختياري مع OpenAI/Anthropic.
- **الصور**: Cloudinary لمعالجة وتخزين الصور.
- **المراقبة والتحليلات**: ClickHouse، Prometheus، Grafana.
- **السجلات**: ElasticSearch + Kibana + Logstash (اختياري).

ملاحظة: تعتمد عمليات البيانات في الإنتاج على Supabase، والصور على Cloudinary.

---

### توزيع المجلدات (نظرة عامة)
- **`app/`**: صفحات Next.js (App Router)، تخطيطات، وRoute Handlers (واجهات API).
- **`components/`**: المكونات المعاد استخدامها، مثل `BlockEditor` ومكونات الواجهات.
- **`lib/`**: وظائف عامة، عملاء خارجيون، أدوات مساعدة.
- **`hooks/`**: React Hooks مخصّصة.
- **`contexts/`**: مزودو السياق لحالة التطبيق.
- **`stores/`**: إدارة الحالة عبر Zustand.
- **`config/`**: تهيئات خارجية (nginx/redis/prometheus/grafana...)
- **`prisma/`**: `schema.prisma` وتعريفات قاعدة البيانات وتوليد العميل.
- **`public/`**: ملفات ثابتة (صور/أيقونات/أصول عامة).
- **`styles/`**: أنماط Tailwind وCSS عام.
- **`scripts/`**: سكربتات Node.js لأعمال الصيانة والنسخ الاحتياطي والاختبارات.
- **`__tests__/`** و**`e2e/`**: اختبارات Jest وPlaywright.
- **`docs/`**: مستندات التوثيق الفنية والتشغيلية.
- **`smart-notifications-system/`** و`smart_notifications_system/`: نظام الإشعارات الذكية.
- **`ml_recommendation_engine/`**: محرك التوصية.
- **`arabic_sentiment_system/`**: تحليل المشاعر بالعربية.
- **`backup-system/`**: أدوات النسخ الاحتياطي.
- **`spa-api/`**: وحدات/خدمات API مساعدة.
- **`nginx/`, `k8s/`**: قوالب نشر وتوجيه للحاويات.

ملفات بارزة:
- **`next.config.js`**: إعداد الصور، Turbopack، رؤوس HTTP، وإستراتيجيات التقطيع.
- **`tsconfig.json`**: مسارات الاستيراد (`@/*`) وخيارات TypeScript.
- **`ecosystem.config.js`**: إعداد PM2 للتشغيل المتعدد العمليات.
- **`Dockerfile` و`docker-compose.yml`**: قوالب نشر وإدارة خدمات (Postgres/Redis/Kafka/ClickHouse/Nginx...).
- **`start.sh`**: تشغيل محلي سريع في وضع التطوير.

---

### التشغيل المحلي (Development)
1. تثبيت المتطلبات: Node.js ≥ 18 (موصى به 20)، npm ≥ 9.
2. نسخ الإعدادات:
   - انسخ `env.example` إلى `.env.local` ثم حدّث القيم الأساسية: `DATABASE_URL`, `JWT_SECRET`, مفاتيح Cloudinary.
   - للإنتاج راجع `env.production.example`.
3. تثبيت التبعيات وتوليد Prisma Client:
   - `npm install`
   - `npx prisma generate`
4. تشغيل الخادم التطويري:
   - `npm run dev` أو عبر `./start.sh`.
5. الواجهة: `http://localhost:3000`

ملاحظة: للإنتاج وللسيرفرات الحية استخدم قاعدة Supabase وعدم الاعتماد على تخزين محلي أثناء التشغيل.

---

### البناء والتشغيل للإنتاج
- بناء: `npm run build`
- تشغيل: `npm start`
- Docker (مُوصى به):
  - بناء وتشغيل: `docker compose up -d`
  - يوفّر خدمات: App + PostgreSQL + Redis + Kafka + ClickHouse + Nginx + ELK + مراقبة.
- PM2:
  - ملف `ecosystem.config.js` للتشغيل في وضع cluster: `pm2 start ecosystem.config.js`.

---

### متغيرات البيئة (أهم القيم)
- **الأساسية**: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`.
- **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **Redis**: `REDIS_URL` (اختياري للكاش).
- **عامّة (Next.js)**: `NEXT_PUBLIC_*` لعناوين الموقع والـ Analytics.
- **ذكاء اصطناعي (اختياري)**: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`.

راجع `env.example` و`env.production.example` لقوائم كاملة مع أمثلة.

---

### قاعدة البيانات
- Prisma مع PostgreSQL (مصدر القيم عبر `DATABASE_URL`).
- أوامر مفيدة:
  - توليد العميل: `npm run prisma:generate`
  - مزامنة/مخطط سريع: `npm run prisma:push`
  - هجرات محلية: `npm run prisma:migrate`
  - استديو: `npm run prisma:studio`

---

### إدارة الصور والأصول
- Next Image مهيّأ لقوائم Remote من: Cloudinary وAWS S3 وسبك (`cdn.sabq.org`) وغيرها عبر `next.config.js`.
- التخزين والمعالجة على Cloudinary.

---

### الاختبارات والجودة
- **Jest** لاختبارات الوحدة والتكامل: `npm test`, `npm run test:watch`, `npm run test:coverage`.
- **Playwright** لاختبارات E2E: `npm run test:e2e`.
- **ESLint** وتهيئة Next: `npm run lint` و`npm run lint:fix`.

---

### مهام وصيانة (نماذج من `package.json`)
- بناء تحليلي: `npm run build:analyze`
- نسخ احتياطي واستعادة: `npm run backup`, `npm run restore`, وأوامر الحالة والجدولة.
- سكربتات تشخيص/إصلاح (صور، تنبيهات، أداء...) داخل `scripts/`.

---

### المساهمة والترخيص
- المساهمة: راجع `CONTRIBUTING.md`.
- الرخصة: `LICENSE` في جذر المشروع.

---

### مراجع إضافية داخل `docs/`
- **البداية السريعة لتحسين الأداء**: `QUICK_START_PERFORMANCE.md`
- **حل المزامنة - التوثيق الكامل**: `SYNC_SOLUTION_DOCUMENTATION.md`
- **تحسينات الأداء المطبّقة**: `APPLIED_PERFORMANCE_IMPROVEMENTS.md`
- **تحليل أداء صفحة التفاصيل**: `performance-analysis-news-detail.md`
- **خطة ترحيل الكوكيز**: `COOKIE_MIGRATION_PLAN.md`
- **كشف الأجهزة المحسّن**: `ENHANCED_DEVICE_DETECTION_GUIDE.md`
- **نسخ/استعادة رموز 2FA**: `2FA_BACKUP_RECOVERY.md`



