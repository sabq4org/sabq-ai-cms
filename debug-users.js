#!/usr/bin/env node

/**
 * أداة تشخيص سريعة لفحص المستخدمين في قاعدة البيانات
 * للتأكد من وجود editor@sabq.ai
 */

async function checkUsersInDatabase() {
  console.log('🔍 فحص المستخدمين في قاعدة البيانات...\n');
  
  try {
    // محاولة مع Prisma
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      console.log('📊 استخدام Prisma للفحص...');
      
      // البحث عن المستخدم المحدد
      const targetUserId = '0f107dd1-bfb7-4fac-b664-6587e6fc9a1e';
      const targetUser = await prisma.users.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          created_at: true,
          is_admin: true
        }
      });
      
      console.log(`🎯 البحث عن المستخدم: ${targetUserId}`);
      if (targetUser) {
        console.log('✅ المستخدم موجود:');
        console.log(`  - البريد الإلكتروني: ${targetUser.email}`);
        console.log(`  - الاسم: ${targetUser.name || 'غير محدد'}`);
        console.log(`  - الدور: ${targetUser.role}`);
        console.log(`  - مدير: ${targetUser.is_admin ? 'نعم' : 'لا'}`);
        console.log(`  - تاريخ الإنشاء: ${targetUser.created_at}`);
      } else {
        console.log('❌ المستخدم غير موجود في قاعدة البيانات!');
      }
      
      // البحث بالبريد الإلكتروني
      console.log('\n🔍 البحث بالبريد الإلكتروني: editor@sabq.ai');
      const emailUser = await prisma.users.findUnique({
        where: { email: 'editor@sabq.ai' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          created_at: true,
          is_admin: true
        }
      });
      
      if (emailUser) {
        console.log('✅ وُجد المستخدم بالبريد الإلكتروني:');
        console.log(`  - المعرف: ${emailUser.id}`);
        console.log(`  - البريد الإلكتروني: ${emailUser.email}`);
        console.log(`  - الاسم: ${emailUser.name || 'غير محدد'}`);
        console.log(`  - الدور: ${emailUser.role}`);
        console.log(`  - مدير: ${emailUser.is_admin ? 'نعم' : 'لا'}`);
        
        if (emailUser.id !== targetUserId) {
          console.log('⚠️ تحذير: معرف المستخدم في قاعدة البيانات مختلف عن التوكن!');
          console.log(`  - في قاعدة البيانات: ${emailUser.id}`);
          console.log(`  - في التوكن: ${targetUserId}`);
        }
      } else {
        console.log('❌ لم يُوجد المستخدم بالبريد الإلكتروني');
      }
      
      // عرض جميع المستخدمين
      console.log('\n📋 جميع المستخدمين في قاعدة البيانات:');
      const allUsers = await prisma.users.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          is_admin: true,
          created_at: true
        },
        orderBy: { created_at: 'desc' },
        take: 10
      });
      
      if (allUsers.length > 0) {
        allUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${user.email} (${user.role})`);
          console.log(`   - المعرف: ${user.id}`);
          console.log(`   - الاسم: ${user.name || 'غير محدد'}`);
          console.log(`   - مدير: ${user.is_admin ? 'نعم' : 'لا'}`);
          console.log(`   - تاريخ الإنشاء: ${user.created_at}`);
          console.log('');
        });
      } else {
        console.log('❌ لا توجد مستخدمين في قاعدة البيانات!');
      }
      
      await prisma.$disconnect();
      
    } catch (prismaError) {
      console.log('⚠️ فشل استخدام Prisma:', prismaError.message);
      
      // محاولة مع Supabase
      try {
        console.log('\n📊 محاولة استخدام Supabase...');
        const { createClient } = require('@supabase/supabase-js');
        
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
          console.log('❌ متغيرات Supabase غير موجودة');
          return;
        }
        
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const targetUserId = '0f107dd1-bfb7-4fac-b664-6587e6fc9a1e';
        
        // البحث عن المستخدم المحدد
        const { data: targetUser, error: targetError } = await supabase
          .from('users')
          .select('id, email, name, role, created_at, is_admin')
          .eq('id', targetUserId)
          .single();
        
        if (targetError && targetError.code !== 'PGRST116') {
          console.log('❌ خطأ في البحث عن المستخدم:', targetError);
        } else if (targetUser) {
          console.log('✅ المستخدم موجود في Supabase:');
          console.log(`  - البريد الإلكتروني: ${targetUser.email}`);
          console.log(`  - الدور: ${targetUser.role}`);
        } else {
          console.log('❌ المستخدم غير موجود في Supabase');
        }
        
        // البحث بالبريد الإلكتروني
        const { data: emailUser, error: emailError } = await supabase
          .from('users')
          .select('id, email, name, role, created_at, is_admin')
          .eq('email', 'editor@sabq.ai')
          .single();
        
        if (emailError && emailError.code !== 'PGRST116') {
          console.log('❌ خطأ في البحث بالبريد الإلكتروني:', emailError);
        } else if (emailUser) {
          console.log('✅ وُجد المستخدم بالبريد الإلكتروني في Supabase:');
          console.log(`  - المعرف: ${emailUser.id}`);
          console.log(`  - البريد الإلكتروني: ${emailUser.email}`);
          
          if (emailUser.id !== targetUserId) {
            console.log('⚠️ تعارض في المعرفات!');
          }
        }
        
      } catch (supabaseError) {
        console.log('❌ فشل استخدام Supabase:', supabaseError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

// تشغيل التشخيص
checkUsersInDatabase().catch(console.error);
