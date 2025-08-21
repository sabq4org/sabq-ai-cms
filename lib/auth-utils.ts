import { cookies } from "next/headers";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar_url?: string;
  is_admin?: boolean;
}

// حفظ بيانات المستخدم في الكوكيز
export async function setUserCookie(user: User) {
  const cookieStore = await cookies();
  cookieStore.set("user", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// جلب بيانات المستخدم من الكوكيز
export async function getUserFromCookie(): Promise<User | null> {
  const cookieStore = await cookies();

  // تم إزالة نظام التطوير التجريبي لأسباب أمنية

  // ثم تحقق من user cookie العادي
  const userCookie = cookieStore.get("user");

  if (!userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

// حذف كوكيز المستخدم
export async function clearUserCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("user");
}

// إنشاء مستخدم افتراضي للتطوير
export function getDefaultUser(): User {
  return {
    id: crypto.randomUUID(),
    name: "محرر المحتوى",
    email: "editor@sabq.org",
    role: "editor",
  };
}
