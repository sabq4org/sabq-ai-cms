'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Image, 
  RefreshCw,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useDarkMode } from "@/hooks/useDarkMode";

interface UploadLog {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  upload_type: string;
  status: 'success' | 'failed' | 'placeholder';
  error_message?: string;
  cloudinary_url?: string;
  is_placeholder: boolean;
  created_at: string;
}

export default function UploadLogsPage() {
  const { darkMode } = useDarkMode();
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    placeholder: 0
  });
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'placeholder'>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/images/upload-logs');
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
        
        // حساب الإحصائيات
        const stats = data.logs.reduce((acc: any, log: UploadLog) => {
          acc.total++;
          acc[log.status]++;
          return acc;
        }, { total: 0, success: 0, failed: 0, placeholder: 0 });
        
        setStats(stats);
      }
    } catch (error) {
      console.error('خطأ في جلب السجلات:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'placeholder':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700">نجح</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">فشل</Badge>;
      case 'placeholder':
        return <Badge className="bg-yellow-100 text-yellow-700">مؤقت</Badge>;
      default:
        return null;
    }
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.status === filter);

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`} dir="rtl">
      {/* العنوان */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>سجلات رفع الصور</h1>
        <p className={`transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>تتبع جميع محاولات رفع الصور ومعالجة المشاكل</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المحاولات</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Image className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نجحت</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">فشلت</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صور مؤقتة</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.placeholder}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تحذير إذا كان هناك الكثير من الفشل */}
      {stats.failed + stats.placeholder > stats.success && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>تحذير:</strong> أكثر من نصف محاولات رفع الصور تفشل أو تستخدم صور مؤقتة.
            يُنصح بمراجعة إعدادات Cloudinary والتحقق من الاتصال.
          </AlertDescription>
        </Alert>
      )}

      {/* أدوات التصفية */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          <Filter className="w-4 h-4 ml-2" />
          الكل
        </Button>
        <Button
          variant={filter === 'success' ? 'default' : 'outline'}
          onClick={() => setFilter('success')}
          size="sm"
        >
          <CheckCircle className="w-4 h-4 ml-2" />
          نجحت
        </Button>
        <Button
          variant={filter === 'failed' ? 'default' : 'outline'}
          onClick={() => setFilter('failed')}
          size="sm"
        >
          <XCircle className="w-4 h-4 ml-2" />
          فشلت
        </Button>
        <Button
          variant={filter === 'placeholder' ? 'default' : 'outline'}
          onClick={() => setFilter('placeholder')}
          size="sm"
        >
          <AlertCircle className="w-4 h-4 ml-2" />
          مؤقتة
        </Button>
        <Button
          variant="outline"
          onClick={fetchLogs}
          size="sm"
          className="mr-auto"
        >
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* جدول السجلات */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المحاولات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-muted-foreground">جاري تحميل السجلات...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Image className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-muted-foreground">لا توجد سجلات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">اسم الملف</th>
                    <th className="text-right py-3 px-4">الحجم</th>
                    <th className="text-right py-3 px-4">النوع</th>
                    <th className="text-right py-3 px-4">التصنيف</th>
                    <th className="text-right py-3 px-4">رسالة الخطأ</th>
                    <th className="text-right py-3 px-4">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          {getStatusBadge(log.status)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate" title={log.file_name}>
                          {log.file_name}
                        </div>
                      </td>
                      <td className="py-3 px-4">{formatFileSize(log.file_size)}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{log.file_type}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{log.upload_type}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {log.error_message && (
                          <span className="text-sm text-red-600 max-w-xs truncate block" title={log.error_message}>
                            {log.error_message}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: ar })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 