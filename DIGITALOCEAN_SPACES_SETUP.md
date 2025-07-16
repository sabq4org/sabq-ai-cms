# دليل إعداد DigitalOcean Spaces لسجلات البناء

## المشكلة الحالية
- خطأ `NoSuchKey` عند محاولة الوصول لسجلات البناء
- البكت `appbuild-logs` غير موجود أو غير مرتبط بشكل صحيح
- عدم وجود صلاحيات بين App Platform و Spaces

## الحل الشامل

### 1. إنشاء DigitalOcean Space

#### أ) من لوحة التحكم:
1. اذهب إلى [DigitalOcean Dashboard](https://cloud.digitalocean.com)
2. اضغط على **Create** → **Spaces**
3. اختر المنطقة: **FRA1** (نفس منطقة التطبيق)
4. اسم Space: `sabq-ai-spaces`
5. اختر **Private** (خاص)
6. اضغط **Create Space**

#### ب) إنشاء البكت المطلوب:
```bash
# باستخدام s3cmd
s3cmd mb s3://sabq-ai-spaces/appbuild-logs

# أو من لوحة التحكم
# 1. افتح Space
# 2. اضغط Create Folder
# 3. اسم المجلد: appbuild-logs
```

### 2. إعداد Access Keys

#### أ) إنشاء Access Key:
1. اذهب إلى **API** → **Spaces Keys**
2. اضغط **Generate New Key**
3. الاسم: `sabq-app-platform-key`
4. احفظ المفاتيح:
   - Access Key: `DO...`
   - Secret Key: `...`

### 3. ربط App Platform مع Spaces

#### أ) إضافة متغيرات البيئة في App Platform:
```env
# Spaces Configuration
DO_SPACES_KEY=your-access-key
DO_SPACES_SECRET=your-secret-key
DO_SPACES_REGION=fra1
DO_SPACES_BUCKET=sabq-ai-spaces
DO_SPACES_ENDPOINT=https://fra1.digitaloceanspaces.com
```

#### ب) تحديث إعدادات App Platform:
في **.do/app.yaml**، أضف:
```yaml
envs:
  # ... متغيرات أخرى
  - key: DO_SPACES_KEY
    type: SECRET
  - key: DO_SPACES_SECRET
    type: SECRET
  - key: DO_SPACES_REGION
    value: fra1
  - key: DO_SPACES_BUCKET
    value: sabq-ai-spaces
  - key: DO_SPACES_ENDPOINT
    value: https://fra1.digitaloceanspaces.com
```

### 4. إنشاء سكريبت رفع السجلات

#### أ) إنشاء `scripts/upload-build-logs.js`:
```javascript
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// إعداد DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: process.env.DO_SPACES_REGION
});

async function uploadBuildLogs() {
  const timestamp = new Date().toISOString();
  const logFile = `build-log-${timestamp}.txt`;
  
  try {
    // جمع معلومات البناء
    const buildInfo = {
      timestamp,
      node_version: process.version,
      platform: process.platform,
      app_version: process.env.APP_VERSION || '0.2.2',
      build_command: process.env.BUILD_COMMAND,
      environment: process.env.NODE_ENV
    };

    // قراءة سجلات البناء (إذا كانت موجودة)
    let buildLogs = JSON.stringify(buildInfo, null, 2);
    const logPath = '.next/build-manifest.json';
    
    if (fs.existsSync(logPath)) {
      const manifest = fs.readFileSync(logPath, 'utf8');
      buildLogs += '\n\n--- Build Manifest ---\n' + manifest;
    }

    // رفع السجلات إلى Spaces
    const params = {
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: `appbuild-logs/${logFile}`,
      Body: buildLogs,
      ContentType: 'text/plain',
      ACL: 'private'
    };

    const result = await s3.upload(params).promise();
    console.log('✅ تم رفع سجلات البناء:', result.Location);

  } catch (error) {
    console.error('❌ فشل رفع السجلات:', error);
  }
}

// تشغيل عند البناء
if (require.main === module) {
  uploadBuildLogs();
}

module.exports = uploadBuildLogs;
```

#### ب) تحديث أمر البناء:
في **package.json**:
```json
"scripts": {
  "build": "prisma generate && next build && node scripts/upload-build-logs.js",
  "build:do": "node scripts/digitalocean-build.js && npm run prisma:generate && next build && node scripts/upload-build-logs.js"
}
```

### 5. إعداد CORS لـ Spaces

#### من لوحة تحكم Spaces:
1. افتح Space: `sabq-ai-spaces`
2. اذهب إلى **Settings** → **CORS**
3. أضف:
```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://sabq-ai-cms-*.ondigitalocean.app</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
```

### 6. التحقق من الإعداد

#### أ) اختبار الاتصال محلياً:
```bash
# إنشاء سكريبت اختبار
node scripts/test-spaces-connection.js
```

#### ب) إنشاء `scripts/test-spaces-connection.js`:
```javascript
require('dotenv').config({ path: '.env.local' });
const AWS = require('aws-sdk');

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: process.env.DO_SPACES_REGION
});

async function testConnection() {
  try {
    // محاولة قراءة البكت
    const result = await s3.listBuckets().promise();
    console.log('✅ الاتصال ناجح! البكتات المتاحة:', result.Buckets);

    // محاولة قراءة المجلد
    const objects = await s3.listObjectsV2({
      Bucket: process.env.DO_SPACES_BUCKET,
      Prefix: 'appbuild-logs/'
    }).promise();

    console.log('📁 محتويات appbuild-logs:', objects.Contents?.length || 0, 'ملف');

  } catch (error) {
    console.error('❌ فشل الاتصال:', error.message);
  }
}

testConnection();
```

### 7. إضافة صفحة عرض السجلات

#### إنشاء `app/dashboard/build-logs/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';

export default function BuildLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/build-logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('فشل جلب السجلات:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>سجلات البناء</CardTitle>
          <Button onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>جاري التحميل...</div>
          ) : logs.length === 0 ? (
            <div>لا توجد سجلات متاحة</div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{log.name}</span>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 ml-2" />
                      تحميل
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>التاريخ: {new Date(log.lastModified).toLocaleString('ar')}</div>
                    <div>الحجم: {(log.size / 1024).toFixed(2)} KB</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 8. نصائح مهمة

1. **الأمان**: لا تشارك Access Keys أبداً
2. **النسخ الاحتياطي**: احتفظ بنسخة من السجلات محلياً
3. **التنظيف**: أضف سكريبت لحذف السجلات القديمة
4. **المراقبة**: راقب استخدام Space لتجنب التكاليف الزائدة

### 9. حل المشاكل الشائعة

#### خطأ NoSuchKey:
```bash
# تأكد من وجود البكت
s3cmd ls s3://sabq-ai-spaces/

# إنشاء المجلد إذا لم يكن موجوداً
s3cmd put --recursive empty-file s3://sabq-ai-spaces/appbuild-logs/
```

#### خطأ في الصلاحيات:
```bash
# تحقق من الصلاحيات
s3cmd info s3://sabq-ai-spaces/appbuild-logs/

# تحديث ACL
s3cmd setacl s3://sabq-ai-spaces/appbuild-logs/ --acl-private
```

## الخطوات التالية

1. اتبع الخطوات أعلاه لإنشاء Space
2. أضف متغيرات البيئة في App Platform
3. انشر التحديثات
4. اختبر رفع السجلات

بعد إكمال هذه الخطوات، ستتمكن من الوصول لسجلات البناء بدون مشاكل. 