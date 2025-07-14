# ElevenLabs Support Request

## Subject: API Error - missing_permissions When Generating Arabic Text-to-Speech

Dear ElevenLabs Support Team,

I hope this message finds you well. I am writing to request assistance with an API error we are encountering in our Arabic news platform integration.

## Issue Description

We are experiencing a persistent "missing_permissions" error when attempting to generate text-to-speech audio for Arabic content through your API.

### Error Details:
```
❌ ElevenLabs Error: {
  "detail": {
    "status": "missing_permissions",
    "message": "Insufficient permissions to perform this action"
  }
}
```

### Our Implementation:

1. **API Key**: We are using the API key stored in our environment variable `ELEVENLABS_API_KEY`
2. **Voice ID**: We are using the voice ID `EXAVITQu4vr4xnSDxMaL` for Arabic content
3. **Model**: We are using `eleven_multilingual_v2` model
4. **Endpoint**: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`

### Code Sample:
```javascript
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text: arabicText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    })
  }
);
```

## Use Case

We are building an Arabic news platform (SABQ AI CMS) that aims to provide audio summaries of news articles for accessibility purposes. The text-to-speech feature is crucial for:

- Enabling visually impaired users to access news content
- Providing audio content for users who prefer listening while multitasking
- Enhancing the overall user experience on our platform

## Questions:

1. What specific permissions are required for text-to-speech generation?
2. Is our current subscription plan sufficient for Arabic TTS generation?
3. Are there any specific requirements or limitations for the Arabic language?
4. Is the voice ID `EXAVITQu4vr4xnSDxMaL` still valid and available for our account?

## Account Information:

- Platform: SABQ AI CMS (Arabic News Platform)
- API Integration: Node.js/Next.js application
- Language: Arabic (ar)
- Expected Usage: ~1000-2000 audio generations per month

We would greatly appreciate your assistance in resolving this issue. Please let us know if you need any additional information or if there are specific steps we need to take to enable the necessary permissions.

Thank you for your time and support.

Best regards,
[Your Name]
SABQ AI CMS Development Team

---

## النسخة العربية (للمرجع الداخلي)

### الموضوع: خطأ API - صلاحيات مفقودة عند توليد النطق الصوتي للنصوص العربية

نواجه خطأ "missing_permissions" عند محاولة توليد الصوت للمحتوى العربي. نحتاج إلى:
- معرفة الصلاحيات المطلوبة
- التأكد من أن خطة الاشتراك تدعم اللغة العربية
- التحقق من صحة معرف الصوت المستخدم

المشروع: منصة صبق للأخبار بالذكاء الاصطناعي
الاستخدام المتوقع: 1000-2000 توليد صوتي شهرياً 