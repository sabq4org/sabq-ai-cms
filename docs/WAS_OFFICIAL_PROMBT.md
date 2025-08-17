# 🔵 برومبت الربط مع وكالة الأنباء السعودية (واس) - تكامل قسم "أخبار واس" مع لوحة التحكم

## 1️⃣ ملخص تنفيذي

نحن بصدد ربط منصة إدارة المحتوى (CMS) مباشرة مع وكالة الأنباء السعودية (واس) عبر واجهة برمجة التطبيقات (SPA Distribution API) لجلب الأخبار في الوقت الفعلي وعرضها بقسم "أخبار واس" في لوحة التحكم.

جميع عمليات الاستدعاء ستكون عبر HTTPS وتُستخدم بيانات المصادقة الرسمية:
- **API Key:**
owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP
- **Client Key:**
olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4=
- **Client Name:**
(اسم العميل المسجل في عقد واس (SABQ)

---

## 2️⃣ متغيرات البيئة المطلوبة

```env
SPA_API_URL=https://nwdistapi.spa.gov.sa/
SPA_API_KEY=owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP
SPA_CLIENT_KEY=olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4=
SPA_CLIENT_NAME=اسم_العميل_حسب_العقد
```

---

## 3️⃣ أهم متطلبات الربط البرمجي
- تمرير المتغيرات أعلاه في كل طلب.
- جميع الطلبات عبر HTTPS فقط.
- التعامل مع كل الأخطاء البرمجية بدقة (401، 404، 419، 500).
- الاستجابة للمعايير غير الوظيفية (سرعة الاستجابة، عدد العمليات، الأمان).
- جميع الهيكلة البرمجية مطابقة لـ ContractInfo وCondition وNewsData (انظر الملف المرفق).

---

## 4️⃣ نموذج كود (Node.js/TypeScript) - جلب أحدث الأخبار

```typescript
import axios from "axios";

const SPA_API_URL = process.env.SPA_API_URL || "https://nwdistapi.spa.gov.sa/";
const SPA_API_KEY = process.env.SPA_API_KEY;
const SPA_CLIENT_KEY = process.env.SPA_CLIENT_KEY;
const SPA_CLIENT_NAME = process.env.SPA_CLIENT_NAME;

// الدالة لجلب الأخبار الجديدة من واس
async function getLatestSPAnews({ lastNewsId = 0, basketId = 1 }) {
  try {
    const response = await axios.post(
      `${SPA_API_URL}api/News/NextNews`,
      {
        client_name_TXT: SPA_CLIENT_NAME,
        client_key_TXT: SPA_CLIENT_KEY,
        last_news_CD: lastNewsId,
        basket_CD: basketId,
        IS_recived: true,
        IS_load_media: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SPA_API_KEY,
        },
        timeout: 8000,
      }
    );
    // بيانات الخبر الجديد
    return response.data;
  } catch (error) {
    // معالجة الأخطاء (تسجيلها، رفع تنبيه، إلخ)
    if (error.response) {
      console.error("SPA API Error:", error.response.status, error.response.data);
    } else {
      console.error("SPA API Unknown Error:", error);
    }
    throw error;
  }
}

// مثال للاستخدام:
getLatestSPAnews({ lastNewsId: 0, basketId: 1 })
  .then((news) => {
    console.log("أحدث خبر من واس:", news);
  })
  .catch((err) => {
    // التعامل مع الخطأ
  });
```

---

## 5️⃣ تنبيهات هامة للفريق البرمجي
- تأكد من صحة اسم العميل ومفتاح العميل حسب بيانات العقد.
- إذا تغيرت الأكواد، راجع الدليل المرفق (SPA Postman/Docs).
- جميع البيانات المستلمة يتم التعامل معها وفق بنية NewsData الموصوفة في ملف PDF.
- استخدم خاصية IS_load_media: true لتحميل الوسائط تلقائيًا مع كل خبر (صور/فيديو).
- يفضل الاحتفاظ برقم آخر خبر تم جلبه last_news_CD في قاعدة البيانات لضمان جلب الأخبار الجديدة فقط.
- عالج الأكواد التي تتعلق بالمصادقة وواجهات REST بدقة شديدة.

---

## 📝 ملاحظة حول التنفيذ

تم تنفيذ هذا البرومبت بالكامل في المشروع، لكن واجهتنا مشكلة من جهة سيرفر واس:
- Endpoint المستخدم: `api/ClientAppSDAIA/Get_Next_News` (يعمل مع Get_Status)
- Endpoint المذكور في البرومبت: `api/News/NextNews` (يُرجع 404)
- كلاهما يُرجع أخطاء من السيرفر حالياً

الكود جاهز وسيعمل فور حل المشكلة من جهة واس. 