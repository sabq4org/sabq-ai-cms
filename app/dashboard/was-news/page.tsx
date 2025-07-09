"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, RefreshCw, Download, Eye, FileText, AlertCircle, CheckCircle, Clock, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface WasNews {
  id: string;
  news_NUM: number;
  news_DT: string;
  title_TXT: string;
  story_TXT: string;
  news_priority_CD: number;
  is_Report: boolean;
  is_imported: boolean;
  media?: any;
  keywords?: any;
  created_at: string;
}

interface Basket {
  news_basket_CD: number;
  news_basket_TXT: string;
  news_basket_TXT_AR: string;
}

export default function WasNewsPage() {
  const [loading, setLoading] = useState(false);
  const [fetchingNew, setFetchingNew] = useState(false);
  const [savedNews, setSavedNews] = useState<WasNews[]>([]);
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [selectedBasket, setSelectedBasket] = useState<number | null>(null);
  const [selectedNews, setSelectedNews] = useState<WasNews | null>(null);
  const [activeTab, setActiveTab] = useState('saved');
  const [importingId, setImportingId] = useState<string | null>(null);

  // جلب الأخبار المحفوظة
  const fetchSavedNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/was-news?action=saved');
      const data = await res.json();
      if (data.success) {
        setSavedNews(data.data);
      } else {
        toast.error(data.error || 'فشل جلب الأخبار');
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب الأخبار');
    } finally {
      setLoading(false);
    }
  };

  // جلب السلال المتاحة
  const fetchBaskets = async () => {
    try {
      const res = await fetch('/api/was-news?action=baskets');
      const data = await res.json();
      if (data.success) {
        setBaskets(data.baskets);
        if (data.baskets.length > 0 && !selectedBasket) {
          setSelectedBasket(data.baskets[0].news_basket_CD);
        }
      }
    } catch (error) {
      console.error('Error fetching baskets:', error);
    }
  };

  // جلب أخبار جديدة من واس
  const fetchNewNews = async () => {
    setFetchingNew(true);
    try {
      const url = selectedBasket 
        ? `/api/was-news?basket_id=${selectedBasket}`
        : '/api/was-news';
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        if (data.data) {
          toast.success('تم جلب خبر جديد!');
          fetchSavedNews(); // تحديث القائمة
        } else {
          toast.info(data.message || 'لا توجد أخبار جديدة');
        }
      } else {
        toast.error(data.error || 'فشل جلب الأخبار');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بواس');
    } finally {
      setFetchingNew(false);
    }
  };

  // استيراد خبر إلى المقالات
  const importNews = async (newsId: string) => {
    setImportingId(newsId);
    try {
      const res = await fetch('/api/was-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('تم استيراد الخبر بنجاح!');
        fetchSavedNews(); // تحديث القائمة
      } else {
        toast.error(data.error || 'فشل استيراد الخبر');
      }
    } catch (error) {
      toast.error('حدث خطأ في استيراد الخبر');
    } finally {
      setImportingId(null);
    }
  };

  useEffect(() => {
    fetchSavedNews();
    fetchBaskets();
  }, []);

  const getPriorityBadge = (priority: number) => {
    switch(priority) {
      case 1:
        return <Badge variant="destructive">عاجل</Badge>;
      case 2:
        return <Badge variant="default">مهم</Badge>;
      default:
        return <Badge variant="secondary">عادي</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">أخبار وكالة الأنباء السعودية (واس)</h1>
        <p className="text-gray-600">إدارة وعرض الأخبار من وكالة واس</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="saved">الأخبار المحفوظة</TabsTrigger>
          <TabsTrigger value="fetch">جلب أخبار جديدة</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">الأخبار المحفوظة ({savedNews.length})</h2>
            <Button onClick={fetchSavedNews} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : savedNews.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>لا توجد أخبار محفوظة</AlertTitle>
              <AlertDescription>
                قم بجلب أخبار جديدة من تبويب "جلب أخبار جديدة"
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {savedNews.map((news) => (
                <Card key={news.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{news.title_TXT}</CardTitle>
                        <div className="flex gap-2 items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {format(new Date(news.news_DT), 'PPpp', { locale: ar })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getPriorityBadge(news.news_priority_CD)}
                        {news.is_imported && <Badge variant="outline" className="bg-green-50">مستورد</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {news.story_TXT || 'لا يوجد محتوى'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedNews(news)}
                      >
                        <Eye className="h-4 w-4 ml-2" />
                        عرض التفاصيل
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => importNews(news.id)}
                        disabled={news.is_imported || importingId === news.id}
                      >
                        {importingId === news.id ? (
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4 ml-2" />
                        )}
                        {news.is_imported ? 'تم الاستيراد' : 'استيراد كمقال'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fetch" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>جلب أخبار جديدة من واس</CardTitle>
              <CardDescription>
                اختر السلة المطلوبة واضغط على زر الجلب لاستيراد آخر الأخبار
              </CardDescription>
            </CardHeader>
            <CardContent>
              {baskets.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">اختر السلة:</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedBasket || ''}
                    onChange={(e) => setSelectedBasket(Number(e.target.value))}
                  >
                    {baskets.map((basket) => (
                      <option key={basket.news_basket_CD} value={basket.news_basket_CD}>
                        {basket.news_basket_TXT_AR || basket.news_basket_TXT}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                onClick={fetchNewNews}
                disabled={fetchingNew}
                className="w-full"
                size="lg"
              >
                {fetchingNew ? (
                  <>
                    <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                    جاري جلب الأخبار...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 ml-2" />
                    جلب أخبار جديدة
                  </>
                )}
              </Button>

              <Alert className="mt-6">
                <Newspaper className="h-4 w-4" />
                <AlertTitle>ملاحظة</AlertTitle>
                <AlertDescription>
                  يتم جلب الأخبار الجديدة فقط. الأخبار المكررة لن يتم جلبها مرة أخرى.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* نافذة عرض تفاصيل الخبر */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{selectedNews.title_TXT}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNews(null)}
                >
                  ✕
                </Button>
              </div>
              <div className="flex gap-2 items-center text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {format(new Date(selectedNews.news_DT), 'PPpp', { locale: ar })}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedNews.story_TXT}</p>
              </div>
              {selectedNews.media && selectedNews.media.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">الوسائط المرفقة:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {/* عرض الوسائط هنا */}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 