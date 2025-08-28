# خطة علاج الأداء لصفحة الخبر (i6ax8bmg)

- الصفحة: https://www.sabq.io/news/i6ax8bmg
- الملفات المرجعية: 
  - تقارير Lighthouse: `performance/reports/i6ax8bmg-mobile.report.{html,json}` و`i6ax8bmg-desktop.report.{html,json}`
  - الملخّص الموحّد: `performance/reports/i6ax8bmg-summary.json`
  - تقرير القياسات المختصر: `performance/reports/i6ax8bmg-REPORT.md`

## الملخص الرقمي (قبل التحسين)
- Mobile:
  - Performance: 0.51
  - FCP: ~7569ms
  - LCP: ~15183ms
  - CLS: ~0.018
  - TTI: ~15505ms
  - TBT: ~252ms
  - TTFB: ~397ms
- Desktop:
  - Performance: 0.36
  - FCP: ~7313ms
  - LCP: ~15146ms
  - CLS: ~0.00088
  - TTI: ~15186ms
  - TBT: ~430ms
  - TTFB: ~443ms

مؤشرات داعمة (Mobile Diagnostics):
- Requests: 86، Scripts: 27، Stylesheets: 17، Fonts: 24، Total Byte Weight: ~2.86MB، Main Document: ~1.25MB transfer (~9.2MB resource).
- أكبر طلبات: وثيقة الصفحة (1.25MB)، chunk البائع `vendor-*.js` (~752KB)، عدة خطوط WOFF2 (~20–96KB لكل ملف)، وCSS أساسي (~42KB transfer).

## أهم 10 عنق زجاجة (مرتب حسب الأثر على LCP/TTI)

| # | المشكلة | الدليل (تقرير/قياس) | السبب الجذري | الحل المقترح | الجهد | الأثر المتوقع على LCP/INP |
|---|---|---|---|---|---|---|
| 1 | LCP ~15.2s (مرتفع جداً) | Summary JSON: LCP≈15183ms (Mobile) | وثيقة HTML ضخمة 1.25MB + تأثير خطوط كثيرة + chunk كبير | تقليل وزن الوثيقة، خفض الخطوط المحمّلة، ضمان أولوية صورة الهيرو وتحويلاتها (Cloudinary f_auto,q_auto,w_) | M | −3s إلى −6s |
| 2 | FCP ~7.6s (بطيء) | Summary JSON: FCP≈7569ms | CSS/Fonts تعلو فوق المحتوى وpreload واسع للخطوط | Critical CSS للهيدر وأعلاه، تقليص Preload للخطوط لوزنين فقط | M | −0.6s إلى −1.2s |
| 3 | وثيقة الصفحة 1.25MB (resource ~9.2MB) | Network Requests (Document) | محتوى HTML ثقيل (علامات وصور/روابط كثيرة) | تنقية المحتوى من العناصر غير الضرورية، منع inline/base64، تصغير HTML SSR | M | −1s إلى −2.5s |
| 4 | vendor-*.js ~752KB | Top Requests | حمل JS مبدئي كبير | Code splitting ديناميكي، إزالة مكتبات غير مستخدمة، lazy للمكوّنات الثانوية | M | INP −80–150ms، TTI −0.5–1.0s |
| 5 | Fonts = 24 ملفاً | Diagnostics (numFonts=24) | أوزان متعددة وPreload واسع | تقييد الأوزان إلى 400/700 فقط، Subset عربي، self-host + font-display: swap | S | FCP −200–400ms |
| 6 | Stylesheets = 17 | Diagnostics (numStylesheets=17) | CSS مجزأ متعدد | دمج CSS الحرِج، تحميل غير حاجب للباقي، إزالة unused عبر Coverage | S | FCP −100–200ms |
| 7 | Requests = 86 | Diagnostics | سكربتات/صور/خطوط زائدة | تأجيل الطرف الثالث، lazy للصور خارج viewport، تقليل الروابط | S | LCP −200–400ms |
| 8 | TTI ~15.5s | Summary JSON | Hydration مبكر لمكوّنات غير حرجة | Islands/dynamic import + gating بـ requestIdleCallback | M | TTI −2–4s |
| 9 | TBT ~252ms (مقبول لكن قابل للتحسين) | Summary JSON | بعض المهام الطويلة بالواجهة | إزالة console في الإنتاج، مزيد من التقسيم والتأجيل | XS | TBT −50–120ms |
| 10 | INP غير مُقاس | Summary JSON (INP=null) | غياب قياس RUM/INP | تفعيل Web-Vitals RUM وقياس INP حي، إصلاح المستمعات الثقيلة | S | INP −50–120ms |

## خطة التنفيذ المرحلية (5 أيام)

- اليوم 1: القياس والتجهيز
  - دمج تقارير LH (تم) وإنشاء ملخص. إضافة تتبّع RUM للـ INP/CLS/LCP.
- اليوم 2: الخطوط وCritical CSS (أولوية عالية)
  - تقليص أوزان IBM Plex Arabic إلى 400/700 فقط، Subset عربي، `font-display: swap`، إزالة الـpreload الزائد. استخراج Critical CSS للهيدر/الهيرو.
- اليوم 3: تقليل JS المبدئي
  - Dynamic import للمكوّنات غير الحرِجة في صفحة الخبر (الملصق الجانبي، الأسئلة، التعليقات)، ومراجعة المكتبات الثقيلة ضمن `vendor`.
- اليوم 4: الوثيقة والصور
  - تنقية HTML SSR من العناصر غير الضرورية، منع inline/base64 في المحتوى، ضمان تحويلات Cloudinary وصِفة `sizes` للهيرو.
- اليوم 5: الطرف الثالث والتحسينات الأخيرة
  - تأجيل سكربتات الطرف الثالث، Service Worker للصور، مراجعة Coverage لحذف CSS/JS غير المستعمل.

## معايير القبول
- Mobile Performance ≥ 90
- LCP ≤ 2.5s عند 75th percentile على 4G متوسطة
- INP ≤ 200ms، CLS ≤ 0.1
- تقليل JS المبدئي ≥ 30%، وتقليل Long Tasks ≥ 50%
- TTFB < 400ms (قائم حالياً ويُحافظ عليه)

## ملاحظات تطبيقية (سريعة)
- الهيرو في صفحة الخبر: تأكيد `priority` + `fetchPriority="high"` + `sizes` مناسبة، مع تحويلات Cloudinary (`f_auto,q_auto,w_*`).
- الخطوط: حصر الأوزان، تقليل عدد ملفات الخطوط المحمّلة مبكراً إلى 2–3 فقط.
- CSS: إبقاء critical inline صغير جداً، والباقي lazy عبر media=print + onload.
- JS: استخدام `next/dynamic` مع placeholders ثابتة لمنع CLS. تأجيل المنطقيات الثقيلة حتى الخمول.
