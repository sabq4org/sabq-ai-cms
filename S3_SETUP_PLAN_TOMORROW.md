# 📸 خطة إعداد Amazon S3 للصور - الغد

## 🎯 الهدف
تحويل نظام رفع الصور من التخزين المحلي إلى Amazon S3 للحصول على:
- ✅ تخزين آمن وموثوق
- ✅ سرعة في التحميل (CDN)
- ✅ تحسين الأداء
- ✅ Scalability

## 📋 خطة العمل (الغد)

### المرحلة 1: إعداد S3 Bucket (30 دقيقة)

#### 1.1 إنشاء S3 Bucket
```bash
# في AWS Console:
1. S3 → Create bucket
2. Bucket name: sabq-cms-images-prod-2025
3. Region: eu-north-1 (نفس منطقة RDS)
4. Object Ownership: ACLs enabled
5. Block Public Access: 
   - ❌ Block all public access (نحتاج public read)
   - ✅ Block public access to buckets and objects granted through new ACLs
   - ✅ Block public access to buckets and objects granted through any ACLs
   - ❌ Block public access to buckets and objects granted through new public bucket or access point policies
   - ❌ Block public access to buckets and objects granted through any public bucket or access point policies
```

#### 1.2 إعداد Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::sabq-cms-images-prod-2025/*"
    }
  ]
}
```

#### 1.3 إعداد CORS
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### المرحلة 2: إعداد IAM (20 دقيقة)

#### 2.1 إنشاء IAM Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::sabq-cms-images-prod-2025/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::sabq-cms-images-prod-2025"
    }
  ]
}
```

#### 2.2 إنشاء IAM User
```bash
1. IAM → Users → Create user
2. User name: sabq-cms-s3-user
3. Access type: Programmatic access
4. Attach policy: sabq-s3-policy
5. Generate Access Keys
6. Save: Access Key ID + Secret Access Key
```

### المرحلة 3: تحديث التطبيق (60 دقيقة)

#### 3.1 تثبيت المكتبات المطلوبة
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer multer-s3
```

#### 3.2 إنشاء S3 Client
```typescript
// lib/s3-client.ts
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
```

#### 3.3 تحديث Upload API
```typescript
// app/api/upload/route.ts
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '@/lib/s3-client';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // Return S3 URL
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;

    return Response.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
    });

  } catch (error) {
    console.error('S3 upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

#### 3.4 تحديث Image Component
```typescript
// components/ui/ImageUpload.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

export function ImageUpload({ onImageUploaded, currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setPreview(result.url);
        onImageUploaded(result.url);
      } else {
        alert('فشل في رفع الصورة');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        {preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">اضغط لرفع الصورة</span>
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
          disabled={uploading}
        />
      </div>
      
      {uploading && (
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            جاري رفع الصورة...
          </div>
        </div>
      )}
    </div>
  );
}
```

### المرحلة 4: Environment Variables (10 دقيقة)

#### إضافة متغيرات S3 للبيئة
```bash
# .env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=sabq-cms-images-prod-2025
AWS_S3_REGION=eu-north-1

# AWS Amplify Environment Variables
# Add these in Amplify Console → Environment variables
```

### المرحلة 5: اختبار ونشر (30 دقيقة)

#### 5.1 اختبار محلي
```bash
1. تحديث .env مع S3 credentials
2. npm run dev
3. اختبار رفع الصور
4. التحقق من ظهور الصور في S3
5. اختبار عرض الصور من S3 URLs
```

#### 5.2 نشر التحديثات
```bash
git add .
git commit -m "✅ إضافة دعم Amazon S3 للصور

🎯 المميزات الجديدة:
- رفع الصور إلى Amazon S3
- CDN للصور (تحميل سريع)
- تحسين الأداء والمساحة
- دعم كامل لجميع أنواع الصور

📊 التحسينات:
- ImageUpload component محدث
- S3 client configuration
- Upload API متصل بـ S3
- Environment variables للإنتاج"

git push origin main
```

#### 5.3 تحديث Amplify
```bash
1. AWS Amplify → Environment variables
2. إضافة S3 credentials
3. إعادة نشر التطبيق
4. اختبار الصور على الموقع المباشر
```

## 📊 النتائج المتوقعة

### بعد التطبيق:
- ✅ **رفع الصور**: مباشرة إلى S3
- ✅ **السرعة**: تحميل أسرع مع CDN
- ✅ **المساحة**: لا توجد صور في الخادم
- ✅ **الموثوقية**: Amazon S3 reliability
- ✅ **التكلفة**: pay-as-you-use

### مقاييس التحسين:
- **قبل**: صور محلية، بطيئة، محدودة المساحة
- **بعد**: S3 + CDN، سريعة، مساحة غير محدودة

## 🎯 Timeline الغد

| الوقت | المهمة | المدة |
|-------|--------|--------|
| 9:00 | إعداد S3 Bucket | 30 دقيقة |
| 9:30 | IAM User & Policies | 20 دقيقة |
| 10:00 | تحديث الكود | 60 دقيقة |
| 11:00 | اختبار محلي | 30 دقيقة |
| 11:30 | نشر وتحديث Amplify | 30 دقيقة |
| 12:00 | اختبار نهائي | 30 دقيقة |

**المجموع**: 3 ساعات من العمل المُركز

---

**الحالة**: خطة جاهزة للتنفيذ غداً ✅
**الهدف**: صور سريعة وموثوقة على S3 📸
**النتيجة**: تطبيق محترف بالكامل على AWS 🚀
