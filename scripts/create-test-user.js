#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  console.log('🔨 إنشاء مستخدم تجريبي...');
  
  try {
    // قراءة ملف المستخدمين
    const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
    const fileContents = await fs.readFile(usersFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // إنشاء مستخدم تجريبي جديد
    const testUser = {
      id: `user-${Date.now()}-test`,
      name: 'مستخدم تجريبي',
      email: 'test@sabq.org',
      password: await bcrypt.hash('test123', 10), // كلمة المرور: test123
      email_verified: true,
      isVerified: true,
      status: 'active',
      role: 'regular',
      loyaltyPoints: 500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // إضافة المستخدم للقائمة
    data.users.push(testUser);
    
    // حفظ الملف
    await fs.writeFile(usersFilePath, JSON.stringify(data, null, 2));
    
    console.log('✅ تم إنشاء المستخدم التجريبي بنجاح!');
    console.log('📧 البريد الإلكتروني: test@sabq.org');
    console.log('🔑 كلمة المرور: test123');
    console.log('🎯 نقاط الولاء: 500');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error);
  }
}

// تشغيل السكريبت
createTestUser(); 