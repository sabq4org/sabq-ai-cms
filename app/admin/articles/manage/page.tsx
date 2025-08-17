'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Search, Eye } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  views: number;
  category?: {
    name: string;
    name_ar: string;
  };
}

export default function ManageArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/admin/news?limit=100');
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId: string, articleTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف المقال: "${articleTitle}"؟`)) {
      return;
    }

    setDeleteLoading(articleId);
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('تم حذف المقال بنجاح');
        setArticles(articles.filter(a => a.id !== articleId));
      } else {
        alert(`خطأ في حذف المقال: ${data.error}`);
      }
    } catch (error) {
      console.error('خطأ في حذف المقال:', error);
      alert('حدث خطأ في حذف المقال');
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    article.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة المقالات</h1>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن المقالات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العنوان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التصنيف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المشاهدات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredArticles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {article.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {article.slug}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    article.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.status === 'published' ? 'منشور' : 'مسودة'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {article.category?.name_ar || article.category?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {article.views}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(article.created_at).toLocaleDateString('ar-SA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <a
                      href={`/article/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900"
                      title="عرض المقال"
                    >
                      <Eye className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(article.id, article.title)}
                      disabled={deleteLoading === article.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="حذف المقال"
                    >
                      {deleteLoading === article.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          لا توجد مقالات
        </div>
      )}
    </div>
  );
}
