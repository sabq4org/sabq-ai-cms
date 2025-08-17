/**
 * إصلاح حالة النشر للزوايا - تحويل null إلى true
 */

async function fixAnglesPublishedStatus() {
  console.log("🔧 إصلاح حالة النشر للزوايا...\n");

  const baseUrl = "http://localhost:3003";

  // معرفات الزوايا التي نريد نشرها
  const angleIds = [
    "2b13681c-f97d-40d5-ae2b-38ec3a74e01c", // نسيج 1
    "d7351e3c-aca6-4528-a5f2-83008323a680", // نسيج 2
    "4648b5f7-ca37-414b-b5f2-733a597254f7", // فكر رقمي
    "f86ff880-7c24-4eef-9794-98e953d4268c", // تقنية AI
  ];

  try {
    for (const angleId of angleIds) {
      console.log(`🔄 تفعيل نشر الزاوية ${angleId}...`);

      // جلب بيانات الزاوية أولاً
      const getResponse = await fetch(
        `${baseUrl}/api/muqtarab/angles/${angleId}`
      );

      if (!getResponse.ok) {
        console.log(`   ❌ فشل في جلب بيانات الزاوية ${angleId}`);
        continue;
      }

      const angleData = await getResponse.json();

      if (!angleData.success || !angleData.angle) {
        console.log(`   ❌ بيانات الزاوية غير متاحة ${angleId}`);
        continue;
      }

      const angle = angleData.angle;

      // تحديث الزاوية مع تفعيل النشر
      const updateResponse = await fetch(
        `${baseUrl}/api/muqtarab/angles/${angleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: angle.title,
            description: angle.description,
            icon: angle.icon,
            themeColor: angle.themeColor || angle.theme_color || "#3B82F6",
            slug: angle.slug,
            coverImage: angle.coverImage || angle.cover_image,
            isFeatured: angle.isFeatured || false,
            isPublished: true, // تفعيل النشر بوضوح
          }),
        }
      );

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        console.log(`   ✅ تم تفعيل نشر زاوية "${angle.title}"`);
      } else {
        const errorData = await updateResponse.json();
        console.log(
          `   ❌ فشل تفعيل نشر زاوية "${angle.title}":`,
          errorData.error
        );
      }

      // انتظار قصير
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n🎉 انتهى إصلاح حالة النشر!");
    console.log("🔄 التحقق من النتائج...\n");

    // التحقق من النتائج
    const finalResponse = await fetch(`${baseUrl}/api/muqtarab/angles`);
    const finalData = await finalResponse.json();

    if (finalData.success) {
      const publishedAngles = finalData.angles.filter(
        (angle) => angle.isPublished === true
      );
      console.log(`📊 عدد الزوايا المنشورة الآن: ${publishedAngles.length}`);

      publishedAngles.forEach((angle) => {
        console.log(`   ✅ "${angle.title}" - منشورة`);
      });
    }

    console.log("\n🌐 تفقد الموقع: http://localhost:3003/muqtarab");
  } catch (error) {
    console.error("❌ خطأ في الإصلاح:", error.message);
  }
}

fixAnglesPublishedStatus();
