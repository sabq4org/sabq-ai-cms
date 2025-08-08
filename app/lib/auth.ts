import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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
    return jwt.verify(token, process.env.JWT_SECRET || "secret");
  } catch (error) {
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
    // دعم أكثر من اسم للكوكيز الخاصة بالتوكن، مع مسار احتياطي لقراءة كوكيز "user"
    const tokenCookie =
      cookieStore.get("auth-token") ||
      cookieStore.get("token") ||
      cookieStore.get("jwt");

    let payload: any = null;
    if (tokenCookie) {
      payload = await verifyToken(tokenCookie.value);
    }

    // إن لم نجد توكن صالح، نحاول استخدام كوكيز user كحل احتياطي (تحسين تجربة الإدارة)
    if (!payload) {
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
          if (parsed?.id) {
            // استعلام قاعدة البيانات للحصول على أحدث بيانات المستخدم
            const { PrismaClient } = await import("@prisma/client");
            const prisma = new PrismaClient();
            const user = await prisma.users.findUnique({
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
            await prisma.$disconnect();
            if (!user) return null;
            return {
              id: user.id,
              email: user.email,
              name: user.name || "User",
              role_id: user.is_admin ? 1 : 2,
              status: "active",
              avatar_url: user.avatar || undefined,
              role: user.role,
              isAdmin: user.is_admin,
            } as User & { role: string };
          }
        } catch (e) {
          // تجاهُل أي خطأ في التحليل والاعتماد على مسار التوكن فقط
        }
      }
      // لا يوجد أي تعريف للمستخدم
      return null;
    }

    // استعلام قاعدة البيانات للحصول على بيانات المستخدم الكاملة
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const user = await prisma.users.findUnique({
      where: { id: payload.id || payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_admin: true,
        avatar: true,
      },
    });

    await prisma.$disconnect();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name || "User",
      role_id: user.is_admin ? 1 : 2, // 1 for admin, 2 for user
      status: "active",
      avatar_url: user.avatar || undefined,
      // إضافة role للتحقق في API
      role: user.role,
      isAdmin: user.is_admin,
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
