# تحليل ملف Postman المحدث - API وكالة الأنباء السعودية

## معلومات عامة
- **اسم المجموعة**: SPAClient API
- **معرف Postman**: b2027e68-26f2-4151-a856-cf8feb182c43
- **الإصدار**: v2.0.0

## نقاط النهاية المكتشفة

### 1. GetStatus
- **المسار**: `/ClientAppV1/GetStatus`
- **الطريقة**: GET
- **الوصف**: فحص حالة الخدمة
- **البيانات المطلوبة**: clientName, clientKey, languageId

### 2. GetBaskets
- **المسار**: `/ClientAppV1/GetBaskets`
- **الطريقة**: GET
- **الوصف**: الحصول على السلال المتاحة
- **البيانات المطلوبة**: clientName, clientKey, languageId

### 3. GetNextNews
- **المسار**: `/ClientAppV1/GetNextNews`
- **الطريقة**: GET
- **الوصف**: الحصول على الأخبار التالية
- **البيانات المطلوبة**: Client (ClientName, ClientKey, LanguageId), LastNewsId, BasketId, IsRecived, LoadMedia

### 4. GetAllClassifications
- **المسار**: `/ClientAppV1/GetStatus` (يبدو أن هناك خطأ في المسار)
- **الطريقة**: GET
- **الوصف**: الحصول على جميع التصنيفات
- **البيانات المطلوبة**: clientName, clientKey, languageId

### 5. GetAllSiteSections
- **المسار**: `/ClientAppV1/GetAllSiteSections`
- **الطريقة**: GET
- **الوصف**: الحصول على جميع أقسام الموقع
- **البيانات المطلوبة**: clientName, clientKey, languageId

### 6. GetAllPriorities
- **المسار**: `/ClientAppV1/GetAllPriorities`
- **الطريقة**: GET
- **الوصف**: الحصول على جميع الأولويات
- **البيانات المطلوبة**: clientName, clientKey, languageId

### 7. GetAllRegions
- **المسار**: `/ClientAppV1/GetAllRegions`
- **الطريقة**: GET
- **الوصف**: الحصول على جميع المناطق
- **البيانات المطلوبة**: clientName, clientKey, languageId

## معلومات المصادقة
- **النوع**: API Key
- **المفتاح**: X-API-Key
- **القيمة**: owuDXImzoEIyRUJ4564zZ2O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsdgdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkf894jksjds456d56i327893289kj89389d889jkjkjkdk49043656d5asklskGGP

## ملاحظات مهمة
1. جميع الطلبات تستخدم طريقة GET مع بيانات في الـ body
2. يتم إرسال البيانات بصيغة JSON في الـ body
3. هناك مسار أساسي جديد: `/ClientAppV1/`
4. يبدو أن هناك خطأ في مسار GetAllClassifications (يشير إلى GetStatus)
5. جميع الطلبات تتطلب clientName و clientKey و languageId

