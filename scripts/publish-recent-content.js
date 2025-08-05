/**
 * نشر المحتوى الحديث غير المنشور
 * يقوم بنشر آخر الزوايا والمقالات المضافة
 */

async function publishRecentContent() {
  console.log("🚀 بدء عملية نشر المحتوى الحديث...\n");

  try {
    const baseUrl = "http://localhost:3003";

    // 1. جلب جميع الزوايا للتحقق من المنشور/غير المنشور
    console.log("📐 فحص الزوايا...");
    const anglesResponse = await fetch(`${baseUrl}/api/muqtarab/angles`);
    const anglesData = await anglesResponse.json();

    if (!anglesData.success) {
      console.error("❌ خطأ في جلب الزوايا:", anglesData.error);
      return;
    }

    const allAngles = anglesData.angles || [];
    const unpublishedAngles = allAngles.filter((angle) => !angle.is_published);

    console.log(`   📊 إجمالي الزوايا: ${allAngles.length}`);
    console.log(`   📋 غير منشور: ${unpublishedAngles.length}`);

    // 2. نشر الزوايا غير المنشورة
    if (unpublishedAngles.length > 0) {
      console.log("\\n🔄 نشر الزوايا غير المنشورة:");

      for (const angle of unpublishedAngles) {
        try {
          console.log(`   • نشر زاوية "${angle.title}"...`);

          const updateResponse = await fetch(
            `${baseUrl}/api/muqtarab/angles/${angle.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: angle.title,
                description: angle.description,
                icon: angle.icon,
                themeColor: angle.theme_color,
                coverImage: angle.cover_image,
                isFeatured: angle.is_featured || false,
                isPublished: true, // تفعيل النشر
              }),
            }
          );

          if (updateResponse.ok) {
            console.log(`     ✅ تم نشر "${angle.title}" بنجاح`);
          } else {
            const errorData = await updateResponse.json();
            console.log(`     ❌ فشل نشر "${angle.title}":`, errorData.error);
          }

          // انتظار قصير بين الطلبات
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.log(`     ❌ خطأ في نشر "${angle.title}":`, error.message);
        }
      }
    }

    // 3. فحص ونشر المقالات غير المنشورة
    console.log("\\n📝 فحص المقالات في كل زاوية...");

    for (const angle of allAngles) {
      try {
        // جلب مقالات الزاوية
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
              `\\n   📂 زاوية "${angle.title}" - ${unpublishedArticles.length} مقال غير منشور:`
            );

            for (const article of unpublishedArticles) {
              try {
                console.log(`     • نشر مقال "${article.title}"...`);

                const updateArticleResponse = await fetch(
                  `${baseUrl}/api/muqtarab/angles/${angle.id}/articles/${article.id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      title: article.title,
                      content: article.content,
                      excerpt: article.excerpt,
                      coverImage: article.cover_image,
                      authorId: article.author_id,
                      tags: article.tags || [],
                      isPublished: true, // تفعيل النشر
                      publishDate: new Date().toISOString(),
                    }),
                  }
                );

                if (updateArticleResponse.ok) {
                  console.log(`       ✅ تم نشر "${article.title}" بنجاح`);
                } else {
                  const errorData = await updateArticleResponse.json();
                  console.log(
                    `       ❌ فشل نشر "${article.title}":`,
                    errorData.error
                  );
                }

                // انتظار قصير بين الطلبات
                await new Promise((resolve) => setTimeout(resolve, 300));
              } catch (error) {
                console.log(
                  `       ❌ خطأ في نشر "${article.title}":`,
                  error.message
                );
              }
            }
          }
        }
      } catch (error) {
        console.log(
          `   ❌ خطأ في فحص مقالات زاوية "${angle.title}":`,
          error.message
        );
      }
    }

    console.log(
      "\\n🎉 انتهت عملية النشر! تحقق من الموقع لرؤية المحتوى المنشور."
    );
    console.log("🌐 الرابط: http://localhost:3003/muqtarab");
  } catch (error) {
    console.error("❌ خطأ عام في عملية النشر:", error);
  }
}

// تشغيل الدالة
publishRecentContent();
