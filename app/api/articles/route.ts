import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { prisma, ensureConnection } from '@/lib/prisma'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis-improved'

import { filterTestContent, rejectTestContent } from '@/lib/data-protection'
import jwt from 'jsonwebtoken'
import { perfMonitor } from '@/lib/performance-monitor'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// دالة مساعدة لإضافة CORS headers
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// دالة لإنشاء response مع CORS headers
function corsResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // إضافة cache headers لتحسين الأداء
  if (status === 200) {
    // cache لمدة 5 دقائق للمقالات
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    // إضافة ETag للتحقق من التغييرات
    const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64').substring(0, 27)}"`;
    response.headers.set('ETag', etag);
  }
  
  return addCorsHeaders(response);
}

// دالة لمعالجة طلبات OPTIONS
function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// دالة لاستخراج النص من JSON الخاص بـ Tiptap
function extractTextFromTiptap(content: any): string {
  if (!content || !content.content) return '';
  
  let text = '';
  
  function extractFromNode(node: any): string {
    let nodeText = '';
    
    if (node.text) {
      nodeText += node.text;
    }
    
    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        nodeText += extractFromNode(child);
      }
    }
    
    return nodeText;
  }
  
  for (const node of content.content) {
    text += extractFromNode(node) + ' ';
  }
  
  return text.trim();
}

// دالة لتحويل JSON من Tiptap إلى HTML
function convertTiptapToHTML(content: any): string {
  if (!content || !content.content) return '';
  
  function nodeToHTML(node: any): string {
    // إذا كان النود يحتوي على نص
    if (node.text) {
      let text = node.text;
      
      // تطبيق التنسيقات
      if (node.marks) {
        for (const mark of node.marks) {
          switch (mark.type) {
            case 'bold':
              text = `<strong>${text}</strong>`;
              break;
            case 'italic':
              text = `<em>${text}</em>`;
              break;
            case 'underline':
              text = `<u>${text}</u>`;
              break;
            case 'link':
              text = `<a href="${mark.attrs?.href || '#'}" target="_blank" rel="noopener noreferrer">${text}</a>`;
              break;
          }
        }
      }
      
      return text;
    }
    
    // تحويل النودات بناءً على النوع
    let html = '';
    let children = '';
    
    if (node.content && Array.isArray(node.content)) {
      children = node.content.map(nodeToHTML).join('');
    }
    
    switch (node.type) {
      case 'doc':
        return children;
      case 'paragraph':
        return `<p>${children}</p>`;
      case 'heading':
        const level = node.attrs?.level || 1;
        return `<h${level}>${children}</h${level}>`;
      case 'bulletList':
        return `<ul>${children}</ul>`;
      case 'orderedList':
        return `<ol>${children}</ol>`;
      case 'listItem':
        return `<li>${children}</li>`;
      case 'blockquote':
        return `<blockquote>${children}</blockquote>`;
      case 'codeBlock':
        return `<pre><code>${children}</code></pre>`;
      case 'hardBreak':
        return '<br>';
      case 'image':
        const src = node.attrs?.src || '';
        const alt = node.attrs?.alt || '';
        return `<img src="${src}" alt="${alt}" />`;
      default:
        return children;
    }
  }
  
  return nodeToHTML(content);
}

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return handleOptions();
}

export const runtime = 'nodejs'

// جلب المقالات
export async function GET(request: NextRequest) {
  const endTimer = perfMonitor.startTimer('api_articles_get');
  
  try {
    // التحقق من اتصال قاعدة البيانات
    await ensureConnection();
    
    console.log('🔍 بدء معالجة طلب المقالات...')
    const { searchParams } = new URL(request.url)
    
    // إنشاء مفتاح التخزين المؤقت بناءً على المعاملات
    const cacheKey = CACHE_KEYS.articles(Object.fromEntries(searchParams))
    
    // محاولة جلب البيانات من Redis
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      console.log('✅ تم جلب المقالات من Redis cache')
      return corsResponse(cachedData, 200)
    }
    
    // بناء شروط البحث
    const where: any = {}
    
    // فلترة حسب الحالة مع استبعاد المقالات المحذوفة دائماً
    const status = searchParams.get('status')
    
    // إذا كان المطلوب هو المقالات المحذوفة فقط (للوحة التحكم)
    if (status === 'deleted') {
      where.status = 'deleted'
    } else {
      // لجميع الحالات الأخرى، نستبعد المقالات المحذوفة دائماً
      if (status) {
        where.status = status
      }
      // إضافة شرط لاستبعاد المقالات المحذوفة في جميع الحالات
      where.NOT = { status: 'deleted' }
    }

    // فلترة حسب التصنيف
    const categoryId = searchParams.get('category_id')
    if (categoryId) {
      where.category_id = categoryId
    }

    // فلترة حسب المؤلف
    const authorId = searchParams.get('author_id')
    if (authorId) {
      where.author_id = authorId
    }

    // البحث في العنوان والمحتوى
    const search = searchParams.get('search')
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } }
      ]
    }

    // فلترة المقالات المميزة
    const featured = searchParams.get('featured')
    if (featured === 'true') {
      where.featured = true
    }

    // فلترة الأخبار العاجلة
    const breaking = searchParams.get('breaking')
    if (breaking === 'true') {
      where.breaking = true
    }

    /*
    // فلترة حسب نوع المقال (OPINION أو غيره) - معطل مؤقتاً للتشخيص
    const type = searchParams.get('type')
    if (type === 'OPINION') {
      // جلب معرف تصنيف الرأي من قاعدة البيانات
      const opinionCategory = await prisma.categories.findFirst({
        where: { 
          OR: [
            { slug: 'opinion' },
            { name: 'رأي' }
          ]
        },
        select: { id: true }
      })
      if (opinionCategory) {
        where.category_id = opinionCategory.id
      }
    } else if (type && type !== 'OPINION') {
      // لأنواع أخرى من المقالات، استبعاد مقالات الرأي
      const opinionCategory = await prisma.categories.findFirst({
        where: { 
          OR: [
            { slug: 'opinion' },
            { name: 'رأي' }
          ]
        },
        select: { id: true }
      })
      if (opinionCategory) {
        where.category_id = { not: opinionCategory.id }
      }
    }
    */

    // الترتيب
    const sortBy = searchParams.get('sortBy') || 'published_at';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
    
    let orderBy: any = {};
    if (sortBy === 'published_at') {
      // استخدام created_at إذا كان published_at غير موجود
      orderBy = [
        { published_at: order },
        { created_at: order }
      ];
    } else if (sortBy === 'views_count') {
      orderBy.views_count = order;
    } else if (sortBy === 'engagement_score') {
      orderBy.engagement_score = order;
    } else if (sortBy === 'created_at') {
      orderBy.created_at = order;
    } else {
      orderBy = [
        { published_at: order },
        { created_at: order }
      ];
    }

    // التقسيم (Pagination)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')
    const skip = (page - 1) * limit

    // جلب المقالات من قاعدة البيانات البعيدة مع العلاقات (Eager Loading)
    console.time('🔍 جلب المقالات من قاعدة البيانات')
    let articles = []
    try {
      // استخدام select محدد لتقليل حجم البيانات المنقولة
      articles = await prisma.articles.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          published_at: true,
          created_at: true,
          views: true,
          reading_time: true,
          status: true,
          featured: true,
          breaking: true,
          author_id: true,
          category_id: true,
          // محتوى المقال فقط عند الحاجة
          content: searchParams.get('includeContent') === 'true',
          // البيانات الوصفية
          seo_title: true,
          seo_description: true,
          // العلاقات
          categories: {
            select: {
              id: true,
              name: true,
              name_en: true,
              slug: true,
              color: true,
              icon: true
            }
          }
        }
      })
    } catch (dbError) {
      console.error('خطأ في قاعدة البيانات:', dbError)
      throw dbError
    }
    console.timeEnd('🔍 جلب المقالات من قاعدة البيانات')

    // جلب العدد الإجمالي والمؤلفين بشكل متوازي
    console.time('📊 جلب البيانات الإضافية')
    const [total, authors] = await Promise.all([
      // جلب العدد الإجمالي
      prisma.articles.count({ where }),
      
      // جلب المؤلفين فقط إذا كانت هناك مقالات
      articles.length > 0 
        ? prisma.users.findMany({
            where: { 
              id: { 
                in: [...new Set(articles.map((a: any) => a.author_id).filter(Boolean))] 
              } 
            },
            select: {
              id: true,
              name: true,
              email: true
            }
          })
        : Promise.resolve([])
    ])
    console.timeEnd('📊 جلب البيانات الإضافية')

    // تحويل المؤلفين إلى Map للوصول السريع
    const authorsMap = authors.reduce((acc: any, author: any) => {
      acc[author.id] = author
      return acc
    }, {})

    // تحويل البيانات للتوافق مع الواجهة
    console.time('🔄 تحويل وتنسيق البيانات')
    const formattedArticles = articles.map((article: any) => {
      // محاولة الحصول على اسم المؤلف من مصادر مختلفة
      const author = authorsMap[article.author_id] || null
      const authorName = author?.name || 
                        article.metadata?.author_name || 
                        (author?.email ? author.email.split('@')[0] : null) ||
                        'غير محدد'
      
      // التصنيف يأتي مباشرة من include - الحقل اسمه categories وليس category
      const category = article.categories || null
      
      return {
        ...article,
        author: { 
          id: article.author_id, 
          name: authorName,
          email: author?.email
        },
        author_name: authorName, // إضافة author_name مباشرة للتوافق
        category: category || { 
          id: article.category_id, 
          name: 'غير مصنف',
          name_ar: 'غير مصنف',
          slug: 'uncategorized',
          color: '#6B7280'
        },
        category_name: category?.name || 'غير مصنف',
        category_color: category?.color || '#6B7280',
        featured_image: article.featured_image,
        reading_time: article.reading_time,
        created_at: article.created_at,
        updated_at: article.updated_at,
        published_at: article.published_at,
        views_count: article.views || 0 // إضافة views_count من حقل views في قاعدة البيانات
      }
    })
    console.timeEnd('🔄 تحويل وتنسيق البيانات')

    // تصفية المحتوى التجريبي إذا كان مطلوباً
    // const filteredArticles = filterTestContent(formattedArticles);
    const filteredArticles = formattedArticles; // تعطيل التصفية مؤقتاً
    
    // إحصائيات التقسيم
    const stats = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: skip + limit < total,
      hasPrev: page > 1
    }

    console.log(`✅ تم جلب ${formattedArticles.length} مقال من أصل ${total}`)
    
    const responseData = {
      success: true,
      articles: formattedArticles,
      data: formattedArticles,
      pagination: stats,
      filters: {
        status: searchParams.get('status'),
        category_id: searchParams.get('category_id'),
        search: searchParams.get('search'),
        featured: searchParams.get('featured'),
        breaking: searchParams.get('breaking'),
        type: searchParams.get('type')
      }
    }
    
    const duration = endTimer();
    console.log(`⏱️ إجمالي وقت معالجة الطلب: ${duration.toFixed(2)}ms`);
    
    // حفظ البيانات في Redis للطلبات المستقبلية
    // استخدام مدة كاش ذكية: دقيقة واحدة للأخبار العادية
    // للأخبار العاجلة: استخدم 30 ثانية فقط
    // TODO: تطبيق نظام الكاش الذكي من lib/cache-config.ts
    await cache.set(cacheKey, responseData, CACHE_TTL.ARTICLES)
    
    return corsResponse(responseData, 200)
  } catch (error) {
    endTimer();
    console.error('خطأ في جلب المقالات:', error)
    return corsResponse({
      success: false,
      error: 'فشل في استرجاع المقالات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500)
  }
}

// إنشاء مقال جديد
export async function POST(request: NextRequest) {
  try {
    // التحقق من اتصال قاعدة البيانات
    await ensureConnection();
    
    console.log('📝 بدء معالجة طلب إنشاء مقال جديد...');
    
    const body = await request.json()
    console.log('📋 بيانات المقال المستلمة:', {
      title: body.title?.substring(0, 50),
      hasContent: !!body.content,
      status: body.status,
      author_id: body.author_id,
      category_id: body.category_id
    });
    
    const {
      title,
      content,
      excerpt,
      category_id,
      author_id,
      author_name,
      status = 'draft',
      featured_image,
      keywords,
      seo_keywords,
      metadata = {}
    } = body

    // التحقق من البيانات المطلوبة
    if (!title || !content) {
      console.log('❌ بيانات ناقصة: العنوان أو المحتوى مفقود');
      return NextResponse.json(
        { success: false, error: 'العنوان والمحتوى مطلوبان' },
        { status: 400 }
      )
    }
    
    // تحويل البيانات إلى string وتنظيفها
    const cleanTitle = String(title).trim();
    
    // معالجة المحتوى: تحويل JSON من Tiptap إلى HTML
    let cleanContent = '';
    if (typeof content === 'string') {
      cleanContent = content.trim();
    } else if (typeof content === 'object' && content) {
      // تحويل Tiptap JSON إلى HTML
      cleanContent = convertTiptapToHTML(content);
    } else {
      cleanContent = String(content || '').trim();
    }
    
    // استخراج النص من المحتوى للـ excerpt
    let textContent = '';
    if (typeof content === 'object' && content?.content) {
      // استخراج النص من Tiptap JSON
      textContent = extractTextFromTiptap(content);
    } else {
      textContent = cleanContent.replace(/<[^>]*>/g, ''); // إزالة HTML tags
    }
    
    const cleanExcerpt = excerpt ? String(excerpt).trim() : textContent.substring(0, 200) + '...';
    
    // تحويل keywords إلى string إذا كان array
    const cleanKeywords = keywords ? 
                         (Array.isArray(keywords) ? keywords.join(', ') : String(keywords)) :
                         (seo_keywords ? 
                           (Array.isArray(seo_keywords) ? seo_keywords.join(', ') : String(seo_keywords)) : 
                           null);
    
    console.log('🧹 البيانات بعد التنظيف:', {
      titleLength: cleanTitle.length,
      contentLength: cleanContent.length,
      contentType: typeof cleanContent,
      contentPreview: cleanContent.substring(0, 100),
      excerptLength: cleanExcerpt.length,
      textContentLength: textContent.length,
      keywordsType: typeof cleanKeywords,
      keywords: cleanKeywords,
      originalKeywords: keywords,
      originalSeoKeywords: seo_keywords,
      featured_image: featured_image
    });

    // التحقق من البيانات بعد التنظيف
    if (!cleanTitle || !cleanContent) {
      console.log('❌ بيانات فارغة بعد التنظيف');
      return NextResponse.json(
        { success: false, error: 'العنوان والمحتوى لا يمكن أن يكونا فارغين' },
        { status: 400 }
      )
    }
    
    // كشف المقالات التجريبية وتسجيلها
    const testKeywords = ['اختبار', 'تجريبي', 'test', 'TEST', 'مقال اختبار'];
    const isTestArticle = testKeywords.some(keyword => 
      cleanTitle.includes(keyword) || cleanContent.includes(keyword) || cleanContent.includes('محتوى تجريبي')
    );
    
    if (isTestArticle) {
      console.log('⚠️ تحذير: يتم إنشاء مقال تجريبي:', {
        title: cleanTitle.substring(0, 50),
        isTest: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // البحث عن مستخدم افتراضي أو استخدام المصادقة
    let finalAuthorId = null;
    let finalAuthorName = 'مؤلف افتراضي';
    
    // التحقق من المصادقة أولاً
    try {
      const authCheck = await checkUserPermissions(request);
      if (authCheck.valid && authCheck.user) {
        finalAuthorId = authCheck.user.id;
        finalAuthorName = authCheck.user.name || authCheck.user.email || 'مستخدم';
        console.log('✅ تم التحقق من المصادقة بنجاح:', { finalAuthorId, finalAuthorName });
      }
    } catch (authError) {
      console.log('⚠️ تعذر التحقق من المصادقة:', authError);
    }
    
    // إذا لم نحصل على مستخدم من المصادقة، نبحث عن مستخدم افتراضي
    if (!finalAuthorId) {
      try {
        // اختبار الاتصال مع Prisma أولاً
        console.log('🔗 اختبار اتصال Prisma...');
        await prisma.$connect();
        console.log('✅ تم الاتصال بـ Prisma بنجاح');
        
        // البحث عن admin user كمؤلف افتراضي
        console.log('🔍 البحث عن مستخدم افتراضي...');
        const defaultUser = await prisma.users.findFirst({
          where: {
            OR: [
              { email: 'admin@sabq.ai' },
              { role: 'admin' },
              { is_admin: true }
            ]
          }
        });
        
        if (defaultUser) {
          finalAuthorId = defaultUser.id;
          finalAuthorName = defaultUser.name || defaultUser.email || 'المدير';
          console.log('📝 تم استخدام المستخدم الافتراضي:', { finalAuthorId, finalAuthorName });
        } else {
          console.log('❌ لم يتم العثور على مستخدم افتراضي');
          return NextResponse.json(
            { success: false, error: 'لم يتم العثور على مؤلف صالح للمقال' },
            { status: 400 }
          );
        }
      } catch (userError) {
        console.error('❌ خطأ في البحث عن المستخدم الافتراضي:', userError);
        console.error('📊 تفاصيل الخطأ:', JSON.stringify(userError, null, 2));
        
        // استخدام مؤلف افتراضي ثابت كحل أخير
        finalAuthorId = 'user-admin-001';
        finalAuthorName = 'المدير الافتراضي';
        console.log('🔄 استخدام مؤلف افتراضي ثابت:', { finalAuthorId, finalAuthorName });
      }
    }
    
    // استخدام القيم المرسلة إذا كانت متوفرة وصحيحة
    if (author_id) {
      // التحقق من وجود المؤلف في قاعدة البيانات
      try {
        console.log('🔍 التحقق من المؤلف المحدد:', author_id);
        const authorExists = await prisma.users.findUnique({
          where: { id: author_id }
        });
        if (authorExists) {
          finalAuthorId = author_id;
          finalAuthorName = author_name || authorExists.name || authorExists.email || 'مؤلف';
          console.log('✅ تم العثور على المؤلف المحدد:', { finalAuthorId, finalAuthorName });
        } else {
          console.log('⚠️ المؤلف المحدد غير موجود في قاعدة البيانات');
        }
      } catch (authorError) {
        console.log('⚠️ خطأ في التحقق من المؤلف المحدد:', authorError);
        console.log('🔄 سيتم استخدام المؤلف الافتراضي');
      }
    }

    console.log('👤 معلومات المؤلف النهائية:', { finalAuthorId, finalAuthorName });
    
    // التأكد من وجود مؤلف صالح
    if (!finalAuthorId) {
      console.error('❌ لا يوجد مؤلف صالح للمقال');
      return NextResponse.json(
        { success: false, error: 'لا يمكن إنشاء المقال بدون مؤلف صالح' },
        { status: 400 }
      );
    }

    // إنشاء معرف فريد للمقال
    const articleId = crypto.randomUUID();
    const slug = generateSlug(cleanTitle);
    
    console.log('🆔 معرف المقال الجديد:', articleId);
    console.log('🔗 رابط المقال (slug):', slug);

    // إنشاء المقال في قاعدة البيانات البعيدة
    console.log('💾 محاولة حفظ المقال في قاعدة البيانات...');
    
    const articleData = {
      id: articleId,
      title: cleanTitle,
      content: cleanContent,
      excerpt: cleanExcerpt,
      category_id: category_id || null,
      status: String(status),
      featured_image: featured_image || null,
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        isSmartDraft: (metadata as any)?.isSmartDraft || false,
        aiEditor: (metadata as any)?.aiEditor || false,
        author_name: finalAuthorName
      },
      seo_keywords: cleanKeywords || null,
      author_id: finalAuthorId,
      slug: slug,
      views: 0,
      reading_time: Math.max(1, Math.ceil(textContent.split(' ').length / 200)), // تأكد من أن وقت القراءة لا يقل عن دقيقة واحدة
      updated_at: new Date(),
      // إضافة published_at للمقالات المنشورة فوراً
      published_at: status === 'published' ? new Date() : null,
      featured: false,
      breaking: false,
      allow_comments: true,
      created_at: new Date(),
      likes: 0,
      saves: 0,
      shares: 0
    };

    console.log('📊 بيانات المقال النهائية:', {
      id: articleData.id,
      title: articleData.title.substring(0, 50),
      content: typeof articleData.content + ' - ' + articleData.content.substring(0, 100),
      status: articleData.status,
      author_id: articleData.author_id,
      category_id: articleData.category_id,
      slug: articleData.slug,
      seo_keywords: typeof articleData.seo_keywords + ' - ' + articleData.seo_keywords,
      featured_image: articleData.featured_image
    });

    const article = await prisma.articles.create({
      data: articleData
    });

    console.log('✅ تم إنشاء المقال بنجاح:', {
      id: article.id,
      title: article.title,
      status: article.status
    });

    // إضافة حدث إلى timeline_events عند نشر المقال
    if (status === 'published') {
      try {
        await prisma.timeline_events.create({
          data: {
            id: crypto.randomUUID(),
            event_type: 'article_published',
            entity_type: 'article',
            entity_id: article.id,
            title: `مقال جديد: ${cleanTitle}`,
            description: cleanExcerpt,
            user_id: finalAuthorId || null,
            author_name: finalAuthorName,
            metadata: {
              category_id: category_id,
              featured_image: featured_image,
              is_breaking: (metadata as any)?.is_breaking || false
            },
            created_at: new Date(),
            is_important: false
          }
        })
        console.log('✅ تم إضافة الحدث إلى timeline_events')
      } catch (error) {
        console.error('⚠️ فشل إضافة الحدث إلى timeline_events:', error)
      }
    }

    // مسح الكاش عند إنشاء مقال جديد
    if (status === 'published') {
      try {
        console.log('🧹 مسح الكاش بعد نشر المقال...');
        await cache.clearPattern('articles:*');
        if (category_id) {
          await cache.clearPattern(`articles:*category_id*${category_id}*`);
        }
      } catch (cacheError) {
        console.error('⚠️ فشل مسح الكاش:', cacheError);
      }
    }

    return NextResponse.json({
      success: true,
      article,
      message: 'تم حفظ المقال بنجاح'
    })
  } catch (error) {
    console.error('❌ خطأ تفصيلي في إنشاء المقال:', {
      message: error instanceof Error ? error.message : 'خطأ غير معروف',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطأ في حفظ المقال',
        details: error instanceof Error ? error.message : 'خطأ غير معروف',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// دوال مساعدة
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, '') // إزالة الأحرف غير المسموحة
    .replace(/\s+/g, '-') // استبدال المسافات بشرطة
    .replace(/-+/g, '-') // إزالة الشرطات المتكررة
    .trim()
    .substring(0, 90); // تقليل الطول لإفساح مجال للـ timestamp
  
  // إضافة timestamp مختصر لضمان الفرادة
  const timestamp = Date.now().toString().slice(-6); // آخر 6 أرقام
  return `${baseSlug}-${timestamp}`;
}

function calculateReadingTime(content: string): number {
  const wordsCount = content.split(/\s+/).length
  return Math.ceil(wordsCount / 200)
}

// دالة للتحقق من صلاحيات المستخدم
async function checkUserPermissions(request: NextRequest, requireDelete: boolean = false): Promise<{ valid: boolean, user?: any, error?: string }> {
  try {
    // محاولة الحصول على التوكن من الكوكيز أو من Authorization header
    let token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return { valid: false, error: 'لم يتم العثور على معلومات المصادقة' };
    }

    // التحقق من صحة التوكن
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return { valid: false, error: 'جلسة غير صالحة' };
    }

    // البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_admin: true,
        is_verified: true
      }
    });

    if (!user) {
      return { valid: false, error: 'المستخدم غير موجود' };
    }

    // التحقق من أن المستخدم مفعل
    if (!user.is_verified) {
      return { valid: false, error: 'المستخدم غير مفعل' };
    }

    // التحقق من صلاحيات الحذف إذا كان مطلوباً
    if (requireDelete) {
      const canDelete = user.is_admin || 
                       user.role === 'admin' || 
                       user.role === 'editor' || 
                       user.role === 'super_admin';

      if (!canDelete) {
        return { valid: false, error: 'ليس لديك صلاحية حذف المقالات' };
      }
    }

    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: 'خطأ في التحقق من الصلاحيات' };
  }
}

// DELETE: حذف مقالات (حذف ناعم) - محمي بالمصادقة
export async function DELETE(request: NextRequest) {
  try {
    // التحقق من اتصال قاعدة البيانات
    await ensureConnection();
    
    // التحقق من صلاحيات المستخدم للحذف
    const authCheck = await checkUserPermissions(request, true);
    if (!authCheck.valid) {
      return NextResponse.json({
        success: false,
        error: authCheck.error || 'غير مصرح بالوصول'
      }, { status: 401 });
    }

    const body = await request.json()
    const ids = body.ids || []

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'معرفات المقالات مطلوبة'
      }, { status: 400 })
    }

    // تسجيل عملية الحذف للمراجعة
    console.log(`🗑️ محاولة حذف ${ids.length} مقال من قبل المستخدم:`, {
      userId: authCheck.user?.id,
      userEmail: authCheck.user?.email,
      userRole: authCheck.user?.role,
      articleIds: ids,
      timestamp: new Date().toISOString()
    });

    // تحديث حالة المقالات إلى "محذوف" في قاعدة البيانات البعيدة
    const result = await prisma.articles.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        status: 'deleted',
        updated_at: new Date()
      }
    })

    // تسجيل النشاط في سجل الأنشطة - معطل مؤقتاً
    // await prisma.activity_logs.create({ ... });

    console.log(`✅ تم حذف ${result.count} مقال بنجاح من قبل:`, authCheck.user?.email);

    return NextResponse.json({
      success: true,
      affected: result.count,
      message: `تم حذف ${result.count} مقال(ات) بنجاح`,
      deletedBy: {
        userId: authCheck.user.id,
        userEmail: authCheck.user.email,
        userRole: authCheck.user.role
      }
    })
  } catch (error) {
    console.error('خطأ في حذف المقالات:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف المقالات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
} 