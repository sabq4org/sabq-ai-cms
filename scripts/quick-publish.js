/**
 * نشر سريع للمحتوى الأحدث
 * لحل مشكلة عدم ظهور المحتوى الجديد
 */

async function quickPublish() {
  console.log("⚡ نشر سريع للمحتوى الأحدث...\n");

  const baseUrl = "http://localhost:3003";

  try {
    // 1. نشر آخر زاوية مضافة
    console.log("🔍 البحث عن آخر زاوية مضافة...");

    const anglesResponse = await fetch(`${baseUrl}/api/muqtarab/angles`);
    const anglesData = await anglesResponse.json();

    if (anglesData.success && anglesData.angles) {
      // ترتيب الزوايا حسب تاريخ الإنشاء (الأحدث أولاً)
      const sortedAngles = anglesData.angles.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      const latestAngle = sortedAngles[0];

      if (latestAngle && !latestAngle.is_published) {
        console.log(`📐 وجدت زاوية غير منشورة: "${latestAngle.title}"`);
        console.log("🚀 جاري نشرها...");

        const publishAngleResponse = await fetch(
          `${baseUrl}/api/muqtarab/angles/${latestAngle.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: latestAngle.title,
              description: latestAngle.description,
              icon: latestAngle.icon,
              themeColor: latestAngle.theme_color,
              coverImage: latestAngle.cover_image,
              isFeatured: latestAngle.is_featured || false,
              isPublished: true,
            }),
          }
        );

        if (publishAngleResponse.ok) {
          console.log(`✅ تم نشر زاوية "${latestAngle.title}" بنجاح!`);
        } else {
          console.log(`❌ فشل نشر الزاوية`);
        }
      } else if (latestAngle && latestAngle.is_published) {
        console.log(`✅ آخر زاوية "${latestAngle.title}" منشورة بالفعل`);
      }

      // 2. نشر آخر مقال في كل زاوية
      console.log("\n🔍 البحث عن المقالات غير المنشورة...");

      for (const angle of sortedAngles.slice(0, 3)) {
        // فحص آخر 3 زوايا فقط
        const articlesResponse = await fetch(
          `${baseUrl}/api/muqtarab/angles/${angle.id}/articles`
        );
        const articlesData = await articlesResponse.json();

        if (articlesData.success && articlesData.articles) {
          const sortedArticles = articlesData.articles.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          const latestArticle = sortedArticles[0];

          if (latestArticle && !latestArticle.is_published) {
            console.log(
              `📝 وجدت مقال غير منشور: "${latestArticle.title}" في زاوية "${angle.title}"`
            );
            console.log("🚀 جاري نشره...");

            const publishArticleResponse = await fetch(
              `${baseUrl}/api/muqtarab/angles/${angle.id}/articles/${latestArticle.id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: latestArticle.title,
                  content: latestArticle.content,
                  excerpt: latestArticle.excerpt,
                  coverImage: latestArticle.cover_image,
                  authorId: latestArticle.author_id,
                  tags: latestArticle.tags || [],
                  isPublished: true,
                  publishDate: new Date().toISOString(),
                }),
              }
            );

            if (publishArticleResponse.ok) {
              console.log(`✅ تم نشر مقال "${latestArticle.title}" بنجاح!`);
            } else {
              console.log(`❌ فشل نشر المقال`);
            }
          }
        }
      }

      console.log("\n🎉 انتهت عملية النشر السريع!");
      console.log("🌐 تفقد الموقع الآن: http://localhost:3003/muqtarab");
    } else {
      console.log("❌ لم يتم العثور على زوايا");
    }
  } catch (error) {
    console.error("❌ خطأ في النشر السريع:", error.message);
  }
}

quickPublish();
