// اختبار بسيط للإحصائيات الثابتة
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickTest() {
  try {
    console.log('🧪 اختبار سريع للإحصائيات الثابتة...\n');
    
    // اختبار بسيط - حساب كل حالة منفصلة
    const [published, draft, archived, deleted] = await Promise.all([
      prisma.articles.count({ where: { status: 'published' } }),
      prisma.articles.count({ where: { status: 'draft' } }),
      prisma.articles.count({ where: { status: 'archived' } }),
      prisma.articles.count({ where: { status: 'deleted' } }),
    ]);
    
    const total = published + draft + archived + deleted;
    
    console.log('📊 الإحصائيات الثابتة (من قاعدة البيانات مباشرة):');
    console.log(`   ✅ منشورة: ${published} مقال`);
    console.log(`   ✏️ مسودة: ${draft} مقال`);
    console.log(`   🗂️ مؤرشفة: ${archived} مقال`);
    console.log(`   ❌ محذوفة: ${deleted} مقال`);
    console.log(`   📊 الإجمالي: ${total} مقال`);
    
    console.log('\n✅ هذه الأرقام يجب أن تبقى ثابتة في الواجهة!');
    console.log('✅ لا تتغير مع الفلاتر (منشورة، مسودة، مؤرشفة، محذوفة)');
    console.log('✅ لا تتغير مع البحث');
    console.log('✅ تتحدث فقط عند إجراء عمليات فعلية (نشر، أرشفة، حذف)');
    
    // محاكاة سيناريوهات مختلفة
    console.log('\n🎭 السيناريوهات:');
    console.log(`   1. عرض "المنشورة": يرى ${published} مقال في الجدول، الإحصائيات العلوية ثابتة`);
    console.log(`   2. عرض "المسودة": يرى ${draft} مقال في الجدول، الإحصائيات العلوية ثابتة`);
    console.log(`   3. البحث عن كلمة: يرى نتائج البحث في الجدول، الإحصائيات العلوية ثابتة`);
    console.log(`   4. نشر مسودة: الجدول يتحدث + الإحصائيات تتحدث (منشورة +1, مسودة -1)`);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();