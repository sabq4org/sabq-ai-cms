import { NextRequest } from "next/server";
import { getCurrentUser, requireAuthFromRequest } from "@/app/lib/auth";

interface AdminCheckResult {
  authorized: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
}

export async function requireAdmin(request: NextRequest): Promise<AdminCheckResult> {
  try {
    // أولاً: الحصول على المستخدم من الطلب مباشرة (تُعيد User وليس كائناً)
    let user: any = null;
    try {
      user = await requireAuthFromRequest(request);
    } catch (_) {
      user = null;
    }

    if (user && user.id) {
      const role: string = user.roles?.[0] || user.role || "user";
      const isAdmin: boolean = user.isAdmin === true || ["admin", "system_admin", "editor", "author"].includes(role);

      if (!isAdmin) {
        return { authorized: false, error: "Insufficient permissions" };
      }

      return {
        authorized: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        },
      };
    }

    // ثانياً: fallback إلى قراءة المستخدم من الكوكيز مباشرة
    const fallbackUser = await getCurrentUser();
    if (!fallbackUser) return { authorized: false, error: "Unauthorized" };

    const fallbackRole: string = (fallbackUser as any).role || "user";
    const fallbackIsAdmin: boolean = (fallbackUser as any).isAdmin === true || ["admin", "system_admin", "editor", "author"].includes(fallbackRole);

    if (!fallbackIsAdmin) return { authorized: false, error: "Insufficient permissions" };

    return {
      authorized: true,
      user: {
        id: fallbackUser.id,
        email: fallbackUser.email,
        name: fallbackUser.name,
        role: fallbackRole,
      },
    };
  } catch (error) {
    console.error("Error in requireAdmin:", error);
    return { authorized: false, error: "Authentication check failed" };
  }
}
