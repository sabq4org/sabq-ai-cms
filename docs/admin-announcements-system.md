# 📢 نظام الإعلانات والتنبيهات الإدارية
## Admin Announcements & Alerts System

**الإصدار:** 1.0.0  
**آخر تحديث:** أكتوبر 2025  
**الحالة:** قيد التطوير

---

## 📋 جدول المحتويات

1. [نظرة عامة](#-نظرة-عامة)
2. [الأهداف](#-الأهداف)
3. [نمذجة البيانات](#-نمذجة-البيانات)
4. [واجهات برمجة التطبيقات](#-واجهات-برمجة-التطبيقات)
5. [مكونات واجهة المستخدم](#-مكونات-واجهة-المستخدم)
6. [نظام الصلاحيات](#-نظام-الصلاحيات)
7. [الجدولة والأتمتة](#-الجدولة-والأتمتة)
8. [خطة التنفيذ](#-خطة-التنفيذ)
9. [اختبارات القبول](#-اختبارات-القبول)

---

## 🎯 نظرة عامة

نظام إعلانات وتنبيهات متكامل داخل لوحة تحكم "سبق الذكية" لضمان توصيل الرسائل التشغيلية والعاجلة بفعالية للمستخدمين المناسبين، مع نظام صلاحيات قوي وتتبع كامل.

### المكونات الرئيسية

```
┌─────────────────────────────────────────────┐
│         نظام الإعلانات الإدارية              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐    ┌──────────────┐      │
│  │ شريط البانر   │    │ الخط الزمني   │      │
│  │  (Banner)    │    │  (Timeline)  │      │
│  └──────────────┘    └──────────────┘      │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │      قائمة الإعلانات الكاملة         │  │
│  │    (Full Announcements List)        │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │         نظام الصلاحيات (RBAC)       │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 الأهداف

### الأهداف الوظيفية

1. **توصيل الرسائل العاجلة**: إيصال التنبيهات الحرجة لجميع المستخدمين المستهدفين
2. **التوجيه الدقيق**: إرسال إعلانات محددة لأدوار أو مستخدمين معينين
3. **التنظيم الزمني**: جدولة وإدارة دورة حياة الإعلانات تلقائياً
4. **التتبع والمراجعة**: سجل تدقيق كامل لجميع الإجراءات

### الأهداف التقنية

1. **الأداء**: استجابة سريعة باستخدام التخزين المؤقت الذكي
2. **القابلية للتوسع**: معالجة آلاف الإعلانات بكفاءة
3. **الأمان**: نظام صلاحيات محكم (RBAC)
4. **قابلية الصيانة**: كود نظيف ومُوثّق بشكل جيد

---

## 🗄️ نمذجة البيانات

### مخطط Prisma الكامل

```prisma
// prisma/schema.prisma

/// نموذج الإعلان الإداري
model AdminAnnouncement {
  id            String   @id @default(cuid())
  
  // المحتوى الأساسي
  title         String   @db.VarChar(500)
  bodyMd        String   @db.Text
  
  // التصنيف والأولوية
  type          AnnouncementType     @default(ANNOUNCEMENT)
  priority      AnnouncementPriority @default(NORMAL)
  status        AnnouncementStatus   @default(DRAFT)
  isPinned      Boolean              @default(false)

  // الجدولة الزمنية
  startAt       DateTime?
  endAt         DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // المؤلف
  authorId      String
  author        users    @relation("AnnouncementAuthor", fields: [authorId], references: [id])

  // الجمهور المستهدف
  audienceRoles  String[] @default([])  // ['editor', 'reporter', 'admin']
  audienceUsers  String[] @default([])  // ['user-id-1', 'user-id-2']
  audienceTeams  String[] @default([])  // ['team-id-1', 'team-id-2']

  // المرفقات
  attachments    AnnouncementAttachment[]

  // الفهارس لتحسين الأداء
  @@index([status, startAt, endAt], name: "idx_status_dates")
  @@index([priority, isPinned], name: "idx_priority_pinned")
  @@index([type], name: "idx_type")
  @@index([authorId], name: "idx_author")
  @@map("admin_announcements")
}

/// مرفقات الإعلانات (صور، ملفات، روابط)
model AnnouncementAttachment {
  id             String  @id @default(cuid())
  announcementId String
  url            String  @db.VarChar(1000)
  kind           AttachmentKind @default(IMAGE)
  alt            String?
  meta           Json?   // { size, mimetype, dimensions }

  announcement   AdminAnnouncement @relation(fields: [announcementId], references: [id], onDelete: Cascade)
  
  @@index([announcementId], name: "idx_announcement")
  @@map("announcement_attachments")
}

// ===== Enums =====

/// أنواع الإعلانات
enum AnnouncementType {
  ANNOUNCEMENT    // إعلان عام
  CRITICAL        // تنبيه حرج
  GUIDELINE       // إرشادات وتوجيهات
  ASSET_APPROVED  // موافقة على محتوى
  MAINTENANCE     // صيانة مجدولة
  FEATURE         // ميزة جديدة
  POLICY          // سياسة جديدة
}

/// مستويات الأولوية
enum AnnouncementPriority {
  LOW       // منخفضة
  NORMAL    // عادية
  HIGH      // عالية
  CRITICAL  // حرجة
}

/// حالات الإعلان
enum AnnouncementStatus {
  DRAFT      // مسودة
  SCHEDULED  // مجدول
  ACTIVE     // نشط
  EXPIRED    // منتهي
  ARCHIVED   // مؤرشف
}

/// أنواع المرفقات
enum AttachmentKind {
  IMAGE  // صورة
  VIDEO  // فيديو
  FILE   // ملف
  LINK   // رابط خارجي
}
```

### تحديث نموذج المستخدم

```prisma
model users {
  // ... الحقول الموجودة
  
  // إضافة علاقة الإعلانات
  createdAnnouncements AdminAnnouncement[] @relation("AnnouncementAuthor")
}
```

### تطبيق المخطط

```bash
# توليد Prisma Client
npx prisma generate

# تطبيق التغييرات على قاعدة البيانات
npx prisma db push

# (اختياري) إنشاء migration
npx prisma migrate dev --name add_admin_announcements
```

---

## 🔌 واجهات برمجة التطبيقات

### هيكل API Routes

```
app/api/admin/announcements/
├── route.ts                    # GET (list) & POST (create)
├── [id]/
│   └── route.ts               # GET (single), PATCH (update), DELETE
├── timeline/
│   └── route.ts               # GET (timeline view)
└── stats/
    └── route.ts               # GET (statistics)
```

### 1. قائمة الإعلانات (GET)

**المسار:** `/api/admin/announcements`

**ملف:** `app/api/admin/announcements/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // استخراج المعاملات
    const { searchParams } = new URL(request.url);
    const filters = {
      q: searchParams.get('q') || undefined,
      type: searchParams.get('type') || undefined,
      priority: searchParams.get('priority') || undefined,
      status: searchParams.get('status') || undefined,
      isPinned: searchParams.get('isPinned') === 'true' ? true : undefined,
      authorId: searchParams.get('authorId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // بناء شروط WHERE
    const whereConditions: any = {
      AND: []
    };

    // البحث النصي
    if (filters.q) {
      whereConditions.AND.push({
        OR: [
          { title: { contains: filters.q, mode: 'insensitive' } },
          { bodyMd: { contains: filters.q, mode: 'insensitive' } }
        ]
      });
    }

    // التصفية حسب النوع
    if (filters.type) {
      whereConditions.AND.push({ type: filters.type });
    }

    // التصفية حسب الأولوية
    if (filters.priority) {
      whereConditions.AND.push({ priority: filters.priority });
    }

    // التصفية حسب الحالة
    if (filters.status) {
      whereConditions.AND.push({ status: filters.status });
    }

    // التصفية حسب المثبت
    if (filters.isPinned !== undefined) {
      whereConditions.AND.push({ isPinned: filters.isPinned });
    }

    // التصفية حسب المؤلف
    if (filters.authorId) {
      whereConditions.AND.push({ authorId: filters.authorId });
    }

    // منطق RBAC: إرجاع الإعلانات المناسبة للمستخدم
    whereConditions.AND.push({
      OR: [
        { audienceRoles: { isEmpty: true } }, // إعلانات عامة
        { audienceRoles: { has: user.role } },
        { audienceUsers: { has: user.id } },
        // إذا كان المستخدم admin، يرى كل شيء
        ...(user.role === 'admin' ? [{}] : [])
      ]
    });

    // الحصول على العدد الإجمالي
    const total = await prisma.adminAnnouncement.count({
      where: whereConditions.AND.length > 0 ? whereConditions : undefined
    });

    // الحصول على البيانات مع الترقيم
    const announcements = await prisma.adminAnnouncement.findMany({
      where: whereConditions.AND.length > 0 ? whereConditions : undefined,
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        attachments: true
      }
    });

    return NextResponse.json({
      data: announcements,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit)
      }
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2. إنشاء إعلان (POST)

```typescript
import { z } from 'zod';

// مخطط التحقق
const CreateAnnouncementSchema = z.object({
  title: z.string().min(5, 'العنوان قصير جداً').max(500),
  bodyMd: z.string().min(10, 'المحتوى قصير جداً'),
  type: z.enum(['ANNOUNCEMENT', 'CRITICAL', 'GUIDELINE', 'ASSET_APPROVED', 'MAINTENANCE', 'FEATURE', 'POLICY']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE']).default('DRAFT'),
  isPinned: z.boolean().default(false),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  audienceRoles: z.array(z.string()).default([]),
  audienceUsers: z.array(z.string()).default([]),
  audienceTeams: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    url: z.string().url(),
    kind: z.enum(['IMAGE', 'VIDEO', 'FILE', 'LINK']),
    alt: z.string().optional(),
    meta: z.record(z.any()).optional()
  })).optional()
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    // التحقق من الصلاحيات
    if (!user || !['admin', 'system_admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    // قراءة البيانات
    const body = await request.json();
    
    // التحقق من الصحة
    const validation = CreateAnnouncementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // إنشاء الإعلان
    const announcement = await prisma.adminAnnouncement.create({
      data: {
        title: data.title,
        bodyMd: data.bodyMd,
        type: data.type,
        priority: data.priority,
        status: data.status,
        isPinned: data.isPinned,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        authorId: user.id,
        audienceRoles: data.audienceRoles,
        audienceUsers: data.audienceUsers,
        audienceTeams: data.audienceTeams,
        attachments: data.attachments ? {
          create: data.attachments
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        attachments: true
      }
    });

    // تسجيل في سجل التدقيق
    await prisma.activity_logs?.create({
      data: {
        actorId: user.id,
        action: 'ANNOUNCEMENT_CREATED',
        entityType: 'AdminAnnouncement',
        entityId: announcement.id,
        newValue: JSON.stringify(announcement),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json(announcement, { status: 201 });

  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. الخط الزمني (GET)

**المسار:** `/api/admin/announcements/timeline`

**ملف:** `app/api/admin/announcements/timeline/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // استعلام مُحسّن للخط الزمني
    const timeline = await prisma.adminAnnouncement.findMany({
      where: {
        AND: [
          {
            OR: [
              // المثبتة النشطة أو المجدولة
              {
                isPinned: true,
                status: { in: ['ACTIVE', 'SCHEDULED'] }
              },
              // النشطة خلال آخر 7 أيام
              {
                status: 'ACTIVE',
                startAt: { gte: sevenDaysAgo }
              },
              // المجدولة خلال 24 ساعة القادمة
              {
                status: 'SCHEDULED',
                startAt: { 
                  gte: now,
                  lte: oneDayAhead 
                }
              }
            ]
          },
          // منطق RBAC
          {
            OR: [
              { audienceRoles: { isEmpty: true } },
              { audienceRoles: { has: user.role } },
              { audienceUsers: { has: user.id } },
              ...(user.role === 'admin' ? [{}] : [])
            ]
          }
        ]
      },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { startAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10, // أحدث 10 عناصر
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json(timeline);

  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. تحديث إعلان (PATCH)

**المسار:** `/api/admin/announcements/[id]`

**ملف:** `app/api/admin/announcements/[id]/route.ts`

```typescript
const UpdateAnnouncementSchema = CreateAnnouncementSchema.partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // الحصول على الإعلان الحالي
    const existing = await prisma.adminAnnouncement.findUnique({
      where: { id: params.id },
      include: { attachments: true }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // التحقق من الصلاحيات
    const canEdit = 
      user.role === 'admin' ||
      user.id === existing.authorId ||
      ['system_admin', 'editor'].includes(user.role);

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Forbidden - cannot edit this announcement' },
        { status: 403 }
      );
    }

    // التحقق من البيانات
    const body = await request.json();
    const validation = UpdateAnnouncementSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // تحديث الإعلان
    const updated = await prisma.adminAnnouncement.update({
      where: { id: params.id },
      data: {
        ...data,
        startAt: data.startAt ? new Date(data.startAt) : undefined,
        endAt: data.endAt ? new Date(data.endAt) : undefined,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        },
        attachments: true
      }
    });

    // تسجيل التغيير
    await prisma.activity_logs?.create({
      data: {
        actorId: user.id,
        action: 'ANNOUNCEMENT_UPDATED',
        entityType: 'AdminAnnouncement',
        entityId: params.id,
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updated),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }).catch(err => console.error('Failed to log activity:', err));

    return NextResponse.json(updated);

  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 مكونات واجهة المستخدم

### 1. شريط البانر (Banner)

**ملف:** `components/admin/AdminAnnouncementsBanner.tsx`

```tsx
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AlertCircle, X, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminAnnouncementsBanner() {
  const { data: bannerAnnouncement, isLoading } = useAnnouncements('banner');
  const [isDismissed, setIsDismissed] = useState(false);

  if (isLoading || !bannerAnnouncement || isDismissed) return null;

  const isCritical = bannerAnnouncement.priority === 'CRITICAL';
  const isHigh = bannerAnnouncement.priority === 'HIGH';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4"
      >
        <Alert 
          className={`relative ${
            isCritical 
              ? 'border-red-500 bg-red-50 dark:bg-red-950'
              : isHigh
              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
              : ''
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>

          <AlertTitle className="flex items-center gap-2 pr-8">
            {bannerAnnouncement.title}
            <Badge variant={isCritical ? 'destructive' : isHigh ? 'default' : 'secondary'}>
              {isCritical ? 'عاجل' : isHigh ? 'مهم' : 'إعلان'}
            </Badge>
          </AlertTitle>

          <AlertDescription className="mt-2">
            {bannerAnnouncement.bodyMd.substring(0, 150)}
            {bannerAnnouncement.bodyMd.length > 150 && '...'}
            
            {bannerAnnouncement.bodyMd.length > 150 && (
              <Button 
                variant="link" 
                size="sm"
                className="p-0 h-auto ml-2"
              >
                اقرأ المزيد <ExternalLink className="h-3 w-3 mr-1" />
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
```

### 2. الخط الزمني (Timeline)

**ملف:** `components/admin/AdminAnnouncementsTimeline.tsx`

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Pin, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const priorityConfig = {
  CRITICAL: { color: 'destructive', icon: AlertTriangle },
  HIGH: { color: 'default', icon: AlertTriangle },
  NORMAL: { color: 'secondary', icon: CheckCircle },
  LOW: { color: 'outline', icon: CheckCircle },
};

const typeLabels = {
  ANNOUNCEMENT: 'إعلان',
  CRITICAL: 'حرج',
  GUIDELINE: 'إرشادات',
  ASSET_APPROVED: 'موافقة',
  MAINTENANCE: 'صيانة',
  FEATURE: 'ميزة',
  POLICY: 'سياسة',
};

export function AdminAnnouncementsTimeline() {
  const { data: timeline, isLoading } = useAnnouncements('timeline');

  if (isLoading) {
    return (
      <Card className="sticky top-4 h-fit">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-4 h-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <Card className="sticky top-4 h-fit">
        <CardHeader>
          <CardTitle className="text-lg">الخط الزمني</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد إعلانات حالياً
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4 h-fit">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          الخط الزمني للأهم
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {timeline.map((item) => {
              const PriorityIcon = priorityConfig[item.priority].icon;
              
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 text-sm border-b pb-3 last:border-0"
                >
                  <div className="mt-1 relative">
                    {item.isPinned && (
                      <Pin className="w-4 h-4 text-blue-500 absolute -top-2 -right-2" />
                    )}
                    {item.status === 'ACTIVE' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {item.status === 'SCHEDULED' && (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.startAt 
                        ? formatDistanceToNow(new Date(item.startAt), { 
                            addSuffix: true,
                            locale: ar 
                          })
                        : formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                            locale: ar
                          })
                      }
                    </p>

                    <div className="flex gap-1 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[item.type]}
                      </Badge>
                      <Badge 
                        variant={priorityConfig[item.priority].color}
                        className="text-xs"
                      >
                        {item.priority}
                      </Badge>
                      {item.isPinned && (
                        <Badge variant="secondary" className="text-xs">
                          مثبت
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
```

### 3. قائمة الإعلانات الكاملة

**ملف:** `components/admin/AdminAnnouncementsList.tsx`

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Search, Plus, Filter } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function AdminAnnouncementsList() {
  const [filters, setFilters] = useState({
    q: '',
    type: '',
    priority: '',
    status: '',
  });

  const { data, isLoading } = useAnnouncements('list', filters);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>جميع الإعلانات</CardTitle>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            إعلان جديد
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="pr-10"
            />
          </div>

          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              <SelectItem value="ANNOUNCEMENT">إعلان</SelectItem>
              <SelectItem value="CRITICAL">حرج</SelectItem>
              <SelectItem value="GUIDELINE">إرشادات</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) => setFilters({ ...filters, priority: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="الأولوية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              <SelectItem value="LOW">منخفضة</SelectItem>
              <SelectItem value="NORMAL">عادية</SelectItem>
              <SelectItem value="HIGH">عالية</SelectItem>
              <SelectItem value="CRITICAL">حرجة</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              <SelectItem value="DRAFT">مسودة</SelectItem>
              <SelectItem value="SCHEDULED">مجدول</SelectItem>
              <SelectItem value="ACTIVE">نشط</SelectItem>
              <SelectItem value="EXPIRED">منتهي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div>جار التحميل...</div>
        ) : (
          <div className="space-y-4">
            {data?.data?.map((announcement) => (
              <div
                key={announcement.id}
                className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {announcement.bodyMd.substring(0, 100)}...
                    </p>
                    
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Badge>{announcement.type}</Badge>
                      <Badge variant="outline">{announcement.priority}</Badge>
                      <Badge variant="secondary">{announcement.status}</Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      بواسطة {announcement.author.name} •{' '}
                      {format(new Date(announcement.createdAt), 'PPP', { locale: ar })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      عرض
                    </Button>
                    <Button variant="ghost" size="sm">
                      تعديل
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🪝 الخطاف المخصص (Custom Hook)

**ملف:** `hooks/useAnnouncements.ts`

```typescript
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type FeedType = 'banner' | 'list' | 'timeline';

interface UseAnnouncementsOptions {
  q?: string;
  type?: string;
  priority?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useAnnouncements(
  feed: FeedType,
  filters?: UseAnnouncementsOptions
) {
  let url = `/api/admin/announcements`;
  
  if (feed === 'timeline') {
    url = `/api/admin/announcements/timeline`;
  }

  // بناء query string
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  const fullUrl = queryParams.toString() 
    ? `${url}?${queryParams.toString()}` 
    : url;

  const { data, error, isLoading, mutate } = useSWR(fullUrl, fetcher, {
    refreshInterval: feed === 'banner' ? 60000 : 0, // Banner يحدث كل دقيقة
    revalidateOnFocus: true,
  });

  // منطق خاص للبانر: اختيار أول إعلان CRITICAL نشط
  let processedData = data;
  if (feed === 'banner' && data?.data) {
    processedData = data.data.find(
      (a: any) => 
        a.priority === 'CRITICAL' && 
        a.status === 'ACTIVE'
    );
  }

  return {
    data: processedData,
    error,
    isLoading,
    mutate,
  };
}
```

---

## 🔐 نظام الصلاحيات (RBAC)

### مصفوفة الصلاحيات

| الدور | عرض | إنشاء | تعديل | حذف | إدارة الجمهور |
|-------|-----|-------|-------|------|---------------|
| **admin** | ✅ الكل | ✅ | ✅ | ✅ | ✅ |
| **system_admin** | ✅ الكل | ✅ | ✅ (خاصته) | ✅ (خاصته) | ✅ |
| **editor** | ✅ المستهدفة | ✅ | ✅ (خاصته) | ❌ | ❌ |
| **reporter** | ✅ المستهدفة | ❌ | ❌ | ❌ | ❌ |
| **trainee** | ✅ المستهدفة | ❌ | ❌ | ❌ | ❌ |

### تطبيق RBAC

```typescript
// lib/permissions/announcements.ts

export function canViewAnnouncement(
  user: { id: string; role: string },
  announcement: { audienceRoles: string[]; audienceUsers: string[] }
): boolean {
  // Admins يرون كل شيء
  if (user.role === 'admin') return true;

  // إعلانات عامة (بدون جمهور محدد)
  if (
    announcement.audienceRoles.length === 0 &&
    announcement.audienceUsers.length === 0
  ) {
    return true;
  }

  // موجه للدور
  if (announcement.audienceRoles.includes(user.role)) {
    return true;
  }

  // موجه للمستخدم مباشرة
  if (announcement.audienceUsers.includes(user.id)) {
    return true;
  }

  return false;
}

export function canEditAnnouncement(
  user: { id: string; role: string },
  announcement: { authorId: string }
): boolean {
  // Admins يعدلون كل شيء
  if (user.role === 'admin') return true;

  // System admins and editors يعدلون ما كتبوه
  if (
    ['system_admin', 'editor'].includes(user.role) &&
    announcement.authorId === user.id
  ) {
    return true;
  }

  return false;
}

export function canDeleteAnnouncement(
  user: { id: string; role: string },
  announcement: { authorId: string }
): boolean {
  // فقط admins وصاحب الإعلان (system_admin)
  if (user.role === 'admin') return true;
  
  if (user.role === 'system_admin' && announcement.authorId === user.id) {
    return true;
  }

  return false;
}

export function canCreateAnnouncement(user: { role: string }): boolean {
  return ['admin', 'system_admin', 'editor'].includes(user.role);
}
```

---

## ⏰ الجدولة والأتمتة

### 1. مهمة Cron للجدولة

**المسار:** `/api/internal/cron/announcements`

**ملف:** `app/api/internal/cron/announcements/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// حماية النقطة بسر
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // التحقق من السر
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const now = new Date();
    const results = {
      activated: 0,
      expired: 0,
      archived: 0,
    };

    // 1. تفعيل الإعلانات المجدولة
    const activatedResult = await prisma.adminAnnouncement.updateMany({
      where: {
        status: 'SCHEDULED',
        startAt: { lte: now },
      },
      data: { status: 'ACTIVE' },
    });
    results.activated = activatedResult.count;

    // 2. تعليق الإعلانات المنتهية
    const expiredResult = await prisma.adminAnnouncement.updateMany({
      where: {
        status: 'ACTIVE',
        endAt: { lt: now },
      },
      data: { status: 'EXPIRED' },
    });
    results.expired = expiredResult.count;

    // 3. أرشفة تلقائية بعد 14 يوماً
    const archiveDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const archivedResult = await prisma.adminAnnouncement.updateMany({
      where: {
        status: 'EXPIRED',
        updatedAt: { lt: archiveDate },
      },
      data: { status: 'ARCHIVED' },
    });
    results.archived = archivedResult.count;

    // 4. إعادة بناء الصفحات
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/announcements');

    console.log('Announcement cron job completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Announcement cron job completed',
      results,
      timestamp: now.toISOString(),
    });

  } catch (error) {
    console.error('Error in announcement cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2. إعداد Vercel Cron

**ملف:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/internal/cron/announcements",
      "schedule": "* * * * *"
    }
  ]
}
```

### 3. متغيرات البيئة

```env
# .env.local
CRON_SECRET="your-super-secret-cron-key"
```

---

## 🚀 خطة التنفيذ

### المرحلة 1: البنية التحتية (يوم 1-2)

- [ ] إنشاء نماذج Prisma
- [ ] تطبيق migrations
- [ ] إعداد أنواع TypeScript
- [ ] تهيئة ملفات البيئة

### المرحلة 2: API Backend (يوم 3-5)

- [ ] إنشاء GET /api/admin/announcements
- [ ] إنشاء POST /api/admin/announcements
- [ ] إنشاء PATCH /api/admin/announcements/[id]
- [ ] إنشاء DELETE /api/admin/announcements/[id]
- [ ] إنشاء GET /api/admin/announcements/timeline
- [ ] تطبيق RBAC على جميع النقاط
- [ ] إضافة التدقيق (audit logging)

### المرحلة 3: واجهة المستخدم (يوم 6-8)

- [ ] إنشاء AdminAnnouncementsBanner
- [ ] إنشاء AdminAnnouncementsTimeline
- [ ] إنشاء AdminAnnouncementsList
- [ ] إنشاء نموذج الإنشاء/التعديل
- [ ] إنشاء useAnnouncements hook
- [ ] تطبيق الرسوم المتحركة

### المرحلة 4: الأتمتة (يوم 9)

- [ ] إنشاء cron job
- [ ] إعداد Vercel Cron
- [ ] اختبار الجدولة التلقائية
- [ ] اختبار الأرشفة التلقائية

### المرحلة 5: الاختبار والتوثيق (يوم 10)

- [ ] اختبارات الوحدة
- [ ] اختبارات التكامل
- [ ] اختبارات E2E
- [ ] توثيق API
- [ ] توثيق المستخدم

---

## ✅ اختبارات القبول

### الوظائف الأساسية

- [ ] **شريط البانر:**
  - [ ] يظهر لإعلان "صورة الوزير" للمستخدمين المستهدفين
  - [ ] يعرض الأولوية CRITICAL بلون أحمر
  - [ ] يمكن إخفاؤه مؤقتاً
  - [ ] يظهر فقط للجمهور المحدد (editor, reporter, media)

- [ ] **الخط الزمني:**
  - [ ] يعرض العناصر المثبتة (isPinned) في الأعلى
  - [ ] يعرض الإعلانات النشطة من آخر 7 أيام
  - [ ] يعرض المجدولة خلال 24 ساعة القادمة
  - [ ] يحدد البيانات كل دقيقة

- [ ] **نظام الصلاحيات:**
  - [ ] trainee لا يرى إعلانات موجهة لـ editor
  - [ ] editor يمكنه إنشاء وتعديل إعلاناته فقط
  - [ ] admin يرى ويعدل كل الإعلانات
  - [ ] reporter يرى فقط بدون صلاحيات تعديل

- [ ] **الجدولة التلقائية:**
  - [ ] تفعيل SCHEDULED عند بلوغ startAt
  - [ ] تحويل ACTIVE إلى EXPIRED عند بلوغ endAt
  - [ ] أرشفة EXPIRED بعد 14 يوماً

- [ ] **المرفقات:**
  - [ ] يظهر في معاينة Sheet
  - [ ] يعرض بحجم مناسب
  - [ ] رابط Cloudinary يعمل بشكل صحيح

- [ ] **التدقيق:**
  - [ ] إنشاء إعلان يسجل في activity_logs
  - [ ] تحديث يسجل القيم القديمة والجديدة
  - [ ] حذف يسجل مع معلومات كاملة

---

## 🐛 استكشاف الأخطاء

### المشاكل الشائعة

#### 1. الإعلانات لا تظهر للمستخدم

**الأسباب المحتملة:**
- الجمهور المستهدف لا يشمل دور المستخدم
- حالة الإعلان ليست ACTIVE
- لم يبدأ وقت العرض (startAt)

**الحل:**
```typescript
// تحقق من منطق RBAC
console.log('User role:', user.role);
console.log('Announcement audiences:', announcement.audienceRoles);
console.log('Status:', announcement.status);
```

#### 2. Cron Job لا يعمل

**الأسباب المحتملة:**
- CRON_SECRET غير صحيح
- Vercel Cron غير مفعّل
- مشاكل في الاتصال بقاعدة البيانات

**الحل:**
```bash
# اختبار يدوي
curl -H "Authorization: Bearer YOUR_SECRET" \
     https://your-domain.com/api/internal/cron/announcements
```

#### 3. البانر لا يختفي

**الأسباب المحتملة:**
- state الـ dismiss لا يحفظ
- SWR يعيد التحديث بسرعة

**الحل:**
```typescript
// استخدم localStorage
const [dismissed, setDismissed] = useState(() => {
  return localStorage.getItem(`dismissed-${announcement.id}`) === 'true';
});

const handleDismiss = () => {
  localStorage.setItem(`dismissed-${announcement.id}`, 'true');
  setDismissed(true);
};
```

---

## 📚 مراجع إضافية

- **[Prisma Docs](https://www.prisma.io/docs/)** - وثائق Prisma
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Route Handlers
- **[SWR](https://swr.vercel.app/)** - React Hooks for Data Fetching
- **[shadcn/ui](https://ui.shadcn.com/)** - مكونات UI
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

---

## 👥 المساهمون

- **فريق سبق التقني** - التطوير والصيانة

---

## 📄 الترخيص

هذا المستند جزء من مشروع سبق الذكية. جميع الحقوق محفوظة © 2024-2025 سبق.

---

**آخر تحديث:** أكتوبر 2025  
**الإصدار:** 1.0.0  
**الحالة:** 🚧 قيد التطوير
