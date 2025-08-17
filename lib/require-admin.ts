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
    // المحاولة الأولى: الاعتماد على السياق العام للكوكيز
    let user = await getCurrentUser();

    // مسار احتياطي موثوق: القراءة مباشرة من الطلب (يدعم Authorization header)
    if (!user) {
      try {
        user = await requireAuthFromRequest(request);
      } catch {
        // نتجاهل الخطأ ونرجع Unauthorized أدناه
      }
    }
    if (!user) return { authorized: false, error: "Unauthorized" };
    const role = (user as any).role || "user";
    const isAdmin =
      (user as any).isAdmin === true ||
      ["admin", "system_admin", "super_admin"].includes(role);
    if (!isAdmin) return { authorized: false, error: "Insufficient permissions" };
    return { authorized: true, user: { id: user.id, email: user.email, name: user.name, role } };
  } catch (error) {
    console.error("Error in requireAdmin:", error);
    return { authorized: false, error: "Authentication check failed" };
  }
}
