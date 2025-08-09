import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

async function getContentTypeBySlug(slug: string): Promise<"NEWS"|"OPINION"|null> {
  try {
    const art = await prisma.articles.findFirst({
      where: { slug },
      select: { article_type: true },
    });
    if (!art) return null;
    // موائمة: article_type="news" أو "opinion"
    if ((art as any).article_type === "news") return "NEWS";
    return "OPINION";
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname;

  const articleMatch = path.match(/^\/article\/([^\/]+)\/?$/);
  if (articleMatch) {
    const slug = articleMatch[1];
    const type = await getContentTypeBySlug(slug);
    if (type === "NEWS") {
      url.pathname = `/news/${slug}`;
      return NextResponse.redirect(url, 301);
    }
  }

  const newsMatch = path.match(/^\/news\/([^\/]+)\/?$/);
  if (newsMatch) {
    const slug = newsMatch[1];
    const type = await getContentTypeBySlug(slug);
    if (type === "OPINION") {
      url.pathname = `/article/${slug}`;
      return NextResponse.redirect(url, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/article/:path*",
    "/news/:path*",
  ],
};

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// قاموس لتحويل الأسماء العربية إلى slugs صحيحة
const reporterNameMappings: { [key: string]: string } = {
  "علي-الحازمي": "ali-alhazmi-389657",
  "علي الحازمي": "ali-alhazmi-389657",
  علي_الحازمي: "ali-alhazmi-389657",
  // يمكن إضافة المزيد من المراسلين هنا
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // معالجة روابط المراسلين العربية
  if (pathname.startsWith("/reporter/")) {
    const reporterSlug = pathname.replace("/reporter/", "");
    const decodedSlug = decodeURIComponent(reporterSlug);

    // البحث في قاموس التحويل
    const correctSlug = reporterNameMappings[decodedSlug];

    if (correctSlug) {
      const url = req.nextUrl.clone();
      url.pathname = `/reporter/${correctSlug}`;
      return NextResponse.redirect(url, 301); // permanent redirect
    }
  }

  // إعادة توجيه من dashboard إلى admin
  if (pathname.startsWith("/dashboard/")) {
    const url = req.nextUrl.clone();
    // معالجة خاصة لصفحة unified
    if (
      pathname === "/dashboard/news/unified" ||
      pathname.startsWith("/dashboard/news/unified?")
    ) {
      url.pathname = "/admin/news/unified";
    } else {
      // التحويل العام
      url.pathname = pathname
        .replace("/dashboard/", "/admin/")
        .replace("/article/", "/articles/");
    }
    return NextResponse.redirect(url, 301);
  }

  // إضافة cache headers للملفات الثابتة
  const response = NextResponse.next();

  // للصور الثابتة
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // للملفات CSS و JS
  if (pathname.match(/\.(css|js)$/i)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // للـ API endpoints - cache ديناميكي
  if (pathname.startsWith("/api/")) {
    // لا نضع cache للـ auth endpoints أو admin endpoints
    if (!pathname.includes("/auth") && !pathname.includes("/admin/")) {
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=300"
      );
    } else if (pathname.includes("/admin/")) {
      // للـ admin APIs - no cache
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate"
      );
      response.headers.set("Content-Type", "application/json; charset=utf-8");
    }
  }

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Compression hint
  response.headers.set("Accept-Encoding", "gzip, deflate, br");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
