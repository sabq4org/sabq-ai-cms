"use client";

import {
  Calendar,
  ChevronDown,
  Edit,
  Eye,
  EyeOff,
  MousePointer,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Ad {
  id: string;
  title?: string;
  image_url: string;
  target_url: string;
  placement: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  stats: {
    views: number;
    clicks: number;
    ctr: number;
  };
  status: "active" | "expired" | "upcoming" | "disabled";
}

interface ApiResponse {
  success: boolean;
  data: Ad[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const PLACEMENT_LABELS = {
  below_featured: "أسفل الأخبار المميزة",
  below_custom_block: "أسفل المحتوى المخصص",
  article_detail_header: "رأس صفحة المقال",
  sidebar_top: "أعلى الشريط الجانبي",
  sidebar_bottom: "أسفل الشريط الجانبي",
  footer_banner: "بانر التذييل",
};

const STATUS_LABELS = {
  active: "فعال",
  expired: "منتهي",
  upcoming: "قادم",
  disabled: "معطل",
};

const STATUS_COLORS = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  expired: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  disabled: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
};

export default function AdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    placement: "",
    status: "",
    search: "",
  });

  // جلب الإعلانات
  const fetchAds = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(filters.placement && { placement: filters.placement }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/ads?${params}`, {
        credentials: "include",
      });
      const data: ApiResponse = await response.json();

      if (data.success) {
        let filteredAds = data.data;

        // فلترة النتائج حسب البحث
        if (filters.search) {
          filteredAds = filteredAds.filter(
            (ad) =>
              ad.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
              ad.target_url.toLowerCase().includes(filters.search.toLowerCase())
          );
        }

        setAds(filteredAds);
        setTotalPages(data.pagination.pages);
        setCurrentPage(page);
      } else {
        setError("فشل في جلب الإعلانات");
      }
    } catch (err) {
      setError("خطأ في الاتصال بالخادم");
      console.error("Error fetching ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds(1);
  }, [filters]);

  // حذف إعلان
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;

    try {
      const response = await fetch(`/api/ads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchAds(currentPage);
      } else {
        alert("فشل في حذف الإعلان");
      }
    } catch (err) {
      alert("خطأ في حذف الإعلان");
    }
  };

  // تبديل حالة الإعلان
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/ads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchAds(currentPage);
      } else {
        alert("فشل في تحديث حالة الإعلان");
      }
    } catch (err) {
      alert("خطأ في تحديث حالة الإعلان");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={() => fetchAds(currentPage)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الفلاتر */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* البحث */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في الإعلانات..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* فلتر الموضع */}
          <div className="relative">
            <select
              value={filters.placement}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, placement: e.target.value }))
              }
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
            >
              <option value="">جميع المواضع</option>
              {Object.entries(PLACEMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* فلتر الحالة */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
            >
              <option value="">جميع الحالات</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* قائمة الإعلانات */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {ads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              لا توجد إعلانات
            </div>
            <Link
              href="/admin/ads/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              إنشاء إعلان جديد
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإعلان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الموضع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإحصائيات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {ads.map((ad) => (
                  <tr
                    key={ad.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={ad.image_url}
                            alt={ad.title || "إعلان"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {ad.title || "بدون عنوان"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {ad.target_url}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {
                        PLACEMENT_LABELS[
                          ad.placement as keyof typeof PLACEMENT_LABELS
                        ]
                      }
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[ad.status]
                        }`}
                      >
                        {STATUS_LABELS[ad.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {ad.stats.views}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointer className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {ad.stats.clicks}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {ad.stats.ctr}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(ad.start_date).toLocaleDateString("ar-SA")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleToggleStatus(ad.id, ad.is_active)
                          }
                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${
                            ad.is_active ? "text-green-600" : "text-gray-400"
                          }`}
                          title={
                            ad.is_active ? "إيقاف الإعلان" : "تفعيل الإعلان"
                          }
                        >
                          {ad.is_active ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/admin/ads/edit/${ad.id}`}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
                          title="تعديل الإعلان"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400"
                          title="حذف الإعلان"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* الباجيناشن */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchAds(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <button
                  onClick={() => fetchAds(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    عرض{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * 10 + 1}
                    </span>{" "}
                    إلى{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, ads.length)}
                    </span>{" "}
                    من <span className="font-medium">{ads.length}</span> نتيجة
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => fetchAds(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? "z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400"
                              : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
