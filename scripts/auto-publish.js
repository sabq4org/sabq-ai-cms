/**
 * النشر التلقائي للمحتوى الجديد
 * يمكن استخدامه كـ cron job أو يدوياً
 */

async function autoPublish() {
  console.log("🤖 النشر التلقائي للمحتوى الجديد...\n");

  const baseUrl = "http://localhost:3003";
  let publishedCount = 0;

  try {
    // 1. نشر الزوايا الجديدة
    console.log("📐 فحص الزوايا الجديدة...");

    const anglesResponse = await fetch(`${baseUrl}/api/muqtarab/angles`);
    const anglesData = await anglesResponse.json();

    if (anglesData.success) {
      const unpublishedAngles = anglesData.angles.filter(
        (angle) => !angle.is_published
      );

      if (unpublishedAngles.length > 0) {
        console.log(`   🔢 وجدت ${unpublishedAngles.length} زاوية جديدة للنشر`);

        for (const angle of unpublishedAngles) {
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
                coverImage: angle.cover_image,
                isFeatured: false,
                isPublished: true,
              }),
            }
          );

          if (updateResponse.ok) {
            console.log(`   ✅ نُشرت زاوية "${angle.title}"`);
            publishedCount++;
          }
        }
      } else {
        console.log("   ✅ جميع الزوايا منشورة");
      }

      // 2. نشر المقالات الجديدة
      console.log("\\n📝 فحص المقالات الجديدة...");

      const publishedAngles = anglesData.angles.filter(
        (angle) => angle.is_published
      );

      for (const angle of publishedAngles) {
        const articlesResponse = await fetch(
          `${baseUrl}/api/muqtarab/angles/${angle.id}/articles`
        );
        const articlesData = await articlesResponse.json();

        if (articlesData.success && articlesData.articles) {
          const unpublishedArticles = articlesData.articles.filter(
            (article) => !article.is_published
          );

          if (unpublishedArticles.length > 0) {
            console.log(
              `   📂 زاوية "${angle.title}": ${unpublishedArticles.length} مقال جديد`
            );

            for (const article of unpublishedArticles) {
              const updateResponse = await fetch(
                `${baseUrl}/api/muqtarab/angles/${angle.id}/articles/${article.id}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: article.title,
                    content: article.content,
                    excerpt: article.excerpt,
                    coverImage: article.cover_image,
                    authorId: article.author_id,
                    tags: article.tags || [],
                    isPublished: true,
                    publishDate: new Date().toISOString(),
                  }),
                }
              );

              if (updateResponse.ok) {
                console.log(`     ✅ نُشر مقال "${article.title}"`);
                publishedCount++;
              }
            }
          }
        }
      }

      // 3. التقرير النهائي
      console.log(`\\n📊 التقرير النهائي:`);
      console.log(`   📈 تم نشر ${publishedCount} عنصر جديد`);

      if (publishedCount > 0) {
        console.log("   🎉 تم تحديث الموقع بالمحتوى الجديد!");
        console.log("   🌐 الرابط: http://localhost:3003/muqtarab");
      } else {
        console.log("   ✅ جميع المحتوى منشور بالفعل");
      }
    } else {
      console.log("❌ خطأ في جلب البيانات");
    }
  } catch (error) {
    console.error("❌ خطأ في النشر التلقائي:", error.message);
  }
}

// إضافة الدالة للـ package.json scripts
console.log("💡 نصيحة: أضف هذا للـ package.json:");
console.log('"scripts": { "auto-publish": "node scripts/auto-publish.js" }');
console.log("");

autoPublish();
