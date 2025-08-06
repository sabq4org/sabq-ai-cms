import Image from "next/image";
import Link from "next/link";
import { getEmergencyArticle } from "../../emergency-articles";

export default function EmergencyArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const article = getEmergencyArticle(id);

  if (!article) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            المقال غير موجود في النسخة الاحتياطية
          </h1>
          <p className="text-gray-700 mb-6">
            عذراً، لم نتمكن من العثور على نسخة احتياطية لهذا المقال.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-yellow-50 text-yellow-800 p-4 mb-6 rounded-md text-center">
        <p>
          أنت تشاهد نسخة احتياطية من هذا المقال بسبب مشكلة مؤقتة في قاعدة
          البيانات
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

        {article.summary && (
          <p className="text-lg text-gray-700 mb-6 font-semibold">
            {article.summary}
          </p>
        )}

        <div className="flex items-center text-gray-600 mb-6">
          <span>
            نُشر: {new Date(article.publishedAt).toLocaleDateString("ar-SA")}
          </span>
          <span className="mx-2">•</span>
          <span>القسم: {article.category || "عام"}</span>
        </div>

        {article.image && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              width={800}
              height={450}
              className="w-full h-auto object-cover"
              onError={(e) => {
                // إذا فشل تحميل الصورة، نعرض رسالة بدلا منها
                console.error("فشل تحميل الصورة:", article.image);
                // نخفي العنصر
                e.currentTarget.style.display = "none";
              }}
            />
            {article.caption && (
              <p className="text-sm text-gray-600 mt-2">{article.caption}</p>
            )}
          </div>
        )}

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
