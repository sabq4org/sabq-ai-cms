# 📸 متطلبات إضافة ميزة الصورة الشخصية للمستخدم

## 🎯 نظرة عامة
نحتاج إلى إضافة دعم كامل لميزة الصورة الشخصية (Avatar) للمستخدمين في منصة سبق الإخبارية، بحيث تشمل رفع الصورة، حفظها، وعرضها في جميع أجزاء الواجهة.

---

## 📤 1. رفع الصورة (Upload)

### المتطلبات الأساسية:
- **الصيغ المدعومة**: JPG, PNG, WebP
- **الحد الأقصى للحجم**: 2MB
- **الأبعاد الموصى بها**: 200x200 بكسل (مربعة)
- **الحد الأدنى للأبعاد**: 100x100 بكسل

### المكونات المطلوبة:

#### أ) مكون رفع الصورة `AvatarUpload.tsx`:
```typescript
interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
}
```

#### ب) الميزات المطلوبة:
1. **معاينة فورية** (Preview) للصورة المختارة
2. **أداة قص** (Cropper) لتوحيد الشكل المربع
3. **شريط تقدم** أثناء الرفع
4. **رسائل خطأ واضحة** عند:
   - تجاوز الحجم المسموح
   - صيغة غير مدعومة
   - فشل الرفع

#### ج) مثال على التنفيذ:
```typescript
// التحقق من الملف
const validateFile = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('يُسمح فقط بصيغ JPG, PNG, WebP');
  }
  
  if (file.size > maxSize) {
    throw new Error('حجم الملف يجب أن يكون أقل من 2MB');
  }
};
```

---

## 💾 2. الحفظ في قاعدة البيانات

### أ) تحديث جدول المستخدمين:
```sql
ALTER TABLE users 
ADD COLUMN avatar_url TEXT,
ADD COLUMN avatar_updated_at TIMESTAMP;
```

### ب) مسار الحفظ:
1. **رفع إلى Cloudinary** (مستخدم حالياً في المشروع):
   ```typescript
   const uploadToCloudinary = async (file: File) => {
     const formData = new FormData();
     formData.append('file', file);
     formData.append('upload_preset', 'user_avatars');
     formData.append('folder', 'avatars');
     
     const response = await fetch(
       `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
       { method: 'POST', body: formData }
     );
     
     const data = await response.json();
     return data.secure_url;
   };
   ```

2. **تحديث قاعدة البيانات**:
   ```typescript
   const updateUserAvatar = async (userId: string, avatarUrl: string) => {
     const { error } = await supabase
       .from('users')
       .update({ 
         avatar_url: avatarUrl,
         avatar_updated_at: new Date().toISOString()
       })
       .eq('id', userId);
       
     if (error) throw error;
   };
   ```

### ج) الصورة الافتراضية:
```typescript
const DEFAULT_AVATAR = '/images/default-avatar.svg';

const getUserAvatar = (user: User) => {
  return user.avatar_url || DEFAULT_AVATAR;
};
```

---

## 👤 3. عرض الصورة في الواجهة

### أ) النسخة المكتبية (Desktop):

#### مكون `UserAvatar.tsx`:
```typescript
interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

// الأحجام:
// sm: 32x32px
// md: 40x40px (افتراضي)
// lg: 48x48px
```

#### التصميم في الهيدر:
- **الموقع**: الزاوية العلوية اليمنى
- **الحجم**: 40x40 بكسل
- **الشكل**: دائري `rounded-full`
- **الحدود**: `border-2 border-white shadow-sm`
- **التفاعل**: عند الضغط تفتح قائمة منسدلة

#### مثال التنفيذ:
```jsx
<div className="flex items-center gap-3">
  <span className="text-sm font-medium">{user.name}</span>
  <div className="relative">
    <img
      src={getUserAvatar(user)}
      alt={user.name}
      className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={toggleDropdown}
    />
    {showDropdown && <UserDropdown />}
  </div>
</div>
```

### ب) النسخة الخفيفة (Mobile/Responsive):

#### التصميم للموبايل:
- **الحجم**: 36x36 بكسل في الهيدر
- **داخل قائمة الهامبرغر**: 48x48 بكسل
- **مع اسم المستخدم**: في أعلى القائمة الجانبية

#### مثال التنفيذ للموبايل:
```jsx
// في الهيدر
<button className="flex items-center gap-2 p-2">
  <img
    src={getUserAvatar(user)}
    alt={user.name}
    className="w-9 h-9 rounded-full border border-gray-200"
  />
  <MenuIcon className="w-5 h-5" />
</button>

// في القائمة الجانبية
<div className="p-4 border-b border-gray-200 bg-gray-50">
  <div className="flex items-center gap-3">
    <img
      src={getUserAvatar(user)}
      alt={user.name}
      className="w-12 h-12 rounded-full border-2 border-white shadow"
    />
    <div>
      <p className="font-semibold text-sm">{user.name}</p>
      <p className="text-xs text-gray-500">{user.email}</p>
    </div>
  </div>
</div>
```

---

## 🔄 4. تحديث الصورة في الوقت الفعلي

### أ) استخدام Context API:
```typescript
// UserContext.tsx
interface UserContextType {
  user: User | null;
  updateAvatar: (avatarUrl: string) => void;
}

const UserContext = createContext<UserContextType>();

// تحديث الصورة
const updateAvatar = (avatarUrl: string) => {
  setUser(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
};
```

### ب) تحديث الـ Session:
```typescript
// بعد رفع الصورة بنجاح
const handleAvatarUpload = async (file: File) => {
  const avatarUrl = await uploadToCloudinary(file);
  await updateUserAvatar(user.id, avatarUrl);
  
  // تحديث السيشن
  await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl }
  });
  
  // تحديث الـ Context
  updateAvatar(avatarUrl);
};
```

---

## 🧪 5. الاختبار والتحقق

### قائمة الاختبارات المطلوبة:
- [ ] رفع صورة بصيغة JPG/PNG/WebP
- [ ] التحقق من رفض الملفات الكبيرة (> 2MB)
- [ ] التحقق من رفض الصيغ غير المدعومة
- [ ] معاينة الصورة قبل الحفظ
- [ ] حفظ الصورة في Cloudinary
- [ ] تحديث قاعدة البيانات
- [ ] عرض الصورة في الهيدر (Desktop)
- [ ] عرض الصورة في القائمة (Mobile)
- [ ] تحديث الصورة بدون إعادة تسجيل دخول
- [ ] عرض الصورة الافتراضية للمستخدمين بدون صورة

---

## 📁 6. هيكل الملفات المقترح

```
/components
  /user
    - UserAvatar.tsx        # مكون عرض الصورة
    - AvatarUpload.tsx      # مكون رفع الصورة
    - AvatarCropper.tsx     # أداة قص الصورة
    
/hooks
  - useUserAvatar.ts        # Hook لإدارة الصورة
  
/utils
  - avatar.ts               # دوال مساعدة للصور
  
/api
  /avatar
    - upload.ts             # API لرفع الصورة
    - update.ts             # API لتحديث الصورة
```

---

## 🎨 7. أمثلة على التصميم

### Desktop Header:
```
┌─────────────────────────────────────────────┐
│ Logo    Home  News  Articles      👤 علي ⚙️ │
│                                    ╰─────╯   │
└─────────────────────────────────────────────┘
```

### Mobile Header:
```
┌─────────────────────────┐
│ ☰ 👤    سبق نيوز    🔍  │
└─────────────────────────┘
```

### Profile Dropdown:
```
┌──────────────────┐
│ 👤 علي الحازمي   │
│ ─────────────────│
│ 📝 الملف الشخصي  │
│ ⚙️ الإعدادات     │
│ 🚪 تسجيل الخروج  │
└──────────────────┘
```

---

## 📝 8. ملاحظات إضافية

1. **الأمان**: التحقق من نوع الملف على الخادم وليس فقط على العميل
2. **الأداء**: استخدام lazy loading للصور في القوائم
3. **التوافق**: دعم الصور الشفافة (PNG) مع خلفية بيضاء احتياطية
4. **إمكانية الوصول**: إضافة `alt` text مناسب لجميع الصور
5. **التخزين المؤقت**: استخدام cache headers مناسبة للصور

---

## ✅ 9. معايير القبول

- يمكن للمستخدم رفع صورة شخصية جديدة
- تظهر الصورة في جميع أماكن عرض المستخدم
- تعمل الميزة على جميع الأجهزة (Desktop/Tablet/Mobile)
- لا توجد مشاكل في الأداء عند تحميل الصور
- تظهر رسائل خطأ واضحة عند فشل العمليات
- يمكن تغيير الصورة بدون إعادة تسجيل دخول
