import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: البحث في مواضيع وردود المنتدى
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // topics, replies, all
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'يجب أن يكون البحث أكثر من حرفين' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${query.trim()}%`;

    let results: any[] = [];
    let total = 0;

    if (type === 'all' || type === 'topics') {
      // البحث في المواضيع
      let whereClause = "WHERE (t.title ILIKE ? OR t.content ILIKE ?) AND t.status = 'active'";
      const params = [searchTerm, searchTerm];

      if (category) {
        whereClause += " AND c.slug = ?";
        params.push(category);
      }

      const topics = await prisma.$queryRawUnsafe(`
        SELECT 
          t.id,
          t.title,
          t.content,
          t.views,
          t.is_pinned,
          t.is_locked,
          t.created_at,
          t.last_reply_at,
          c.name_ar as category_name,
          c.slug as category_slug,
          c.color as category_color,
          u.name as author_name,
          'topic' as result_type
        FROM forum_topics t
        JOIN forum_categories c ON t.category_id = c.id
        JOIN users u ON t.author_id = u.id
        ${whereClause}
        ORDER BY t.created_at DESC
        LIMIT ? OFFSET ?
      `, ...params, limit, offset);

      const topicCount = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as total
        FROM forum_topics t
        JOIN forum_categories c ON t.category_id = c.id
        ${whereClause}
      `, ...params);

      results.push(...(topics as any[]));
      total += Number((topicCount as any)[0]?.total || 0);
    }

    if (type === 'all' || type === 'replies') {
      // البحث في الردود
      let whereClause = "WHERE r.content ILIKE ? AND r.status = 'active'";
      const params = [searchTerm];

      if (category) {
        whereClause += " AND c.slug = ?";
        params.push(category);
      }

      const replies = await prisma.$queryRawUnsafe(`
        SELECT 
          r.id,
          r.content,
          r.created_at,
          r.topic_id,
          t.title as topic_title,
          c.name_ar as category_name,
          c.slug as category_slug,
          c.color as category_color,
          u.name as author_name,
          'reply' as result_type
        FROM forum_replies r
        JOIN forum_topics t ON r.topic_id = t.id
        JOIN forum_categories c ON t.category_id = c.id
        JOIN users u ON r.author_id = u.id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `, ...params, limit, offset);

      const replyCount = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as total
        FROM forum_replies r
        JOIN forum_topics t ON r.topic_id = t.id
        JOIN forum_categories c ON t.category_id = c.id
        ${whereClause}
      `, ...params);

      results.push(...(replies as any[]));
      total += Number((replyCount as any)[0]?.total || 0);
    }

    // ترتيب النتائج حسب التاريخ
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // تحديد النتائج حسب الصفحة
    const paginatedResults = results.slice(0, limit);

    // تنسيق النتائج
    const formattedResults = paginatedResults.map(result => {
      if (result.result_type === 'topic') {
        return {
          id: result.id,
          type: 'topic',
          title: result.title,
          content: highlightSearchTerm(result.content, query),
          url: `/forum/topic/${result.id}`,
          categories: {
            name: result.category_name,
            slug: result.category_slug,
            color: result.category_color
          },
          author: result.author_name,
          createdAt: result.created_at,
          views: result.views,
          isPinned: result.is_pinned,
          isLocked: result.is_locked,
          relativeTime: getRelativeTime(new Date(result.created_at))
        };
      } else {
        return {
          id: result.id,
          type: 'reply',
          content: highlightSearchTerm(result.content, query),
          topicTitle: result.topic_title,
          url: `/forum/topic/${result.topic_id}#reply-${result.id}`,
          categories: {
            name: result.category_name,
            slug: result.category_slug,
            color: result.category_color
          },
          author: result.author_name,
          createdAt: result.created_at,
          relativeTime: getRelativeTime(new Date(result.created_at))
        };
      }
    });

    return NextResponse.json({
      results: formattedResults,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      query,
      type
    });
  } catch (error: any) {
    console.error('Error searching forum:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في البحث' },
      { status: 500 }
    );
  }
}

// دالة لتمييز النص المطابق في النتائج
function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  const highlightedText = text.replace(regex, '<mark>$1</mark>');
  
  // إرجاع مقطع من النص مع التمييز (حوالي 200 حرف)
  const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (index !== -1) {
    const start = Math.max(0, index - 100);
    const end = Math.min(text.length, index + searchTerm.length + 100);
    const excerpt = text.substring(start, end);
    return start > 0 ? '...' + excerpt.replace(regex, '<mark>$1</mark>') + '...' : excerpt.replace(regex, '<mark>$1</mark>') + '...';
  }
  
  return highlightedText.substring(0, 200) + (text.length > 200 ? '...' : '');
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// دالة مساعدة لحساب الوقت النسبي
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
  if (diffHours < 24) return `قبل ${diffHours} ساعة`;
  if (diffDays < 30) return `قبل ${diffDays} يوم`;
  
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    calendar: 'gregory',
    numberingSystem: 'latn'
  });
} 