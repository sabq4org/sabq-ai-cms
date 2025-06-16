import { NextRequest, NextResponse } from 'next/server';

// ===============================
// أنواع البيانات
// ===============================

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  media_type: 'image' | 'video' | 'audio' | 'document';
  width?: number;
  height?: number;
  duration?: number;
  title?: string;
  description?: string;
  alt_text?: string;
  caption?: string;
  credit?: string;
  tags: string[];
  uploaded_by: string;
  article_id?: string;
  storage_provider: string;
  is_public: boolean;
  is_optimized: boolean;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

// بيانات وهمية للوسائط
let mediaFiles: MediaFile[] = [
  {
    id: 'media-1',
    filename: 'vision-2030-tech-hero.jpg',
    original_name: 'رؤية 2030 التقنية.jpg',
    file_path: '/uploads/images/2024/12/vision-2030-tech-hero.jpg',
    file_url: '/images/articles/vision-2030-tech-hero.jpg',
    mime_type: 'image/jpeg',
    file_size: 245760,
    media_type: 'image',
    width: 1200,
    height: 675,
    title: 'رؤية 2030 والتقنية',
    description: 'صورة توضيحية لإنجازات رؤية 2030 في قطاع التقنية',
    alt_text: 'رؤية المملكة 2030 في قطاع التقنية والابتكار',
    caption: 'إنجازات متميزة في التحول الرقمي',
    credit: 'وكالة الأنباء السعودية',
    tags: ['رؤية 2030', 'تقنية', 'تحول رقمي'],
    uploaded_by: 'user-1',
    article_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    storage_provider: 'local',
    is_public: true,
    is_optimized: true,
    usage_count: 5,
    last_used_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'media-2',
    filename: 'alhilal-celebration.jpg',
    original_name: 'احتفال الهلال.jpg',
    file_path: '/uploads/images/2024/12/alhilal-celebration.jpg',
    file_url: '/images/articles/alhilal-celebration.jpg',
    mime_type: 'image/jpeg',
    file_size: 189440,
    media_type: 'image',
    width: 800,
    height: 600,
    title: 'احتفال نادي الهلال',
    description: 'لاعبو الهلال يحتفلون بالتأهل لنهائي دوري أبطال آسيا',
    alt_text: 'لاعبو نادي الهلال يحتفلون بالتأهل',
    caption: 'فرحة التأهل للنهائي الآسيوي',
    credit: 'المصور الرياضي',
    tags: ['الهلال', 'كرة قدم', 'دوري آسيا'],
    uploaded_by: 'user-2',
    article_id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    storage_provider: 'local',
    is_public: true,
    is_optimized: true,
    usage_count: 12,
    last_used_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'media-3',
    filename: 'oil-market-chart.png',
    original_name: 'مخطط أسعار النفط.png',
    file_path: '/uploads/images/2024/12/oil-market-chart.png',
    file_url: '/images/articles/oil-market-chart.png',
    mime_type: 'image/png',
    file_size: 156230,
    media_type: 'image',
    width: 1000,
    height: 500,
    title: 'مخطط أسعار النفط',
    description: 'رسم بياني يوضح تطور أسعار النفط خلال الربع الأخير',
    alt_text: 'مخطط بياني لأسعار النفط',
    caption: 'ارتفاع أسعار النفط في الأسواق العالمية',
    tags: ['نفط', 'اقتصاد', 'أسعار'],
    uploaded_by: 'user-3',
    article_id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    storage_provider: 'local',
    is_public: true,
    is_optimized: false,
    usage_count: 3,
    last_used_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'media-4',
    filename: 'ai-conference-video.mp4',
    original_name: 'مؤتمر الذكاء الاصطناعي.mp4',
    file_path: '/uploads/videos/2024/12/ai-conference-video.mp4',
    file_url: '/videos/ai-conference-video.mp4',
    mime_type: 'video/mp4',
    file_size: 15728640,
    media_type: 'video',
    width: 1920,
    height: 1080,
    duration: 180,
    title: 'مقطع من مؤتمر الذكاء الاصطناعي',
    description: 'لقطات من افتتاح مؤتمر الرياض للذكاء الاصطناعي',
    caption: 'كلمة افتتاح المؤتمر',
    credit: 'قناة سبق',
    tags: ['ذكاء اصطناعي', 'مؤتمر', 'تقنية'],
    uploaded_by: 'user-1',
    storage_provider: 'local',
    is_public: true,
    is_optimized: true,
    usage_count: 1,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'media-5',
    filename: 'neom-project-doc.pdf',
    original_name: 'تقرير مشروع نيوم.pdf',
    file_path: '/uploads/documents/2024/12/neom-project-doc.pdf',
    file_url: '/documents/neom-project-doc.pdf',
    mime_type: 'application/pdf',
    file_size: 2097152,
    media_type: 'document',
    title: 'تقرير مشروع نيوم',
    description: 'تقرير شامل عن مشروع نيوم ومبادرات الطاقة المتجددة',
    tags: ['نيوم', 'طاقة متجددة', 'مشاريع'],
    uploaded_by: 'user-2',
    storage_provider: 'local',
    is_public: false,
    is_optimized: false,
    usage_count: 2,
    last_used_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

// ===============================
// وظائف مساعدة
// ===============================

// تحديد نوع الوسائط من MIME type
function getMediaTypeFromMime(mimeType: string): 'image' | 'video' | 'audio' | 'document' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

// تحويل حجم الملف إلى نص قابل للقراءة
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// فلترة الوسائط
function filterMedia(query: URLSearchParams) {
  let filteredMedia = [...mediaFiles];

  // فلترة حسب نوع الوسائط
  const mediaType = query.get('media_type');
  if (mediaType) {
    filteredMedia = filteredMedia.filter(file => file.media_type === mediaType);
  }

  // فلترة حسب المؤلف
  const uploadedBy = query.get('uploaded_by');
  if (uploadedBy) {
    filteredMedia = filteredMedia.filter(file => file.uploaded_by === uploadedBy);
  }

  // البحث في الاسم والوصف والعلامات
  const search = query.get('search');
  if (search) {
    filteredMedia = filteredMedia.filter(file => 
      file.title?.includes(search) ||
      file.description?.includes(search) ||
      file.original_name.includes(search) ||
      file.tags.some(tag => tag.includes(search))
    );
  }

  // فلترة الملفات العامة/الخاصة
  const isPublic = query.get('is_public');
  if (isPublic !== null) {
    filteredMedia = filteredMedia.filter(file => file.is_public === (isPublic === 'true'));
  }

  // فلترة حسب حجم الملف
  const maxSize = query.get('max_size');
  if (maxSize) {
    const maxSizeBytes = parseInt(maxSize);
    filteredMedia = filteredMedia.filter(file => file.file_size <= maxSizeBytes);
  }

  return filteredMedia;
}

// ===============================
// معالجات API
// ===============================

// GET: استرجاع الوسائط
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // تطبيق الفلاتر
    let filteredMedia = filterMedia(searchParams);
    
    // ترتيب حسب تاريخ الإنشاء (الأحدث أولاً)
    const sortBy = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    
    filteredMedia.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.original_name;
          bValue = b.original_name;
          break;
        case 'size':
          aValue = a.file_size;
          bValue = b.file_size;
          break;
        case 'usage':
          aValue = a.usage_count;
          bValue = b.usage_count;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }
      
      if (order === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });
    
    // تطبيق التقسيم
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedMedia = filteredMedia.slice(startIndex, endIndex);
    
    // إحصائيات
    const stats = {
      total: filteredMedia.length,
      page,
      limit,
      totalPages: Math.ceil(filteredMedia.length / limit),
      hasNext: endIndex < filteredMedia.length,
      hasPrev: page > 1,
      totalSize: filteredMedia.reduce((sum, file) => sum + file.file_size, 0),
      typeBreakdown: {
        image: filteredMedia.filter(f => f.media_type === 'image').length,
        video: filteredMedia.filter(f => f.media_type === 'video').length,
        audio: filteredMedia.filter(f => f.media_type === 'audio').length,
        document: filteredMedia.filter(f => f.media_type === 'document').length
      }
    };

    return NextResponse.json({
      success: true,
      data: paginatedMedia.map(file => ({
        ...file,
        file_size_formatted: formatFileSize(file.file_size)
      })),
      pagination: stats
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في استرجاع الوسائط',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// POST: رفع ملف جديد
export async function POST(request: NextRequest) {
  try {
    // في التطبيق الحقيقي، سيتم استخدام FormData لرفع الملفات
    const body = await request.json();
    
    if (!body.filename || !body.mime_type || !body.file_size) {
      return NextResponse.json({
        success: false,
        error: 'بيانات الملف مطلوبة'
      }, { status: 400 });
    }

    // إنشاء معرف فريد للملف
    const fileId = `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();
    const year = timestamp.getFullYear();
    const month = String(timestamp.getMonth() + 1).padStart(2, '0');
    
    const newFile: MediaFile = {
      id: fileId,
      filename: body.filename,
      original_name: body.original_name || body.filename,
      file_path: `/uploads/${getMediaTypeFromMime(body.mime_type)}s/${year}/${month}/${body.filename}`,
      file_url: `/media/${body.filename}`,
      mime_type: body.mime_type,
      file_size: body.file_size,
      media_type: getMediaTypeFromMime(body.mime_type),
      width: body.width,
      height: body.height,
      duration: body.duration,
      title: body.title?.trim(),
      description: body.description?.trim(),
      alt_text: body.alt_text?.trim(),
      caption: body.caption?.trim(),
      credit: body.credit?.trim(),
      tags: body.tags || [],
      uploaded_by: 'current-user-id', // سيتم استبداله بالمستخدم الحالي
      article_id: body.article_id,
      storage_provider: 'local',
      is_public: body.is_public !== false,
      is_optimized: false,
      usage_count: 0,
      created_at: timestamp.toISOString(),
      updated_at: timestamp.toISOString()
    };

    mediaFiles.unshift(newFile);

    return NextResponse.json({
      success: true,
      data: {
        ...newFile,
        file_size_formatted: formatFileSize(newFile.file_size)
      },
      message: 'تم رفع الملف بنجاح'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في رفع الملف',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// DELETE: حذف ملفات متعددة
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'قائمة معرفات الملفات مطلوبة'
      }, { status: 400 });
    }

    const deletedCount = mediaFiles.length;
    mediaFiles = mediaFiles.filter(file => !ids.includes(file.id));
    const actualDeletedCount = deletedCount - mediaFiles.length;

    return NextResponse.json({
      success: true,
      message: `تم حذف ${actualDeletedCount} ملف`,
      deletedCount: actualDeletedCount
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف الملفات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 