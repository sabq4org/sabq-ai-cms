import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDbConnected, retryWithConnection } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // اختبار الاتصال الأساسي
    await ensureDbConnected();
    await retryWithConnection(async () => {
      await prisma.$queryRaw`SELECT 1`;
    });
    
    // اختبار الجداول الأساسية
    const [usersCount, articlesCount, categoriesCount] = await retryWithConnection(async () => 
      await Promise.all([
        prisma.users.count(),
        prisma.articles.count(), 
        prisma.categories.count()
      ])
    );
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: "healthy",
      database: {
        connected: true,
        responseTime: `${responseTime}ms`,
        tables: {
          users: usersCount,
          articles: articlesCount,
          categories: categoriesCount
        }
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown"
    });
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    console.error("❌ Database health check failed:", error);
    
    return NextResponse.json({
      status: "unhealthy",
      database: {
        connected: false,
        error: error.message,
        responseTime: `${responseTime}ms`,
        code: error.code || "UNKNOWN"
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown"
    }, { status: 503 });
  }
}