import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { clearAuthCookies } from "@/lib/auth-cookies";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // إبطال refresh token المطابق إن وجد
    const rt = request.cookies.get("sabq_rt")?.value || null;
    if (rt) {
      const candidates = await prisma.refreshToken.findMany({ where: { revokedAt: null } });
      for (const c of candidates) {
        if (await bcrypt.compare(rt, c.tokenHash)) {
          await prisma.refreshToken.update({ where: { id: c.id }, data: { revokedAt: new Date() } });
          break;
        }
      }
    }

    const response = NextResponse.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
    clearAuthCookies(response);
    // مسح أي ترويسات تخزين/كاش لضمان انتهاء الجلسة فوراً
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch (error) {
    console.error("خطأ في تسجيل الخروج:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في عملية تسجيل الخروج" },
      { status: 500 }
    );
  }
}
