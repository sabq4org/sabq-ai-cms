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

// دالة للبحث الذكي في الـ slugs مع نظام تسجيل النقاط
function findBestSlugMatch(
  searchTerm: string,
  allReporters: Array<{ slug: string; full_name: string }>
): string | null {
  const searchLower = searchTerm.toLowerCase().trim();

  console.log("🔍 البحث عن:", searchLower);

  // 1. محاولة البحث المباشر في الـ slug
  const exactSlugMatch = allReporters.find((r) => r.slug === searchLower);
  if (exactSlugMatch) {
    console.log("✅ تطابق slug مباشر:", exactSlugMatch.slug);
    return exactSlugMatch.slug;
  }

  // 2. محاولة البحث المباشر في الاسم
  const exactNameMatch = allReporters.find(
    (r) => r.full_name === searchTerm.trim()
  );
  if (exactNameMatch) {
    console.log(
      "✅ تطابق اسم مباشر:",
      exactNameMatch.full_name,
      "->",
      exactNameMatch.slug
    );
    return exactNameMatch.slug;
  }

  // 3. نظام تسجيل النقاط للبحث الذكي
  const matches = allReporters
    .map((reporter) => {
      let score = 0;
      const reporterNameWords = reporter.full_name
        .split(" ")
        .filter((w) => w.trim());
      const searchWords = searchTerm.split(" ").filter((w) => w.trim());

      // نقاط للتطابق في الكلمات
      for (const searchWord of searchWords) {
        for (const reporterWord of reporterNameWords) {
          if (reporterWord === searchWord) {
            score += 10; // تطابق كامل
          } else if (
            reporterWord.includes(searchWord) ||
            searchWord.includes(reporterWord)
          ) {
            score += 5; // تطابق جزئي
          }
        }

        // نقاط للتطابق في الـ slug
        const convertedWord = convertArabicNameToSlug(searchWord);
        if (reporter.slug.includes(convertedWord)) {
          score += 7;
        }
      }

      // مكافأة إضافية للأسماء الأطول (أكثر تحديداً)
      if (
        searchWords.length > 1 &&
        reporterNameWords.length >= searchWords.length
      ) {
        score += 3;
      }

      return { reporter, score };
    })
    .filter((match) => match.score > 0);

  // ترتيب حسب النقاط
  matches.sort((a, b) => b.score - a.score);

  if (matches.length > 0) {
    const bestMatch = matches[0];
    console.log(
      "✅ أفضل تطابق:",
      bestMatch.reporter.full_name,
      "بنقاط:",
      bestMatch.score,
      "->",
      bestMatch.reporter.slug
    );

    // عرض المطابقات الأخرى للتوضيح
    if (matches.length > 1) {
      console.log("🔍 مطابقات أخرى:");
      matches.slice(1, 3).forEach((match) => {
        console.log(`   - ${match.reporter.full_name} (${match.score} نقطة)`);
      });
    }

    return bestMatch.reporter.slug;
  }

  console.log("❌ لم يتم العثور على تطابق");
  return null;
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

    // فك تشفير الـ slug أولاً
    const decodedSlug = decodeURIComponent(slug);
    console.log("🔍 البحث بالاسم المفكوك:", decodedSlug);

    // محاولة البحث بالـ slug أولاً (المتوقع أن يكون إنجليزي)
    try {
      reporter = await prisma.reporters.findUnique({
        where: { slug: slug },
        select: {
          id: true,
          full_name: true,
          slug: true,
          title: true,
          bio: true,
          avatar_url: true,
          specializations: true,
          coverage_areas: true,
          is_verified: true,
          verification_badge: true,
          is_active: true,
          twitter_url: true,
          linkedin_url: true,
          website_url: true,
          email_public: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (reporter) {
        console.log("✅ تم العثور على المراسل بالـ slug:", reporter.full_name);
      }
    } catch (error) {
      console.log("خطأ في البحث بالـ slug:", error);
    }

    // إذا لم يتم العثور عليه، حاول البحث بالاسم الكامل (للاسماء العربية)
    if (!reporter) {
      console.log("⚠️ لم يُعثر على المراسل بالـ slug، محاولة البحث بالاسم...");

      try {
        reporter = await prisma.reporters.findFirst({
          where: {
            OR: [
              {
                full_name: {
                  equals: decodedSlug,
                  mode: "insensitive",
                },
              },
              {
                full_name: {
                  contains: decodedSlug,
                  mode: "insensitive",
                },
              },
              // البحث في أجزاء الاسم
              {
                full_name: {
                  contains: decodedSlug.split(" ")[0], // الاسم الأول
                  mode: "insensitive",
                },
              },
            ],
          },
          select: {
            id: true,
            full_name: true,
            slug: true,
            title: true,
            bio: true,
            avatar_url: true,
            specializations: true,
            coverage_areas: true,
            is_verified: true,
            verification_badge: true,
            is_active: true,
            twitter_url: true,
            linkedin_url: true,
            website_url: true,
            email_public: true,
            created_at: true,
            updated_at: true,
          },
        });

        if (reporter) {
          console.log("✅ تم العثور على المراسل بالاسم:", reporter.full_name);
        }
      } catch (error) {
        console.log("خطأ في البحث بالاسم الكامل:", error);
      }
    }

    // محاولة أخيرة: البحث الذكي بجميع الـ slugs
    if (!reporter) {
      console.log("🔄 محاولة أخيرة: البحث الذكي في جميع المراسلين...");

      try {
        // جلب جميع المراسلين للبحث الذكي
        const allReporters = await prisma.reporters.findMany({
          where: { is_active: true },
          select: {
            id: true,
            full_name: true,
            slug: true,
          },
        });

        // البحث الذكي
        const smartMatch = findBestSlugMatch(decodedSlug, allReporters);

        if (smartMatch) {
          console.log("🎯 تم العثور على تطابق ذكي:", smartMatch);

          reporter = await prisma.reporters.findUnique({
            where: { slug: smartMatch },
            select: {
              id: true,
              full_name: true,
              slug: true,
              title: true,
              bio: true,
              avatar_url: true,
              specializations: true,
              coverage_areas: true,
              is_verified: true,
              verification_badge: true,
              is_active: true,
              twitter_url: true,
              linkedin_url: true,
              website_url: true,
              email_public: true,
              created_at: true,
              updated_at: true,
            },
          });

          if (reporter) {
            console.log(
              "✅ تم العثور على المراسل بالبحث الذكي:",
              reporter.full_name
            );
          }
        } else {
          console.log("❌ لم يتم العثور على تطابق ذكي");
        }
      } catch (error) {
        console.log("خطأ في البحث الذكي:", error);
      }
    }

    if (!reporter) {
      console.log("❌ لم يتم العثور على المراسل نهائياً");
      return NextResponse.json(
        { success: false, error: "المراسل غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من أن المراسل نشط
    if (!reporter.is_active) {
      console.log("⚠️ المراسل غير نشط:", reporter.full_name);
      return NextResponse.json(
        { success: false, error: "المراسل غير متوفر حالياً" },
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
