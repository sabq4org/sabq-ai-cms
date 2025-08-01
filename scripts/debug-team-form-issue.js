/**
 * تشخيص سريع لمشكلة نموذج الفريق
 * - لماذا تظهر كلمة "مراسل"؟
 * - لماذا القائمة لا تستجيب؟
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugTeamFormIssue() {
  try {
    console.log('🔍 تشخيص مشكلة نموذج الفريق...\n');
    
    // 1. فحص API الأدوار
    console.log('1️⃣ فحص API الأدوار:');
    
    try {
      console.log('🔗 محاكاة: GET /api/admin/roles');
      
      const rolesFromDB = await prisma.roles.findMany({
        select: {
          id: true,
          name: true,
          display_name: true,
          description: true
        },
        orderBy: { display_name: 'asc' }
      });
      
      console.log(`📊 عدد الأدوار في قاعدة البيانات: ${rolesFromDB.length}`);
      
      if (rolesFromDB.length === 0) {
        console.log('❌ لا توجد أدوار في قاعدة البيانات!');
        console.log('💡 هذا قد يفسر عدم استجابة القائمة');
      } else {
        console.log('✅ الأدوار موجودة:');
        rolesFromDB.forEach((role, index) => {
          console.log(`  ${index + 1}. ${role.display_name || role.name} (${role.name})`);
        });
      }
      
    } catch (apiError) {
      console.error('❌ خطأ في API الأدوار:', apiError.message);
      console.log('💡 هذا قد يفسر عدم تحميل الأدوار');
    }
    
    // 2. فحص البيانات الافتراضية المحتملة
    console.log('\n2️⃣ فحص المصادر المحتملة لكلمة "مراسل":');
    
    const possibleSources = [
      'formData initial state',
      'localStorage cache',
      'previous form values',
      'role mapping function',
      'fallback default value'
    ];
    
    console.log('🎯 المصادر المحتملة:');
    possibleSources.forEach((source, index) => {
      console.log(`  ${index + 1}. ${source}`);
    });
    
    // 3. محاكاة سيناريو التحميل
    console.log('\n3️⃣ محاكاة سيناريو تحميل النموذج:');
    
    console.log('📱 خطوات تحميل النموذج:');
    console.log('  1. useEffect يستدعي fetchRoles()');
    console.log('  2. rolesLoading = true في البداية');
    console.log('  3. API call إلى /api/admin/roles');
    
    // محاكاة API response
    const apiResponse = {
      success: true,
      data: rolesFromDB.map(role => ({
        id: role.id,
        name: role.name,
        display_name: role.display_name || role.name,
        description: role.description
      }))
    };
    
    console.log('  4. API response:');
    console.log(`     success: ${apiResponse.success}`);
    console.log(`     data count: ${apiResponse.data.length}`);
    
    if (apiResponse.data.length > 0) {
      console.log('  5. ✅ تحويل للتنسيق المطلوب:');
      const frontendRoles = apiResponse.data.map(role => ({
        value: role.name,
        label: role.display_name
      }));
      
      frontendRoles.slice(0, 3).forEach(role => {
        console.log(`     { value: "${role.value}", label: "${role.label}" }`);
      });
      
      console.log('  6. ✅ rolesLoading = false');
      console.log('  7. ✅ availableRoles.length > 0');
    } else {
      console.log('  5. ❌ لا توجد أدوار للتحويل');
      console.log('  6. ❌ fallback إلى الأدوار الافتراضية');
    }
    
    // 4. فحص مشاكل محتملة في Select component
    console.log('\n4️⃣ فحص مشاكل محتملة في Select:');
    
    const selectIssues = [
      {
        issue: 'rolesLoading لا يتحول إلى false',
        cause: 'API فشل أو لم يستجب',
        solution: 'فحص Network tab في المتصفح'
      },
      {
        issue: 'availableRoles فارغ',
        cause: 'فشل في تحويل البيانات أو API فارغ',
        solution: 'فحص Console errors'
      },
      {
        issue: 'Select disabled',
        cause: 'rolesLoading = true دائماً',
        solution: 'فحص fetchRoles function'
      },
      {
        issue: 'قيمة "مراسل" من cache',
        cause: 'browser cache أو localStorage',
        solution: 'Hard refresh أو clear cache'
      }
    ];
    
    console.log('🔧 المشاكل المحتملة:');
    selectIssues.forEach((item, index) => {
      console.log(`  ${index + 1}. المشكلة: ${item.issue}`);
      console.log(`     السبب: ${item.cause}`);
      console.log(`     الحل: ${item.solution}\n`);
    });
    
    // 5. تعليمات التشخيص للمستخدم
    console.log('5️⃣ تعليمات التشخيص السريع:');
    
    const debugSteps = [
      'افتح Developer Tools (F12)',
      'انتقل إلى Console tab',
      'ابحث عن أخطاء تحميل الأدوار',
      'تحقق من Network tab للـ API calls',
      'امسح cache المتصفح (Ctrl+Shift+R)',
      'تحقق من Application > Local Storage'
    ];
    
    console.log('📋 خطوات التشخيص:');
    debugSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    
    // 6. نتائج وتوصيات
    console.log('\n6️⃣ التشخيص والتوصيات:');
    
    if (rolesFromDB.length > 0) {
      console.log('✅ قاعدة البيانات سليمة - الأدوار موجودة');
      console.log('🎯 المشكلة محتملة في:');
      console.log('  - تحميل JavaScript');
      console.log('  - API endpoint response');
      console.log('  - React state management');
      console.log('  - Browser caching');
      
      console.log('\n💡 الحلول المقترحة:');
      console.log('  1. Hard refresh: Ctrl+Shift+R');
      console.log('  2. فحص Console للأخطاء');
      console.log('  3. فحص Network tab');
      console.log('  4. إعادة build المشروع');
    } else {
      console.log('❌ مشكلة في قاعدة البيانات - لا توجد أدوار');
      console.log('🎯 يجب إضافة الأدوار أولاً');
    }
    
    console.log('\n🔍 للتأكد من وصول API:');
    console.log('curl -X GET "http://localhost:3000/api/admin/roles"');
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTeamFormIssue();