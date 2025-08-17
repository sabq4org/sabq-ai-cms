/**
 * API تشخيصية لفحص مشكلة التصنيفات والمؤلفين
 * /api/admin/debug-categories
 */

import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [DEBUG] بدء التشخيص...");

    // جلب آخر 5 أخبار مع جميع العلاقات
    const recentArticles = await prisma.articles.findMany({
      where: {
        article_type: "news", // الأخبار فقط
      },
      take: 5,
      orderBy: {
        created_at: "desc",
      },
      include: {
        categories: {
          select: { id: true, name: true, slug: true },
        },
        author: {
          select: { id: true, name: true, email: true },
        },
        article_author: {
          select: { id: true, full_name: true, email: true },
        },
      },
    });

    // جلب جميع التصنيفات النشطة
    const activeCategories = await prisma.categories.findMany({
      where: { is_active: true },
      select: { id: true, name: true, slug: true, is_active: true },
    });

    // جلب جميع المؤلفين من الجدولين
    const [oldAuthors, newAuthors] = await Promise.all([
      prisma.users.findMany({
        select: { id: true, name: true, email: true, role: true },
      }),
      prisma.article_authors.findMany({
        where: { is_active: true },
        select: { id: true, full_name: true, email: true, is_active: true },
      }),
    ]);

    // تحليل البيانات
    const analysis = {
      articlesCount: recentArticles.length,
      categoriesCount: activeCategories.length,
      oldAuthorsCount: oldAuthors.length,
      newAuthorsCount: newAuthors.length,
      articlesWithoutCategory: recentArticles.filter((a) => !a.category_id)
        .length,
      articlesWithoutAuthor: recentArticles.filter(
        (a) => !a.author_id && !a.article_author_id
      ).length,
      categoryIssues: recentArticles.filter(
        (a) => a.category_id && !a.categories
      ).length,
      authorIssues: recentArticles.filter(
        (a) => a.author_id && !a.author && !a.article_author
      ).length,
    };

    console.log("🔍 [DEBUG] تحليل البيانات:", analysis);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      analysis,
      sampleData: {
        recentArticles: recentArticles.map((a) => ({
          id: a.id,
          title: a.title?.substring(0, 50) + "...",
          category_id: a.category_id,
          category_name: a.categories?.name || "غير مُرتبط",
          author_id: a.author_id,
          article_author_id: a.article_author_id,
          author_name:
            a.author?.name || a.article_author?.full_name || "غير مُرتبط",
          article_type: a.article_type,
          status: a.status,
          created_at: a.created_at,
        })),
        activeCategories: activeCategories.slice(0, 10),
        authorsInfo: {
          oldSystem: oldAuthors.slice(0, 5),
          newSystem: newAuthors.slice(0, 5),
        },
      },
    });
  } catch (error: any) {
    console.error("❌ [DEBUG] خطأ في التشخيص:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "خطأ غير معروف",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
