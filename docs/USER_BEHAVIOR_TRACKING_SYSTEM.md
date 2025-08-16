# نظام تتبع سلوك المستخدم المتقدم - سبق الذكية

## 🎯 نظرة عامة

نظام تتبع سلوك المستخدم في مشروع سبق الذكية هو حل شامل ومتقدم يجمع ويحلل بيانات تفاعل المستخدمين مع المحتوى بطريقة ذكية وآمنة. النظام مصمم لاحترام الخصوصية وتقديم رؤى قيمة لتحسين تجربة المستخدم.

## 🏗️ المعمارية العامة

### المكونات الأساسية

1. **تتبع التفاعلات** (`UserInteractionTracker`)
   - تتبع الإعجاب، الحفظ، المشاركة، التعليقات
   - معالجة مجمعة للأحداث
   - إدارة نقاط الولاء

2. **تحليل سلوك القراءة** (`ReadingBehaviorAnalyzer`)
   - تتبع وقت القراءة ونسبة التمرير
   - تحليل أنماط القراءة والتوقفات
   - تقييم جودة القراءة ومستوى التفاعل

3. **جمع بيانات السياق** (`ContextDataCollector`)
   - معلومات الجهاز والمتصفح
   - بيانات الموقع الجغرافي (مع الخصوصية)
   - معلومات الشبكة والأداء

4. **إدارة الخصوصية** (`PrivacyManager`)
   - مستويات خصوصية متعددة
   - تشفير البيانات الحساسة
   - إدارة الموافقات والحذف

5. **APIs للتتبع**
   - `/api/tracking/interactions` - تتبع التفاعلات
   - `/api/tracking/reading-session` - تتبع جلسات القراءة

6. **مكونات العميل**
   - `TrackingManager` - إدارة التتبع في المتصفح
   - `ReadingTracker` - تتبع سلوك القراءة
   - React Hooks للاستخدام السهل

## 📊 أنواع البيانات المجمعة

### 1. تفاعلات المستخدم
```typescript
interface InteractionEvent {
  article_id: string;
  interaction_type: 'like' | 'save' | 'share' | 'comment' | 'view';
  timestamp: string;
  context: {
    device_type: string;
    browser_type: string;
    ip_address: string;
    page_url: string;
  };
}
```

### 2. سلوك القراءة
```typescript
interface ReadingSession {
  session_id: string;
  article_id: string;
  duration_seconds: number;
  read_percentage: number;
  scroll_depth: number;
  pause_points: PausePoint[];
  interactions: ReadingInteraction[];
  highlights: TextHighlight[];
  reading_pattern: ReadingPattern;
}
```

### 3. بيانات السياق
```typescript
interface ContextData {
  device: DeviceInfo;
  location: LocationInfo;
  network: NetworkInfo;
  app_context: AppContext;
  performance: PerformanceMetrics;
}
```

## 🔒 الخصوصية والأمان

### مستويات الخصوصية

1. **إيقاف كامل** (`OFF`)
   - لا يتم جمع أي بيانات
   - المستخدم يتصفح بشكل مجهول تماماً

2. **الحد الأدنى** (`MINIMAL`)
   - البيانات الأساسية فقط للتشغيل
   - لا توجد بيانات شخصية
   - إخفاء هوية كامل

3. **متوازن** (`BALANCED`) - الافتراضي
   - توازن بين الخصوصية والوظائف
   - تشفير البيانات الحساسة
   - إخفاء الهوية للمعرفات

4. **كامل** (`FULL`)
   - جمع شامل للبيانات
   - تخصيص متقدم وتوصيات ذكية

### ميزات الحماية

- **تشفير البيانات**: جميع البيانات الحساسة مشفرة
- **إخفاء الهوية**: استبدال المعرفات الشخصية
- **Rate Limiting**: حماية من الاستخدام المفرط
- **انتهاء الصلاحية**: حذف البيانات القديمة تلقائياً
- **حق النسيان**: إمكانية حذف جميع البيانات

## 🚀 التطبيق والاستخدام

### 1. تهيئة النظام

```typescript
import { initializeTracking } from '@/lib/tracking/client/tracking-manager';

// تهيئة التتبع
await initializeTracking(userId, {
  enabledEvents: ['interaction', 'reading_session'],
  privacyMode: false,
  debug: true
});
```

### 2. استخدام React Hooks

```typescript
import { useUserTracking, useArticleTracking } from '@/hooks/useUserTracking';

function ArticlePage({ articleId }: { articleId: string }) {
  const tracking = useArticleTracking(articleId);

  const handleLike = () => {
    tracking.trackLike();
  };

  const handleHighlight = (text: string, start: number, end: number) => {
    tracking.highlightText(text, start, end);
  };

  return (
    <div>
      <button onClick={handleLike}>إعجاب</button>
      {/* باقي المحتوى */}
    </div>
  );
}
```

### 3. تتبع مخصص

```typescript
import { getTrackingManager } from '@/lib/tracking/client/tracking-manager';

const trackingManager = getTrackingManager();

// تتبع حدث مخصص
trackingManager.trackInteraction('custom_action', 'article-123', {
  custom_data: 'value'
});

// تتبع جلسة قراءة
trackingManager.trackReadingSession({
  article_id: 'article-123',
  duration_seconds: 120,
  read_percentage: 85
});
```

## 📈 التحليلات والرؤى

### 1. تحليل جودة القراءة

النظام يحلل جودة القراءة بناءً على:
- **المدة**: وقت القراءة الفعلي
- **العمق**: نسبة التمرير والقراءة
- **التفاعل**: النقرات والتمييز والتوقفات
- **الانتباه**: فترات التركيز والمراجعة

```typescript
interface ReadingQuality {
  is_quality_reading: boolean;
  quality_score: number; // 0-100
  estimated_comprehension: number;
  reading_thoroughness: number;
}
```

### 2. مستوى التفاعل

```typescript
interface EngagementLevel {
  engagement_score: number; // 0-100
  engagement_level: 'منخفض جداً' | 'منخفض' | 'متوسط' | 'عالي' | 'عالي جداً';
  contributing_factors: string[];
}
```

### 3. أنماط القراءة

```typescript
interface ReadingStyle {
  primary_style: 'سريع' | 'متأني' | 'تحليلي' | 'مسح سريع' | 'عادي';
  characteristics: string[];
  reading_speed_wpm: number;
  scroll_pattern: ScrollPattern;
}
```

## 🔧 الإعدادات والتخصيص

### إعدادات التتبع

```typescript
interface TrackingConfig {
  enabledEvents: TrackingEventType[];
  batchSize: number; // عدد الأحداث في المجموعة
  flushInterval: number; // فترة الإرسال بالميلي ثانية
  enableOfflineQueue: boolean; // تخزين محلي للأحداث
  privacyMode: boolean; // وضع الخصوصية
  debug: boolean; // وضع التطوير
  apiEndpoint: string; // نقطة النهاية للAPI
}
```

### إعدادات الخصوصية

```typescript
interface PrivacyPolicy {
  level: PrivacyLevel;
  dataRetentionDays: number; // مدة الاحتفاظ بالبيانات
  allowedDataTypes: SensitiveDataType[]; // أنواع البيانات المسموحة
  anonymizeData: boolean; // إخفاء الهوية
  encryptData: boolean; // تشفير البيانات
  shareWithThirdParties: boolean; // مشاركة مع أطراف ثالثة
  geoLocationTracking: boolean; // تتبع الموقع
  crossSiteTracking: boolean; // تتبع عبر المواقع
}
```

## 🧪 الاختبارات

### 1. اختبارات الوحدة
- اختبار دوال التحليل والتصفية
- التحقق من صحة البيانات
- اختبار التشفير وإخفاء الهوية

### 2. اختبارات التكامل
- اختبار تدفق البيانات الكامل
- API endpoints
- قاعدة البيانات والتخزين

### 3. اختبارات الأداء
- معالجة الأحداث الكثيرة
- الاستجابة تحت الضغط
- استهلاك الذاكرة

### تشغيل الاختبارات

```bash
# جميع اختبارات التتبع
npm test __tests__/tracking/

# اختبارات محددة
npm test __tests__/tracking/user-interactions.test.ts
npm test __tests__/tracking/reading-behavior.test.ts
npm test __tests__/tracking/privacy-manager.test.ts
```

## 📊 مراقبة الأداء

### المقاييس الرئيسية

1. **معدل الأحداث**: عدد الأحداث المعالجة في الثانية
2. **وقت الاستجابة**: متوسط وقت معالجة الطلبات
3. **معدل الأخطاء**: نسبة الأحداث الفاشلة
4. **استخدام الذاكرة**: استهلاك الذاكرة للمعالجة
5. **حجم البيانات**: مقدار البيانات المعالجة يومياً

### التنبيهات

- تنبيه عند ارتفاع معدل الأخطاء > 5%
- تنبيه عند زيادة وقت الاستجابة > 2 ثانية
- تنبيه عند امتلاء قائمة الانتظار
- تنبيه عند فشل العمليات المجمعة

## 🔄 التحديث والصيانة

### 1. تحديث المخططات
عند تغيير مخطط البيانات، يجب:
- تحديث Zod schemas
- تحديث TypeScript interfaces
- تشغيل الاختبارات
- تحديث التوثيق

### 2. إضافة نوع تفاعل جديد
```typescript
// 1. إضافة النوع الجديد
export type InteractionType = 'like' | 'save' | 'share' | 'comment' | 'view' | 'new_type';

// 2. تحديث النقاط
const pointsMap: Record<string, number> = {
  'new_type': 3
};

// 3. تحديث المعالجة
// 4. إضافة الاختبارات
```

### 3. تنظيف البيانات القديمة

```typescript
// تشغيل دوري لتنظيف البيانات
await UserInteractionTracker.cleanupOldData(365); // حذف أقدم من سنة
```

## 🌟 أفضل الممارسات

### 1. للمطورين

- **استخدم الـ Hooks**: استخدم `useUserTracking` و `useArticleTracking`
- **تجميع الأحداث**: لا ترسل كل حدث منفرداً
- **التحقق من الخصوصية**: تأكد من الموافقة قبل التتبع
- **معالجة الأخطاء**: تعامل مع فشل التتبع بشكل جيد

### 2. للأداء

- **استخدم المعالجة المجمعة**: تجميع عدة أحداث في طلب واحد
- **التخزين المحلي**: استخدم offline queue للموثوقية
- **ضغط البيانات**: قلل من حجم البيانات المرسلة
- **تحسين الاستعلامات**: استخدم indexes مناسبة

### 3. للخصوصية

- **الموافقة أولاً**: لا تجمع البيانات بدون موافقة
- **الشفافية**: اشرح للمستخدم ما تجمعه
- **الحد الأدنى**: اجمع أقل قدر ممكن من البيانات
- **الحذف**: قدم خيارات سهلة لحذف البيانات

## 🚨 استكشاف الأخطاء

### مشاكل شائعة

1. **التتبع لا يعمل**
   ```javascript
   // تحقق من التهيئة
   console.log('Tracking initialized:', trackingManager.isInitialized);
   
   // تحقق من الموافقة
   console.log('Consent valid:', PrivacyManager.validateConsent());
   ```

2. **البيانات لا تصل للخادم**
   ```javascript
   // تحقق من الشبكة
   console.log('Online:', navigator.onLine);
   
   // تحقق من الأحداث المحلية
   console.log('Offline events:', localStorage.getItem('tracking_offline_events'));
   ```

3. **أداء بطيء**
   ```javascript
   // قلل من تكرار الإرسال
   const manager = getTrackingManager({
     flushInterval: 60000, // دقيقة واحدة
     batchSize: 20 // مجموعات أكبر
   });
   ```

## 📞 الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل:

1. **الوثائق**: راجع هذا الملف والتعليقات في الكود
2. **الاختبارات**: انظر للاختبارات كأمثلة على الاستخدام
3. **المطورين**: تواصل مع فريق التطوير
4. **GitHub Issues**: أنشئ issue في المستودع

## 🔮 التطوير المستقبلي

### ميزات مخطط لها

1. **تحليلات الذكاء الاصطناعي**
   - توقع سلوك المستخدم
   - توصيات محتوى ذكية
   - كشف الأنماط غير العادية

2. **تتبع الوقت الفعلي**
   - تحديثات مباشرة
   - تحليلات لحظية
   - تنبيهات فورية

3. **تكامل أوسع**
   - Google Analytics
   - Facebook Pixel
   - أدوات تحليل أخرى

4. **ميزات متقدمة**
   - A/B testing
   - Heat maps
   - Session recordings

---

**تم إنشاء هذا النظام بعناية لضمان التوازن بين الحصول على رؤى قيمة واحترام خصوصية المستخدمين. جميع البيانات محمية ومشفرة، ويمكن للمستخدمين التحكم الكامل في مستوى المشاركة.**
