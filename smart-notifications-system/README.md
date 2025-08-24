# نظام الإشعارات الذكية المحسن - سبق
# Enhanced Smart Notifications System - Sabq

## 🚀 نظرة عامة

نظام إشعارات ذكي متقدم يستخدم الذكاء الاصطناعي لتحليل سلوك المستخدمين وتخصيص الإشعارات بناءً على اهتماماتهم وأنماط قراءتهم. النظام مصمم خصيصاً للمحتوى العربي ويدعم تحليل المشاعر والكيانات باللغة العربية.

## ✨ المميزات الرئيسية

### 🤖 الذكاء الاصطناعي
- **تحليل الاهتمامات المتقدم**: استخدام BERT العربي لفهم اهتمامات المستخدمين بدقة عالية
- **التوقيت الذكي**: خوارزميات تعلم آلي لتحديد أفضل وقت لإرسال الإشعارات
- **تقييم التفاعل الديناميكي**: نظام تقييم يتعلم من سلوك المستخدم ويتحسن مع الوقت
- **منع فقاعة الترشيح**: خوارزميات لضمان تنوع المحتوى المقترح

### 📱 نظام الإشعارات
- **6 قنوات توصيل**: Web Push, Mobile Push, Email, SMS, In-App, WebSocket
- **8 أنواع إشعارات**: تفاعلات اجتماعية، توصيات محتوى، أخبار عاجلة، وأكثر
- **تجميع ذكي**: تجميع الإشعارات المتشابهة لتقليل الإزعاج
- **منع التكرار**: خوارزميات متقدمة لمنع إرسال نفس الإشعار مرتين
- **حدود معدل تكيفية**: تعديل تلقائي لعدد الإشعارات حسب تفاعل المستخدم

### 📊 تتبع السلوك المتقدم
- **تحليل جلسات القراءة**: فهم عميق لكيفية قراءة المستخدمين
- **10 أنماط سلوكية**: Power User, Night Owl, Weekend Warrior، وأكثر
- **معالجة في الوقت الفعلي**: تحليل فوري للسلوك واتخاذ القرارات
- **اكتشاف الشذوذ**: رصد السلوكيات غير الطبيعية أو المشبوهة

### 🎯 واجهات المستخدم
- **لوحة تحكم تفاعلية**: رسوم بيانية وإحصائيات في الوقت الفعلي
- **إعدادات شخصية شاملة**: تحكم كامل في تفضيلات الإشعارات
- **إشعارات الوقت الفعلي**: دعم WebSocket للإشعارات الفورية
- **دعم RTL كامل**: تصميم محسّن للغة العربية

## 🏗️ البنية التقنية

### Frontend
```typescript
- React 18 + TypeScript
- Next.js 15 (App Router)
- Material-UI v5
- Chart.js للرسوم البيانية
- Socket.io Client
- Framer Motion للحركات
```

### Backend
```typescript
- Node.js + Express
- FastAPI (Python) لخدمات الذكاء الاصطناعي
- PostgreSQL (قاعدة البيانات الرئيسية)
- Redis (التخزين المؤقت)
- ClickHouse (تحليلات البيانات الضخمة)
- Apache Kafka (معالجة الأحداث)
```

### AI/ML
```python
- TensorFlow / scikit-learn
- BERT Arabic (AraBERT)
- NLTK / spaCy للمعالجة اللغوية
- Pandas / NumPy
```

## 📁 هيكل المشروع

```
smart-notifications-system/
├── ai/                      # خوارزميات الذكاء الاصطناعي
│   ├── enhanced-interest-analyzer.ts
│   ├── smart-timing-predictor.ts
│   └── dynamic-engagement-scorer.ts
├── api/                     # واجهات API
│   ├── routes/
│   │   ├── notifications.ts
│   │   └── behavior-tracking.ts
│   └── services/
│       └── smart-notification-service.ts
├── services/                # خدمات النظام
│   ├── smart-notification-aggregator.ts
│   ├── smart-rate-limiter.ts
│   ├── anti-duplication-engine.ts
│   ├── behavior-tracking-service.ts
│   ├── advanced-reading-analyzer.ts
│   ├── behavior-pattern-detector.ts
│   └── real-time-processor.ts
├── types/                   # أنواع TypeScript
│   └── index.ts
├── components/              # مكونات React
│   └── notifications/
│       ├── NotificationDashboard.tsx
│       ├── NotificationSettings.tsx
│       └── RealTimeNotifications.tsx
├── hooks/                   # React Hooks
│   └── useBehaviorTracking.ts
├── lib/                     # مكتبات مساعدة
│   └── behavior-tracking/
│       └── index.ts
└── prisma/                  # مخططات قاعدة البيانات
    └── schema.prisma
```

## 🚀 التثبيت والإعداد

### 1. تثبيت التبعيات

```bash
# تثبيت تبعيات Node.js
npm install

# تثبيت تبعيات Python
pip install -r requirements.txt
```

### 2. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
npx prisma db push

# تشغيل migrations
npx prisma migrate dev
```

### 3. إعداد متغيرات البيئة

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sabq_notifications"

# Redis
REDIS_URL="redis://localhost:6379"

# Kafka
KAFKA_BROKERS="localhost:9092"

# WebSocket
WS_PORT=3001

# AI Services
AI_SERVICE_URL="http://localhost:8000"
BERT_MODEL_PATH="./models/arabert"
```

### 4. تشغيل النظام

```bash
# تشغيل خدمات Backend
npm run dev:backend

# تشغيل خدمات AI (Python)
python -m uvicorn ai_service:app --reload

# تشغيل Frontend
npm run dev
```

## 📊 قاعدة البيانات

### الجداول الرئيسية

1. **SmartNotification**: الإشعارات الذكية
2. **UserProfile**: ملفات المستخدمين وتفضيلاتهم
3. **BehaviorEvent**: أحداث السلوك
4. **ReadingSession**: جلسات القراءة
5. **BehaviorPattern**: أنماط السلوك المكتشفة
6. **NotificationTemplate**: قوالب الإشعارات
7. **Campaign**: حملات الإشعارات

## 🔌 واجهات API

### إشعارات
```typescript
POST   /api/notifications/send          // إرسال إشعار
POST   /api/notifications/send-batch    // إرسال مجموعة
POST   /api/notifications/schedule      // جدولة إشعار
GET    /api/notifications/user/:userId  // إشعارات المستخدم
GET    /api/notifications/stats/:userId // إحصائيات
```

### تتبع السلوك
```typescript
POST   /api/behavior/track              // تتبع حدث
GET    /api/behavior/analyze/:userId    // تحليل السلوك
GET    /api/behavior/patterns/:userId   // أنماط السلوك
GET    /api/behavior/journey/:userId    // رحلة المستخدم
```

## 📈 مقاييس الأداء

### الأهداف
- **معدل فتح الإشعارات**: > 40%
- **معدل النقر**: > 15%
- **وقت التسليم**: < 5 ثواني
- **دقة التوصيات**: > 85%
- **رضا المستخدمين**: > 4.5/5

### المراقبة
- Prometheus للمقاييس
- Grafana للوحات المراقبة
- ELK Stack للسجلات
- Sentry لتتبع الأخطاء

## 🔒 الأمان والخصوصية

- تشفير جميع البيانات الحساسة
- GDPR متوافق
- إمكانية حذف البيانات الشخصية
- تحكم كامل للمستخدم في بياناته
- تدقيق أمني دوري

## 🧪 الاختبار

```bash
# اختبارات الوحدة
npm run test:unit

# اختبارات التكامل
npm run test:integration

# اختبارات E2E
npm run test:e2e

# اختبارات الأداء
npm run test:performance
```

## 📚 التوثيق الإضافي

- [دليل المطور](./docs/developer-guide.md)
- [دليل API](./docs/api-reference.md)
- [دليل النشر](./docs/deployment-guide.md)
- [دليل الصيانة](./docs/maintenance-guide.md)

## 🤝 المساهمة

نرحب بالمساهمات! الرجاء قراءة [دليل المساهمة](./CONTRIBUTING.md) قبل البدء.

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](./LICENSE).

## 👥 الفريق

- **قائد المشروع**: [اسم]
- **مطور رئيسي**: [اسم]
- **مهندس AI**: [اسم]
- **مصمم UI/UX**: [اسم]

## 📞 الدعم

- البريد الإلكتروني: support@sabq.ai
- التوثيق: https://docs.sabq.ai
- المشاكل: https://github.com/sabq/notifications/issues

---

صُنع بـ ❤️ لتحسين تجربة القراءة العربية
