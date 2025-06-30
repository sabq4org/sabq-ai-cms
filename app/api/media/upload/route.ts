import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// الحد الأقصى لحجم الملف (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// أنواع الملفات المسموحة
const ALLOWED_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
};

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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const userId = formData.get('userId') as string || 'anonymous';
    const autoAnalyze = formData.get('autoAnalyze') === 'true';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'لم يتم اختيار أي ملفات' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];
    const errors = [];

    // إنشاء مجلد الرفع إذا لم يكن موجوداً
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // معالجة كل ملف
    for (const file of files) {
      try {
        // التحقق من حجم الملف
        if (file.size > MAX_FILE_SIZE) {
          errors.push({
            fileName: file.name,
            error: 'حجم الملف أكبر من الحد المسموح (10MB)',
          });
          continue;
        }

        // التحقق من نوع الملف
        const fileType = getFileType(file.type);
        if (!ALLOWED_TYPES[fileType].includes(file.type)) {
          errors.push({
            fileName: file.name,
            error: 'نوع الملف غير مسموح',
          });
          continue;
        }

        // قراءة محتوى الملف
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // إنشاء أسماء فريدة للملفات
        const fileId = uuidv4();
        const extension = file.name.split('.').pop();
        const fileName = `${fileId}.${extension}`;
        const filePath = join(uploadDir, fileName);

        let finalBuffer: Uint8Array = new Uint8Array(buffer);
        let thumbnailUrl = null;
        let imageMetadata = null;

        // معالجة الصور
        if (fileType === 'IMAGE') {
          try {
            const { compressed, thumbnail, metadata } = await compressImage(buffer, file.type);
            finalBuffer = new Uint8Array(compressed);
            imageMetadata = metadata;

            // حفظ الصورة المصغرة
            const thumbnailName = `${fileId}_thumb.jpg`;
            const thumbnailPath = join(uploadDir, thumbnailName);
            await writeFile(thumbnailPath, thumbnail);
            thumbnailUrl = `/uploads/${thumbnailName}`;
          } catch (error) {
            console.error('خطأ في ضغط الصورة:', error);
            // الاستمرار مع الصورة الأصلية
          }
        }

        // حفظ الملف
        await writeFile(filePath, finalBuffer);
        const fileUrl = `/uploads/${fileName}`;

        // حفظ في قاعدة البيانات
        const mediaFile = await prisma.mediaFile.create({
          data: {
            url: fileUrl,
            type: fileType,
            title: file.name.split('.')[0],
            fileName: file.name,
            fileSize: finalBuffer.length,
            mimeType: file.type,
            width: imageMetadata?.width,
            height: imageMetadata?.height,
            thumbnailUrl,
            uploadedBy: userId,
          },
        });

        uploadedFiles.push(mediaFile);

        // تحليل الصورة تلقائياً إذا طُلب ذلك
        if (autoAnalyze && fileType === 'IMAGE') {
          // إرسال طلب تحليل غير متزامن
          fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/media/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mediaId: mediaFile.id }),
          }).catch(console.error);
        }
      } catch (error) {
        console.error('خطأ في رفع الملف:', error);
        errors.push({
          fileName: file.name,
          error: 'فشل رفع الملف',
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedFiles,
      errors,
      summary: {
        total: files.length,
        succeeded: uploadedFiles.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error('خطأ في معالجة الرفع:', error);
    return NextResponse.json(
      { error: 'فشل في معالجة الملفات' },
      { status: 500 }
    );
  }
} 