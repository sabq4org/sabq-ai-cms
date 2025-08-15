import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    if (ids.length === 0) return NextResponse.json({ success: false, error: "ids مطلوبة" }, { status: 400 });

    // إن وُجد جدول smart_notification_targets يمكن تعليمها كمقروءة
    // هنا fallback: لا شيء نفعل سوى إرجاع نجاح (لتجنب الأعطال إن لم يتوفر الجدول)
    // TODO: عند تفعيل smart_notification_targets فعلياً، نفّذ updateMany هنا

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("/api/notifications/mark-read error:", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}


