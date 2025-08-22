const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestNotifications() {
  try {
    console.log('🚀 بدء إنشاء إشعارات تجريبية...')
    
    // جلب أول مستخدم من قاعدة البيانات
    const user = await prisma.users.findFirst()
    
    if (!user) {
      console.log('❌ لا يوجد مستخدمون في قاعدة البيانات')
      return
    }
    
    console.log(`👤 المستخدم الحالي: ${user.name} (${user.id})`)
    
    // إنشاء بعض الإشعارات التجريبية
    const notifications = [
      {
        user_id: user.id,
        type: 'breaking_news',
        title: '🔥 خبر عاجل: تطوير نظام الإشعارات مكتمل',
        message: 'تم تطوير نظام إشعارات ذكي جديد مع تحسينات كبيرة في الأداء والتصميم',
        priority: 'high',
        status: 'sent',
        data: {
          articleId: 'test-article-1',
          category: 'تقنية'
        }
      },
      {
        user_id: user.id,
        type: 'article_recommendation',
        title: '📖 مقال مُوصى: تحسينات الأداء الجديدة',
        message: 'مقال جديد حول تحسينات الأداء يناسب اهتماماتك',
        priority: 'medium',
        status: 'sent',
        data: {
          articleId: 'test-article-2',
          tags: ['أداء', 'تطوير']
        }
      },
      {
        user_id: user.id,
        type: 'user_engagement',
        title: '💬 تعليق جديد على مقالك',
        message: 'أضاف أحد القراء تعليقاً على مقال "نظام الإشعارات الذكية"',
        priority: 'low',
        status: 'sent',
        data: {
          articleId: 'test-article-3',
          commentId: 'comment-1'
        }
      },
      {
        user_id: user.id,
        type: 'system_alert',
        title: '🎉 ترحيب بالنظام الجديد',
        message: 'مرحباً بك في نظام الإشعارات المحدث مع واجهة جديدة وأداء محسّن',
        priority: 'medium',
        status: 'sent',
        data: {
          version: '2.0.0',
          features: ['تصميم محسن', 'أداء أسرع', 'فلترة ذكية']
        }
      },
      {
        user_id: user.id,
        type: 'ai_insight',
        title: '📊 رؤى ذكية: أداءك اليوم',
        message: 'إليك ملخص أداءك وأهم الأحداث والمقالات لهذا اليوم',
        priority: 'low',
        status: 'sent',
        data: {
          date: new Date().toISOString().split('T')[0],
          articlesCount: 12,
          commentsCount: 45,
          insights: ['تفاعل جيد', 'قراءة متنوعة']
        }
      }
    ]
    
    // إنشاء الإشعارات
    for (const notification of notifications) {
      const created = await prisma.smartNotifications.create({
        data: notification
      })
      
      console.log(`✅ تم إنشاء إشعار: ${created.title}`)
    }
    
    console.log(`🎉 تم إنشاء ${notifications.length} إشعارات تجريبية بنجاح!`)
    
    // عرض الإحصائيات
    const totalCount = await prisma.smartNotifications.count({
      where: { user_id: user.id }
    })
    
    const unreadCount = await prisma.smartNotifications.count({
      where: { 
        user_id: user.id,
        read_at: null 
      }
    })
    
    console.log(`📊 الإحصائيات:`)
    console.log(`   - إجمالي الإشعارات: ${totalCount}`)
    console.log(`   - غير المقروءة: ${unreadCount}`)
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الإشعارات:', error)
    
    if (error.code === 'P2002') {
      console.log('ℹ️ الجدول موجود بالفعل، يتم المتابعة...')
    }
  } finally {
    await prisma.$disconnect()
  }
}

createTestNotifications()
