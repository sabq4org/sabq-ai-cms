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
    // أولاً محاولة الحصول على المستخدم من الـ request
    const authResult = await requireAuthFromRequest(request);
    
    if (authResult && !authResult.error && authResult.user) {
      const user = authResult.user;
      const role = user.roles?.[0] || user.role || "user";
      const isAdmin = user.isAdmin === true || ["admin", "system_admin", "editor", "author"].includes(role);
      
      if (!isAdmin) {
        return { authorized: false, error: "Insufficient permissions" };
      }
      
      return { 
        authorized: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role 
        } 
      };
    }
    
    // إذا فشل، جرب getCurrentUser كـ fallback
    const user = await getCurrentUser();
    if (!user) return { authorized: false, error: "Unauthorized" };
    
    const role = (user as any).role || "user";
    const isAdmin = (user as any).isAdmin === true || ["admin", "system_admin", "editor", "author"].includes(role);
    
    if (!isAdmin) return { authorized: false, error: "Insufficient permissions" };
    
    return { authorized: true, user: { id: user.id, email: user.email, name: user.name, role } };
  } catch (error) {
    console.error("Error in requireAdmin:", error);
    return { authorized: false, error: "Authentication check failed" };
  }
}
