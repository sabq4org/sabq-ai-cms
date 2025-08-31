import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// قاموس لتحويل الأسماء العربية إلى slugs صحيحة
const reporterNameMappings: { [key: string]: string } = {
  "علي-الحازمي": "ali-alhazmi-389657",
  "علي الحازمي": "ali-alhazmi-389657",
  علي_الحازمي: "ali-alhazmi-389657",
};

// كاش في الذاكرة لتجنب lookups متكررة
const contentTypeCache = new Map<
  string,
  { type: "NEWS" | "OPINION"; timestamp: number }
>();
const CACHE_DURATION = 3600000; // ساعة واحدة

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // قياس زمن التنفيذ
  const startTime = Date.now();

  // معالجة روابط المراسلين العربية
  if (pathname.startsWith("/reporter/")) {
    const reporterSlug = pathname.replace("/reporter/", "");
    const decodedSlug = decodeURIComponent(reporterSlug);
    const correctSlug = reporterNameMappings[decodedSlug];
    if (correctSlug) {
      const url = nextUrl.clone();
      url.pathname = `/reporter/${correctSlug}`;
      console.log(`⏱️ Middleware redirect: ${Date.now() - startTime}ms`);
      return NextResponse.redirect(url, 301);
    }
  }

  // إعادة توجيه من dashboard إلى admin
  if (pathname.startsWith("/dashboard/")) {
    const url = nextUrl.clone();
    if (
      pathname === "/dashboard/news/unified" ||
      pathname.startsWith("/dashboard/news/unified?")
    ) {
      url.pathname = "/admin/news/unified";
    } else {
      url.pathname = pathname
        .replace("/dashboard/", "/admin/")
        .replace("/article/", "/articles/");
    }
    console.log(`⏱️ Middleware redirect: ${Date.now() - startTime}ms`);
    return NextResponse.redirect(url, 301);
  }

  // تحسين: تجنب lookups لمسارات واضحة
  // مسارات muqtarab لا تحتاج معالجة
  if (pathname.startsWith("/muqtarab/")) {
    return NextResponse.next();
  }

  // مسارات API لا تحتاج معالجة content type
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    // Cache headers للـ API
    if (!pathname.includes("/auth") && !pathname.includes("/admin/")) {
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=300"
      );
    } else if (pathname.includes("/admin/")) {
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate"
      );
    }

    return response;
  }

  // دعم الروابط المؤرخة: /news/yyyy/mm/dd/slug → /news/slug
  const datedNewsMatch = pathname.match(
    /^\/news\/(\d{4})\/(\d{2})\/(\d{2})\/([^\/]+)\/?$/
  );
  if (datedNewsMatch) {
    const slug = datedNewsMatch[4];
    const url = nextUrl.clone();
    url.pathname = `/news/${slug}`;
    console.log(`⏱️ Middleware redirect: ${Date.now() - startTime}ms`);
    return NextResponse.redirect(url, 301);
  }

  // تحسين: عدم عمل lookups للمسارات التي لا تحتاج
  const skipPatterns = [
    /^\/(images|fonts|_next|favicon)/,
    /\.(jpg|jpeg|png|gif|webp|svg|ico|css|js)$/i,
  ];

  if (skipPatterns.some((pattern) => pattern.test(pathname))) {
    const response = NextResponse.next();

    // Cache headers للملفات الثابتة
    if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
      response.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
    }

    if (pathname.match(/\.(css|js)$/i)) {
      response.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
    }

    return response;
  }

  // تحسين: تأجيل content type lookups للصفحات نفسها
  // بدلاً من عملها في middleware
  console.log(`⏱️ Middleware execution: ${Date.now() - startTime}ms`);

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
