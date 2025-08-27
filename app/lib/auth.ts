import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export interface User {
  id: string;
  email: string;
  name: string;
  role_id: number;
  status: string;
  avatar_url?: string;
  permissions?: string[];
  sections?: number[];
  role?: string;
  isAdmin?: boolean;
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  permissions: Permission[];
}

// توليد JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
    },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  );
}

// التحقق من JWT token
export async function verifyToken(token: string): Promise<any> {
  try {
    const candidates = [
      process.env.JWT_ACCESS_SECRET,
      process.env.JWT_SECRET,
      // مفاتيح fallback تاريخية لضمان التوافق
      "your-super-secret-jwt-key",
      "secret",
      "your-secret-key-change-this-in-production",
    ].filter(Boolean) as string[];

    for (const key of candidates) {
      try {
        return jwt.verify(token, key);
      } catch (_) {
        // جرّب المفتاح التالي
      }
    }
    return null;
  } catch {
    return null;
  }
}

// تشفير كلمة المرور
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// التحقق من كلمة المرور
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// الحصول على المستخدم الحالي من الجلسة
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    
    // تسجيل جميع الكوكيز المتاحة للتشخيص
    console.log('[getCurrentUser] Available cookies:', 
      Array.from(cookieStore.getAll()).map(c => c.name).join(', '));
    
    // دعم أكثر من اسم للكوكيز الخاصة بالتوكن، مع مسار احتياطي لقراءة كوكيز "user"
    const tokenCookie =
      cookieStore.get("sabq_at") ||
      cookieStore.get("auth-token") ||
      cookieStore.get("access_token") ||
      cookieStore.get("token") ||
      cookieStore.get("jwt");

    console.log('[getCurrentUser] Token cookie found:', tokenCookie ? tokenCookie.name : 'none');

    let payload: any = null;
    if (tokenCookie) {
      payload = await verifyToken(tokenCookie.value);
      console.log('[getCurrentUser] Token verified:', !!payload);
    }

    // إن لم نجد توكن صالح
    if (!payload) {
      const allowUserCookieFallback = (process.env.ALLOW_USER_COOKIE_FALLBACK || '').toLowerCase() === 'true';
      console.log('[getCurrentUser] No valid token, user cookie fallback allowed:', allowUserCookieFallback);
      if (!allowUserCookieFallback) {
        console.log('[getCurrentUser] Returning null - no token and fallback disabled');
        return null;
      }
      const userCookie = cookieStore.get("user");
      if (userCookie?.value) {
        try {
          // قد تكون مخزّنة بصيغة JSON مباشرة أو URL-encoded
          const raw = userCookie.value;
          const decoded = (() => {
            try {
              return decodeURIComponent(raw);
            } catch {
              return raw;
            }
          })();
          const parsed = JSON.parse(decoded);
          // استيراد Prisma بطريقة آمنة للبراوزر
          if (typeof window !== 'undefined') {
            console.warn('Cannot access database from browser environment');
            return null;
          }
          const prisma = (await import("@/lib/prisma")).default;
          let user = null as any;
          if (parsed?.id) {
            user = await prisma.users.findUnique({
              where: { id: parsed.id },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                is_admin: true,
                avatar: true,
              },
            });
          } else if (parsed?.email) {
            user = await prisma.users.findUnique({
              where: { email: parsed.email },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                is_admin: true,
                avatar: true,
              },
            });
          }
          // Note: لا نقوم بعمل $disconnect هنا لتفادي قطع الاتصال بين الطلبات
          if (!user) return null;
          const superAdmins = (
            process.env.SUPER_ADMIN_EMAILS || "admin@sabq.ai"
          )
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          const isSuper =
            !!user.email && superAdmins.includes(user.email.toLowerCase());
          return {
            id: user.id,
            email: user.email,
            name: user.name || "User",
            role_id: user.is_admin ? 1 : 2,
            status: "active",
            avatar_url: user.avatar || undefined,
            role: user.role,
            isAdmin: user.is_admin || isSuper,
          } as User & { role: string };
        } catch (e) {
          // تجاهُل أي خطأ في التحليل والاعتماد على مسار التوكن فقط
        }
      }
      // لا يوجد أي تعريف للمستخدم
      return null;
    }

    // استعلام قاعدة البيانات للحصول على بيانات المستخدم الكاملة
    if (typeof window !== 'undefined') {
      console.warn('Cannot access database from browser environment');
      return null;
    }
    const prisma = (await import("@/lib/prisma")).default;

    const payloadId = (payload?.sub as string) || payload?.id || payload?.userId || payload?.uid || payload?.user?.id || payload?.user_id;
    const payloadEmail = payload?.email || payload?.user?.email;
    let user = null as any;
    if (payloadId) {
      user = await prisma.users.findUnique({
        where: { id: String(payloadId) },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          is_admin: true,
          avatar: true,
        },
      });
    } else if (payloadEmail) {
      user = await prisma.users.findUnique({
        where: { email: String(payloadEmail) },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          is_admin: true,
          avatar: true,
        },
      });
    }

    // Note: لا تقطع الاتصال داخل المسار - اترك إدارة الاتصال للـ singleton

    if (!user) return null;
    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "admin@sabq.ai")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const isSuper =
      !!user.email && superAdmins.includes(user.email.toLowerCase());
    return {
      id: user.id,
      email: user.email,
      name: user.name || "User",
      role_id: user.is_admin ? 1 : 2, // 1 for admin, 2 for user
      status: "active",
      avatar_url: user.avatar || undefined,
      // إضافة role للتحقق في API
      role: user.role,
      isAdmin: user.is_admin || isSuper,
    } as User & { role: string };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// التحقق من صلاحية معينة
export async function hasPermission(
  user: User,
  permission: string
): Promise<boolean> {
  if (!user.permissions) return false;
  return user.permissions.includes(permission);
}

// التحقق من صلاحيات متعددة
export async function hasAnyPermission(
  user: User,
  permissions: string[]
): Promise<boolean> {
  if (!user.permissions) return false;
  return permissions.some((p) => user.permissions!.includes(p));
}

// التحقق من جميع الصلاحيات
export async function hasAllPermissions(
  user: User,
  permissions: string[]
): Promise<boolean> {
  if (!user.permissions) return false;
  return permissions.every((p) => user.permissions!.includes(p));
}

// Middleware للتحقق من المصادقة
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Middleware للتحقق من المصادقة من طلب HTTP
export async function requireAuthFromRequest(request: NextRequest): Promise<User> {
  console.log('🔍 بدء التحقق من المصادقة...');
  
  // للتطوير: التحقق من user-id header أولاً
  const userIdHeader = request.headers.get('user-id');
  if (userIdHeader) {
    console.log('🔧 وضع التطوير: استخدام user-id من header:', userIdHeader);
    // الحصول على المستخدم مباشرة من قاعدة البيانات
    if (typeof window !== 'undefined') {
      throw new Error('Cannot access database from browser environment');
    }
    const prisma = (await import("@/lib/prisma")).default;

    // محاولة البحث بالايميل أولاً، ثم بالـ ID
    let user = await prisma.users.findUnique({
      where: { email: userIdHeader },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_admin: true,
        avatar: true,
      },
    });

    // إذا لم نجد بالايميل، نجرب البحث بالـ ID
    if (!user) {
      user = await prisma.users.findUnique({
        where: { id: userIdHeader },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          is_admin: true,
          avatar: true,
        },
      });
    }

    await prisma.$disconnect();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "admin@sabq.ai")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const isSuper = !!user.email && superAdmins.includes(user.email.toLowerCase());
    
    return {
      id: user.id,
      email: user.email,
      name: user.name || "User",
      role_id: user.is_admin ? 1 : 2,
      status: "active",
      avatar_url: user.avatar || undefined,
      role: user.role,
      isAdmin: user.is_admin || isSuper,
    } as User & { role: string };
  }

  // محاولة جلب التوكن من Request باستخدام قائمة الأولويات
  // NOTE: Always prefer __Host-sabq-access-token for unified system
  // Legacy fallback support for backward compatibility
  let token: string | null = null;
  
  // استخدام قائمة الأولويات للبحث عن التوكن
  const tokenPriority = [
    "__Host-sabq-access-token", // ✅ النظام الموحد الجديد (أولوية عليا)
    "sabq_at",                  // 🔄 النظام القديم الرئيسي
    "auth-token",               // 🔄 Fallback عام
    "access_token",             // 🔄 Fallback عام
    "token",                    // 🔄 Fallback عام
    "jwt"                       // 🔄 Fallback عام
  ];
  
  for (const cookieName of tokenPriority) {
    const cookieValue = request.cookies.get(cookieName)?.value;
    if (cookieValue) {
      token = cookieValue;
      console.log(`🔑 تم العثور على التوكن في: ${cookieName}`);
      break;
    }
  }

  console.log('🔑 التوكن من الكوكيز:', token ? 'موجود' : 'غير موجود');
  console.log('🔍 جميع الكوكيز:', request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })));

  // محاولة جلب من Authorization header
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('🔑 تم العثور على التوكن في Header');
    }
  }

  if (!token) {
    console.log('❌ لا يوجد توكن - رفض الطلب');
    throw new Error("No authentication token found");
  }

  // التحقق من التوكن
  let payload;
  try {
    payload = await verifyToken(token);
    if (!payload) {
      console.log('❌ فشل التحقق من التوكن - payload فارغ');
      throw new Error("Invalid token");
    }
    console.log('✅ تم فك تشفير التوكن بنجاح');
  } catch (jwtError: any) {
    console.error('❌ خطأ في التحقق من التوكن:', jwtError.message);
    throw new Error('Invalid token');
  }

  // الحصول على المستخدم من قاعدة البيانات
  if (typeof window !== 'undefined') {
    throw new Error('Cannot access database from browser environment');
  }
  const prisma = (await import("@/lib/prisma")).default;

  const pid = (payload?.sub as string) || payload?.id || payload?.userId || payload?.uid || payload?.user?.id || payload?.user_id;
  const pemail = payload?.email || payload?.user?.email;
  console.log('🔍 معرف المستخدم من التوكن:', pid, 'البريد:', pemail);
  let user = null as any;
  if (pid) {
    user = await prisma.users.findUnique({
      where: { id: String(pid) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_admin: true,
        avatar: true,
      },
    });
  } else if (pemail) {
    user = await prisma.users.findUnique({
      where: { email: String(pemail) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_admin: true,
        avatar: true,
      },
    });
  }

  // Note: عدم قطع الاتصال هنا - قد يسبب "Engine is not yet connected"

  if (!user) {
    console.log('❌ المستخدم غير موجود في قاعدة البيانات');
    throw new Error("User not found");
  }

  console.log('✅ تم العثور على المستخدم:', user.email);

  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "admin@sabq.ai")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const isSuper = !!user.email && superAdmins.includes(user.email.toLowerCase());
  
  return {
    id: user.id,
    email: user.email,
    name: user.name || "User",
    role_id: user.is_admin ? 1 : 2,
    status: "active",
    avatar_url: user.avatar || undefined,
    role: user.role,
    isAdmin: user.is_admin || isSuper,
  } as User & { role: string };
}

// Middleware للتحقق من صلاحية معينة
export async function requirePermission(permission: string): Promise<User> {
  const user = await requireAuth();
  if (!(await hasPermission(user, permission))) {
    throw new Error("Forbidden");
  }
  return user;
}

// توليد رمز دعوة
export function generateInviteToken(): string {
  return Buffer.from(
    Math.random().toString(36).substring(2) + Date.now()
  ).toString("base64");
}

// الحصول على دور المستخدم الفعلي بناءً على المعرف
export async function getEffectiveUserRoleById(
  userId: string
): Promise<string> {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot access database from browser environment');
    }
    const prisma = (await import("@/lib/prisma")).default;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        role: true,
        is_admin: true,
        email: true,
      },
    });

    // عدم قطع الاتصال - يُدار مركزياً في lib/prisma

    if (!user) return "user";

    // تحقق من Super Admin
    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "admin@sabq.ai")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const isSuper =
      !!user.email && superAdmins.includes(user.email.toLowerCase());

    if (isSuper || user.is_admin) return "admin";
    if (user.role === "moderator") return "moderator";
    if (user.role === "editor") return "editor";

    return user.role || "user";
  } catch (error) {
    console.error("Error getting user role:", error);
    return "user";
  }
}

// تسجيل نشاط المستخدم
export async function logActivity(
  userId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  targetTitle?: string,
  metadata?: any
) {
  // يتم تنفيذ هذا في قاعدة البيانات
  console.log("Activity logged:", {
    userId,
    action,
    targetType,
    targetId,
    targetTitle,
    metadata,
  });
}
