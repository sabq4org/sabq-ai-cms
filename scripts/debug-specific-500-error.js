/**
 * تشخيص محدد لخطأ 500 في API articles
 */

const fs = require('fs').promises;

console.log('🔍 تشخيص محدد لخطأ 500 في API articles...\n');

async function debugSpecific500() {
  try {
    console.log('📋 1. محاكاة البيانات التي يرسلها المستخدم...');
    
    // بيانات نموذجية من form إنشاء المقال
    const testArticleData = {
      title: 'اختبار تشخيص خطأ 500',
      content: 'محتوى تجريبي طويل لاختبار API. هذا محتوى يحتوي على أكثر من 10 أحرف لتمرير validation.',
      excerpt: 'نبذة تجريبية',
      // هذه القيم قد تكون السبب:
      author_id: 'real-author-id-from-frontend', // سنحتاج قيم حقيقية
      category_id: 'real-category-id-from-frontend',
      status: 'published',
      featured: false,
      breaking: false,
      featured_image: null,
      seo_title: 'عنوان SEO',
      seo_description: 'وصف SEO',
      seo_keywords: null,
      metadata: {
        subtitle: 'عنوان فرعي',
        type: 'local',
        image_caption: null,
        keywords: [],
        gallery: [],
        external_link: null
      }
    };
    
    console.log('📋 2. فحص قاعدة البيانات للقيم الحقيقية...');
    
    // تحميل Prisma
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // جلب أول تصنيف نشط
      const firstCategory = await prisma.categories.findFirst({
        where: { is_active: true },
        select: { id: true, name: true }
      });
      
      // جلب أول مؤلف نشط
      const firstAuthor = await prisma.article_authors.findFirst({
        where: { is_active: true },
        select: { id: true, full_name: true, email: true }
      });
      
      // إذا لم نجد في article_authors، نجرب users
      let author = firstAuthor;
      if (!author) {
        const userAuthor = await prisma.users.findFirst({
          select: { id: true, name: true, email: true }
        });
        if (userAuthor) {
          author = { 
            id: userAuthor.id, 
            full_name: userAuthor.name, 
            email: userAuthor.email 
          };
        }
      }
      
      console.log('📊 البيانات الحقيقية الموجودة:');
      console.log(`   📂 التصنيف: ${firstCategory ? `${firstCategory.name} (${firstCategory.id})` : 'لا يوجد'}`);
      console.log(`   👤 المؤلف: ${author ? `${author.full_name} (${author.id})` : 'لا يوجد'}`);
      
      if (!firstCategory) {
        console.error('❌ مشكلة: لا توجد تصنيفات نشطة في قاعدة البيانات!');
        console.log('💡 حل: إنشاء تصنيف نشط أو تفعيل تصنيفات موجودة');
      }
      
      if (!author) {
        console.error('❌ مشكلة: لا توجد مؤلفين في قاعدة البيانات!');
        console.log('💡 حل: إنشاء مؤلف في article_authors أو users');
      }
      
      if (firstCategory && author) {
        console.log('\n📋 3. اختبار مع بيانات حقيقية...');
        
        // تحديث البيانات التجريبية
        testArticleData.category_id = firstCategory.id;
        testArticleData.author_id = author.id;
        
        console.log('🚀 إرسال اختبار إلى API...');
        
        // اختبار API مع بيانات حقيقية
        const response = await fetch('https://www.sabq.io/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Debug-Script-500-Test'
          },
          body: JSON.stringify(testArticleData)
        });
        
        console.log(`📡 استجابة API: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ نجح! المشكلة كانت في البيانات المرسلة');
          console.log('📊 النتيجة:', {
            id: result.article?.id,
            title: result.article?.title,
            status: result.article?.status
          });
        } else {
          console.log('❌ ما زال فشل - المشكلة أعمق');
          
          // تحليل تفصيلي للخطأ
          const contentType = response.headers.get('content-type');
          console.log(`📋 نوع المحتوى: ${contentType}`);
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              console.log('📄 تفاصيل الخطأ (JSON):', errorData);
            } catch (e) {
              console.log('❌ فشل في قراءة JSON رغم Content-Type');
            }
          } else {
            const errorText = await response.text();
            console.log('📄 محتوى الخطأ (HTML):', errorText.substring(0, 500) + '...');
            
            // فحص أخطاء شائعة في HTML
            if (errorText.includes('Internal Server Error')) {
              console.log('🔍 خطأ خادم داخلي - مشكلة في الكود أو قاعدة البيانات');
            }
            if (errorText.includes('timeout')) {
              console.log('🔍 مشكلة timeout - قاعدة البيانات بطيئة');
            }
            if (errorText.includes('connection')) {
              console.log('🔍 مشكلة اتصال - قاعدة البيانات غير متاحة');
            }
            if (errorText.includes('prisma')) {
              console.log('🔍 مشكلة Prisma - خطأ في ORM أو schema');
            }
          }
        }
      }
      
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  }
}

// تشغيل التشخيص
debugSpecific500()
  .then(() => {
    console.log('\n✅ انتهى التشخيص المحدد');
    console.log('\n💡 خطوات تشخيص إضافية:');
    console.log('1. تحقق من logs الخادم (Vercel/AWS)');
    console.log('2. تأكد من صحة DATABASE_URL في الإنتاج');
    console.log('3. فحص schema.prisma مقابل database structure');
    console.log('4. تحقق من أن جميع tables موجودة ومتاحة');
  })
  .catch(error => {
    console.error('❌ فشل التشخيص:', error);
  });