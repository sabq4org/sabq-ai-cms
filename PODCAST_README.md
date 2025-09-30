# 🎙️ نظام البودكاست الذكي - سبق

نظام بودكاست متطور ومتكامل مصمم خصيصاً لموقع سبق الذكية، يدعم التشغيل الذكي والتحليلات المتقدمة.

## 🌟 المميزات الرئيسية

### 🎵 مشغل البودكاست
- **تشغيل متقدم**: تحكم كامل في التشغيل والإيقاف والترجيع/التقديم
- **مشغل مصغر**: يظل ثابتاً أثناء التنقل في الموقع
- **موجات صوتية متحركة**: تأثيرات بصرية جذابة أثناء التشغيل
- **حفظ الموضع**: يحفظ موضع التوقف تلقائياً
- **سرعة التشغيل**: إمكانية تغيير سرعة التشغيل (0.5x - 2x)

### 📱 تصميم متجاوب
- **موبايل فيرست**: محسن للهواتف الذكية والأجهزة اللوحية
- **الوضع المظلم/الفاتح**: دعم كامل لتبديل الأوضاع
- **تصميم عصري**: استخدام Tailwind CSS و Radix UI
- **حركات سلسة**: رسوم متحركة بواسطة Framer Motion

### 🎯 نظام الفئات الذكي
- **تصنيف متقدم**: فئات ملونة مع أيقونات مميزة
- **تصفية ذكية**: تصفية سريعة حسب الفئة أو المحتوى
- **بحث نصي**: بحث في العناوين والأوصاف
- **ترتيب ذكي**: ترتيب حسب الشعبية والتاريخ

### 📊 تحليلات متقدمة
- **إحصائيات التشغيل**: عدد الاستماع لكل حلقة
- **تتبع التفاعل**: إعجابات، مشاركات، تحميلات
- **نسبة الإكمال**: تتبع مدى استماع المستخدمين للحلقة
- **تحليل الجمهور**: إحصائيات تفصيلية عن المستمعين

## 🏗️ البنية التقنية

### Frontend
```
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI Components
- Framer Motion
- Lucide Icons
```

### Backend & Database
```
- Prisma ORM
- PostgreSQL
- RESTful APIs
- File Upload Support
- Caching Layer
```

### Audio Features
```
- HTML5 Audio API
- Progressive Loading
- Waveform Visualization
- Audio Compression
- Multiple Format Support
```

## 📁 هيكل المشروع

```
📦 podcast-system/
├── 🎵 components/
│   ├── home/
│   │   └── IntelligentPodcastBlock.tsx    # المكون الرئيسي
│   └── ui/
│       └── AudioWave.tsx                  # موجات الصوت
├── 🔌 app/api/podcast/
│   ├── episodes/route.ts                  # API الحلقات
│   └── categories/route.ts                # API الفئات
├── 📄 app/podcast/
│   └── page.tsx                          # صفحة البودكاست الكاملة
├── 🗃️ prisma/
│   └── podcast_models.prisma             # نماذج قاعدة البيانات
├── 🎨 styles/
│   └── podcast-block.css                 # أنماط مخصصة
└── 📚 database/
    └── podcast_schema.sql                # مخطط قاعدة البيانات
```

## 🚀 التثبيت والإعداد

### 1. تثبيت التبعيات
```bash
npm install @radix-ui/react-card @radix-ui/react-button
npm install @radix-ui/react-badge @radix-ui/react-avatar
npm install framer-motion lucide-react
npm install prisma @prisma/client
```

### 2. إعداد قاعدة البيانات
```bash
# إنشاء مخطط قاعدة البيانات
psql -h localhost -U username -d database_name -f database/podcast_schema.sql

# تشغيل Prisma
npx prisma generate
npx prisma db push
```

### 3. متغيرات البيئة
```bash
# نسخ ملف البيئة
cp .env.podcast.example .env.local

# تحرير المتغيرات
vim .env.local
```

### 4. تشغيل التطوير
```bash
npm run dev
```

## 🎛️ استخدام النظام

### إضافة البودكاست للصفحة الرئيسية
```tsx
import { IntelligentPodcastBlock } from '@/components/home/IntelligentPodcastBlock';

export default function HomePage() {
  return (
    <div>
      {/* محتوى الصفحة */}
      <IntelligentPodcastBlock />
      {/* باقي المحتوى */}
    </div>
  );
}
```

### API استخدام
```typescript
// جلب الحلقات
const response = await fetch('/api/podcast/episodes?limit=5&featured=true');
const { episodes } = await response.json();

// تسجيل تشغيل حلقة
await fetch('/api/podcast/episodes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    episodeId: '1',
    action: 'play',
    playPosition: 120
  })
});
```

### إضافة حلقة جديدة
```typescript
const newEpisode = {
  title: 'عنوان الحلقة',
  description: 'وصف الحلقة',
  audioUrl: '/audio/episode.mp3',
  duration: 300,
  category: 'التكنولوجيا',
  voiceName: 'اسم المتحدث'
};
```

## ⚙️ التكوين المتقدم

### إعدادات المشغل
```typescript
const audioConfig = {
  autoplay: false,
  preload: 'metadata',
  crossOrigin: 'anonymous',
  playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
  skipBackward: 15, // ثانية
  skipForward: 30,  // ثانية
};
```

### إعدادات التحليلات
```typescript
const analyticsConfig = {
  trackPlay: true,
  trackPause: true,
  trackComplete: true,
  trackProgress: true,
  progressIntervals: [25, 50, 75, 90], // نسب مئوية
};
```

## 🎨 التخصيص والأنماط

### ألوان الفئات
```css
.category-economy { color: #10B981; }
.category-technology { color: #3B82F6; }
.category-education { color: #8B5CF6; }
.category-analysis { color: #F59E0B; }
.category-health { color: #EF4444; }
```

### أنماط مخصصة
```css
.podcast-wave {
  animation: audioWave 1.5s ease-in-out infinite;
}

@keyframes audioWave {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.5); }
}
```

## 🔧 الصيانة والتحديث

### نسخ احتياطية دورية
```bash
# نسخة احتياطية يومية
pg_dump database_name > backup_$(date +%Y%m%d).sql

# تنظيف الإحصائيات القديمة
DELETE FROM podcast_interactions WHERE created_at < NOW() - INTERVAL '1 year';
```

### تحسين الأداء
```sql
-- إعادة بناء المؤشرات
REINDEX TABLE podcast_episodes;
REINDEX TABLE podcast_interactions;

-- تحليل الجداول
ANALYZE podcast_episodes;
ANALYZE podcast_interactions;
```

## 📈 المقاييس والتحليلات

### المقاييس المهمة
- **معدل الاستماع**: نسبة الحلقات المستمعة إلى المعروضة
- **مدة الاستماع المتوسطة**: متوسط وقت الاستماع لكل مستخدم
- **معدل الإكمال**: نسبة المستمعين الذين أكملوا الحلقة
- **الحلقات الأكثر شعبية**: ترتيب حسب عدد الاستماع

### تقارير دورية
```sql
-- تقرير أسبوعي للحلقات الأكثر استماعاً
SELECT title, play_count, like_count, 
       AVG(completion_rate) as avg_completion
FROM podcast_episodes pe
JOIN podcast_interactions pi ON pe.id = pi.episode_id
WHERE pi.created_at >= NOW() - INTERVAL '7 days'
GROUP BY pe.id, pe.title, pe.play_count, pe.like_count
ORDER BY play_count DESC
LIMIT 10;
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة
1. **لا يتم تشغيل الصوت**: تحقق من صيغة الملف ومسار URL
2. **بطء التحميل**: تحقق من CDN وضغط الملفات
3. **أخطاء قاعدة البيانات**: تحقق من الاتصال والصلاحيات

### سجلات النظام
```javascript
// تفعيل السجلات التفصيلية
const DEBUG_PODCAST = process.env.NODE_ENV === 'development';

if (DEBUG_PODCAST) {
  console.log('Podcast Debug:', { episodeId, action, timestamp });
}
```

## 🔮 الميزات المستقبلية

- [ ] **تطبيق الجوال**: تطبيق React Native أو Flutter
- [ ] **البث المباشر**: إمكانية البث المباشر للحلقات
- [ ] **التعليقات الصوتية**: إمكانية ترك تعليقات صوتية
- [ ] **قوائم التشغيل الذكية**: قوائم تشغيل مخصصة بالذكاء الاصطناعي
- [ ] **النسخ التلقائي**: تحويل الصوت إلى نص تلقائياً
- [ ] **الترجمة**: ترجمة الحلقات لعدة لغات
- [ ] **التوصيات الذكية**: اقتراح حلقات مخصصة للمستخدم

## 📞 الدعم والمساعدة

للحصول على الدعم الفني أو الاستفسارات:
- 📧 البريد الإلكتروني: tech@sabq.ai
- 💬 التليجرام: @sabq_tech
- 📱 الواتساب: +966501234567

## 📄 الترخيص

هذا النظام مطور خصيصاً لموقع سبق الذكية. جميع الحقوق محفوظة © 2024 سبق.

---

**تطوير**: فريق سبق التقني 🚀
**آخر تحديث**: ديسمبر 2024
