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
function selectVoiceForContent(title: string, content: string): string {
  const text = (title + " " + content).toLowerCase();

  // تحليل المحتوى لاختيار الصوت المناسب
  if (
    text.includes("تقني") ||
    text.includes("ذكاء اصطناعي") ||
    text.includes("تكنولوجيا")
  ) {
    return ARABIC_VOICES.masculine.khalid; // صوت تقني واضح
  } else if (
    text.includes("علاقات") ||
    text.includes("مجتمع") ||
    text.includes("نسيج")
  ) {
    return ARABIC_VOICES.feminine.mariam; // صوت دافئ للمواضيع الاجتماعية
  } else if (
    text.includes("فكر") ||
    text.includes("فلسفة") ||
    text.includes("تحليل")
  ) {
    return ARABIC_VOICES.masculine.omar; // صوت هادئ للمواضيع الفكرية
  } else {
    return ARABIC_VOICES.masculine.ahmad; // صوت افتراضي
  }
}

// تحسين النص للقراءة الصوتية
function optimizeTextForTTS(title: string, content: string): string {
  // دمج العنوان والمحتوى
  let fullText = `${title}.\n\n${content}`;

  // إزالة markdown وتنسيق HTML
  fullText = fullText
    .replace(/\*\*(.*?)\*\*/g, "$1") // إزالة النص العريض
    .replace(/\*(.*?)\*/g, "$1") // إزالة النص المائل
    .replace(/<[^>]*>/g, "") // إزالة HTML tags
    .replace(/#{1,6}\s/g, "") // إزالة headers markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // تحويل الروابط إلى نص فقط
    .replace(/```[\s\S]*?```/g, "كود برمجي") // استبدال الكود
    .replace(/`([^`]+)`/g, "$1") // إزالة backticks
    .replace(/\n{3,}/g, "\n\n") // تقليل الأسطر الفارغة
    .trim();

  // تحسين علامات الترقيم للقراءة
  fullText = fullText
    .replace(/([.!?])\s*([A-Za-z\u0600-\u06FF])/g, "$1 $2") // إضافة مسافات بعد علامات الترقيم
    .replace(/\s+/g, " ") // توحيد المسافات
    .replace(/([.!?]){2,}/g, "$1") // تقليل علامات الترقيم المتكررة
    .replace(/\.\.\./g, "."); // استبدال النقاط الثلاث

  // تحديد الطول المناسب للـ TTS (حوالي 1000 حرف)
  if (fullText.length > 1000) {
    // قطع النص عند أول نقطة بعد 800 حرف
    const cutIndex = fullText.indexOf(".", 800);
    if (cutIndex > 0 && cutIndex < 1000) {
      fullText = fullText.substring(0, cutIndex + 1);
    } else {
      fullText = fullText.substring(0, 1000).trim() + ".";
    }
  }

  return fullText;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: "معرف المقال مطلوب" },
        { status: 400 }
      );
    }

    console.log("🎵 [Article Audio] معالجة طلب الصوت للمقال:", articleId);

    // جلب بيانات المقال
    const article = await prisma.angle_articles.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        content: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "المقال غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من وجود صوت محفوظ مسبقاً (مؤقتاً معطل)
    // if (article.audio_summary_url) {
    //   console.log("✅ [Article Audio] تم العثور على صوت محفوظ مسبقاً");
    //   return NextResponse.json({
    //     success: true,
    //     audioUrl: article.audio_summary_url,
    //     cached: true,
    //     message: "تم استرجاع الصوت المحفوظ مسبقاً",
    //   });
    // }

    // التحقق من وجود مفتاح ElevenLabs
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      console.error("❌ [Article Audio] مفتاح ElevenLabs غير متوفر");
      return NextResponse.json(
        { success: false, error: "خدمة الصوت غير متوفرة حالياً" },
        { status: 500 }
      );
    }

    console.log("🎤 [Article Audio] توليد صوت جديد...");

    // تحضير النص للقراءة
    const optimizedText = optimizeTextForTTS(
      article.title,
      article.content || ""
    );
    console.log(
      "📝 [Article Audio] النص المحسن:",
      optimizedText.substring(0, 100) + "..."
    );

    // اختيار الصوت المناسب
    const selectedVoice = selectVoiceForContent(
      article.title,
      article.content || ""
    );
    console.log("🎭 [Article Audio] الصوت المختار:", selectedVoice);

    // طلب توليد الصوت من ElevenLabs
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsKey,
        },
        body: JSON.stringify({
          text: optimizedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error(
        "❌ [Article Audio] خطأ من ElevenLabs:",
        elevenLabsResponse.status,
        errorText
      );
      return NextResponse.json(
        { success: false, error: "فشل في توليد الصوت" },
        { status: 500 }
      );
    }

    // تحويل الصوت إلى Base64
    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log("💾 [Article Audio] حفظ الصوت في قاعدة البيانات...");

    // حفظ رابط الصوت في قاعدة البيانات (مؤقتاً معطل)
    // await prisma.angle_articles.update({
    //   where: { id: articleId },
    //   data: { audio_summary_url: audioDataUrl },
    // });

    console.log("✅ [Article Audio] تم توليد الصوت بنجاح (بدون حفظ مؤقتاً)");

    return NextResponse.json({
      success: true,
      audioUrl: audioDataUrl,
      cached: false,
      message: "تم توليد الصوت بنجاح",
    });
  } catch (error) {
    console.error("❌ [Article Audio] خطأ في API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في توليد الصوت",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error)?.message
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    // تجنب إغلاق اتصال Prisma لمنع مشاكل Concurrent Requests
  }
}
