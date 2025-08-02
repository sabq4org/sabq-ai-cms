/**
 * صفحة الوسائط الحديثة - تصميم احترافي
 * Modern Media Page - Professional Design
 */

'use client';

import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { DesignComponents } from '@/components/design-system/DesignSystemGuide';
import {
    Calendar,
    Download,
    Eye,
    File,
    FileText,
    Filter,
    Folder,
    Grid3X3,
    HardDrive,
    Image,
    List,
    MoreHorizontal,
    Music,
    Play,
    Search,
    Trash2,
    Upload,
    Video
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  size: number;
  created_at: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // للفيديو والصوت
}

const ModernMediaNew: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
    audio: 0,
    documents: 0,
    totalSize: 0
  });

  // بيانات تجريبية للوسائط
  const sampleMediaFiles: MediaFile[] = [
    {
      id: '1',
      name: 'article-header-1.jpg',
      type: 'image',
      url: '/api/placeholder/400/300',
      size: 245760, // 240 KB
      created_at: '2025-01-28T10:30:00Z',
      dimensions: { width: 1200, height: 800 }
    },
    {
      id: '2',
      name: 'news-video-2025.mp4',
      type: 'video',
      url: '/api/placeholder/video',
      size: 15728640, // 15 MB
      created_at: '2025-01-28T09:15:00Z',
      dimensions: { width: 1920, height: 1080 },
      duration: 180 // 3 minutes
    },
    {
      id: '3',
      name: 'interview-audio.mp3',
      type: 'audio',
      url: '/api/placeholder/audio',
      size: 5242880, // 5 MB
      created_at: '2025-01-28T08:45:00Z',
      duration: 600 // 10 minutes
    },
    {
      id: '4',
      name: 'report-2025.pdf',
      type: 'document',
      url: '/api/placeholder/document',
      size: 1048576, // 1 MB
      created_at: '2025-01-28T07:20:00Z'
    },
    {
      id: '5',
      name: 'banner-image.png',
      type: 'image',
      url: '/api/placeholder/400/200',
      size: 512000, // 500 KB
      created_at: '2025-01-27T16:45:00Z',
      dimensions: { width: 1600, height: 800 }
    }
  ];

  useEffect(() => {
    // محاكاة جلب البيانات
    setTimeout(() => {
      setMediaFiles(sampleMediaFiles);
      calculateStats(sampleMediaFiles);
      setLoading(false);
    }, 1000);
  }, []);

  const calculateStats = (files: MediaFile[]) => {
    const stats = {
      total: files.length,
      images: files.filter(f => f.type === 'image').length,
      videos: files.filter(f => f.type === 'video').length,
      audio: files.filter(f => f.type === 'audio').length,
      documents: files.filter(f => f.type === 'document').length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0)
    };
    setStats(stats);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'text-green-600 bg-green-50';
      case 'video': return 'text-blue-600 bg-blue-50';
      case 'audio': return 'text-purple-600 bg-purple-50';
      case 'document': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'منذ أقل من ساعة';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
    return date.toLocaleDateString('ar-SA');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Image className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">إدارة الوسائط</h1>
                <p className="text-purple-100">إدارة الصور والفيديوهات والملفات</p>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Upload className="w-4 h-4" />
              <span>رفع ملف</span>
            </button>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي الملفات</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Folder className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الصور</p>
                  <p className="text-2xl font-bold text-green-600">{stats.images}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Image className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الفيديوهات</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.videos}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الصوتيات</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.audio}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Music className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المستندات</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.documents}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الحجم الإجمالي</p>
                  <p className="text-2xl font-bold text-gray-600">{formatFileSize(stats.totalSize)}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <HardDrive className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>
        </div>

        {/* شريط البحث والفلاتر */}
        <DesignComponents.StandardCard>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* البحث */}
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="البحث في الملفات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* فلتر النوع */}
                <div className="sm:w-48">
                  <div className="relative">
                    <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="all">جميع الأنواع</option>
                      <option value="image">الصور</option>
                      <option value="video">الفيديوهات</option>
                      <option value="audio">الصوتيات</option>
                      <option value="document">المستندات</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* أزرار العرض */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        {/* قائمة الملفات */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file) => (
              <DesignComponents.StandardCard key={file.id}>
                <div className="p-4">
                  {/* معاينة الملف */}
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : file.type === 'video' ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${getTypeColor(file.type)}`}>
                        {getFileIcon(file.type)}
                      </div>
                    )}

                    {/* إشارة النوع */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(file.type)}`}>
                      {file.type}
                    </div>
                  </div>

                  {/* معلومات الملف */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </h3>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      {file.duration && (
                        <span>{formatDuration(file.duration)}</span>
                      )}
                    </div>

                    {file.dimensions && (
                      <div className="text-sm text-gray-500">
                        {file.dimensions.width} × {file.dimensions.height}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatTimeAgo(file.created_at)}</span>
                    </div>

                    {/* أزرار العمليات */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </DesignComponents.StandardCard>
            ))}
          </div>
        ) : (
          <DesignComponents.StandardCard>
            <div className="p-4">
              <div className="space-y-4">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    {/* أيقونة الملف */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(file.type)}`}>
                      {getFileIcon(file.type)}
                    </div>

                    {/* معلومات الملف */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        {file.dimensions && (
                          <span>{file.dimensions.width} × {file.dimensions.height}</span>
                        )}
                        {file.duration && (
                          <span>{formatDuration(file.duration)}</span>
                        )}
                        <span>{formatTimeAgo(file.created_at)}</span>
                      </div>
                    </div>

                    {/* نوع الملف */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(file.type)}`}>
                      {file.type}
                    </div>

                    {/* أزرار العمليات */}
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DesignComponents.StandardCard>
        )}

        {/* رسالة عدم وجود نتائج */}
        {filteredFiles.length === 0 && (
          <DesignComponents.StandardCard>
            <div className="p-12 text-center">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد ملفات</h3>
              <p className="text-gray-500">لم يتم العثور على ملفات تطابق معايير البحث المحددة</p>
            </div>
          </DesignComponents.StandardCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ModernMediaNew;
