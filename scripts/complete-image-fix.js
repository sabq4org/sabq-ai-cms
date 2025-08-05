/**
 * إضافة صور لجميع المقالات والزوايا المفقودة
 */

async function completeImageFix() {
  console.log("🎨 إصلاح شامل للصور...\n");

  const baseUrl = "http://localhost:3003";

  // مجموعة متنوعة من الصور عالية الجودة
  const images = [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop&auto=format", // تقنية وتركيز
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop&auto=format", // علاقات ومجتمع
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop&auto=format", // ذكاء اصطناعي
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&auto=format", // تقنية عامة
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop&auto=format", // تفكير ودراسة
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=800&fit=crop&auto=format", // عمل وإنتاجية
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&auto=format", // تطوير شخصي
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop&auto=format", // مستقبل وابتكار
  ];

  try {
    // جلب الزوايا
    const response = await fetch(`${baseUrl}/api/muqtarab/angles`);
    const data = await response.json();

    if (!data.success) {
      console.log("❌ خطأ في جلب البيانات");
      return;
    }

    const publishedAngles = data.angles.filter((angle) => angle.is_published);
    console.log(`📊 عدد الزوايا المنشورة: ${publishedAngles.length}\n`);

    // معالجة كل زاوية
    for (const angle of publishedAngles) {
      console.log(`📂 معالجة زاوية "${angle.title}"...`);

      // جلب مقالات الزاوية
      const articlesResponse = await fetch(
        `${baseUrl}/api/muqtarab/angles/${angle.id}/articles`
      );
      const articlesData = await articlesResponse.json();

      if (articlesData.success && articlesData.articles) {
        const publishedArticles = articlesData.articles.filter(
          (article) => article.is_published
        );
        console.log(`   📝 المقالات المنشورة: ${publishedArticles.length}`);

        // معالجة كل مقال
        for (let i = 0; i < publishedArticles.length; i++) {
          const article = publishedArticles[i];

          // تخطي المقالات التي تحتوي على صور بالفعل
          if (article.coverImage && article.coverImage !== null) {
            console.log(`     ✅ "${article.title}" - يحتوي على صورة بالفعل`);
            continue;
          }

          // اختيار صورة مناسبة
          let selectedImage = images[i % images.length];

          // اختيار صورة حسب المحتوى
          const content = (
            article.title +
            " " +
            (article.excerpt || "")
          ).toLowerCase();
          if (
            content.includes("تركيز") ||
            content.includes("انتباه") ||
            content.includes("تمرير")
          ) {
            selectedImage = images[0]; // صورة التركيز
          } else if (
            content.includes("علاقات") ||
            content.includes("تغيير") ||
            content.includes("مجتمع")
          ) {
            selectedImage = images[1]; // صورة المجتمع
          } else if (content.includes("ذكاء") || content.includes("ai")) {
            selectedImage = images[2]; // صورة AI
          }

          console.log(`     🔄 إضافة صورة لـ "${article.title}"...`);

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
            console.log(`       ✅ تم تحديث "${article.title}"`);
          } else {
            const errorData = await updateResponse.json();
            console.log(
              `       ❌ فشل تحديث "${article.title}":`,
              errorData.error
            );
          }

          // انتظار قصير
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }

      console.log(""); // سطر فارغ
    }

    console.log("🎉 انتهى الإصلاح الشامل للصور!");
    console.log("🌐 تفقد الموقع: http://localhost:3003/muqtarab");
  } catch (error) {
    console.error("❌ خطأ في الإصلاح:", error.message);
  }
}

completeImageFix();
