/**
 * نشر الزوايا غير المنشورة
 */

async function publishAngles() {
  console.log("📐 نشر الزوايا غير المنشورة...\n");

  const baseUrl = "http://localhost:3003";

  try {
    const anglesResponse = await fetch(`${baseUrl}/api/muqtarab/angles`);
    const anglesData = await anglesResponse.json();

    if (!anglesData.success) {
      console.log("❌ خطأ في جلب الزوايا:", anglesData.error);
      return;
    }

    const unpublishedAngles = anglesData.angles.filter(
      (angle) => !angle.is_published
    );

    console.log(`📊 عدد الزوايا غير المنشورة: ${unpublishedAngles.length}`);

    if (unpublishedAngles.length === 0) {
      console.log("✅ جميع الزوايا منشورة بالفعل!");
      return;
    }

    for (const angle of unpublishedAngles) {
      console.log(`\\n🔄 نشر زاوية: "${angle.title}"`);
      console.log(`   📝 الوصف: ${angle.description.substring(0, 50)}...`);
      console.log(`   🔗 المسار: ${angle.slug}`);

      try {
        // استخدام البيانات الموجودة مع تفعيل النشر فقط
        const updateData = {
          title: angle.title,
          description: angle.description,
          icon: angle.icon,
          themeColor: angle.theme_color,
          slug: angle.slug,
          coverImage: angle.cover_image,
          isFeatured: false, // تعيين false أولاً
          isPublished: true, // تفعيل النشر
        };

        console.log("   📡 إرسال طلب النشر...");

        const response = await fetch(
          `${baseUrl}/api/muqtarab/angles/${angle.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        const responseData = await response.json();

        if (response.ok && responseData.success) {
          console.log(`   ✅ تم نشر "${angle.title}" بنجاح!`);
        } else {
          console.log(`   ❌ فشل نشر "${angle.title}":`, responseData.error);
          console.log("   📋 تفاصيل الاستجابة:", responseData);
        }
      } catch (error) {
        console.log(`   ❌ خطأ في نشر "${angle.title}":`, error.message);
      }

      // انتظار قصير بين الطلبات
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\\n🎉 انتهت عملية نشر الزوايا!");
    console.log("🌐 تفقد الموقع: http://localhost:3003/muqtarab");
  } catch (error) {
    console.error("❌ خطأ عام:", error.message);
  }
}

publishAngles();
