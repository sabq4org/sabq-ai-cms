/**
 * إضافة صور للمقالات التي لا تحتوي على صور
 */

async function addArticleImages() {
  console.log("📸 إضافة صور للمقالات...\n");

  const baseUrl = "http://localhost:3003";

  // صور عالية الجودة مخصصة للمقالات
  const articleImages = [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop&auto=format", // تقنية وتركيز
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop&auto=format", // مجتمع وعلاقات
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop&auto=format", // ذكاء اصطناعي
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&auto=format", // تقنية عامة
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop&auto=format", // تفكير ودراسة
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=800&fit=crop&auto=format", // عمل وإنتاجية
  ];

  try {
    const anglesResponse = await fetch(`${baseUrl}/api/muqtarab/angles`);
    const anglesData = await anglesResponse.json();

    if (!anglesData.success) {
      console.log("❌ خطأ في جلب الزوايا");
      return;
    }

    const publishedAngles = anglesData.angles.filter(
      (angle) => angle.is_published
    );
    let updatedCount = 0;

    for (const angle of publishedAngles) {
      console.log(`\n📂 فحص مقالات زاوية "${angle.title}"...`);

      const articlesResponse = await fetch(
        `${baseUrl}/api/muqtarab/angles/${angle.id}/articles`
      );
      const articlesData = await articlesResponse.json();

      if (articlesData.success && articlesData.articles) {
        const articlesWithoutImages = articlesData.articles.filter(
          (article) => !article.cover_image || article.cover_image === null
        );

        console.log(`   📊 المقالات بدون صور: ${articlesWithoutImages.length}`);

        for (let i = 0; i < articlesWithoutImages.length; i++) {
          const article = articlesWithoutImages[i];

          // اختيار صورة مناسبة
          let selectedImage;
          const content = (
            article.title +
            " " +
            (article.excerpt || "")
          ).toLowerCase();

          if (
            content.includes("تركيز") ||
            content.includes("تمرير") ||
            content.includes("انتباه")
          ) {
            selectedImage = articleImages[0]; // صورة التركيز
          } else if (
            content.includes("علاقات") ||
            content.includes("مجتمع") ||
            content.includes("تغيير")
          ) {
            selectedImage = articleImages[1]; // صورة المجتمع
          } else if (
            content.includes("ذكاء") ||
            content.includes("ai") ||
            content.includes("خوارزمية")
          ) {
            selectedImage = articleImages[2]; // صورة AI
          } else if (
            content.includes("تقنية") ||
            content.includes("رقمي") ||
            content.includes("تكنولوجيا")
          ) {
            selectedImage = articleImages[3]; // صورة التقنية
          } else if (
            content.includes("تفكير") ||
            content.includes("دراسة") ||
            content.includes("بحث")
          ) {
            selectedImage = articleImages[4]; // صورة التفكير
          } else {
            // استخدام صورة مختلفة لكل مقال
            selectedImage = articleImages[i % articleImages.length];
          }

          console.log(`     🔄 إضافة صورة لمقال "${article.title}"...`);

          const updateData = {
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            coverImage: selectedImage,
            authorId: article.author_id,
            tags: article.tags || [],
            isPublished: article.is_published,
            publishDate: article.publish_date,
          };

          const updateResponse = await fetch(
            `${baseUrl}/api/muqtarab/angles/${angle.id}/articles/${article.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updateData),
            }
          );

          if (updateResponse.ok) {
            console.log(`       ✅ تم إضافة صورة لـ "${article.title}"`);
            updatedCount++;
          } else {
            const errorData = await updateResponse.json();
            console.log(
              `       ❌ فشل إضافة صورة لـ "${article.title}":`,
              errorData.error
            );
          }

          // انتظار قصير
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    }

    console.log(`\n📊 الإحصائيات النهائية:`);
    console.log(`   📸 تم تحديث ${updatedCount} مقال بصور جديدة`);
    console.log(`\n🎉 انتهت عملية إضافة الصور!`);
    console.log("🌐 تفقد الموقع: http://localhost:3003/muqtarab");
  } catch (error) {
    console.error("❌ خطأ في إضافة الصور:", error.message);
  }
}

addArticleImages();
