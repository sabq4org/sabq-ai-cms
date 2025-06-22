'use client';

import React from 'react';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  FileText, 
  BarChart3, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';

export default function DeepAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center flex-wrap gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🧠 التحليل العميق من سبق</h1>
                <p className="text-base text-gray-600">رؤى استراتيجية ودراسات معمقة بالذكاء الاصطناعي والخبرة البشرية</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2">
                <span>🔄</span>
                تحديث البيانات
              </button>
              <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700">
                <option>آخر 7 أيام</option>
                <option>آخر 30 يوم</option>
                <option>آخر 3 شهور</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">إجمالي التفاعلات</p>
                <h3 className="text-2xl font-bold text-gray-900">424</h3>
                <p className="text-xs text-gray-500">جميع الأنواع</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+15%</span>
              <span className="text-gray-500 font-normal">من الأسبوع الماضي</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">المستخدمون النشطون</p>
                <h3 className="text-2xl font-bold text-gray-900">8</h3>
                <p className="text-xs text-gray-500">آخر 7 أيام</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+23%</span>
              <span className="text-gray-500 font-normal">نمو مستمر</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">دقة التفضيلات</p>
                <h3 className="text-2xl font-bold text-gray-900">85.5%</h3>
                <p className="text-xs text-gray-500">دقة النظام</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                <Brain className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+5.2%</span>
              <span className="text-gray-500 font-normal">تحسن ملحوظ</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">متوسط نقاط التفاعل</p>
                <h3 className="text-2xl font-bold text-gray-900">65.0</h3>
                <p className="text-xs text-gray-500">من 10</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+8%</span>
              <span className="text-gray-500 font-normal">أداء ممتاز</span>
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث في المقالات..."
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  تصفية
                </button>
                <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                  <option>جميع الفئات</option>
                  <option>سياسة</option>
                  <option>اقتصاد</option>
                  <option>تقنية</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">العنوان</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">الفئة</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">المشاهدات</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">التفاعل</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">مستقبل التعليم في عصر الرقمنة: التجربة السعودية</div>
                    <div className="text-sm text-gray-500">تحليل شامل للتحول الرقمي في قطاع التعليم السعودي وآثاره على جودة ومخرجات التعليم، مع مقارنات دولية ورؤى مستقبلية</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">تعليم</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">منشور</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">12.5K</td>
                  <td className="px-6 py-4 text-sm text-gray-900">89%</td>
                  <td className="px-6 py-4 text-sm text-gray-500">قبل 5 دقائق</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">جيوسياسية الطاقة في 2024: كيف تعيد السعودية تشكيل خريطة النفط العالمية</div>
                    <div className="text-sm text-gray-500">دراسة تحليلية لاستراتيجية المملكة في أسواق الطاقة العالمية وتأثيرها على التوازنات الجيوسياسية الناشئة في عالم متعدد الأقطاب</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">اقتصاد</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">منشور</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">28.3K</td>
                  <td className="px-6 py-4 text-sm text-gray-900">92%</td>
                  <td className="px-6 py-4 text-sm text-gray-500">قبل 12 دقيقة</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">الذكاء الاصطناعي والمستقبل الاقتصادي للمملكة: رؤية 2030 وما بعدها</div>
                    <div className="text-sm text-gray-500">تحليل معمق لدور الذكاء الاصطناعي في تحقيق رؤية 2030، وكيف تستعد المملكة لتصبح رائدة إقليمياً في تقنيات المستقبل</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">تقنية</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">مسودة</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">-</td>
                  <td className="px-6 py-4 text-sm text-gray-900">-</td>
                  <td className="px-6 py-4 text-sm text-gray-500">قبل 30 دقيقة</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">عرض 1-10 من 156 مقال</p>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-gray-300 bg-white rounded-md text-sm hover:bg-gray-50">السابق</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">1</button>
              <button className="px-3 py-1 border border-gray-300 bg-white rounded-md text-sm hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border border-gray-300 bg-white rounded-md text-sm hover:bg-gray-50">3</button>
              <button className="px-3 py-1 border border-gray-300 bg-white rounded-md text-sm hover:bg-gray-50">التالي</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 