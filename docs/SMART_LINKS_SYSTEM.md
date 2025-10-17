# 🔗 نظام الروابط الذكية (Smart Links System)

## 📋 نظرة عامة

نظام الروابط الذكية هو ميزة متقدمة في منصة سبق الذكية تستخدم الذكاء الاصطناعي لاستخراج الكيانات من المقالات واقتراح روابط تشعبية داخلية تلقائياً، مع إمكانية إنشاء صفحات تعريفية للكيانات.

---

## 🎯 الأهداف

1. **تحسين SEO**: زيادة الروابط الداخلية وتحسين بنية الموقع
2. **تحسين تجربة المستخدم**: توفير سياق إضافي وروابط ذات صلة
3. **توفير الوقت**: أتمتة عملية إضافة الروابط اليدوية
4. **بناء شبكة معرفية**: ربط المحتوى ذي الصلة تلقائياً

---

## 🏗️ البنية المعمارية (Architecture)

### Pipeline

```
Article Content
    ↓
AI Entity Extraction (OpenAI)
    ↓
Scoring & Confidence Calculation
    ↓
Link Decision (auto/suggest/skip)
    ↓
Editor Review & Approval
    ↓
Insert Link Tags
    ↓
Optional: Generate Entity Page
```

### المكونات الرئيسية

#### 1. **AI Extractor Service**
- استخراج الكيانات باستخدام OpenAI GPT-4
- تحديد نوع الكيان (شخص، منظمة، مكان، حدث، مصطلح)
- حساب مستوى الثقة (0.0-1.0)

#### 2. **Knowledge Graph / smart_entities DB**
- قاعدة بيانات الكيانات
- المرادفات والأسماء البديلة
- الصفحات المرتبطة
- عداد الاستخدام

#### 3. **Link Decision Service**
- قواعد اتخاذ القرار
- السياسات التحريرية
- عتبات الثقة

#### 4. **Editor UI Plugin**
- واجهة المحرر
- عرض الاقتراحات
- قبول/رفض الروابط
- معاينة الروابط

#### 5. **Background Worker (Queue)**
- إنشاء الصفحات التلقائية
- تحديث الإحصائيات
- التخزين المؤقت

#### 6. **Audit & Moderation**
- سجل التغييرات
- موافقة المحرر
- التحليلات

---

## 📊 نموذج البيانات (Data Model)

### الجداول الرئيسية

#### 1. SmartEntity
```prisma
model SmartEntity {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique
  type         SmartEntityType
  aliases      String[] // مرادفات
  description  String?
  canonicalUrl String?  // الرابط الأساسي
  sourceCount  Int      @default(0)
  importance   Float    @default(1.0)
  metadata     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  isActive     Boolean  @default(true)
  isSensitive  Boolean  @default(false)
  
  mentions     SmartEntityMention[]
}
```

#### 2. SmartEntityMention
```prisma
model SmartEntityMention {
  id          String   @id @default(cuid())
  articleId   String
  entityId    String
  text        String
  normalized  String
  position    Int
  endPosition Int
  context     String?
  confidence  Float
  linkType    SmartLinkType
  linkUrl     String?
  status      SmartLinkStatus
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  approvedBy  String?
  approvedAt  DateTime?
  
  entity      SmartEntity @relation(...)
  article     articles    @relation(...)
}
```

#### 3. SmartLinkAnalysis
```prisma
model SmartLinkAnalysis {
  id             String   @id @default(cuid())
  articleId      String   @unique
  content        String
  rawResponse    Json?
  entityCount    Int      @default(0)
  suggestedCount Int      @default(0)
  acceptedCount  Int      @default(0)
  rejectedCount  Int      @default(0)
  cost           Float?
  processingTime Int?
  status         AnalysisStatus
  error          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  article        articles @relation(...)
}
```

#### 4. SmartLinkSettings
```prisma
model SmartLinkSettings {
  id                     String   @id @default(cuid())
  enableAutoLinks        Boolean  @default(true)
  confidenceThreshold    Float    @default(0.7)
  autoInsertThreshold    Float    @default(0.9)
  maxLinksPerParagraph   Int      @default(1)
  maxLinksPerArticle     Int      @default(20)
  stopTerms              String[]
  enableAutoPageCreation Boolean  @default(false)
  autoPageThreshold      Int      @default(3)
  enableSensitiveCheck   Boolean  @default(true)
  updatedAt              DateTime @updatedAt
  updatedBy              String?
}
```

#### 5. SmartLinkActivityLog
```prisma
model SmartLinkActivityLog {
  id        String   @id @default(cuid())
  articleId String?
  entityId  String?
  mentionId String?
  action    SmartLinkAction
  userId    String?
  metadata  Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}
```

### الأنواع (Enums)

```prisma
enum SmartEntityType {
  PERSON
  ORGANIZATION
  PLACE
  EVENT
  TERM
  TOPIC
  OTHER
}

enum SmartLinkType {
  INTERNAL
  ENTITY_PAGE
  TAG
  CATEGORY
  EXTERNAL
}

enum SmartLinkStatus {
  SUGGESTED
  ACCEPTED
  REJECTED
  AUTO_INSERTED
  REMOVED
}

enum AnalysisStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum SmartLinkAction {
  ANALYZE
  SUGGEST
  ACCEPT
  REJECT
  INSERT
  REMOVE
  CREATE_ENTITY
  UPDATE_ENTITY
  DELETE_ENTITY
  CREATE_PAGE
}
```

---

## 🔌 API Endpoints

### 1. تحليل المقال
```
POST /api/smart-links/analyze

Body:
{
  "articleId": "article_123",
  "content": "نص المقال..."
}

Response:
{
  "success": true,
  "data": {
    "articleId": "article_123",
    "entities": [...],
    "suggestions": [...],
    "stats": {
      "totalEntities": 15,
      "autoInsert": 5,
      "suggested": 8,
      "skipped": 2,
      "processingTime": 1234
    }
  }
}
```

### 2. إدراج الروابط
```
POST /api/smart-links/insert

Body:
{
  "articleId": "article_123",
  "mentions": [
    {
      "start": 100,
      "end": 120,
      "entityId": "entity_456",
      "linkType": "INTERNAL",
      "linkUrl": "/entity/mohammed-bin-salman",
      "text": "محمد بن سلمان",
      "normalized": "محمد بن سلمان",
      "confidence": 0.95
    }
  ]
}

Response:
{
  "success": true,
  "insertedCount": 5
}
```

### 3. إنشاء صفحة كيان
```
POST /api/smart-entities/create-page

Body:
{
  "entityId": "entity_456"
}

Response:
{
  "success": true,
  "pageUrl": "/entity/mohammed-bin-salman"
}
```

### 4. جلب معلومات الكيان
```
GET /api/smart-entities/:slug

Response:
{
  "success": true,
  "data": {
    "id": "entity_456",
    "name": "محمد بن سلمان",
    "slug": "mohammed-bin-salman",
    "type": "PERSON",
    "description": "ولي العهد السعودي...",
    "canonicalUrl": "/entity/mohammed-bin-salman",
    "sourceCount": 150,
    "importance": 9.5,
    "relatedArticles": [...]
  }
}
```

---

## 🎨 واجهة المحرر (Editor UI)

### المكونات

#### 1. SmartLinksSidebar
الشريط الجانبي الذي يعرض اقتراحات الروابط:

```tsx
import { SmartLinksSidebar } from '@/components/editor/SmartLinksSidebar';

<SmartLinksSidebar
  articleId={articleId}
  suggestions={suggestions}
  onAccept={(suggestion) => handleAccept(suggestion)}
  onReject={(suggestion) => handleReject(suggestion)}
  onCreatePage={(suggestion) => handleCreatePage(suggestion)}
  onPreview={(suggestion) => handlePreview(suggestion)}
  isLoading={isAnalyzing}
/>
```

**الميزات:**
- عرض الاقتراحات مع مستوى الثقة
- تصفية حسب النوع (تلقائي/مقترح)
- ترتيب حسب الثقة أو الموقع
- إحصائيات فورية
- معاينة الروابط

#### 2. useSmartLinks Hook
Hook لإدارة حالة الروابط الذكية:

```tsx
import { useSmartLinks } from '@/hooks/useSmartLinks';

const {
  isAnalyzing,
  isInserting,
  suggestions,
  acceptedSuggestions,
  analyzeArticle,
  acceptSuggestion,
  rejectSuggestion,
  insertAcceptedLinks,
  stats
} = useSmartLinks({
  articleId,
  onAnalysisComplete: (result) => console.log(result),
  onLinkInserted: (count) => toast.success(`تم إدراج ${count} رابط`)
});
```

**الوظائف:**
- `analyzeArticle(content)`: تحليل المقال
- `acceptSuggestion(suggestion)`: قبول اقتراح
- `rejectSuggestion(suggestion)`: رفض اقتراح
- `acceptAllSuggestions()`: قبول الكل
- `insertAcceptedLinks()`: إدراج الروابط المقبولة
- `createEntityPage(suggestion)`: إنشاء صفحة كيان

---

## 🔧 قواعد الإدراج (Insertion Policy)

### 1. أنواع الروابط المسموح بها
- ✅ صفحات داخلية (articles, tags, reporters, topic-pages)
- ✅ صفحات تعريف ذكي (auto-generated entity pages)
- ⚠️ روابط خارجية (فقط بموافقة تحريرية)

### 2. عتبات الثقة (Confidence Thresholds)

| الثقة | الإجراء | الوصف |
|-------|---------|-------|
| ≥ 0.90 | إدراج تلقائي | ثقة عالية جداً - يتم الإدراج مباشرة |
| 0.70 - 0.89 | اقتراح | ثقة جيدة - يُعرض على المحرر |
| < 0.70 | تجاهل | ثقة منخفضة - لا يُقترح |

### 3. قيود التحرير

#### حد التكرار
- حد أقصى **1 رابط** لنفس المصطلح في الفقرة الواحدة
- حد أقصى **20 رابط** في المقال الواحد

#### المصطلحات الممنوعة (Stop Terms)
```javascript
const STOP_TERMS = [
  'اليوم', 'الخبر', 'الموعد', 'الوقت', 'المكان',
  'قال', 'ذكر', 'أضاف', 'أوضح', 'أكد',
  'هذا', 'ذلك', 'هذه', 'تلك'
];
```

#### الكيانات الحساسة
- لا تربط الأسماء في القضايا القانونية إلا بموافقة محرر
- لا تربط البيانات الشخصية الحساسة
- تفعيل علامة `isSensitive` للكيانات الحساسة

### 4. سلوك التكرار
- **الوقوع الأول**: يُربط كـ canonical link
- **التكرارات**: tooltip أو no-link

---

## 🤖 برومبت OpenAI

### النسخة الموحدة

```javascript
import { SABQ_SMART_LINKS_PROMPT } from '@/lib/ai/sabq-prompts-library';

const userPrompt = SABQ_SMART_LINKS_PROMPT.userPromptTemplate(content);

const response = await openai.chat.completions.create({
  model: SABQ_SMART_LINKS_PROMPT.settings.model, // gpt-4.1-mini
  messages: [
    { role: 'system', content: SABQ_SMART_LINKS_PROMPT.systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  temperature: SABQ_SMART_LINKS_PROMPT.settings.temperature, // 0.1
  max_tokens: SABQ_SMART_LINKS_PROMPT.settings.max_tokens, // 1000
  response_format: { type: 'json_object' }
});
```

### مثال الاستجابة

```json
{
  "entities": [
    {
      "text": "محمد بن سلمان",
      "normalized": "محمد بن سلمان",
      "type": "PERSON",
      "start": 45,
      "end": 60,
      "confidence": 0.98,
      "candidateLinks": [
        {
          "title": "محمد بن سلمان - ولي العهد",
          "url": "/entity/mohammed-bin-salman",
          "description": "ولي العهد السعودي...",
          "sourceType": "entity",
          "matchScore": 1.0
        }
      ],
      "justification": "اسم شخصية عامة معروفة مع منصب رسمي"
    }
  ]
}
```

---

## 📈 الأداء والتكلفة

### Queueing
استخدام **BullMQ + Redis** لإدارة الطلبات:

```javascript
import { Queue } from 'bullmq';

const smartLinksQueue = new Queue('smart-links', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// إضافة مهمة
await smartLinksQueue.add('analyze', {
  articleId,
  content
});
```

### Caching
تخزين مؤقت للنتائج:

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// حفظ في الكاش
await redis.setex(
  `smart-links:${articleId}`,
  86400, // 24 ساعة
  JSON.stringify(result)
);

// جلب من الكاش
const cached = await redis.get(`smart-links:${articleId}`);
```

### Rate Limits & Fallback
```javascript
try {
  const result = await analyzeWithOpenAI(content);
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    // استخدام fallback محلي
    const result = await analyzeWithLocalNER(content);
    toast.warning('AI unavailable - using fallback');
  }
}
```

### تقدير التكلفة

| النموذج | السعر/1K tokens | متوسط المقال | التكلفة/مقال |
|---------|-----------------|--------------|---------------|
| GPT-4.1-mini | $0.15 | 2000 tokens | $0.30 |
| GPT-4.1-nano | $0.05 | 2000 tokens | $0.10 |

**التوصية**: استخدام `gpt-4.1-nano` للتحليل الأولي و `gpt-4.1-mini` للحالات المعقدة.

---

## 🔒 الأمان والتحذيرات

### 1. منع الروابط الحساسة
```javascript
if (entity.isSensitive) {
  // توجيه للمراجعة الإنسانية
  return {
    action: 'review',
    reason: 'كيان حساس يحتاج موافقة محرر'
  };
}
```

### 2. سجلات التغييرات (Activity Logs)
كل عملية تُسجل في `SmartLinkActivityLog`:

```javascript
await prisma.smartLinkActivityLog.create({
  data: {
    articleId,
    entityId,
    action: 'INSERT',
    userId,
    metadata: { linkUrl, confidence },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  }
});
```

### 3. توافق سياسات النشر
```javascript
// فقط محرر أو أعلى يمكنه إنشاء صفحات كيانات
if (session.user?.role !== 'editor' && session.user?.role !== 'admin') {
  return NextResponse.json(
    { error: 'صلاحيات غير كافية' },
    { status: 403 }
  );
}
```

---

## 📅 خطة التنفيذ (MVP - أسبوعان)

### الأسبوع 1

#### اليوم 1-2: البنية التحتية
- ✅ إنشاء نماذج Prisma
- ✅ تشغيل migrations
- ✅ إعداد OpenAI API

#### اليوم 3-4: الخدمات الأساسية
- ✅ `SmartLinksService` class
- ✅ API endpoint `/analyze`
- ✅ تخزين النتائج في DB

#### اليوم 5: واجهة المحرر
- ✅ `SmartLinksSidebar` component
- ✅ عرض الاقتراحات
- ✅ قبول/رفض

### الأسبوع 2

#### اليوم 6-7: الإدراج
- ✅ API endpoint `/insert`
- ✅ Inline insertion flow
- ✅ تحديث المقال

#### اليوم 8-9: صفحات الكيانات
- ✅ Auto-page generator
- ✅ SEO basics (meta, schema.org)
- ✅ صفحة عرض الكيان

#### اليوم 10: التحسينات
- ✅ Caching + Queue
- ✅ قواعد الإشراف (moderation)
- ✅ Telemetry & metrics

---

## 📊 مؤشرات النجاح (KPIs)

### بعد شهر واحد

| المؤشر | الهدف | كيفية القياس |
|--------|-------|--------------|
| **معدل قبول الاقتراحات** | > 40% | `acceptedCount / suggestedCount` |
| **توفير الوقت** | ≥ 60% | مقارنة الوقت قبل/بعد |
| **نسبة المقالات المربوطة** | 70% | مقالات بـ ≥1 رابط ذكي |
| **تكلفة OpenAI** | < $100/1000 مقال | مراقبة `cost` في DB |
| **وقت المعالجة** | < 5 ثوانٍ | متوسط `processingTime` |
| **دقة الكيانات** | > 85% | مراجعة عينة عشوائية |

### Dashboard للمراقبة

```sql
-- معدل القبول
SELECT 
  COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) * 100.0 / COUNT(*) as acceptance_rate
FROM smart_entity_mentions
WHERE created_at >= NOW() - INTERVAL '30 days';

-- متوسط الثقة
SELECT AVG(confidence) as avg_confidence
FROM smart_entity_mentions
WHERE status = 'ACCEPTED';

-- أكثر الكيانات استخداماً
SELECT e.name, e.source_count
FROM smart_entities e
ORDER BY e.source_count DESC
LIMIT 10;

-- التكلفة الإجمالية
SELECT SUM(cost) as total_cost, AVG(cost) as avg_cost
FROM smart_link_analysis
WHERE created_at >= NOW() - INTERVAL '30 days';
```

---

## 🎓 أمثلة الاستخدام

### مثال كامل: تحليل وإدراج

```tsx
'use client';

import { useState } from 'react';
import { useSmartLinks } from '@/hooks/useSmartLinks';
import { SmartLinksSidebar } from '@/components/editor/SmartLinksSidebar';

export default function ArticleEditor({ articleId, initialContent }) {
  const [content, setContent] = useState(initialContent);
  
  const {
    isAnalyzing,
    isInserting,
    suggestions,
    acceptedSuggestions,
    analyzeArticle,
    acceptSuggestion,
    rejectSuggestion,
    insertAcceptedLinks,
    createEntityPage,
    stats
  } = useSmartLinks({
    articleId,
    onLinkInserted: (count) => {
      alert(`تم إدراج ${count} رابط بنجاح!`);
    }
  });

  const handleAnalyze = async () => {
    await analyzeArticle(content);
  };

  const handleInsert = async () => {
    await insertAcceptedLinks();
  };

  return (
    <div className="flex h-screen">
      {/* المحرر */}
      <div className="flex-1 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full p-4 border rounded"
        />
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isAnalyzing ? 'جاري التحليل...' : 'تحليل الروابط'}
          </button>
          
          <button
            onClick={handleInsert}
            disabled={isInserting || acceptedSuggestions.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {isInserting ? 'جاري الإدراج...' : `إدراج ${acceptedSuggestions.length} رابط`}
          </button>
        </div>
        
        {/* الإحصائيات */}
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">الإحصائيات</h3>
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div>الإجمالي: {stats.total}</div>
            <div>المقبول: {stats.accepted}</div>
            <div>المرفوض: {stats.rejected}</div>
            <div>المعلق: {stats.pending}</div>
          </div>
        </div>
      </div>

      {/* الشريط الجانبي */}
      <div className="w-96 border-l">
        <SmartLinksSidebar
          articleId={articleId}
          suggestions={suggestions}
          onAccept={acceptSuggestion}
          onReject={rejectSuggestion}
          onCreatePage={createEntityPage}
          onPreview={(s) => console.log('Preview:', s)}
          isLoading={isAnalyzing}
        />
      </div>
    </div>
  );
}
```

---

## 🔄 التحديثات المستقبلية

### المرحلة 2 (الشهر الثاني)
- [ ] تحليل الصور واستخراج الكيانات منها
- [ ] دعم اللغات المتعددة
- [ ] تحسين دقة الكيانات بالتعلم الآلي
- [ ] واجهة إدارة الكيانات المتقدمة

### المرحلة 3 (الشهر الثالث)
- [ ] شبكة المعرفة التفاعلية (Knowledge Graph)
- [ ] توصيات ذكية للمقالات ذات الصلة
- [ ] تحليلات متقدمة للأداء
- [ ] API عام للمطورين

---

## 📚 المراجع

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Schema.org for Entities](https://schema.org/Person)

---

**الإصدار**: 1.0.0  
**آخر تحديث**: 17 أكتوبر 2025  
**المسؤول**: فريق سبق الذكية - قسم الذكاء الاصطناعي

---

## 🎉 الخلاصة

نظام الروابط الذكية هو إضافة قوية لمنصة سبق الذكية تجمع بين:
- ✅ **الذكاء الاصطناعي المتقدم** (OpenAI GPT-4)
- ✅ **تجربة محرر ممتازة** (React + Tailwind)
- ✅ **بنية تحتية قوية** (Prisma + Redis + Queue)
- ✅ **أمان وتحكم كامل** (Audit logs + Permissions)
- ✅ **قابلية التوسع** (Caching + Background jobs)

**النتيجة المتوقعة**: 
- تحسين SEO بنسبة **+30%**
- توفير وقت المحررين بنسبة **-60%**
- زيادة الروابط الداخلية بنسبة **+200%**
- تحسين تجربة المستخدم بنسبة **+50%**

