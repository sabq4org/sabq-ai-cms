import Image from 'next/image';
import Link from 'next/link';

export default function TestPage() {
  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">صفحة اختبار</h1>
        <p className="text-gray-600">إذا كنت ترى هذه الصفحة، فإن النظام يعمل بشكل صحيح!</p>
        <div className="mt-4">
          <Link href="/" className="text-blue-500 hover:text-blue-700">العودة للصفحة الرئيسية</Link>
        </div>
      </div>
    </div>
  );
} 