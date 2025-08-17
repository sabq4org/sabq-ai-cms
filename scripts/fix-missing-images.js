/**
 * إصلاح الصور المفقودة في الزوايا والمقالات
 * إضافة صور افتراضية عالية الجودة
 */

async function fixMissingImages() {
  console.log("🖼️ إصلاح الصور المفقودة...\n");

  const baseUrl = "http://localhost:3003";

  // صور افتراضية عالية الجودة من Unsplash
  const defaultImages = {
    angles: {
      "فكر رقمي":
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
      نسيج: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop",
      "تقنية AI":
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
      default:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
    },
    articles: {
      تقنية:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop",
      مجتمع:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop",
      "ذكاء اصطناعي":
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
      تركيز:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop",
      علاقات:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop",
      default:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=800&fit=crop",
    },
  };

  try {
    // 1. إصلاح صور الزوايا
    console.log("📐 إصلاح صور الزوايا...");

    const anglesResponse = await fetch(`${baseUrl}/api/muqtarab/angles`);
    const anglesData = await anglesResponse.json();

    if (anglesData.success) {
      const anglesWithoutImages = anglesData.angles.filter(
        (angle) => !angle.cover_image
      );

      console.log(`   🔍 وجدت ${anglesWithoutImages.length} زاوية بدون صور`);

      for (const angle of anglesWithoutImages) {
        // اختيار صورة مناسبة حسب عنوان الزاوية
        let selectedImage = defaultImages.angles.default;

        if (angle.title.includes("رقمي") || angle.title.includes("تقنية")) {
          selectedImage = defaultImages.angles["فكر رقمي"];
        } else if (
          angle.title.includes("نسيج") ||
          angle.title.includes("مجتمع")
        ) {
          selectedImage = defaultImages.angles["نسيج"];
        } else if (angle.title.includes("AI") || angle.title.includes("ذكاء")) {
          selectedImage = defaultImages.angles["تقنية AI"];
        }

        console.log(`   🔄 تحديث صورة زاوية "${angle.title}"...`);

        const updateResponse = await fetch(
          `${baseUrl}/api/muqtarab/angles/${angle.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: angle.title,
              description: angle.description,
              icon: angle.icon,
              themeColor: angle.theme_color,
              slug: angle.slug,
              coverImage: selectedImage,
              isFeatured: angle.is_featured || false,
              isPublished: angle.is_published,
            }),
          }
        );

        if (updateResponse.ok) {
          console.log(`     ✅ تم تحديث صورة "${angle.title}"`);
        } else {
          console.log(`     ❌ فشل تحديث صورة "${angle.title}"`);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // 2. إصلاح صور المقالات
    console.log("\n📝 إصلاح صور المقالات...");

    const publishedAngles = anglesData.angles.filter(
      (angle) => angle.is_published
    );

    for (const angle of publishedAngles) {
      const articlesResponse = await fetch(
        `${baseUrl}/api/muqtarab/angles/${angle.id}/articles`
      );
      const articlesData = await articlesResponse.json();

      if (articlesData.success && articlesData.articles) {
        const articlesWithoutImages = articlesData.articles.filter(
          (article) => !article.cover_image
        );

        if (articlesWithoutImages.length > 0) {
          console.log(
            `\n   📂 زاوية "${angle.title}": ${articlesWithoutImages.length} مقال بدون صور`
          );

          for (const article of articlesWithoutImages) {
            // اختيار صورة مناسبة حسب محتوى المقال
            let selectedImage = defaultImages.articles.default;

            const content = (
              article.title +
              " " +
              (article.excerpt || "")
            ).toLowerCase();

            if (
              content.includes("تقنية") ||
              content.includes("رقمي") ||
              content.includes("تكنولوجيا")
            ) {
              selectedImage = defaultImages.articles["تقنية"];
            } else if (
              content.includes("ذكاء") ||
              content.includes("ai") ||
              content.includes("خوارزمية")
            ) {
              selectedImage = defaultImages.articles["ذكاء اصطناعي"];
            } else if (
              content.includes("تركيز") ||
              content.includes("انتباه") ||
              content.includes("تمرير")
            ) {
              selectedImage = defaultImages.articles["تركيز"];
            } else if (
              content.includes("علاقات") ||
              content.includes("مجتمع") ||
              content.includes("اجتماعي")
            ) {
              selectedImage = defaultImages.articles["علاقات"];
            }

            console.log(`     🔄 تحديث صورة مقال "${article.title}"...`);

            const updateResponse = await fetch(
              `${baseUrl}/api/muqtarab/angles/${angle.id}/articles/${article.id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: article.title,
                  content: article.content,
                  excerpt: article.excerpt,
                  coverImage: selectedImage,
                  authorId: article.author_id,
                  tags: article.tags || [],
                  isPublished: article.is_published,
                  publishDate: article.publish_date,
                }),
              }
            );

            if (updateResponse.ok) {
              console.log(`       ✅ تم تحديث صورة "${article.title}"`);
            } else {
              console.log(`       ❌ فشل تحديث صورة "${article.title}"`);
            }

            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }
      }
    }

    console.log("\n🎉 انتهى إصلاح الصور!");
    console.log("🌐 تفقد الموقع الآن: http://localhost:3003/muqtarab");
  } catch (error) {
    console.error("❌ خطأ في إصلاح الصور:", error.message);
  }
}

fixMissingImages();
