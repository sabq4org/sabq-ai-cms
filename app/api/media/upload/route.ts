import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

// الحد الأقصى لحجم الملف (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// أنواع الملفات المسموحة
const ALLOWED_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
};

// تكوين Cloudinary من متغيرات البيئة لحماية المفاتيح
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('⚠️  لم يتم ضبط مفاتيح Cloudinary فى متغيرات البيئة');
}

// دالة لضغط الصور
async function compressImage(buffer: Buffer, mimeType: string): Promise<{
  compressed: Buffer;
  thumbnail: Buffer;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // ضغط الصورة الأصلية
  let compressed = image.clone();
  
  // تحديد الجودة بناءً على النوع
  if (mimeType === 'image/jpeg') {
    compressed = compressed.jpeg({ quality: 85, progressive: true });
  } else if (mimeType === 'image/png') {
    compressed = compressed.png({ compressionLevel: 8 });
  } else if (mimeType === 'image/webp') {
    compressed = compressed.webp({ quality: 85 });
  }

  // تغيير حجم الصورة إذا كانت كبيرة جداً
  if (metadata.width && metadata.width > 2000) {
    compressed = compressed.resize(2000, null, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  // إنشاء صورة مصغرة
  const thumbnail = await image.clone()
    .resize(400, 300, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  const compressedBuffer = await compressed.toBuffer();

  return {
    compressed: compressedBuffer,
    thumbnail,
    metadata: {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: compressedBuffer.length,
    },
  };
}

// دالة لتحديد نوع الملف
function getFileType(mimeType: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' {
  for (const [type, mimes] of Object.entries(ALLOWED_TYPES)) {
    if (mimes.includes(mimeType)) {
      return type as any;
    }
  }
  return 'DOCUMENT';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';
    const userId = formData.get('userId') as string || '1'; // مؤقتاً

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم توفير ملف' },
        { status: 400 }
      );
    }

    // تحويل الملف إلى Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // التحقق من مفاتيح Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('⚠️ مفاتيح Cloudinary غير مكتملة');
      // حفظ محلياً كبديل
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = join(process.cwd(), 'public', 'uploads', fileName);
      
      try {
        await mkdir(join(process.cwd(), 'public', 'uploads'), { recursive: true });
        await writeFile(filePath, buffer);
        
        return NextResponse.json({
          id: uuidv4(),
          url: `/uploads/${fileName}`,
          width: null,
          height: null,
          format: file.type.split('/')[1]
        });
      } catch (error) {
        console.error('خطأ في حفظ الملف محلياً:', error);
        return NextResponse.json(
          { error: 'فشل في حفظ الملف' },
          { status: 500 }
        );
      }
    }

    // رفع إلى Cloudinary
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `news/${type}`,
            resource_type: 'auto',
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('خطأ Cloudinary:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        // كتابة البيانات للـ stream
        uploadStream.end(buffer);
      }) as any;

      if (!result || !result.secure_url) {
        throw new Error('لم يتم استلام رابط الصورة من Cloudinary');
      }

      // حفظ في قاعدة البيانات
      const mediaFile = await prisma.mediaFile.create({
        data: {
          fileName: file.name,
          title: file.name,
          url: result.secure_url,
          publicId: result.public_id,
          type: 'IMAGE',
          fileSize: result.bytes,
          width: result.width || null,
          height: result.height || null,
          mimeType: file.type,
          metadata: {
            originalName: file.name,
            uploadType: type,
            cloudinaryData: {
              version: result.version,
              signature: result.signature,
              etag: result.etag
            }
          },
          uploadedBy: userId
        }
      });

      return NextResponse.json({
        id: mediaFile.id,
        url: mediaFile.url,
        width: mediaFile.width,
        height: mediaFile.height,
        format: file.type.split('/')[1]
      });

    } catch (cloudinaryError) {
      console.error('خطأ في رفع الملف إلى Cloudinary:', cloudinaryError);
      return NextResponse.json(
        { error: 'فشل في رفع الملف إلى السحابة' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('خطأ في معالجة الملف:', error);
    return NextResponse.json(
      { error: 'فشل في معالجة الملف' },
      { status: 500 }
    );
  }
} 