import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const interests = await prisma.user_interests.findMany({
      where: { user_id: user.id },
      select: { id: true, category_id: true, is_active: true, created_at: true },
      orderBy: { created_at: "desc" }
    });
    // Removed: $disconnect() - causes connection issues
    return NextResponse.json({ interests, updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));

    // توحيد استخراج المعرفات من عدة صيغ محتملة
    let categoryIds: string[] = body?.categoryIds || body?.interests?.categoryIds || body?.interests || [];
    if (categoryIds && typeof categoryIds === 'object' && 'categoryIds' in categoryIds && Array.isArray((categoryIds as any).categoryIds)) {
      categoryIds = (categoryIds as any).categoryIds;
    }

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json({ error: "صيغة categoryIds غير صحيحة" }, { status: 400 });
    }

    // إزالة التكرارات + تنظيف الفراغ
    categoryIds = [...new Set(categoryIds.map((c: any) => String(c).trim()).filter((c: string) => c.length))];

    const forceClear = !!body?.forceClear;

    if (categoryIds.length === 0 && !forceClear) {
      return NextResponse.json({ ok: false, message: "لا توجد اهتمامات جديدة ولم يتم استخدام forceClear، لن يتم تعديل المخزّن" }, { status: 200 });
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      if (forceClear) {
        await tx.user_interests.updateMany({ where: { user_id: user.id }, data: { is_active: false, updated_at: now } });
      }
      if (categoryIds.length) {
        // اجلب الموجود
        const existing = await tx.user_interests.findMany({ where: { user_id: user.id } });
        const existingMap = new Map(existing.map(e => [e.category_id, e]));
        const wanted = new Set(categoryIds);

        const toDeactivate: string[] = existing.filter(e => e.is_active && !wanted.has(e.category_id)).map(e => e.category_id);
        const toActivate: string[] = existing.filter(e => !e.is_active && wanted.has(e.category_id)).map(e => e.category_id);
        const toCreate: string[] = categoryIds.filter((cid: string) => !existingMap.has(cid));

        if (toDeactivate.length) {
          await tx.user_interests.updateMany({ where: { user_id: user.id, category_id: { in: toDeactivate } }, data: { is_active: false, updated_at: now } });
        }
        if (toActivate.length) {
          await tx.user_interests.updateMany({ where: { user_id: user.id, category_id: { in: toActivate } }, data: { is_active: true, updated_at: now } });
        }
        if (toCreate.length) {
          await tx.user_interests.createMany({ data: toCreate.map((cid: string) => ({ user_id: user.id, category_id: cid, is_active: true })), skipDuplicates: true });
        }
      }
    });

    return NextResponse.json({ ok: true, saved: categoryIds.length, forceCleared: forceClear });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "فشل حفظ الاهتمامات" }, { status: 500 });
  }
}