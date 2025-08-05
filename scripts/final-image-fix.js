/**
 * إصلاح نهائي للصور - بدون فلتر النشر
 */

async function finalImageFix() {
  console.log("🎯 الإصلاح النهائي للصور...\n");

  const baseUrl = "http://localhost:3003";

  const images = [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop&auto=format",
  ];

  // معرفات الزوايا المعروفة
  const knownAngles = [
    { id: "2b13681c-f97d-40d5-ae2b-38ec3a74e01c", title: "نسيج" },
    { id: "4648b5f7-ca37-414b-b5f2-733a597254f7", title: "فكر رقمي" },
    { id: "f86ff880-7c24-4eef-9794-98e953d4268c", title: "تقنية AI" },
  ];

  try {
    for (const angle of knownAngles) {
      console.log(`📂 معالجة زاوية "${angle.title}"...`);

      // جلب مقالات الزاوية
      const articlesResponse = await fetch(
        `${baseUrl}/api/muqtarab/angles/${angle.id}/articles`
      );
      const articlesData = await articlesResponse.json();

      if (articlesData.success && articlesData.articles) {
        console.log(`   📝 عدد المقالات: ${articlesData.articles.length}`);

        for (let i = 0; i < articlesData.articles.length; i++) {
          const article = articlesData.articles[i];

          // تخطي المقالات التي تحتوي على صور
          if (article.coverImage) {
            console.log(`     ✅ "${article.title}" - يحتوي على صورة`);
            continue;
          }

          console.log(`     🔄 إضافة صورة لـ "${article.title}"...`);

          // اختيار صورة
          const selectedImage = images[i % images.length];

          // تحديث المقال
          const updateResponse = await fetch(
            `${baseUrl}/api/muqtarab/angles/${angle.id}/articles/${article.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: article.title,
                content: article.content || "",
                excerpt: article.excerpt || "",
                coverImage: selectedImage,
                authorId: article.authorId || article.author_id,
                tags: article.tags || [],
                isPublished: true,
                publishDate:
                  article.publishDate ||
                  article.publish_date ||
                  new Date().toISOString(),
              }),
            }
          );

          if (updateResponse.ok) {
            console.log(`       ✅ تم إضافة صورة لـ "${article.title}"`);
          } else {
            const errorData = await updateResponse.json();
            console.log(`       ❌ فشل: ${errorData.error}`);
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        console.log(`   ❌ فشل جلب مقالات زاوية "${angle.title}"`);
      }

      console.log(""); // سطر فارغ
    }

    console.log("🎉 انتهى الإصلاح النهائي!");
    console.log("🌐 الموقع: http://localhost:3003/muqtarab");
  } catch (error) {
    console.error("❌ خطأ:", error.message);
  }
}

finalImageFix();
