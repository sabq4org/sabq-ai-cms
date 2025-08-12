import { prisma } from "@/lib/prisma-simple";
import { queueViewIncrement } from '@/lib/viewBatch'
import ArticleAudioPlayer from "@/components/muqtarab/ArticleAudioPlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AngleArticle } from "@/types/muqtarab";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock,
  Cpu,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

// ضمان تشغيل الصفحة على بيئة Node بسبب Prisma
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Removed client-side fetching logic; now server rendered

interface AngleSummary {
  id: string;
  title: string;
  slug: string;
  themeColor: string;
}

// Utility to detect id vs slug (same heuristic as API route)
function isLikelyId(value: string) {
  return /^[a-z0-9]{8,}$/i.test(value) && value.length < 30;
}

async function loadArticleAndRelated(raw: string) {
  // Fallback ذكي عبر API في حال تعذر استخدام Prisma (مثلاً على Edge)
  const fetchFromApi = async () => {
    try {
      const baseUrl =
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://sabq.io";
      const res = await fetch(`${baseUrl}/api/muqtarab/articles/${encodeURIComponent(raw)}`, {
        // تأكد من عدم استخدام الكاش حتى لا تظهر بيانات قديمة
        cache: "no-store",
        // محاولات محدودة لتفادي التعليق
        next: { revalidate: 0 },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.success || !data?.article) return null;
      const a = data.article;
      const angle = a.corner
        ? {
            id: a.corner.id,
            title: a.corner.name,
            slug: a.corner.slug,
            themeColor: a.corner.theme_color || "#3B82F6",
          }
        : null;
      const uiArticle: AngleArticle = {
        id: a.id,
        angleId: angle?.id || "",
        title: a.title,
        slug: a.slug,
        content: a.content,
        excerpt: a.excerpt || undefined,
        authorId: a.author?.id || "",
        author: a.author ? { id: a.author.id, name: a.author.name } : undefined,
        sentiment: undefined,
        tags: undefined,
        coverImage: a.coverImage || undefined,
        isPublished: !!a.isPublished,
        publishDate: a.publishDate || undefined,
        readingTime: a.readingTime || undefined,
        views: a.views || 0,
        createdAt: a.createdAt as any,
        updatedAt: a.createdAt as any,
      };
      return { article: uiArticle, angle, related: [], cross: [] };
    } catch {
      return null;
    }
  };

  const useId = isLikelyId(raw);
  let article: any = null;
  try {
    if (!prisma || !(prisma as any).muqtarabArticle) {
      // Prisma غير متاح في هذا السياق
      return await fetchFromApi();
    }
    article =
      (await prisma.muqtarabArticle.findUnique({
        where: useId ? { id: raw } : { slug: raw },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          cover_image: true,
          status: true,
          publish_at: true,
          read_time: true,
          view_count: true,
          like_count: true,
          comment_count: true,
          created_at: true,
          creator: { select: { id: true, name: true, avatar: true } },
          corner: { select: { id: true, name: true, slug: true, theme_color: true } },
        },
      })) || null;
  } catch {
    // أي فشل في Prisma → fallback API
    return await fetchFromApi();
  }

  if (!article || article.status !== "published") return null;

  // Fire and forget view increment (not awaited)
  try {
    await queueViewIncrement(article.id)
  } catch {}

  const angle: AngleSummary | null = article.corner
    ? {
        id: article.corner.id,
        title: article.corner.name,
        slug: article.corner.slug,
        themeColor: article.corner.theme_color || "#3B82F6",
      }
    : null;

  // Related & cross recommendations
  let related: any[] = [];
  let cross: any[] = [];
  if (angle) {
    const [relatedRaw, crossRaw] = await Promise.all([
      prisma.muqtarabArticle.findMany({
        where: { corner_id: angle.id, status: "published", NOT: { id: article.id } },
        orderBy: { publish_at: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          slug: true,
          cover_image: true,
          read_time: true,
          view_count: true,
          created_at: true,
          creator: { select: { id: true, name: true } },
          tags: true,
        },
      }),
      prisma.muqtarabArticle.findMany({
        where: { status: "published", NOT: { corner_id: angle.id } },
        orderBy: { publish_at: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          slug: true,
          cover_image: true,
          read_time: true,
          view_count: true,
          excerpt: true,
          corner: { select: { id: true, name: true, slug: true, theme_color: true } },
        },
      }),
    ]);
    related = relatedRaw;
    cross = crossRaw;
  }

  const uiArticle: AngleArticle = {
    id: article.id,
    angleId: angle?.id || "",
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt || undefined,
    authorId: article.creator?.id || "",
    author: article.creator
      ? { id: article.creator.id, name: article.creator.name, avatar: article.creator.avatar || undefined }
      : undefined,
    sentiment: undefined,
    tags: undefined,
    coverImage: article.cover_image || undefined,
    isPublished: true,
    publishDate: article.publish_at || undefined,
    readingTime: article.read_time || undefined,
    views: (article.view_count || 0) + 1,
    createdAt: article.created_at as any,
    updatedAt: article.created_at as any,
  };

  return { article: uiArticle, angle, related, cross };
}

function basicSanitize(html: string) {
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/on\w+="[^"]*"/g,'')
}

export default async function MuqtarabArticlePage({ params }: { params: { slug: string } }) {
  const t0 = Date.now()
  const data = await loadArticleAndRelated(params.slug)
  const t1 = Date.now()
  if (!data || !data.article || !data.angle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">المقال غير موجود</h1>
          <p className="text-gray-600 mb-4">لم يتم العثور على المقال المطلوب</p>
          <Link href="/muqtarab"><Button>العودة إلى مُقترب</Button></Link>
        </div>
      </div>
    )
  }
  const { article, angle, related, cross } = data
  const angleColor = angle.themeColor || '#3B82F6'

  return (
    <div className="min-h-screen bg-gray-50">{/* page wrapper */}
      <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8">{/* content wrapper */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/muqtarab" className="hover:text-blue-600 transition-colors">مُقترب</Link>
          <span>/</span>
          <Link href={`/muqtarab/${angle.slug}`} className="hover:text-blue-600 transition-colors">{angle.title}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{article.title}</span>
        </nav>
        {/* meta + title */}
        <div className="mb-4 md:mb-8">
          <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-3 md:mb-4">
            <Link href={`/muqtarab/${angle.slug}`}>
              <Badge variant="secondary" className="hover:bg-blue-100 transition-colors cursor-pointer text-xs md:text-sm" style={{ backgroundColor: angleColor + '20', color: angleColor }}>
                <Cpu className="w-3 h-3 ml-1" />{angle.title}
              </Badge>
            </Link>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">{article.title}</h1>
          {article.excerpt && <p className="text-base md:text-xl text-gray-700 mb-4 md:mb-8 leading-relaxed">{article.excerpt}</p>}
        </div>
        {article.coverImage && (
          <div className="relative w-full h-48 md:h-80 lg:h-96 rounded-lg md:rounded-2xl overflow-hidden mb-4 md:mb-8 shadow-sm md:shadow-lg">
            <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
          </div>
        )}
        {/* author */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-lg md:rounded-xl border mb-4 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            {article.author?.avatar ? (
              <Image src={article.author.avatar} alt={article.author.name} width={40} height={40} className="rounded-full md:w-12 md:h-12" />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: angleColor + '20' }}>
                <User className="w-5 h-5 md:w-6 md:h-6" style={{ color: angleColor }} />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 text-sm md:text-base">{article.author?.name}</p>
              <p className="text-xs md:text-sm text-gray-500">كاتب في {angle.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-500 w-full sm:w-auto">
            <div className="flex items-center gap-1"><Calendar className="w-3 h-3 md:w-4 md:h-4" /><span>{new Date(article.publishDate || article.createdAt).toLocaleDateString('ar-SA')}</span></div>
            <div className="flex items-center gap-1"><Clock className="w-3 h-3 md:w-4 md:h-4" /><span>{article.readingTime || 5} د</span></div>
            <div className="flex items-center gap-1"><Eye className="w-3 h-3 md:w-4 md:h-4" /><span className="hidden md:inline">{(article.views || 0).toLocaleString()} مشاهدة</span></div>
          </div>
        </div>
        {/* content */}
        <div className="mb-6 md:mb-8 prose prose-base md:prose-lg max-w-none leading-relaxed text-gray-800" style={{ whiteSpace: 'pre-line', lineHeight: '1.7', fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: basicSanitize((article.content || '').replace(/\n\n/g, '</p><p class="mb-3 md:mb-4">')) }} data-timing={t1 - t0} />
        {/* interactions */}
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-lg md:rounded-xl border">
          <div className="flex items-center gap-2 md:gap-4">
            <Button size="sm" variant="ghost" className="h-8 md:h-9 px-2 md:px-3"><Heart className="w-4 h-4 ml-1" /><span className="hidden sm:inline">إعجاب</span><span className="text-xs text-gray-500 ml-1">142</span></Button>
            <Button size="sm" variant="ghost" className="h-8 md:h-9 px-2 md:px-3"><MessageCircle className="w-4 h-4 ml-1" /><span className="hidden sm:inline">تعليق</span><span className="text-xs text-gray-500 ml-1">23</span></Button>
            <Button size="sm" variant="ghost" className="h-8 md:h-9 px-2 md:px-3"><Bookmark className="w-4 h-4 ml-1" /><span className="hidden sm:inline">حفظ</span></Button>
          </div>
          <div className="flex items-center gap-2"><Button size="sm" variant="outline" className="h-8 md:h-9 px-2 md:px-3"><Share2 className="w-4 h-4 ml-1" /><span className="hidden sm:inline">مشاركة</span></Button></div>
        </div>
        <Separator className="my-4 md:my-8" />
        {/* back to angle */}
        <div className="text-center py-4 md:py-6">
          <Link href={`/muqtarab/${angle.slug}`}><Button size="lg" className="px-6 md:px-8" style={{ backgroundColor: angleColor, borderColor: angleColor }}><ArrowLeft className="w-4 h-4 ml-2" /><span className="hidden sm:inline">العودة إلى زاوية {angle.title}</span><span className="sm:hidden">العودة للزاوية</span></Button></Link>
        </div>
        {/* related */}
        {related.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6"><h2 className="text-lg md:text-2xl font-bold text-gray-900">مقالات أخرى من نفس الزاوية</h2><div className="px-2 py-1 md:px-3 rounded-full text-xs font-medium text-white" style={{ backgroundColor: angleColor }}>ذكاء اصطناعي</div></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {related.slice(0,3).map((a: any, index:number) => (
                <div key={a.id} className="group rounded-lg md:rounded-xl overflow-hidden border-0 shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-lg transition-all duration-200">
                  <div className="relative h-32 md:h-40 w-full overflow-hidden">
                    {a.cover_image ? <Image src={a.cover_image} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-200" /> : <div className="w-full h-full opacity-20" style={{ background: `linear-gradient(135deg, ${angleColor} 0%, #1f2937 100%)` }} />}
                    <div className="absolute top-2 right-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: angleColor }}>{index + 1}</div></div>
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight text-sm md:text-base">{a.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2 md:mb-3"><span className="truncate">{a.creator?.name}</span><span>{a.read_time || 5} د</span></div>
                    <Link href={`/muqtarab/articles/${a.slug || a.id}`} className="text-sm" style={{ color: angleColor }}>قراءة ←</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* cross angle */}
        {cross.length > 0 && (
          <div className="mt-8 md:mt-12">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6"><h2 className="text-lg md:text-2xl font-bold text-gray-900">مقالات من زوايا أخرى</h2><div className="px-2 py-1 md:px-3 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">استكشف</div></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {cross.slice(0,3).map((a:any) => (
                <div key={a.id} className="group rounded-lg md:rounded-xl overflow-hidden border-0 shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-lg transition-all duration-200">
                  <div className="relative h-32 md:h-40 w-full overflow-hidden">
                    {a.cover_image ? <Image src={a.cover_image} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-200" /> : <div className="w-full h-full opacity-20" style={{ background: `linear-gradient(135deg, ${a.corner?.theme_color || '#3B82F6'} 0%, #1f2937 100%)` }} />}
                    {a.corner && <div className="absolute top-2 right-2"><Badge className="text-xs font-medium text-white shadow-lg" style={{ backgroundColor: a.corner.theme_color }}>{a.corner.name}</Badge></div>}
                  </div>
                  <div className="p-3 md:p-4">
                    <Link href={`/muqtarab/articles/${a.slug || a.id}`}> <h3 className="font-bold text-sm md:text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 mb-2">{a.title}</h3></Link>
                    {a.excerpt && <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3">{a.excerpt}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-500"><div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{a.read_time || 5} دقائق</span></div><div className="flex items-center gap-1"><Eye className="w-3 h-3" /><span className="hidden md:inline">{(a.view_count || 0).toLocaleString()} مشاهدة</span></div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>{/* end content wrapper */}
    </div>
  )
}
