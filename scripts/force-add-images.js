/**
 * إضافة صور إجبارية لجميع المقالات
 */

async function forceAddImages() {
  console.log("🚀 إضافة صور إجبارية لجميع المقالات...\n");

  const baseUrl = "http://localhost:3003";

  // صور متنوعة عالية الجودة
  const images = [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=800&fit=crop",
  ];

  try {
    // جلب جميع الزوايا
    const anglesResponse = await fetch(`${baseUrl}/api/muqtarab/angles`);
    const anglesData = await anglesResponse.json();

    if (!anglesData.success) {
      console.log("❌ خطأ في جلب الزوايا");
      return;
    }

    const publishedAngles = anglesData.angles.filter(
      (angle) => angle.is_published
    );
    let totalUpdated = 0;

    for (const angle of publishedAngles) {
      console.log(`\n📂 معالجة زاوية "${angle.title}"...`);

      // جلب مقالات الزاوية
      const articlesResponse = await fetch(
        `${baseUrl}/api/muqtarab/angles/${angle.id}/articles`
      );
      const articlesData = await articlesResponse.json();

      if (articlesData.success && articlesData.articles) {
        const publishedArticles = articlesData.articles.filter(
          (article) => article.is_published
        );
        console.log(`   📝 عدد المقالات المنشورة: ${publishedArticles.length}`);

        for (let i = 0; i < publishedArticles.length; i++) {
          const article = publishedArticles[i];

          // اختيار صورة مختلفة لكل مقال
          const selectedImage = images[i % images.length];

          console.log(`     🔄 تحديث صورة المقال "${article.title}"...`);

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
                authorId: article.author_id,
                tags: article.tags || [],
                isPublished: true,
                publishDate: article.publish_date || new Date().toISOString(),
              }),
            }
          );

          if (updateResponse.ok) {
            console.log(`       ✅ تم تحديث "${article.title}"`);
            totalUpdated++;
          } else {
            const errorData = await updateResponse.json();
            console.log(
              `       ❌ فشل تحديث "${article.title}":`,
              errorData.error
            );
          }

          // انتظار قصير
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    console.log(`\n🎯 النتائج النهائية:`);
    console.log(`   📸 تم تحديث ${totalUpdated} مقال بصور جديدة`);
    console.log(`\n🎉 انتهت عملية إضافة الصور!`);
    console.log("🌐 تفقد الموقع الآن: http://localhost:3003/muqtarab");
  } catch (error) {
    console.error("❌ خطأ في العملية:", error.message);
  }
}

forceAddImages();
