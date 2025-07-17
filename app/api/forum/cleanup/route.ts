import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE: حذف المواضيع التجريبية
export async function DELETE(request: NextRequest) {
  try {
    console.log('Starting cleanup of test topics');
    
    // حذف المواضيع التجريبية
    const deletedTopics = await prisma.$executeRawUnsafe(`
      DELETE FROM forum_topics 
      WHERE title LIKE '%تجريب%' 
         OR title LIKE '%اختبار%'
         OR title LIKE '%test%'
         OR content LIKE '%تجريبي%'
         OR content LIKE '%اختبار%'
      RETURNING id, title
    `);
    
    console.log('Deleted topics:', deletedTopics);
    
    // حذف المواضيع المكررة
    const deletedDuplicates = await prisma.$executeRawUnsafe(`
      DELETE FROM forum_topics a
      USING forum_topics b
      WHERE a.id < b.id 
        AND a.title = b.title 
        AND a.content = b.content
      RETURNING a.id, a.title
    `);
    
    console.log('Deleted duplicates:', deletedDuplicates);
    
    const topicsCount = typeof deletedTopics === 'number' ? deletedTopics : 0;
    const duplicatesCount = typeof deletedDuplicates === 'number' ? deletedDuplicates : 0;
    const totalDeleted = topicsCount + duplicatesCount;
    
    return NextResponse.json({
      success: true,
      message: `تم حذف ${totalDeleted} موضوع تجريبي/مكرر`,
      deletedTopics: deletedTopics,
      deletedDuplicates: deletedDuplicates
    });
  } catch (error: any) {
    console.error('Error cleaning up topics:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في تنظيف المواضيع',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET: عرض المواضيع التي سيتم حذفها
export async function GET(request: NextRequest) {
  try {
    // جلب المواضيع التجريبية
    const testTopics = await prisma.$queryRawUnsafe(`
      SELECT id, title, content, created_at 
      FROM forum_topics 
      WHERE title LIKE '%تجريب%' 
         OR title LIKE '%اختبار%'
         OR title LIKE '%test%'
         OR content LIKE '%تجريبي%'
         OR content LIKE '%اختبار%'
      ORDER BY created_at DESC
    `);
    
    // جلب المواضيع المكررة
    const duplicates = await prisma.$queryRawUnsafe(`
      SELECT a.id, a.title, a.content, a.created_at
      FROM forum_topics a
      JOIN forum_topics b ON a.title = b.title AND a.content = b.content
      WHERE a.id < b.id
      ORDER BY a.created_at DESC
    `);
    
    return NextResponse.json({
      testTopics: testTopics,
      duplicates: duplicates,
      total: (testTopics as any[]).length + (duplicates as any[]).length
    });
  } catch (error: any) {
    console.error('Error fetching test topics:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في جلب المواضيع التجريبية',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 