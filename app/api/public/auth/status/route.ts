import { corsResponseFromRequest } from "@/lib/cors";
import { NextRequest } from "next/server";

// نقطة نهاية بسيطة للتحقق من حالة المصادقة بدون أي متطلبات
export async function GET(request: NextRequest) {
  try {
    // قراءة أي توكن متاح
    const token = 
      request.cookies.get("sabq_at")?.value ||
      request.cookies.get("auth-token")?.value ||
      request.cookies.get("access_token")?.value ||
      request.cookies.get("token")?.value ||
      request.cookies.get("jwt")?.value ||
      request.cookies.get("user")?.value;

    return corsResponseFromRequest(request, {
      authenticated: !!token,
      hasToken: !!token
    });
  } catch {
    return corsResponseFromRequest(request, {
      authenticated: false,
      hasToken: false
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return corsResponseFromRequest(request, null, 200);
}
