const fetch = require('node-fetch');

async function getUsers() {
  console.log('👥 جلب المستخدمين/المراسلين...\n');
  
  try {
    const response = await fetch('http://localhost:3002/api/team-members');
    
    if (response.ok) {
      const data = await response.json();
      const users = data.data || data || [];
      
      console.log(`✅ تم جلب ${users.length} مستخدم:\n`);
      
      users.forEach(user => {
        console.log(`- ID: ${user.id}`);
        console.log(`  الاسم: ${user.name}`);
        console.log(`  البريد: ${user.email}`);
        console.log(`  الدور: ${user.role || 'غير محدد'}`);
        console.log('');
      });
      
      if (users.length > 0) {
        console.log(`\n💡 استخدم أحد هذه المعرفات في التحديث:`);
        console.log(`   author_id: "${users[0].id}"`);
      }
    } else {
      console.error('❌ فشل جلب المستخدمين:', response.status);
      const error = await response.text();
      console.error('رسالة الخطأ:', error);
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

getUsers().catch(console.error);