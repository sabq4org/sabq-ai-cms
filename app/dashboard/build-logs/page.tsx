'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Trash2, AlertCircle, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface BuildLog {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  downloadUrl: string;
}

interface LatestLog {
  system_info: {
    timestamp: string;
    node_version: string;
    app_version: string;
    environment: string;
    git_branch?: string;
    git_commit?: string;
  };
  environment_variables: {
    NODE_ENV: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}

export default function BuildLogsPage() {
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [latestLog, setLatestLog] = useState<LatestLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/build-logs');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'فشل جلب السجلات');
      }
      
      setLogs(data.logs || []);
      setLatestLog(data.latestLog || null);
    } catch (error: any) {
      setError(error.message);
      toast.error('فشل جلب سجلات البناء');
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (key: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/build-logs?key=${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('فشل حذف السجل');
      }

      toast.success('تم حذف السجل بنجاح');
      fetchLogs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              خطأ في الوصول لسجلات البناء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            {error.includes('غير مفعلة') && (
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold mb-2">لتفعيل الخدمة:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>أنشئ Space في DigitalOcean</li>
                  <li>احصل على Access Keys</li>
                  <li>أضف المتغيرات المطلوبة في App Platform</li>
                  <li>اطلع على <code>DIGITALOCEAN_SPACES_SETUP.md</code> للتفاصيل</li>
                </ol>
              </div>
            )}
            <Button onClick={fetchLogs} className="mt-4">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            سجلات البناء
          </CardTitle>
          <Button onClick={fetchLogs} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </CardHeader>
        <CardContent>
          {/* معلومات آخر بناء */}
          {latestLog && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold mb-2">آخر بناء</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">الوقت:</span>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(latestLog.system_info.timestamp), {
                      addSuffix: true,
                      locale: ar
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">النسخة:</span>
                  <p className="font-medium">{latestLog.system_info.app_version}</p>
                </div>
                <div>
                  <span className="text-gray-600">Node.js:</span>
                  <p className="font-medium">{latestLog.system_info.node_version}</p>
                </div>
                <div>
                  <span className="text-gray-600">البيئة:</span>
                  <p className="font-medium">{latestLog.system_info.environment}</p>
                </div>
              </div>
              
              {latestLog.system_info.git_commit && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Git:</span>
                  <span className="font-medium mr-2">
                    {latestLog.system_info.git_branch} @ {latestLog.system_info.git_commit}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* قائمة السجلات */}
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد سجلات متاحة</p>
              <p className="text-sm mt-2">سيتم إنشاء السجلات تلقائياً عند البناء التالي</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.key}
                  className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                    selectedLog === log.key ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedLog(log.key)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{log.name}</h4>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>
                          {formatDistanceToNow(new Date(log.lastModified), {
                            addSuffix: true,
                            locale: ar
                          })}
                        </span>
                        <span>{formatFileSize(log.size)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(log.downloadUrl, '_blank');
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLog(log.key);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="mt-6 pt-6 border-t text-sm text-gray-600">
            <p>عدد السجلات: {logs.length}</p>
            <p className="mt-1">
              يتم الاحتفاظ بآخر 10 سجلات فقط • السجلات القديمة تُحذف تلقائياً
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 