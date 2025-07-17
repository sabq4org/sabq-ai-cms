'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Download, 
  Search, 
  Calendar, 
  Clock, 
  Volume2, 
  FileAudio, 
  Trash2,
  MoreVertical,
  Share2,
  RefreshCw,
  Home
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AudioFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  duration: string;
  createdAt: string;
  type: 'news' | 'summary' | 'manual';
  title?: string;
  description?: string;
  is_daily?: boolean; // Added for daily status
}

export default function AudioArchivePage() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // جلب قائمة الملفات الصوتية
  useEffect(() => {
    fetchAudioFiles();
  }, []);

  const fetchAudioFiles = async () => {
    setLoading(true);
    try {
      // جلب النشرات من API
      const response = await fetch('/api/audio/archive');
      const data = await response.json();
      
      if (data.success && data.podcasts) {
        // تحويل البيانات للتنسيق المطلوب
        const formattedFiles: AudioFile[] = data.podcasts.map((p: any) => ({
          id: p.id,
          filename: p.filename,
          url: p.url,
          size: p.size,
          duration: p.duration,
          createdAt: p.created_at,
          type: 'news' as const,
          title: `النشرة الصوتية - ${new Date(p.created_at).toLocaleDateString('ar-SA')}`,
          description: `صوت: ${p.voice} - الحجم: ${Math.round(p.size / 1024)} KB`,
          is_daily: p.is_daily // Assuming is_daily is returned from the API
        }));
        
        setAudioFiles(formattedFiles);
      } else {
        // في حالة عدم وجود بيانات
        setAudioFiles([]);
      }
    } catch (error) {
      console.error('خطأ في جلب الملفات الصوتية:', error);
      // عرض بيانات فارغة في حالة الخطأ
      setAudioFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // تشغيل/إيقاف الصوت
  const togglePlay = (audioFile: AudioFile) => {
    if (currentPlaying === audioFile.id) {
      // إيقاف التشغيل
      if (currentAudio) {
        currentAudio.pause();
        setCurrentPlaying(null);
      }
    } else {
      // إيقاف أي صوت آخر يعمل
      if (currentAudio) {
        currentAudio.pause();
      }
      
      // تشغيل الصوت الجديد
      const audio = new Audio(audioFile.url);
      audio.play().then(() => {
        setCurrentPlaying(audioFile.id);
        setCurrentAudio(audio);
      }).catch(err => {
        console.error('خطأ في تشغيل الصوت:', err);
        alert('فشل في تشغيل الملف الصوتي');
      });
      
      // إعادة تعيين الحالة عند انتهاء التشغيل
      audio.addEventListener('ended', () => {
        setCurrentPlaying(null);
        setCurrentAudio(null);
      });
    }
  };

  // حذف ملف صوتي
  const deleteAudioFile = async (fileId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الملف الصوتي؟')) {
      try {
        // TODO: إضافة API للحذف
        setAudioFiles(prev => prev.filter(file => file.id !== fileId));
        alert('تم حذف الملف بنجاح');
      } catch (error) {
        alert('فشل في حذف الملف');
      }
    }
  };

  // مشاركة الملف
  const shareAudioFile = (audioFile: AudioFile) => {
    const shareData = {
      title: audioFile.title || audioFile.filename,
      text: audioFile.description || 'ملف صوتي من أرشيف سبق',
      url: window.location.origin + audioFile.url
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('تم نسخ رابط الملف!');
    }
  };

  // تصفية الملفات حسب البحث
  const filteredFiles = audioFiles.filter(file => 
    file.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // تنسيق حجم الملف
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + ' MB';
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  // أيقونة نوع الملف
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return '📰';
      case 'summary': return '📄';
      case 'manual': return '🎙️';
      default: return '🔊';
    }
  };

  // لون نوع الملف
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'news': return 'bg-blue-100 text-blue-800';
      case 'summary': return 'bg-green-100 text-green-800';
      case 'manual': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // تغيير حالة النشرة اليومية
  const toggleDailyStatus = async (audioFile: AudioFile) => {
    try {
      const response = await fetch(`/api/audio/archive/${audioFile.id}/daily`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_daily: !audioFile.is_daily }),
      });
      const data = await response.json();

      if (data.success) {
        setAudioFiles(prev => prev.map(file => 
          file.id === audioFile.id ? { ...file, is_daily: !audioFile.is_daily } : file
        ));
        alert('تم تغيير حالة النشرة اليومية بنجاح!');
      } else {
        alert('فشل في تغيير حالة النشرة اليومية.');
      }
    } catch (error) {
      console.error('خطأ في تغيير حالة النشرة اليومية:', error);
      alert('خطأ في تغيير حالة النشرة اليومية.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileAudio className="w-8 h-8 text-red-600" />
            أرشيف النشرات الصوتية
          </h1>
          <p className="text-gray-600 mt-2">
            جميع الملفات الصوتية والنشرات المولدة
          </p>
        </div>
        
        <Button onClick={fetchAudioFiles} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث القائمة
        </Button>
      </div>

      {/* شريط البحث والإحصائيات */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* البحث */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ابحث في الملفات الصوتية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            
            {/* الإحصائيات */}
            <div className="flex gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4" />
                <span>{audioFiles.length} ملف</span>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>{audioFiles.filter(f => f.type === 'news').length} نشرة إخبارية</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>آخر تحديث: اليوم</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الملفات */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">جاري تحميل الملفات...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileAudio className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'لا توجد نتائج' : 'لا توجد ملفات صوتية'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'جرب مصطلحات بحث مختلفة' 
                : 'ابدأ بتوليد نشرة صوتية جديدة'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFiles.map((audioFile) => (
            <Card key={audioFile.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* معلومات الملف */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(audioFile.type)}</span>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {audioFile.title || audioFile.filename}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {audioFile.description || 'لا يوجد وصف'}
                        </p>
                      </div>
                      <Badge className={getTypeBadgeColor(audioFile.type)}>
                        {audioFile.type === 'news' ? 'نشرة إخبارية' : 
                         audioFile.type === 'summary' ? 'ملخص مقال' : 'مخصص'}
                      </Badge>
                    </div>
                    
                    {/* معلومات إضافية */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{audioFile.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(audioFile.createdAt)}</span>
                      </div>
                      <span>{formatFileSize(audioFile.size)}</span>
                    </div>
                  </div>
                  
                  {/* أزرار التحكم */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      onClick={() => togglePlay(audioFile)}
                      size="sm"
                      className={currentPlaying === audioFile.id 
                        ? "bg-red-600 hover:bg-red-700" 
                        : "bg-green-600 hover:bg-green-700"}
                    >
                      {currentPlaying === audioFile.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <a 
                      href={audioFile.url} 
                      download
                      className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => shareAudioFile(audioFile)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          مشاركة
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleDailyStatus(audioFile)}
                          className="text-yellow-600"
                        >
                          {audioFile.is_daily ? (
                            <>
                              <Home className="w-4 h-4 mr-2" />
                              إلغاء نشر في الرئيسية
                            </>
                          ) : (
                            <>
                              <Home className="w-4 h-4 mr-2" />
                              نشر في الرئيسية
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteAudioFile(audioFile.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 