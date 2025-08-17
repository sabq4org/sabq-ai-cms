import { NextRequest, NextResponse } from 'next/server';
import AWS, { S3 } from 'aws-sdk';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// إعداد DigitalOcean Spaces
function getS3Client() {
  if (!process.env.DO_SPACES_KEY || !process.env.DO_SPACES_SECRET) {
    return null;
  }

  const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT || 'https://fra1.digitaloceanspaces.com');
  return new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
    region: process.env.DO_SPACES_REGION || 'fra1',
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
  });
}

export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول لهذه الصفحة' },
        { status: 401 }
      );
    }
    
    // التحقق من صحة التوكن والدور
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'يجب أن تكون مديراً للوصول لهذه الصفحة' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'جلسة غير صالحة' },
        { status: 401 }
      );
    }

    // التحقق من إعدادات Spaces
    const s3 = getS3Client();
    if (!s3) {
      return NextResponse.json(
        { 
          error: 'خدمة Spaces غير مفعلة',
          message: 'يجب إضافة متغيرات DO_SPACES في إعدادات البيئة' 
        },
        { status: 503 }
      );
    }

    // جلب قائمة السجلات
    const params = {
      Bucket: process.env.DO_SPACES_BUCKET || 'sabq-ai-spaces',
      Prefix: 'appbuild-logs/',
      MaxKeys: 50 // آخر 50 سجل
    };

    const data = await s3.listObjectsV2(params).promise();

    if (!data.Contents || data.Contents.length === 0) {
      return NextResponse.json({
        logs: [],
        message: 'لا توجد سجلات متاحة'
      });
    }

    // تحويل البيانات للعرض
    const logs = data.Contents
      .filter((obj: S3.Object) => obj.Key !== 'appbuild-logs/') // استبعاد المجلد نفسه
      .map((obj: S3.Object) => ({
        key: obj.Key,
        name: obj.Key?.replace('appbuild-logs/', '') || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString() || '',
        etag: obj.ETag,
        // رابط تحميل مؤقت (صالح لمدة ساعة)
        downloadUrl: s3.getSignedUrl('getObject', {
          Bucket: params.Bucket,
          Key: obj.Key as string,
          Expires: 3600 // ساعة واحدة
        })
      }))
      .sort((a: any, b: any) => {
        // ترتيب حسب التاريخ (الأحدث أولاً)
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      });

    // جلب محتوى آخر سجل
    let latestLogContent = null;
    if (logs.length > 0) {
      try {
        const latestLog = await s3.getObject({
          Bucket: params.Bucket,
          Key: 'appbuild-logs/latest-build.json'
        }).promise();

        if (latestLog.Body) {
          latestLogContent = JSON.parse(latestLog.Body.toString());
        }
      } catch (e) {
        // تجاهل إذا لم يكن موجوداً
      }
    }

    return NextResponse.json({
      logs,
      latestLog: latestLogContent,
      totalLogs: logs.length,
      spacesConfig: {
        bucket: process.env.DO_SPACES_BUCKET,
        region: process.env.DO_SPACES_REGION,
        endpoint: process.env.DO_SPACES_ENDPOINT
      }
    });

  } catch (error: any) {
    console.error('خطأ في جلب سجلات البناء:', error);

    // تحليل نوع الخطأ
    if (error.code === 'NoSuchBucket') {
      return NextResponse.json(
        { 
          error: 'البكت غير موجود',
          message: `البكت "${process.env.DO_SPACES_BUCKET}" غير موجود في Spaces`,
          solution: 'يجب إنشاء البكت من لوحة تحكم DigitalOcean'
        },
        { status: 404 }
      );
    }

    if (error.code === 'InvalidAccessKeyId') {
      return NextResponse.json(
        { 
          error: 'مفتاح الوصول غير صحيح',
          message: 'تحقق من صحة DO_SPACES_KEY'
        },
        { status: 401 }
      );
    }

    if (error.code === 'SignatureDoesNotMatch') {
      return NextResponse.json(
        { 
          error: 'المفتاح السري غير صحيح',
          message: 'تحقق من صحة DO_SPACES_SECRET'
        },
        { status: 401 }
      );
    }

    if (error.code === 'NoSuchKey') {
      return NextResponse.json(
        { 
          error: 'المجلد غير موجود',
          message: 'مجلد appbuild-logs غير موجود في البكت',
          solution: 'سيتم إنشاؤه تلقائياً عند أول عملية بناء'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'فشل جلب سجلات البناء',
        message: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}

// حذف سجل محدد
export async function DELETE(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح لك بهذا الإجراء' },
        { status: 401 }
      );
    }
    
    // التحقق من صحة التوكن والدور
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'يجب أن تكون مديراً لهذا الإجراء' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'جلسة غير صالحة' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'يجب تحديد مفتاح السجل' },
        { status: 400 }
      );
    }

    const s3 = getS3Client();
    if (!s3) {
      return NextResponse.json(
        { error: 'خدمة Spaces غير مفعلة' },
        { status: 503 }
      );
    }

    // حذف السجل
    await s3.deleteObject({
      Bucket: process.env.DO_SPACES_BUCKET || 'sabq-ai-spaces',
      Key: key
    }).promise();

    return NextResponse.json({
      success: true,
      message: 'تم حذف السجل بنجاح'
    });

  } catch (error: any) {
    console.error('خطأ في حذف السجل:', error);
    return NextResponse.json(
      { 
        error: 'فشل حذف السجل',
        message: error.message
      },
      { status: 500 }
    );
  }
} 