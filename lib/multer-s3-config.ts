// ملاحظة: هذا الملف للمرجع فقط - Next.js لا يدعم multer بشكل مباشر
// للاستخدام مع Express.js في مشاريع أخرى

/*
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';

// إعداد AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIA5ODCY47IRLKNVZ7H',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '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',
  region: process.env.AWS_REGION || 'us-east-1',
});

// إعداد multer مع S3
const uploadMulter = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET || 'sabq-uploader',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: any, file: any, cb: any) => {
      const timestamp = Date.now();
      const fileName = `uploads/${timestamp}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // التحقق من نوع الملف
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'), false);
    }
  }
});

export default uploadMulter;
*/

// للاستخدام مع Next.js، استخدم /api/upload-s3/route.ts بدلاً من ذلك

import AWS from 'aws-sdk';

// تكوين S3 للاستخدام العام
export const s3Config = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION || 'us-east-1',
  bucket: process.env.S3_BUCKET_NAME || 'sabq-uploader'
};

// مثال على Express route للمشاريع الأخرى:
export const expressRouteExample = `
import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';

const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName = \`\${Date.now()}-\${file.originalname}\`;
      cb(null, \`uploads/\${fileName}\`);
    },
  }),
});

router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ url: req.file.location });
});

export default router;
`;
