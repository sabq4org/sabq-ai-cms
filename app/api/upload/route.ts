import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// التحقق من أن المجلد موجود
async function ensureUploadDir(uploadPath: string) {
  try {
    await fs.mkdir(uploadPath, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 بدء معالجة طلب رفع الصورة...');
    
    const formData = await request.formData();
    console.log('📋 تم استلام FormData');
    
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'avatar'; // نوع الملف: avatar, featured, article
    
    console.log('📄 معلومات الملف:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      uploadType: type
    });
    
    if (!file) {
      console.log('❌ لا يوجد ملف في الطلب');
      return NextResponse.json(
        { success: false, error: 'لم يتم تحديد ملف' },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      console.log('❌ نوع ملف غير مدعوم:', file.type);
      return NextResponse.json(
        { success: false, error: `نوع الملف غير مدعوم (${file.type}). يُسمح بـ: JPG, PNG, GIF, WEBP, AVIF, SVG` },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('❌ حجم الملف كبير جداً:', file.size);
      return NextResponse.json(
        { success: false, error: `حجم الملف كبير جداً (${(file.size / 1024 / 1024).toFixed(2)}MB). الحد الأقصى 5MB` },
        { status: 400 }
      );
    }

    // إنشاء اسم فريد للملف
    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}-${randomUUID()}${fileExtension}`;
    
    console.log('📝 اسم الملف الجديد:', fileName);
    
    // تحديد مسار الحفظ حسب نوع الملف
    let uploadsDir: string;
    let fileUrl: string;
    
    switch (type) {
      case 'featured':
        uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'featured');
        fileUrl = `/uploads/featured/${fileName}`;
        break;
      case 'article':
        uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'articles');
        fileUrl = `/uploads/articles/${fileName}`;
        break;
      case 'avatar':
      default:
        uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        fileUrl = `/uploads/avatars/${fileName}`;
        break;
    }
    
    console.log('📁 مسار الحفظ:', uploadsDir);
    console.log('🔗 رابط الملف:', fileUrl);
    
    // إنشاء المجلد إذا لم يكن موجوداً
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('✅ تم إنشاء/التحقق من المجلد');
    
    // حفظ الملف
    const filePath = path.join(uploadsDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('💾 بدء حفظ الملف...');
    await fs.writeFile(filePath, buffer);
    console.log('✅ تم حفظ الملف بنجاح');
    
    // إرجاع مسار الملف
    const response = {
      success: true,
      data: {
        url: fileUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadType: type
      }
    };
    
    console.log('🎉 تم رفع الصورة بنجاح:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 خطأ في رفع الملف:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء رفع الملف: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// دعم OPTIONS للـ CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 