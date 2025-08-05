import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// تكوين الأصوات العربية المتخصصة
const ARABIC_VOICES = {
  // أصوات ذكورية
  masculine: {
    omar: "pNInz6obpgDQGcFmaJgB", // صوت عمر - هادئ ومتوازن
    khalid: "onwK4e9ZLuTAKqWW03F9", // صوت خالد - واضح ومؤثر
    ahmad: "EXAVITQu4vr4xnSDxMaL", // صوت أحمد - دافئ ومريح
  },
  // أصوات نسائية
  feminine: {
    sarah: "ThT5KcBeYPX3keUQqHPh", // صوت سارة - واضح ومهني
    mariam: "XB0fDUnXU5powFXDhCwa", // صوت مريم - دافئ وودود
    nour: "pFZP5JQG7iQjIQuC4Bku", // صوت نور - هادئ ومتزن
  },
};

// اختيار الصوت المناسب حسب نوع المحتوى
function selectVoiceForContent(title: string, description: string): string {
  const content = (title + " " + description).toLowerCase();

  // تحليل المحتوى لاختيار الصوت المناسب
  if (
    content.includes("تقني") ||
    content.includes("ذكي") ||
    content.includes("رقمي")
  ) {
    return ARABIC_VOICES.masculine.khalid; // صوت تقني واضح
  }

  if (
    content.includes("مجتمع") ||
    content.includes("إنسان") ||
    content.includes("علاقات")
  ) {
    return ARABIC_VOICES.feminine.mariam; // صوت دافئ للمحتوى الاجتماعي
  }

  if (
    content.includes("فلسفة") ||
    content.includes("فكر") ||
    content.includes("تأمل")
  ) {
    return ARABIC_VOICES.masculine.ahmad; // صوت عميق للمحتوى الفلسفي
  }

  // افتراضي: صوت متوازن
  return ARABIC_VOICES.feminine.sarah;
}

// تحسين النص للقراءة الصوتية
function optimizeTextForArabicTTS(text: string): string {
  return (
    text
      // إزالة الرموز والعلامات غير المرغوبة
      .replace(/[\#\*\_\~\`]/g, "")
      // تحسين علامات الترقيم للنطق
      .replace(/\./g, ". ")
      .replace(/\,/g, "، ")
      .replace(/\!/g, "! ")
      .replace(/\?/g, "؟ ")
      // إضافة توقفات للفقرات
      .replace(/\n\n/g, ". ")
      .replace(/\n/g, " ")
      // تنظيف المسافات
      .replace(/\s+/g, " ")
      .trim()
      // تحديد الطول المناسب (500 حرف كحد أقصى)
      .substring(0, 500)
      .trim()
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const angleId = searchParams.get("angleId");
    const voiceType = searchParams.get("voice") || "auto";
    const forceRegenerate = searchParams.get("regenerate") === "true";

    if (!angleId) {
      return NextResponse.json(
        { success: false, error: "معرف الزاوية مطلوب" },
        { status: 400 }
      );
    }

    console.log(`🎙️ [Angle Audio] طلب توليد صوت للزاوية: ${angleId}`);

    // 1. جلب بيانات الزاوية
    const angle = await prisma.angles.findUnique({
      where: { id: angleId },
      select: {
        id: true,
        title: true,
        description: true,
        audio_summary_url: true,
        theme_color: true,
        icon: true,
      },
    });

    if (!angle) {
      return NextResponse.json(
        { success: false, error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }

    // 2. إذا كان الصوت موجود، إرجاعه (إلا في حالة إعادة التوليد)
    if (angle.audio_summary_url && !forceRegenerate) {
      console.log(
        `✅ [Angle Audio] إرجاع صوت محفوظ مسبقاً للزاوية: ${angle.title}`
      );
      return NextResponse.json({
        success: true,
        audioUrl: angle.audio_summary_url,
        cached: true,
        message: "تم استرجاع الصوت المحفوظ مسبقاً",
      });
    }

    // 3. التحقق من وجود وصف للزاوية
    if (!angle.description) {
      return NextResponse.json(
        { success: false, error: "الزاوية لا تحتوي على وصف" },
        { status: 400 }
      );
    }

    // 4. التحقق من مفتاح ElevenLabs
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error("❌ [Angle Audio] ElevenLabs API key غير موجود");
      return NextResponse.json(
        { success: false, error: "خدمة الصوت غير متاحة حالياً" },
        { status: 500 }
      );
    }

    // 5. تحضير النص للقراءة
    const textToSpeak = `${angle.title}. ${angle.description}`;
    const optimizedText = optimizeTextForArabicTTS(textToSpeak);

    console.log(
      `📝 [Angle Audio] النص المحسن: ${optimizedText.substring(0, 100)}...`
    );

    // 6. اختيار الصوت المناسب
    const selectedVoice = selectVoiceForContent(angle.title, angle.description);
    console.log(`🎭 [Angle Audio] الصوت المختار: ${selectedVoice}`);

    // 7. توليد الصوت باستخدام ElevenLabs
    console.log(`🔄 [Angle Audio] بدء توليد الصوت...`);

    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: optimizedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.65,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error(`❌ [Angle Audio] خطأ ElevenLabs:`, errorText);
      return NextResponse.json(
        { success: false, error: "فشل في توليد الصوت" },
        { status: 500 }
      );
    }

    // 8. تحويل الصوت إلى Buffer
    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log(
      `✅ [Angle Audio] تم توليد الصوت بنجاح للزاوية: ${angle.title}`
    );
    console.log(
      `📊 [Angle Audio] حجم الصوت: ${(audioBuffer.byteLength / 1024).toFixed(
        2
      )} KB`
    );

    // 9. حفظ رابط الصوت في قاعدة البيانات
    try {
      await prisma.angles.update({
        where: { id: angleId },
        data: { audio_summary_url: audioDataUrl },
      });
      console.log(`💾 [Angle Audio] تم حفظ رابط الصوت في قاعدة البيانات`);
    } catch (dbError) {
      console.error(`⚠️ [Angle Audio] خطأ في حفظ رابط الصوت:`, dbError);
      // لا نرجع خطأ هنا لأن الصوت تم توليده بنجاح
    }

    return NextResponse.json({
      success: true,
      audioUrl: audioDataUrl,
      generated: true,
      angleTitle: angle.title,
      textLength: optimizedText.length,
      voiceUsed: selectedVoice,
      message: "تم توليد الصوت بنجاح",
    });
  } catch (error: any) {
    console.error("❌ [Angle Audio] خطأ عام:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في توليد الصوت",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
