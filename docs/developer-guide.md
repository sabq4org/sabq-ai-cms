# 👨‍💻 دليل المطور - سبق الذكية

## 🚀 مرحباً بك في فريق التطوير!

هذا الدليل الشامل مصمم لمساعدة المطورين الجدد على الانضمام لمشروع "سبق الذكية" والمساهمة بفعالية. سواء كنت مطور مبتدئ أو خبير، ستجد هنا كل ما تحتاجه للبدء.

---

## 📋 محتويات الدليل

1. [إعداد البيئة](#-إعداد-البيئة)
2. [بنية المشروع](#-بنية-المشروع)
3. [معايير الكود](#-معايير-الكود)
4. [سير العمل](#-سير-العمل-git-workflow)
5. [الاختبار](#-الاختبار)
6. [التوثيق](#-التوثيق)
7. [النشر](#-النشر)
8. [المساهمة](#-كيفية-المساهمة)

---

## 🛠️ إعداد البيئة

### متطلبات النظام

```bash
# أنظمة التشغيل المدعومة
✅ macOS 10.15+
✅ Ubuntu 20.04+
✅ Windows 10+ (مع WSL2)

# المتطلبات الأساسية
Node.js >= 18.0.0
npm >= 9.0.0
Git >= 2.30.0
Docker >= 24.0.0
Docker Compose >= 2.0.0
```

### إعداد البيئة المحلية

#### 1️⃣ استنساخ المشروع

```bash
# استنساخ المستودع
git clone https://github.com/alialhazmi/sabq-ai-cms.git
cd sabq-ai-cms

# إعداد upstream للمساهمات
git remote add upstream https://github.com/alialhazmi/sabq-ai-cms.git
git fetch upstream
```

#### 2️⃣ تثبيت التبعيات

```bash
# تثبيت تبعيات Node.js
npm install

# التحقق من التثبيت
npm run --version
node --version
```

#### 3️⃣ إعداد متغيرات البيئة

```bash
# نسخ ملف البيئة التجريبية
cp .env.example .env.local

# تحرير المتغيرات (استخدم محرر النصوص المفضل)
nano .env.local
```

**متغيرات البيئة المطلوبة:**

```env
# إعدادات التطبيق
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# قاعدة البيانات
DATABASE_URL="postgresql://postgres:password@localhost:5432/sabq_ai_cms_dev"
REDIS_URL="redis://localhost:6379"

# المصادقة (اختياري للتطوير)
NEXTAUTH_SECRET="dev-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# الذكاء الاصطناعي (اختياري)
OPENAI_API_KEY="sk-your-openai-key"

# البريد الإلكتروني (اختياري)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

#### 4️⃣ إعداد قواعد البيانات

```bash
# تشغيل قواعد البيانات باستخدام Docker
docker-compose up -d postgres redis clickhouse

# التحقق من تشغيل الخدمات
docker-compose ps

# تطبيق مخططات قاعدة البيانات
npm run prisma:migrate
npm run prisma:generate

# إضافة بيانات تجريبية
npm run db:seed
```

#### 5️⃣ تشغيل المشروع

```bash
# تشغيل وضع التطوير
npm run dev

# فتح التطبيق في المتصفح
open http://localhost:3000
```

### التحقق من صحة الإعداد

```bash
# تشغيل الاختبارات
npm test

# فحص جودة الكود
npm run lint

# فحص النوع TypeScript
npm run type-check

# فحص الأمان
npm audit
```

---

## 🏗️ بنية المشروع

### الهيكل العام

```
sabq-ai-cms/
├── 📁 app/                    # Next.js App Router
│   ├── (auth)/               # مجموعة المصادقة
│   ├── admin/                # لوحة الإدارة
│   ├── api/                  # API routes
│   └── globals.css           # الأنماط العامة
├── 📁 components/            # مكونات React
│   ├── ui/                   # مكونات UI أساسية
│   ├── smart-integration/    # المكونات الذكية
│   └── forms/                # مكونات النماذج
├── 📁 lib/                   # مكتبات ومساعدات
│   ├── auth/                 # نظام المصادقة
│   ├── database/             # اتصال قاعدة البيانات
│   ├── ai/                   # خدمات الذكاء الاصطناعي
│   └── utils/                # وظائف مساعدة
├── 📁 hooks/                 # React Hooks مخصصة
├── 📁 stores/                # Zustand stores
├── 📁 types/                 # تعريفات TypeScript
├── 📁 prisma/                # مخططات قاعدة البيانات
├── 📁 public/                # الملفات الثابتة
├── 📁 docs/                  # التوثيق
├── 📁 __tests__/             # الاختبارات
├── 📁 e2e/                   # اختبارات E2E
├── 📁 k8s/                   # ملفات Kubernetes
├── 📁 scripts/               # سكريبتات مساعدة
└── 📁 config/                # ملفات التكوين
```

### مكونات React

#### **هيكل المكون القياسي**

```typescript
// components/ExampleComponent.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ExampleComponentProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  children,
  variant = 'default',
  className,
}) => {
  return (
    <div className={cn('base-styles', {
      'variant-primary': variant === 'primary',
      'variant-secondary': variant === 'secondary',
    }, className)}>
      <h2 className="title">{title}</h2>
      <div className="content">
        {children}
      </div>
    </div>
  );
};

ExampleComponent.displayName = 'ExampleComponent';
```

#### **مكون مع Hooks**

```typescript
// hooks/useExample.ts
import { useState, useEffect } from 'react';
import { useGlobalStore } from '@/stores/globalStore';

interface UseExampleOptions {
  autoRefresh?: boolean;
  interval?: number;
}

export const useExample = (options: UseExampleOptions = {}) => {
  const { autoRefresh = false, interval = 5000 } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useGlobalStore();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/example');
      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const timer = setInterval(fetchData, interval);
      return () => clearInterval(timer);
    }
  }, [autoRefresh, interval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
```

### API Routes

#### **هيكل API Route**

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/database';
import { z } from 'zod';

// تعريف schema للتحقق
const ExampleSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  content: z.string().min(10, 'المحتوى قصير جداً'),
});

export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // جلب البيانات
    const data = await db.example.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('خطأ في API:', error);
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // تحليل البيانات والتحقق منها
    const body = await request.json();
    const validatedData = ExampleSchema.parse(body);

    // إنشاء سجل جديد
    const newRecord = await db.example.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: newRecord,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'بيانات غير صحيحة',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('خطأ في API:', error);
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}
```

---

## 📝 معايير الكود

### TypeScript Guidelines

#### **تعريف الأنواع**

```typescript
// types/index.ts

// استخدم interfaces للكائنات القابلة للتوسع
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// استخدم types للاتحادات والتقاطعات
type UserRole = 'admin' | 'editor' | 'subscriber';
type UserWithProfile = User & {
  profile: UserProfile;
};

// استخدم enums للثوابت
enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// استخدم generic types للمرونة
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// تعريف Props للمكونات
interface ComponentProps {
  title: string;
  description?: string;
  onSubmit: (data: FormData) => void;
  children?: React.ReactNode;
  className?: string;
}
```

#### **معالجة الأخطاء**

```typescript
// lib/error-handling.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} غير موجود`, 404, 'NOT_FOUND');
  }
}

// استخدام معالج الأخطاء
export const handleApiError = (error: unknown): Response => {
  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code 
      },
      { status: error.statusCode }
    );
  }

  console.error('خطأ غير متوقع:', error);
  return NextResponse.json(
    { error: 'خطأ داخلي في الخادم' },
    { status: 500 }
  );
};
```

### React Best Practices

#### **استخدام Hooks بفعالية**

```typescript
// hooks/useOptimizedQuery.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useCallback } from 'react';

interface UseOptimizedQueryOptions<T> extends UseQueryOptions<T> {
  enabled?: boolean;
  staleTime?: number;
}

export const useOptimizedQuery = <T>(
  key: string[],
  fetchFn: () => Promise<T>,
  options: UseOptimizedQueryOptions<T> = {}
) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    ...restOptions
  } = options;

  const optimizedFetchFn = useCallback(fetchFn, []);

  return useQuery({
    queryKey: key,
    queryFn: optimizedFetchFn,
    enabled,
    staleTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...restOptions,
  });
};
```

#### **State Management مع Zustand**

```typescript
// stores/exampleStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExampleState {
  items: Item[];
  selectedItem: Item | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  selectItem: (item: Item | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItem: null,
      loading: false,
      error: null,

      setItems: (items) => set({ items }),
      
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      })),
      
      deleteItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id),
        selectedItem: state.selectedItem?.id === id ? null : state.selectedItem
      })),
      
      selectItem: (item) => set({ selectedItem: item }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'example-store',
      partialize: (state) => ({ 
        items: state.items,
        selectedItem: state.selectedItem 
      }),
    }
  )
);
```

### CSS/Styling Guidelines

#### **Tailwind CSS Best Practices**

```tsx
// استخدم cn helper للشروط المعقدة
import { cn } from '@/lib/utils';

const Button = ({ variant, size, disabled, className, ...props }) => {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        
        // Variants
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
          'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
        },
        
        // Sizes
        {
          'h-10 px-4 py-2': size === 'default',
          'h-9 rounded-md px-3': size === 'sm',
          'h-11 rounded-md px-8': size === 'lg',
        },
        
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
};
```

#### **CSS Custom Properties للثيمات**

```css
/* globals.css */
:root {
  /* Light theme */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  
  /* RTL support */
  --text-align: right;
  --margin-start: margin-right;
  --margin-end: margin-left;
}

.dark {
  /* Dark theme */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
}

[dir="ltr"] {
  --text-align: left;
  --margin-start: margin-left;
  --margin-end: margin-right;
}
```

---

## 🔄 سير العمل Git Workflow

### Git Branch Strategy

```bash
# البنية المعتمدة
main           # الإنتاج الرسمي
├── clean-main # الفرع المستقر
├── develop    # التطوير الرئيسي
├── feature/*  # الميزات الجديدة
├── bugfix/*   # إصلاح الأخطاء
├── hotfix/*   # إصلاحات طارئة
└── release/*  # إعداد الإصدارات
```

### سير العمل للميزة الجديدة

```bash
# 1. تحديث الفرع الرئيسي
git checkout develop
git pull upstream develop

# 2. إنشاء فرع جديد للميزة
git checkout -b feature/smart-notifications

# 3. التطوير مع commits منتظمة
git add .
git commit -m "feat: إضافة مكون الإشعارات الذكية"

# 4. دفع التغييرات
git push origin feature/smart-notifications

# 5. إنشاء Pull Request
gh pr create --title "feat: نظام الإشعارات الذكية" --body "وصف التغييرات..."

# 6. بعد المراجعة والموافقة
git checkout develop
git pull upstream develop
git branch -d feature/smart-notifications
```

### Commit Message Convention

```bash
# التنسيق
type(scope): description

# الأنواع المقبولة
feat:     # ميزة جديدة
fix:      # إصلاح خطأ
docs:     # تحديث التوثيق
style:    # تغييرات التنسيق
refactor: # إعادة هيكلة الكود
test:     # إضافة/تحديث الاختبارات
chore:    # مهام صيانة

# أمثلة جيدة
feat(auth): إضافة مصادقة ثنائية العامل
fix(api): إصلاح مشكلة في التحقق من البيانات
docs(readme): تحديث تعليمات التثبيت
style(components): تحسين تنسيق الأزرار
refactor(hooks): تحسين hook useAuth
test(api): إضافة اختبارات لـ authentication
chore(deps): تحديث التبعيات
```

### Pull Request Template

```markdown
## 📋 وصف التغييرات

وصف موجز للتغييرات المُقترحة.

## 🎯 نوع التغيير

- [ ] إصلاح خطأ (تغيير لا يكسر الوظائف الموجودة)
- [ ] ميزة جديدة (تغيير يضيف وظيفة جديدة)
- [ ] تغيير كاسر (إصلاح أو ميزة تؤثر على الوظائف الموجودة)
- [ ] تحديث التوثيق

## 🧪 التحقق

- [ ] الكود يتبع إرشادات المشروع
- [ ] لقد راجعت الكود بنفسي
- [ ] تمت إضافة تعليقات مفيدة للأجزاء الصعبة
- [ ] تمت إضافة/تحديث التوثيق
- [ ] التغييرات لا تُولد تحذيرات جديدة
- [ ] تمت إضافة اختبارات للميزات الجديدة
- [ ] الاختبارات الجديدة والموجودة تعمل بنجاح

## 🖼️ لقطات الشاشة (إن أمكن)

إضافة لقطات للتغييرات المرئية.

## 📝 ملاحظات إضافية

أي معلومات إضافية للمراجعين.
```

---

## 🧪 الاختبار

### استراتيجية الاختبار

```
🏗️ هرم الاختبار
├── E2E Tests (10%)      # اختبارات شاملة
├── Integration (20%)    # اختبارات التكامل
└── Unit Tests (70%)     # اختبارات الوحدة
```

### Unit Tests مع Jest

```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('يعرض النص بشكل صحيح', () => {
    render(<Button>انقر هنا</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('انقر هنا');
  });

  it('يستدعي onClick عند النقر', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>انقر هنا</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('يُطبق variant styles بشكل صحيح', () => {
    render(<Button variant="destructive">حذف</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });

  it('يُعطل البوتون عند disabled', () => {
    render(<Button disabled>معطل</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Tests

```typescript
// __tests__/api/auth.integration.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/auth/login/route';
import { db } from '@/lib/database';

describe('/api/auth/login', () => {
  beforeEach(async () => {
    // تنظيف قاعدة البيانات
    await db.user.deleteMany();
  });

  it('يُسجل دخول مستخدم صحيح', async () => {
    // إنشاء مستخدم تجريبي
    const testUser = await db.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword', // يجب أن يكون مُشفر
        name: 'مستخدم تجريبي',
      },
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'correctPassword',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.access_token).toBeDefined();
  });

  it('يرفض كلمة مرور خاطئة', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrongPassword',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
  });
});
```

### E2E Tests مع Playwright

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('المستخدم يمكنه تسجيل الدخول بنجاح', async ({ page }) => {
    // الذهاب لصفحة تسجيل الدخول
    await page.goto('/login');

    // ملء النموذج
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    
    // النقر على زر تسجيل الدخول
    await page.click('[data-testid="login-button"]');

    // التحقق من النجاح
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('يعرض خطأ عند بيانات خاطئة', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('بيانات الدخول غير صحيحة');
  });
});
```

### تشغيل الاختبارات

```bash
# اختبارات الوحدة
npm test
npm run test:watch
npm run test:coverage

# اختبارات التكامل
npm run test:integration

# اختبارات E2E
npm run test:e2e
npm run test:e2e:ui

# جميع الاختبارات
npm run test:all

# اختبارات محددة
npm test -- Button.test.tsx
npm test -- --testNamePattern="Authentication"
```

---

## 📚 التوثيق

### تعليقات الكود

```typescript
/**
 * خطاف مخصص لإدارة حالة النماذج مع التحقق
 * 
 * @template T نوع بيانات النموذج
 * @param initialValues القيم الأولية للنموذج
 * @param validationSchema مخطط التحقق باستخدام Zod
 * @param onSubmit دالة الإرسال
 * @returns كائن يحتوي على حالة النموذج والدوال
 * 
 * @example
 * ```tsx
 * const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
 *   name: '',
 *   email: ''
 * }, UserSchema, async (data) => {
 *   await createUser(data);
 * });
 * ```
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: z.ZodSchema<T>,
  onSubmit: (data: T) => Promise<void>
) => {
  // تنفيذ الخطاف...
};
```

### README للمكونات

```markdown
# Button Component

مكون زر قابل للتخصيص مع دعم للثيمات والأحجام المختلفة.

## الاستخدام

```tsx
import { Button } from '@/components/ui/Button';

function MyComponent() {
  return (
    <Button variant="primary" size="lg" onClick={handleClick}>
      انقر هنا
    </Button>
  );
}
```

## Props

| اسم | نوع | افتراضي | وصف |
|-----|------|---------|-----|
| `variant` | `'default' \| 'primary' \| 'destructive' \| 'outline'` | `'default'` | نمط الزر |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | حجم الزر |
| `disabled` | `boolean` | `false` | حالة التعطيل |
| `children` | `ReactNode` | - | محتوى الزر |

## أمثلة

### الأنماط المختلفة
```tsx
<Button variant="default">افتراضي</Button>
<Button variant="primary">أساسي</Button>
<Button variant="destructive">حذف</Button>
<Button variant="outline">مُحدد</Button>
```
```

### Storybook Stories

```typescript
// components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'destructive', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'زر افتراضي',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'زر أساسي',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'زر كبير',
  },
};
```

---

## 🚀 النشر

### بيئات النشر

| البيئة | الفرع | URL | الاستخدام |
|---------|-------|-----|---------|
| Development | `develop` | `http://localhost:3000` | التطوير المحلي |
| Staging | `clean-main` | `https://staging.sabq-ai.com` | الاختبار النهائي |
| Production | `main` | `https://sabq-ai.com` | الإنتاج الرسمي |

### سكريبتات النشر

```bash
# نشر محلي للاختبار
npm run build
npm run start

# نشر تجريبي
git push origin clean-main

# نشر إنتاج
git checkout main
git merge clean-main
git push origin main

# نشر سريع مع Docker
docker build -t sabq-ai-cms .
docker run -p 3000:3000 sabq-ai-cms
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml (مبسط)
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

---

## 🤝 كيفية المساهمة

### 1️⃣ اختيار مهمة

```bash
# البحث عن Issues مناسبة للمبتدئين
https://github.com/alialhazmi/sabq-ai-cms/labels/good%20first%20issue

# مهام متوسطة الصعوبة
https://github.com/alialhazmi/sabq-ai-cms/labels/help%20wanted

# طلب ميزة جديدة
https://github.com/alialhazmi/sabq-ai-cms/labels/enhancement
```

### 2️⃣ التواصل

```markdown
# قبل البدء في مهمة كبيرة
1. 💬 علق على Issue لتُخبر الفريق أنك ستعمل عليها
2. 📋 اقرأ Issue بعناية وتأكد من فهمك للمطلوب
3. ❓ اسأل إذا كان لديك أي استفسارات
4. 📅 قدر الوقت المطلوب للإنجاز
```

### 3️⃣ عملية التطوير

```bash
# 1. تحديث الكود
git checkout develop
git pull upstream develop

# 2. إنشاء فرع جديد
git checkout -b feature/issue-123-add-dark-mode

# 3. التطوير والاختبار
# ... العمل على الميزة ...
npm test
npm run lint

# 4. Commit مع رسالة واضحة
git add .
git commit -m "feat: إضافة الوضع المظلم للتطبيق

- إضافة toggle في الهيدر
- حفظ التفضيل في localStorage
- دعم الـ system preference
- تحديث جميع المكونات

Closes #123"

# 5. Push والـ PR
git push origin feature/issue-123-add-dark-mode
gh pr create --title "feat: إضافة الوضع المظلم" --body "Closes #123"
```

### 4️⃣ مراجعة الكود

```markdown
# نصائح للحصول على موافقة سريعة

✅ **افعل:**
- اكتب كود واضح ومُنظم
- أضف اختبارات للميزات الجديدة
- اتبع إرشادات المشروع
- اكتب تعليقات مفيدة
- حافظ على PRs صغيرة ومركزة

❌ **لا تفعل:**
- تُرسل PRs كبيرة جداً
- تُغير أكثر من ميزة في PR واحد
- تُهمل الاختبارات
- تُخالف معايير الكود
- تُترك تعليقات غير مفيدة
```

### 5️⃣ بعد الموافقة

```bash
# تنظيف بعد الـ merge
git checkout develop
git pull upstream develop
git branch -d feature/issue-123-add-dark-mode
git push origin --delete feature/issue-123-add-dark-mode

# الاستعداد للمهمة التالية
git checkout -b feature/next-awesome-feature
```

---

## 🔧 أدوات التطوير المفيدة

### VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-playwright.playwright",
    "prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

### Settings.json للمشروع

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Snippets مفيدة

```json
// .vscode/typescript.json
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "",
      "interface ${1:ComponentName}Props {",
      "  ${2:prop}: ${3:string};",
      "}",
      "",
      "export const ${1:ComponentName}: React.FC<${1:ComponentName}Props> = ({ ${2:prop} }) => {",
      "  return (",
      "    <div>",
      "      ${4:// Component content}",
      "    </div>",
      "  );",
      "};",
      "",
      "${1:ComponentName}.displayName = '${1:ComponentName}';"
    ],
    "description": "React functional component with TypeScript"
  }
}
```

---

## 🆘 الحصول على المساعدة

### قنوات الدعم

| النوع | المكان | متى تستخدمه |
|-------|---------|-------------|
| 🐛 **الأخطاء** | [GitHub Issues](https://github.com/alialhazmi/sabq-ai-cms/issues) | مشاكل تقنية |
| ❓ **الأسئلة** | [Discussions](https://github.com/alialhazmi/sabq-ai-cms/discussions) | أسئلة عامة |
| 💬 **الدردشة** | [Discord Server](https://discord.gg/sabq-ai) | محادثة سريعة |
| 📧 **البريد** | dev@sabq-ai.com | أمور خاصة |

### نصائح للحصول على مساعدة فعالة

```markdown
# تنسيق طلب المساعدة الجيد

## 🎯 المشكلة
وصف واضح للمشكلة التي تواجهها.

## 🔍 السلوك المتوقع
ما كنت تتوقع أن يحدث.

## 🐛 السلوك الفعلي
ما حدث بدلاً من ذلك.

## 🔄 خطوات إعادة الإنتاج
1. اذهب إلى '...'
2. انقر على '...'
3. مرر إلى '...'
4. انظر الخطأ

## 💻 بيئة العمل
- OS: macOS 13.0
- Node: v18.17.0
- npm: v9.8.1
- Browser: Chrome 118

## 📋 معلومات إضافية
أي معلومات أخرى قد تساعد.
```

---

## 🎓 مصادر التعلم

### 📚 وثائق رسمية

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

### 🎥 فيديوهات تعليمية

- [Next.js 13 Course](https://www.youtube.com/watch?v=...)
- [TypeScript for React](https://www.youtube.com/watch?v=...)
- [Tailwind CSS Crash Course](https://www.youtube.com/watch?v=...)

### 📖 كتب مُوصى بها

- "Learning React" by Alex Banks & Eve Porcello
- "Effective TypeScript" by Dan Vanderkam
- "Clean Code" by Robert C. Martin (Arabic translation available)

---

## 🎉 مبروك!

إذا وصلت إلى هنا، فأنت الآن جاهز للمساهمة في مشروع "سبق الذكية"! 

### خطواتك التالية:

1. ✅ **إعداد البيئة المحلية**
2. ✅ **قراءة معايير الكود**  
3. ✅ **العثور على Issue مناسب**
4. ✅ **بدء أول مساهمة**
5. ✅ **طلب المراجعة**

### تذكر:

- 🤝 نحن مجتمع ودود، لا تتردد في طلب المساعدة
- 🚀 الأخطاء جزء من التعلم، لا تخف منها
- 💪 كل مساهمة مهمة، مهما كانت صغيرة
- 🌟 استمتع بالرحلة!

---

**مرحباً بك في فريق سبق الذكية! 🎊**

*تم إعداد هذا الدليل بحب من فريق التطوير ❤️*

---

[🔙 العودة للدليل الرئيسي](../README.md) | [📚 المزيد من التوثيق](../docs/)
