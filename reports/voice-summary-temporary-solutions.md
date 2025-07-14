# حلول مؤقتة لميزة الموجز الصوتي

## الوضع الحالي
- **المشكلة**: خطأ `missing_permissions` من ElevenLabs عند محاولة توليد الصوت
- **الحل المؤقت المطبق**: استخدام ملف صوتي تجريبي عند فشل ElevenLabs

## الحلول المؤقتة المتاحة

### 1. الوضع التجريبي (مطبق حالياً)
```javascript
// في .env.local
ELEVENLABS_DEMO_MODE=true
```
- يستخدم ملف صوتي تجريبي: `/demo-audio.mp3`
- يسمح باختبار الواجهة دون توليد صوت حقيقي

### 2. خدمات TTS بديلة

#### أ. Google Cloud Text-to-Speech
```javascript
// مثال للتكامل
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

const request = {
  input: {text: arabicText},
  voice: {languageCode: 'ar-XA', ssmlGender: 'NEUTRAL'},
  audioConfig: {audioEncoding: 'MP3'},
};
```
- **المميزات**: دعم ممتاز للعربية، أسعار تنافسية
- **السعر**: $4 لكل مليون حرف

#### ب. Amazon Polly
```javascript
// مثال للتكامل
const AWS = require('aws-sdk');
const Polly = new AWS.Polly();

const params = {
  Text: arabicText,
  OutputFormat: 'mp3',
  VoiceId: 'Zeina', // صوت عربي
  LanguageCode: 'arb'
};
```
- **المميزات**: صوت عربي طبيعي (Zeina)
- **السعر**: $4 لكل مليون حرف

#### ج. Microsoft Azure Speech Service
```javascript
// مثال للتكامل
const sdk = require("microsoft-cognitiveservices-speech-sdk");

const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
speechConfig.speechSynthesisLanguage = "ar-SA";
speechConfig.speechSynthesisVoiceName = "ar-SA-HamedNeural";
```
- **المميزات**: أصوات عصبية عربية متعددة
- **السعر**: $15 لكل مليون حرف (للأصوات العصبية)

### 3. حلول مفتوحة المصدر

#### أ. eSpeak
```bash
# تثبيت
sudo apt-get install espeak

# استخدام
espeak -v ar -f arabic_text.txt -w output.wav
```
- **المميزات**: مجاني، يعمل محلياً
- **العيوب**: جودة صوت منخفضة

#### ب. MaryTTS
- خادم TTS مفتوح المصدر
- يدعم العربية (بجودة محدودة)

### 4. تسجيلات صوتية مسبقة
- تسجيل موجزات صوتية للمقالات المهمة يدوياً
- استخدام متطوعين أو مذيعين محترفين

## خطة العمل المقترحة

### المرحلة 1 (فورية)
1. ✅ الاستمرار بالوضع التجريبي الحالي
2. التواصل مع دعم ElevenLabs

### المرحلة 2 (أسبوع واحد)
1. اختبار Google Cloud TTS مع النصوص العربية
2. مقارنة جودة الصوت والتكلفة
3. إعداد حساب تجريبي

### المرحلة 3 (أسبوعين)
1. تطبيق الحل البديل المختار
2. إضافة خيار للمستخدم لاختيار الصوت المفضل
3. تحسين معالجة النصوص العربية قبل التحويل

## ملاحظات تقنية

### تحسين النص قبل التحويل
```javascript
function prepareArabicTextForTTS(text) {
  return text
    // إزالة التشكيل الزائد
    .replace(/[\u064B-\u0652]/g, '')
    // تحويل الأرقام الإنجليزية إلى عربية
    .replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])
    // إضافة فواصل صوتية
    .replace(/\./g, '.')
    .replace(/،/g, '،')
    // تقصير الجمل الطويلة
    .split('.').map(s => s.trim()).filter(s => s).join('. ');
}
```

### معالجة الأخطاء
```javascript
async function generateAudioWithFallback(text, articleId) {
  try {
    // محاولة ElevenLabs أولاً
    return await generateWithElevenLabs(text);
  } catch (error) {
    console.log('ElevenLabs فشل، محاولة البديل...');
    
    try {
      // محاولة Google TTS
      return await generateWithGoogleTTS(text);
    } catch (error) {
      console.log('Google TTS فشل، استخدام الصوت التجريبي');
      // إرجاع الصوت التجريبي
      return '/demo-audio.mp3';
    }
  }
}
```

## التكلفة المتوقعة

| الخدمة | السعر لكل مليون حرف | التكلفة الشهرية المتوقعة* |
|--------|-------------------|------------------------|
| ElevenLabs | $30 | $60-120 |
| Google TTS | $4 | $8-16 |
| Amazon Polly | $4 | $8-16 |
| Azure Neural | $15 | $30-60 |

*بناءً على 2000 موجز شهرياً، متوسط 1000 حرف لكل موجز

## الخلاصة
الوضع التجريبي الحالي يعمل بشكل جيد كحل مؤقت. يُنصح بالتحضير لاستخدام Google Cloud TTS أو Amazon Polly كبديل دائم بسبب:
- الدعم الممتاز للغة العربية
- التكلفة المعقولة
- الموثوقية العالية
- سهولة التكامل 