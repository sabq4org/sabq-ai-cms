const fetch = require("node-fetch");

async function simpleImageTest() {
  try {
    console.log("🔍 اختبار بسيط للصور...");

    // اختبار API للحصول على مقال واحد
    const response = await fetch("http://localhost:3003/api/articles?limit=1");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.articles && data.articles.length > 0) {
      const article = data.articles[0];
      console.log("✅ تم جلب مقال بنجاح");
      console.log(`📄 العنوان: ${article.title}`);
      console.log(`🖼️ الصورة (image): ${article.image || "غير موجودة"}`);
      console.log(
        `📱 featured_image: ${article.featured_image || "غير موجودة"}`
      );
      console.log(`🔗 image_url: ${article.image_url || "غير موجودة"}`);

      // تحديد نوع الصورة
      const mainImage =
        article.image || article.featured_image || article.image_url;
      if (mainImage) {
        if (mainImage.includes("cloudinary.com")) {
          console.log("🎉 نجح الإصلاح! الصورة من Cloudinary (حقيقية)");
          return true;
        } else if (mainImage.includes("ui-avatars.com")) {
          console.log("⚠️ لا تزال المشكلة - صورة احتياطية من ui-avatars");
          return false;
        } else {
          console.log(`🔍 صورة من مصدر آخر: ${mainImage}`);
          return true;
        }
      } else {
        console.log("❌ لا توجد صورة في المقال");
        return false;
      }
    } else {
      console.log("❌ فشل في جلب البيانات");
      return false;
    }
  } catch (error) {
    console.error("❌ خطأ في الاختبار:", error.message);
    return false;
  }
}

// تشغيل الاختبار
simpleImageTest().then((success) => {
  if (success) {
    console.log("\n🎉 الإصلاح نجح! الصور الحقيقية تظهر الآن");
  } else {
    console.log("\n⚠️ قد تحتاج للمزيد من الإصلاحات");
  }

  console.log("\n🌐 افتح http://localhost:3003 في المتصفح للتحقق البصري");
});
