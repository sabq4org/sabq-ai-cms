const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// قراءة ملف المستخدمين
const usersPath = path.join(__dirname, '../data/users.json');
const data = fs.readFileSync(usersPath, 'utf8');
const usersData = JSON.parse(data);

// البريد الإلكتروني للمدير
const adminEmail = 'ali@alhazm.org';
const newPassword = 'Admin@123456';

// البحث عن المستخدم
const userIndex = usersData.users.findIndex(u => u.email === adminEmail);

if (userIndex !== -1) {
  // تشفير كلمة المرور الجديدة
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  // تحديث كلمة المرور
  usersData.users[userIndex].password = hashedPassword;
  usersData.users[userIndex].updated_at = new Date().toISOString();
  
  // حفظ الملف
  fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
  
  console.log('✅ تم تحديث كلمة المرور بنجاح!');
  console.log('📧 البريد الإلكتروني:', adminEmail);
  console.log('🔑 كلمة المرور الجديدة:', newPassword);
  console.log('🔗 رابط تسجيل الدخول: http://localhost:3000/login');
} else {
  console.log('❌ لم يتم العثور على المستخدم!');
} 