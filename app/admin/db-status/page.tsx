import DatabaseStatusChecker from "@/components/database-status-checker";
import Link from "next/link";

export default function DatabaseStatusPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          إدارة اتصال قاعدة البيانات
        </h1>
        <div className="mt-4 md:mt-0">
          <Link
            href="/admin/db-logs"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg focus:outline-none"
          >
            عرض سجلات الأخطاء
          </Link>
        </div>
      </div>

      <DatabaseStatusChecker />

      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-blue-800 mb-4 text-right">
          تعليمات مهمة:
        </h2>
        <ul className="list-disc list-inside space-y-2 text-blue-800 text-right">
          <li>يمكنك التحقق من حالة الاتصال بقاعدة البيانات في أي وقت</li>
          <li>
            في حالة قطع الاتصال، يمكنك محاولة إعادة الاتصال باستخدام الزر المخصص
          </li>
          <li>
            يتم تنشيط وضع الطوارئ تلقائيًا عند تعذر الاتصال بقاعدة البيانات
          </li>
          <li>يمكنك عرض سجلات الأخطاء لمعرفة تفاصيل المشكلات السابقة</li>
        </ul>
      </div>
    </div>
  );
}
