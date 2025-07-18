# متغيرات البيئة المطلوبة لـ DigitalOcean

## المتغيرات الأساسية

### 1. DATABASE_URL
```
DATABASE_URL=postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. NEXTAUTH_URL
```
NEXTAUTH_URL=https://your-app.ondigitalocean.app
```

### 3. NEXTAUTH_SECRET
```
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### 4. NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb
```

### 5. NEXT_PUBLIC_CLOUDINARY_API_KEY
```
NEXT_PUBLIC_CLOUDINARY_API_KEY=559894124915114
```

### 6. NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
```
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sabq_preset
```

### 7. NEXT_PUBLIC_SITE_URL
```
NEXT_PUBLIC_SITE_URL=https://your-app.ondigitalocean.app
```

### 8. NEXT_PUBLIC_API_URL
```
NEXT_PUBLIC_API_URL=https://your-app.ondigitalocean.app
```

### 9. NEXT_PUBLIC_APP_URL
```
NEXT_PUBLIC_APP_URL=https://your-app.ondigitalocean.app
```

### 10. NEXT_PUBLIC_BASE_URL
```
NEXT_PUBLIC_BASE_URL=https://your-app.ondigitalocean.app
```

### 11. NEXT_PUBLIC_SUPABASE_URL
```
NEXT_PUBLIC_SUPABASE_URL=https://ogmzxtfxmuztpvlvxuzr.supabase.co
```

### 12. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 13. NODE_ENV
```
NODE_ENV=production
```

### 14. CLOUDINARY_API_KEY (مطلوب للملفات الصوتية)
```
CLOUDINARY_API_KEY=559894124915114
```

### 15. CLOUDINARY_API_SECRET (مطلوب للملفات الصوتية)
```
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 16. ELEVENLABS_API_KEY (للنشرات الصوتية)
```
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

## ملاحظات مهمة

1. **استبدل القيم**: غيّر `your-app.ondigitalocean.app` إلى رابط تطبيقك الفعلي
2. **Force Rebuild**: بعد إضافة المتغيرات، اضغط "Force Rebuild and Deploy" وليس مجرد "Redeploy"
3. **التحقق**: بعد النشر، افتح `/api/check-env` للتأكد من عمل المتغيرات
4. **الأولوية**: هذه أهم المتغيرات المطلوبة لعمل التطبيق بشكل صحيح

## التحقق بعد النشر

قم بزيارة:
```
https://your-app.ondigitalocean.app/api/check-env
```

يجب أن تظهر:
```json
{
  "status": "ok",
  "cloudinary": {
    "cloudName": "dybhezmvb",
    "isConfigured": true
  },
  "site": {
    "url": "https://your-app.ondigitalocean.app"
  }
}
``` 