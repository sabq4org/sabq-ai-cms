import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// قاموس لتحويل الأسماء العربية إلى slugs صحيحة
const reporterNameMappings: { [key: string]: string } = {
  "علي-الحازمي": "ali-alhazmi-389657",
  "علي الحازمي": "ali-alhazmi-389657",
  علي_الحازمي: "ali-alhazmi-389657",
};

async function getContentTypeBySlug(
  req: NextRequest,
  slug: string
): Promise<"NEWS" | "OPINION" | null> {
  try {
    const lookupUrl = new URL("/api/lookup/content-type", req.url);
    lookupUrl.searchParams.set("slug", slug);
    const res = await fetch(lookupUrl, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { type?: string | null };
    return data.type === "NEWS" || data.type === "OPINION" ? data.type : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // حماية /admin/** (واجهات) و /api/admin/** (واجهات برمجية) مع إعادة التحقق من الدور من قاعدة البيانات
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  if (isAdminPage || isAdminApi) {
    // السماح بصفحة دخول الإدارة بدون توكن
    if (isAdminPage && pathname === "/admin/login") {
      return NextResponse.next();
    }
    const at =
      req.cookies.get("sabq_at")?.value ||
      req.cookies.get("auth-token")?.value ||
      req.cookies.get("access_token")?.value ||
      req.cookies.get("token")?.value ||
      req.cookies.get("jwt")?.value;
    if (!at) {
      if (isAdminApi) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      const url = nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    try {
      // التحقق من التوكن
      const secretString = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "";
      const secret = new TextEncoder().encode(secretString);
      // التحقق من التوكن بدون فرض issuer لتوافق الإصدارات المختلفة
      await jwtVerify(at, secret);

      // إعادة التحقق من الدور من قاعدة البيانات في كل طلب إداري
      const meUrl = new URL("/api/user/me", req.url);
      const meRes = await fetch(meUrl.toString(), {
        headers: { cookie: req.headers.get("cookie") || "" },
        cache: "no-store",
      });
      if (!meRes.ok) {
        if (isAdminApi) {
          return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          });
        }
        const url = nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
      const me = (await meRes.json()) as { role?: string; isAdmin?: boolean };
      const role = (me.role || "").toString();
      const allowed = role === "system_admin" || role === "super_admin" || role === "admin" || me.isAdmin === true;
      if (!allowed) {
        if (isAdminApi) {
          return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          });
        }
        const url = nextUrl.clone();
        url.pathname = "/admin/access-denied";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
    } catch {
      if (isAdminApi) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      const url = nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // معالجة روابط المراسلين العربية
  if (pathname.startsWith("/reporter/")) {
    const reporterSlug = pathname.replace("/reporter/", "");
    const decodedSlug = decodeURIComponent(reporterSlug);
    const correctSlug = reporterNameMappings[decodedSlug];
    if (correctSlug) {
      const url = nextUrl.clone();
      url.pathname = `/reporter/${correctSlug}`;
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
    return NextResponse.redirect(url, 301);
  }

  // تحويلات 301 حسب نوع المحتوى
  const articleMatch = pathname.match(/^\/article\/([^\/]+)\/?$/);
  if (articleMatch) {
    const slug = articleMatch[1];
    const type = await getContentTypeBySlug(req, slug);
    if (type === "NEWS") {
      const url = nextUrl.clone();
      url.pathname = `/news/${slug}`;
      return NextResponse.redirect(url, 301);
    }
  }

  const newsMatch = pathname.match(/^\/news\/([^\/]+)\/?$/);
  if (newsMatch) {
    const slug = newsMatch[1];
    const type = await getContentTypeBySlug(req, slug);
    if (type === "OPINION") {
      const url = nextUrl.clone();
      url.pathname = `/article/${slug}`;
      return NextResponse.redirect(url, 301);
    }
  }

  // دعم الروابط المؤرخة: /news/yyyy/mm/dd/slug → /news/slug
  const datedNewsMatch = pathname.match(
    /^\/news\/(\d{4})\/(\d{2})\/(\d{2})\/([^\/]+)\/?$/
  );
  if (datedNewsMatch) {
    const slug = datedNewsMatch[4];
    const url = nextUrl.clone();
    url.pathname = `/news/${slug}`;
    return NextResponse.redirect(url, 301);
  }

  // Allow direct access to article detail pages
  if (pathname.startsWith("/muqtarab/articles/")) {
    return NextResponse.next();
  }

  // Redirect old Muqtarab article URLs to new simplified format
  const muqtarabMatch = pathname.match(/^\/muqtarab\/[^\/]+\/([a-zA-Z0-9-]+)$/);
  if (muqtarabMatch && !pathname.startsWith("/muqtarab/articles/")) {
    const articleSlug = muqtarabMatch[1];
    // Redirect to simplified format: /muqtarab/[slug]
    const newUrl = nextUrl.clone();
    newUrl.pathname = `/muqtarab/${articleSlug}`;
    return NextResponse.redirect(newUrl, 301);
  }

  // Handle old Muqtarab article URLs with ID format
  const muqtarabIdMatch = pathname.match(/^\/muqtarab\/([a-zA-Z0-9]+)$/);
  if (muqtarabIdMatch) {
    const articleId = muqtarabIdMatch[1];
    // Check if this looks like an old ID format (like MQcDL9Nz)
    if (articleId.length === 8 && /^[a-zA-Z0-9]+$/.test(articleId)) {
      // This should work with the new slug-based system
      // as the slug and ID are the same for most articles
      return NextResponse.next();
    }
  }

  // إضافة cache & security headers
  const response = NextResponse.next();

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

  if (pathname.startsWith("/api/")) {
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
      response.headers.set("Content-Type", "application/json; charset=utf-8");
    }
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Accept-Encoding", "gzip, deflate, br");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
