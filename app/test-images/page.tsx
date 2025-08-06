import Image from "next/image";

const TestImages = () => {
  // صورة حقيقية من قاعدة البيانات
  const realImageUrl =
    "https://res.cloudinary.com/dybhezmvb/image/upload/v1754495464/sabq-cms/featured/featured-1754495463313-mtu4bs.jpg";

  return (
    <div style={{ padding: "20px" }}>
      <h1>اختبار الصور الحقيقية</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>الصورة الحقيقية من Cloudinary:</h2>
        <Image
          src={realImageUrl}
          alt="صورة حقيقية"
          width={400}
          height={300}
          style={{ objectFit: "cover" }}
        />
        <p>الرابط: {realImageUrl}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>اختبار CloudImage component:</h2>
        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
          {/* هنا سيتم إضافة CloudImage component */}
          <p>سيتم اختبار CloudImage هنا</p>
        </div>
      </div>
    </div>
  );
};

export default TestImages;
