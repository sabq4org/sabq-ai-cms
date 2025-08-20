import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { id, breaking } = await request.json();
    if (!id) return NextResponse.json({ ok: false, error: "MISSING_ID" }, { status: 400 });

    const updated = await prisma.articles.update({ where: { id }, data: { breaking: !!breaking, updated_at: new Date() } });

    // تلميح لمسح الكاش: المتصفحات/CDN ستعيد الجلب سريعًا بسبب s-maxage القصير + SWR
    // يمكن استدعاء /api/admin/purge-cache من الواجهة الإدارية إذا لزم

    return NextResponse.json({ ok: true, data: { id: updated.id, breaking: updated.breaking } }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "UPDATE_FAILED" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { articleId, isBreaking } = await request.json();

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'معرف المقال مطلوب' },
        { status: 400 }
      );
    }

    // تحديث حالة الخبر العاجل
    const updatedArticle = await prisma.articles.update({
      where: { id: articleId },
      data: {
        breaking: isBreaking,
        updated_at: new Date()
      }
    });

    // إذا كان خبر عاجل، قم بإلغاء الأخبار العاجلة الأخرى
    if (isBreaking) {
      await prisma.articles.updateMany({
        where: {
          id: { not: articleId },
          breaking: true
        },
        data: {
          breaking: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      article: updatedArticle
    });
  } catch (error: any) {
    console.error('خطأ في تحديث حالة الخبر العاجل:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في تحديث حالة الخبر',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
