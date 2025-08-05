import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// تحويل الاسم العربي إلى slug بالإنجليزية
function convertArabicNameToSlug(arabicName: string): string {
  const transliterationMap: { [key: string]: string } = {
    ا: "a",
    أ: "a",
    إ: "i",
    آ: "aa",
    ب: "b",
    ت: "t",
    ث: "th",
    ج: "j",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "dh",
    ر: "r",
    ز: "z",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "d",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "q",
    ك: "k",
    ل: "l",
    م: "m",
    ن: "n",
    ه: "h",
    و: "w",
    ي: "y",
    ة: "a",
    ى: "a",
    ء: "a",
  };

  return arabicName
    .split("")
    .map((char) => transliterationMap[char] || char)
    .join("")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "معرف المراسل مطلوب" },
        { status: 400 }
      );
    }

    console.log("🔍 البحث عن المراسل بالـ slug:", slug);

    let reporter = null;

    // محاولة البحث بالـ slug أولاً
    try {
      reporter = await prisma.reporters.findUnique({
        where: { slug: slug },
        select: {
          id: true,
          full_name: true,
          slug: true,
          bio: true,
          avatar_url: true,
          specializations: true,
          is_verified: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      console.log("خطأ في البحث بالـ slug:", error);
    }

    if (!reporter) {
      console.log("⚠️ لم يُعثر على المراسل بالـ slug:", slug);
      console.log("🔄 محاولة البحث بالاسم العربي المُحول...");

      // فك تشفير الـ slug
      const decodedSlug = decodeURIComponent(slug);
      console.log("🔍 البحث بالاسم المفكوك:", decodedSlug);

      // تحويل الاسم العربي إلى slug بالإنجليزية
      const englishSlug = convertArabicNameToSlug(decodedSlug);
      console.log("🔍 البحث بالـ slug المحول:", englishSlug);

      // محاولة البحث بالـ slug الإنجليزي
      try {
        reporter = await prisma.reporters.findUnique({
          where: { slug: englishSlug },
          select: {
            id: true,
            full_name: true,
            slug: true,
            bio: true,
            avatar_url: true,
            specializations: true,
            is_verified: true,
            is_active: true,
            created_at: true,
            updated_at: true,
          },
        });
      } catch (error) {
        console.log("خطأ في البحث بالـ slug الإنجليزي:", error);
      }

      if (reporter) {
        console.log("✅ تم العثور على المراسل:", reporter.full_name);
      } else {
        // محاولة البحث بالاسم الكامل
        try {
          reporter = await prisma.reporters.findFirst({
            where: {
              full_name: {
                contains: decodedSlug,
                mode: "insensitive",
              },
            },
            select: {
              id: true,
              full_name: true,
              slug: true,
              bio: true,
              avatar_url: true,
              specializations: true,
              is_verified: true,
              is_active: true,
              created_at: true,
              updated_at: true,
            },
          });
        } catch (error) {
          console.log("خطأ في البحث بالاسم الكامل:", error);
        }
      }
    }

    if (!reporter) {
      return NextResponse.json(
        { success: false, error: "المراسل غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: reporter,
    });
  } catch (error) {
    console.error("خطأ في جلب بيانات المراسل:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
