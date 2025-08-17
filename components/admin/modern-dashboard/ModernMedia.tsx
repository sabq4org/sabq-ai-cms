/**
 * صفحة إدارة الوسائط الحديثة
 * Modern Media Management Page
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import {
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
  Share2,
  Image,
  Video,
  FileAudio,
  File,
  Calendar,
  HardDrive,
  Play,
  Pause,
  Volume2,
  ZoomIn,
  Copy,
  Edit,
  FolderOpen,
  Grid3x3,
  List,
  SortAsc,
  Star,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  uploadDate: Date;
  dimensions?: { width: number; height: number };
  duration?: number;
  url: string;
  thumbnail?: string;
  tags: string[];
  category: string;
  used: boolean;
  usageCount: number;
}

const mediaFiles: MediaFile[] = [
  {
    id: '1',
    name: 'saudi-vision-2030-banner.jpg',
    type: 'image',
    size: 1024000,
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    dimensions: { width: 1920, height: 1080 },
    url: '/media/images/saudi-vision-2030-banner.jpg',
    tags: ['اقتصاد', 'السعودية', 'رؤية 2030'],
    category: 'economy',
    used: true,
    usageCount: 15
  },
  {
    id: '2',
    name: 'ai-conference-video.mp4',
    type: 'video',
    size: 50000000,
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
    dimensions: { width: 1280, height: 720 },
    duration: 180,
    url: '/media/videos/ai-conference-video.mp4',
    thumbnail: '/media/thumbnails/ai-conference-video.jpg',
    tags: ['ذكاء اصطناعي', 'تقنية', 'مؤتمر'],
    category: 'technology',
    used: false,
    usageCount: 0
  },
  {
    id: '3',
    name: 'interview-audio.mp3',
    type: 'audio',
    size: 8000000,
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 6),
    duration: 600,
    url: '/media/audio/interview-audio.mp3',
    tags: ['مقابلة', 'سياسة'],
    category: 'politics',
    used: true,
    usageCount: 3
  },
  {
    id: '4',
    name: 'economic-report-2025.pdf',
    type: 'document',
    size: 2500000,
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    url: '/media/documents/economic-report-2025.pdf',
    tags: ['تقرير', 'اقتصاد', '2025'],
    category: 'economy',
    used: true,
    usageCount: 8
  }
];

export default function ModernMedia() {
  const [files, setFiles] = useState(mediaFiles);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return FileAudio;
      case 'document': return File;
      default: return File;
    }
  };

  const getFileTypeColor = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'video': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'audio': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'document': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getFileTypeName = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return 'صورة';
      case 'video': return 'فيديو';
      case 'audio': return 'صوت';
      case 'document': return 'مستند';
      default: return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} ميجابايت`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
    return `${bytes} بايت`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || file.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return 'الآن';
  };

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  return (
    <DashboardLayout 
      pageTitle="إدارة الوسائط"
      pageDescription="رفع وإدارة الصور والفيديوهات والملفات"
    >
      <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              رفع ملفات
            </Button>
            <Button variant="outline">
              <FolderOpen className="h-4 w-4 mr-2" />
              إنشاء مجلد
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              تصفية
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="البحث في الملفات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'إجمالي الملفات', value: files.length.toString(), icon: File, color: 'blue' },
            { title: 'الصور', value: files.filter(f => f.type === 'image').length.toString(), icon: Image, color: 'green' },
            { title: 'الفيديوهات', value: files.filter(f => f.type === 'video').length.toString(), icon: Video, color: 'purple' },
            { title: 'حجم التخزين', value: formatFileSize(getTotalSize()), icon: HardDrive, color: 'orange' }
          ].map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={cn(
                    "h-8 w-8",
                    stat.color === 'blue' && "text-blue-500",
                    stat.color === 'green' && "text-green-500",
                    stat.color === 'purple' && "text-purple-500",
                    stat.color === 'orange' && "text-orange-500"
                  )} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* التبويبات والمحتوى */}
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">جميع الملفات</TabsTrigger>
            <TabsTrigger value="images">الصور</TabsTrigger>
            <TabsTrigger value="videos">الفيديوهات</TabsTrigger>
            <TabsTrigger value="audio">الصوتيات</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* فلاتر */}
            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm">نوع الملف</Label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="image">صور</option>
                  <option value="video">فيديوهات</option>
                  <option value="audio">صوتيات</option>
                  <option value="document">مستندات</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">التصنيف</Label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">جميع التصنيفات</option>
                  <option value="economy">اقتصاد</option>
                  <option value="technology">تقنية</option>
                  <option value="politics">سياسة</option>
                  <option value="sports">رياضة</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">ترتيب حسب</Label>
                <select className="px-3 py-2 border rounded-lg text-sm">
                  <option value="date">التاريخ</option>
                  <option value="name">الاسم</option>
                  <option value="size">الحجم</option>
                  <option value="usage">الاستخدام</option>
                </select>
              </div>
            </div>

            {/* عرض الملفات */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFiles.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <Card key={file.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
                      {/* معاينة الملف */}
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative flex items-center justify-center">
                        {file.type === 'image' ? (
                          <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Image className="h-16 w-16 text-blue-500/50" />
                          </div>
                        ) : file.type === 'video' ? (
                          <div className="w-full h-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center relative">
                            <Video className="h-16 w-16 text-purple-500/50" />
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                              {file.duration && formatDuration(file.duration)}
                            </div>
                          </div>
                        ) : (
                          <FileIcon className="h-16 w-16 text-gray-400" />
                        )}
                        
                        {/* حالة الاستخدام */}
                        {file.used && (
                          <Badge className="absolute top-2 left-2 bg-green-100 text-green-700">
                            مستخدم
                          </Badge>
                        )}
                        
                        {/* أزرار الإجراءات السريعة */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        {/* معلومات الملف */}
                        <div className="space-y-2 mb-3">
                          <h3 className="font-medium text-sm line-clamp-1" title={file.name}>
                            {file.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge className={getFileTypeColor(file.type)}>
                              {getFileTypeName(file.type)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>

                        {/* معلومات إضافية */}
                        {file.dimensions && (
                          <div className="text-xs text-gray-500 mb-2">
                            {file.dimensions.width} × {file.dimensions.height}
                          </div>
                        )}

                        {/* العلامات */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {file.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {file.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{file.tags.length - 2}
                            </Badge>
                          )}
                        </div>

                        {/* معلومات التاريخ والاستخدام */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{getTimeAgo(file.uploadDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{file.usageCount}</span>
                          </div>
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            تحرير
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                نسخ الرابط
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="h-4 w-4 mr-2" />
                                مشاركة
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                تحميل
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الملف
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            النوع
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحجم
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            التاريخ
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الاستخدام
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredFiles.map((file) => {
                          const FileIcon = getFileIcon(file.type);
                          return (
                            <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <FileIcon className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <div className="mr-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {file.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {file.dimensions && `${file.dimensions.width}×${file.dimensions.height}`}
                                      {file.duration && formatDuration(file.duration)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={getFileTypeColor(file.type)}>
                                  {getFileTypeName(file.type)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getTimeAgo(file.uploadDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {file.used ? (
                                    <Badge variant="secondary" className="text-xs">
                                      {file.usageCount} مرة
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      غير مستخدم
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        تحرير
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Copy className="h-4 w-4 mr-2" />
                                        نسخ الرابط
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        حذف
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* تبويبات أخرى للأنواع المختلفة */}
          {['images', 'videos', 'audio', 'documents'].map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div className="text-center py-8">
                <div className="h-12 w-12 text-gray-400 mx-auto mb-4">
                  {type === 'images' && <Image className="h-12 w-12" />}
                  {type === 'videos' && <Video className="h-12 w-12" />}
                  {type === 'audio' && <FileAudio className="h-12 w-12" />}
                  {type === 'documents' && <File className="h-12 w-12" />}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {type === 'images' && 'الصور'}
                  {type === 'videos' && 'الفيديوهات'}
                  {type === 'audio' && 'الملفات الصوتية'}
                  {type === 'documents' && 'المستندات'}
                </h3>
                <p className="text-gray-600">
                  {files.filter(f => f.type === type.slice(0, -1)).length} ملف
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
