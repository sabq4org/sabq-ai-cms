import { getCurrentUser } from "@/app/lib/auth";
import { quickLocalAnalysis } from "@/lib/comment-moderation";
import prisma from "@/lib/prisma";
import { cache as redis } from "@/lib/redis-improved";
import { classifyCommentWithAI } from "@/lib/services/ai-comment-classifier";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Vercel-CDN-Cache-Control": "private, no-store",
  "CDN-Cache-Control": "private, no-store",
};

// دالة مساعدة للتحقق من دور المستخدم
async function getUserRole(userId: string): Promise<string> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role || "user";
}

// جلب التعليقات لمقال معين
export async function GET(request: NextRequest) {
  try {
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: "Invalid request URL" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("article_id");
    const status = searchParams.get("status") || "approved";
    const q = (searchParams.get("q") || "").trim();
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const includeAiAnalysis = searchParams
      .get("include")
      ?.includes("aiAnalysis");

    // التحقق من حالة التعليقات في الإعدادات
    const checkCommentsEnabled = searchParams.get("check_enabled");
    if (checkCommentsEnabled === "true") {
      // هنا يمكن إضافة منطق للتحقق من إعدادات قاعدة البيانات
      // حالياً سنعتمد على localStorage في الواجهة الأمامية
      return NextResponse.json({
        success: true,
        enabled: true, // يمكن تغييرها لاحقاً للقراءة من قاعدة البيانات
      });
    }

    // إذا لم يكن هناك article_id، فهذا يعني أننا في لوحة التحكم
    if (!articleId) {
      // جلب جميع التعليقات للوحة التحكم
      const where: any = {};
      if (q) {
        where.content = { contains: q, mode: "insensitive" } as any;
      }
      const aiScoreLt = searchParams.get("aiScore[lt]");
      if (aiScoreLt) {
        where.aiScore = { lt: parseInt(aiScoreLt) } as any;
      } else if (status !== "all") {
        where.status = status;
      }

      const [
        comments,
        total,
        pendingCount,
        approvedCount,
        rejectedCount,
        spamCount,
      ] = await Promise.all([
        prisma.comments.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip,
          take: limit,
        }),
        prisma.comments.count({
          where: q
            ? { content: { contains: q, mode: "insensitive" } as any }
            : {},
        }),
        prisma.comments.count({ where: { status: "pending" } }),
        prisma.comments.count({ where: { status: "approved" } }),
        prisma.comments.count({ where: { status: "rejected" } }),
        prisma.comments.count({ where: { status: "spam" } }),
      ]);

      // جلب معلومات المقالات والمستخدمين لتجميل البيانات في لوحة التحكم
      const articleIds = Array.from(
        new Set(comments.map((c: any) => c.article_id))
      ).filter(Boolean);
      const userIds = Array.from(
        new Set(comments.map((c: any) => c.user_id))
      ).filter(Boolean) as string[];

      const [articles, users] = await Promise.all([
        articleIds.length
          ? prisma.articles.findMany({
              where: { id: { in: articleIds as string[] } },
              select: { id: true, title: true },
            })
          : Promise.resolve([]),
        userIds.length
          ? prisma.users.findMany({
              where: { id: { in: userIds } },
              select: { id: true, name: true, email: true, avatar: true },
            })
          : Promise.resolve([]),
      ]);

      const articleMap = new Map((articles as any[]).map((a) => [a.id, a]));
      const userMap = new Map((users as any[]).map((u) => [u.id, u]));

      const enriched = (comments as any[]).map((c) => ({
        id: c.id,
        content: c.content,
        status: c.status,
        likes: c.likes,
        metadata: c.metadata,
        created_at: c.created_at,
        updated_at: c.updated_at,
        article: {
          id: c.article_id,
          title: articleMap.get(c.article_id)?.title || "",
        },
        author: c.user_id
          ? {
              id: c.user_id,
              name: userMap.get(c.user_id)?.name || "مستخدم",
              email: userMap.get(c.user_id)?.email || undefined,
              avatar: userMap.get(c.user_id)?.avatar || undefined,
            }
          : {
              name: c.metadata?.guestName || "زائر",
              email: undefined,
              avatar: undefined,
            },
      }));

      return NextResponse.json(
        {
          success: true,
          comments: enriched,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
          stats: {
            total,
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
            spam: spamCount,
          },
        },
        { headers: noStoreHeaders }
      );
    }

    // جلب التعليقات الرئيسية مع الردود
    const where: any = {
      article_id: articleId,
      parent_id: null, // فقط التعليقات الرئيسية
    };

    // إضافة فلتر الحالة للمستخدمين العاديين
    const user = await getCurrentUser();
    let userRole = "user";
    if (user) {
      userRole = await getUserRole(user.id);
    }

    if (!user || !["admin", "moderator"].includes(userRole)) {
      where.status = "approved";
    } else if (status !== "all") {
      where.status = status;
    }

    const [comments, total] = await Promise.all([
      prisma.comments.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.comments.count({ where }),
    ]);

    // تنسيق البيانات
    const formattedComments = comments.map(formatComment);

    return NextResponse.json(
      {
        success: true,
        comments: formattedComments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: noStoreHeaders }
    );
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { success: false, error: "فشل في جلب التعليقات" },
      { status: 500 }
    );
  }
}

// إنشاء تعليق جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, content, parentId } = body;

    if (!articleId || !content) {
      return NextResponse.json(
        { success: false, error: "معرف المقال والمحتوى مطلوبان" },
        { status: 400 }
      );
    }

    // التحقق من المستخدم أولاً
    const user = await getCurrentUser();
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    // التحقق من إعدادات التعليقات للمقال
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        allow_comments: true,
      },
    });

    // قائمة الكلمات المحظورة المحلية (يمكن نقلها لاحقاً إلى قاعدة البيانات)
    const bannedWords = [
      { word: "spam", severity: "high" },
      { word: "كلام فارغ", severity: "medium" },
      { word: "غبي", severity: "low" },
    ];

    // إعدادات الذكاء الاصطناعي الافتراضية
    // قراءة إعدادات الموديريشن من التخزين (Redis)
    const moderationSettings = (await redis.get<{
      mode: "ai_only" | "human" | "hybrid";
      aiThreshold: number;
    }>("settings:comments:moderation")) || {
      mode: "hybrid",
      aiThreshold: 0.75,
    };

    const aiSettings = {
      enabled: !!process.env.OPENAI_API_KEY,
      autoApproveThreshold: Math.round(
        (moderationSettings.aiThreshold ?? 0.75) * 100
      ),
      autoRejectThreshold: 20,
      mode: moderationSettings.mode,
    } as const;

    if (!article) {
      return NextResponse.json(
        { success: false, error: "المقال غير موجود" },
        { status: 404 }
      );
    }

    if (!article.allow_comments) {
      return NextResponse.json(
        { success: false, error: "التعليقات مغلقة على هذا المقال" },
        { status: 403 }
      );
    }

    // تحديد دور المستخدم
    let userRole = "user";
    if (user) {
      userRole = await getUserRole(user.id);
    }

    // تحديد حالة التعليق الافتراضية
    let commentStatus = "pending";
    let aiScore = 100;
    let aiClassification = "safe";
    let aiAnalysis = null;
    let processedContent = content;
    let requiresModeration = false;

    // إذا كان المستخدم مشرف أو كاتب، وافق مباشرة بدون تحليل
    if (user && ["admin", "moderator", "author"].includes(userRole)) {
      commentStatus = "approved";
    } else {
      // تحديد نوع التحليل المطلوب
      const useOpenAI = !!process.env.OPENAI_API_KEY && aiSettings.enabled;

      let analysisResult;
      const startTime = Date.now();

      if (useOpenAI) {
        // استخدام OpenAI للتحليل المتقدم
        try {
          const aiResult = await classifyCommentWithAI(content);
          aiScore = aiResult.score;
          aiClassification = aiResult.classification;

          analysisResult = {
            score: aiResult.score,
            classification: aiResult.classification,
            suggestedAction: aiResult.suggestedAction,
            confidence: aiResult.confidence,
            flaggedWords: [],
            reason: aiResult.reason,
          };

          aiAnalysis = {
            score: aiResult.score,
            classification: aiResult.classification,
            suggested_action: aiResult.suggestedAction,
            ai_provider: aiResult.aiProvider,
            confidence: aiResult.confidence,
            flagged_words: [],
            categories: {},
            processing_time: aiResult.processingTime,
            reason: aiResult.reason,
          };
        } catch (error: any) {
          console.error(
            "OpenAI classification failed, falling back to local:",
            error
          );
          // في حالة فشل OpenAI، نستخدم التحليل المحلي
          analysisResult = quickLocalAnalysis(content);
          aiScore = analysisResult.score;
          aiClassification = analysisResult.classification;
        }
      } else {
        // تحليل التعليق محلياً بسرعة فائقة
        analysisResult = quickLocalAnalysis(content);
        aiScore = analysisResult.score;
        aiClassification = analysisResult.classification;
      }

      const processingTime = Date.now() - startTime;

      // سياسة أكثر تسامحًا: إن كان التقييم منخفضًا جدًا، نسجّله "قيد المراجعة" بدل الرفض الفوري
      // ما لم توجد كلمة محظورة عالية الخطورة تم اكتشافها أعلاه
      if (aiScore < 20) {
        commentStatus = "pending";
        requiresModeration = true;
      }

      // إذا لم يكن aiAnalysis محدداً بعد (في حالة التحليل المحلي)
      if (!aiAnalysis) {
        aiAnalysis = {
          score: analysisResult.score,
          classification: analysisResult.classification,
          suggested_action: analysisResult.suggestedAction,
          ai_provider: "local",
          confidence: analysisResult.confidence,
          flagged_words: analysisResult.flaggedWords,
          categories: analysisResult.categories || {},
          processing_time: processingTime,
          reason: analysisResult.reason,
        };
      }

      // التحقق من الكلمات المحظورة
      for (const bannedWord of bannedWords) {
        const regex = new RegExp(bannedWord.word, "gi");
        if (regex.test(content)) {
          // تطبيق الإجراء بناءً على مستوى الخطورة
          switch (bannedWord.severity) {
            case "high":
              return NextResponse.json(
                { success: false, error: "التعليق يحتوي على كلمات غير مسموحة" },
                { status: 400 }
              );
            case "medium":
              processedContent = processedContent.replace(regex, "***");
              requiresModeration = true;
              break;
            case "low":
              requiresModeration = true;
              break;
          }
        }
      }

      // تطبيق وضع المراجعة المحدد حتى في حال غياب OpenAI
      const score100 = aiScore <= 1 ? Math.round(aiScore * 100) : aiScore;
      const pass = score100 >= (aiSettings.autoApproveThreshold || 80);
      switch (aiSettings.mode) {
        case "human":
          commentStatus = "pending";
          requiresModeration = true;
          break;
        case "ai_only":
          commentStatus = pass ? "approved" : "rejected";
          requiresModeration = !pass;
          break;
        case "hybrid":
        default:
          commentStatus = pass ? "approved" : "pending";
          requiresModeration = !pass;
          break;
      }

      if (commentStatus === "pending" && !requiresModeration) {
        // يمكن تطبيق منطق إضافي للموافقة التلقائية هنا
        // commentStatus = 'approved';
      }
    }

    console.log("Comment status:", commentStatus, "User role:", userRole);

    // إنشاء التعليق
    const comment = await prisma.comments.create({
      data: {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        article_id: articleId,
        user_id: user?.id || null,
        parent_id: parentId,
        content: processedContent,
        status: commentStatus,
        likes: 0,
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {
          guestName: !user ? body.guestName : null,
          requiresModeration,
          ipAddress,
          userAgent,
          aiAnalysis: aiAnalysis || null,
        },
      },
    });

    // جلب بيانات المستخدم إذا كان موجوداً
    let userData = null;
    if (comment.user_id) {
      userData = await prisma.users.findUnique({
        where: { id: comment.user_id },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      });
    }

    // حفظ تحليل الذكاء الاصطناعي إذا كان متاحاً (في الخلفية)
    if (aiAnalysis && !["admin", "moderator", "author"].includes(userRole)) {
      // حفظ التحليل في metadata التعليق بدلاً من جدول منفصل
      console.log("AI Analysis saved in comment metadata:", {
        score: aiAnalysis.score,
        classification: aiAnalysis.classification,
        processingTime: aiAnalysis.processing_time,
      });
    }

    // تحديث عدد التعليقات في المقال (في الخلفية)
    if (commentStatus === "approved") {
      prisma.$executeRaw`
        UPDATE articles
        SET comments_count = comments_count + 1,
            last_comment_at = NOW()
        WHERE id = ${articleId}
      `.catch((error: Error) => {
        console.error("Error updating article comment count:", error);
      });
    }

    // إضافة نقاط الولاء للمستخدم (في الخلفية)
    if (user && commentStatus === "approved") {
      prisma.loyalty_points
        .create({
          data: {
            id: `loyalty-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            user_id: user.id,
            points: 5,
            action: "comment_posted",
            reference_id: comment.id,
            reference_type: "comment",
            created_at: new Date(),
          },
        })
        .catch((error: any) => {
          console.error("Error adding loyalty points:", error);
        });
    }

    // إعادة توليد صفحة المقال لضمان تحديث العدادات إن كانت تعتمد SSG
    try {
      revalidatePath(`/article/${articleId}`);
    } catch {}

    return NextResponse.json(
      {
        success: true,
        comment: {
          ...formatComment(comment),
          user: userData,
        },
        message:
          commentStatus === "pending"
            ? "تم إرسال تعليقك وسيتم نشره بعد المراجعة"
            : "تم نشر تعليقك بنجاح",
        // إضافة معلومات التحليل إذا كان التعليق مشبوهاً
        ...(aiScore < 80 && {
          aiWarning: {
            score: aiScore,
            classification: aiClassification,
            message:
              aiScore < 50
                ? "تحذير: قد يحتوي تعليقك على محتوى مشبوه وسيتم مراجعته قبل النشر"
                : "ملاحظة: سيتم مراجعة تعليقك قبل النشر",
            flaggedWords: aiAnalysis?.flagged_words || [],
          },
        }),
      },
      { headers: noStoreHeaders }
    );
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { success: false, error: "فشل في إنشاء التعليق" },
      { status: 500 }
    );
  }
}

// دالة مساعدة لتنسيق التعليق
function formatComment(comment: any) {
  return {
    id: comment.id,
    content: comment.content,
    status: comment.status,
    aiClassification: comment.aiClassification || null,
    aiAnalyzedAt: comment.aiAnalyzedAt,
    createdAt: comment.created_at,
    user: comment.user || {
      name: comment.metadata?.guestName || "زائر",
      avatar: null,
    },
    replies: comment.replies?.map(formatComment) || [],
    reportsCount: comment._count?.reports || 0,
    metadata: comment.metadata,
    aiAnalysis: []?.[0] || comment.aiAnalysis || null,
  };
}
