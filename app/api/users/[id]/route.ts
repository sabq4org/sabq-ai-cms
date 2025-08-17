import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// GET: معلومات مستخدم
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        is_admin: true,
        is_verified: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "خطأ" }, { status: 500 });
  }
}

// DELETE: حذف/تعطيل مستخدم (حذف منطقي لتفادي قيود العلاقات)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // حذف منطقي: ضبط الحالة إلى inactive ومنع الحذف الفعلي لتجنّب P2003
    const updated = await prisma.users.update({
      where: { id: params.id },
      data: { status: "inactive", updated_at: new Date() },
      select: { id: true, status: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "خطأ" }, { status: 500 });
  }
}


