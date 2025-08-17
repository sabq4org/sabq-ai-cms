/**
 * Script تشخيص مشكلة API أعضاء الفريق
 */

const fs = require('fs').promises;
const path = require('path');

async function diagnoseTeamError() {
  const baseUrl = 'http://localhost:3002';
  
  console.log('🔍 بدء تشخيص مشكلة API أعضاء الفريق...');
  
  try {
    // اختبار 1: جلب الأعضاء الحاليين
    console.log('\n📊 اختبار جلب الأعضاء...');
    const getResponse = await fetch(`${baseUrl}/api/team-members`);
    console.log('GET Status:', getResponse.status);
    
    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log('✅ GET نجح:', {
        success: getResult.success,
        membersCount: getResult.members?.length || 0
      });
    } else {
      const getError = await getResponse.text();
      console.log('❌ GET فشل:', getError);
    }
    
    // اختبار 2: محاولة إضافة عضو بأقل البيانات
    console.log('\n➕ اختبار إضافة عضو بأقل البيانات...');
    
    const minimalMember = {
      name: 'اختبار تشخيص',
      email: `diagnosis-${Date.now()}@test.com`,
      role: 'member'
    };
    
    console.log('📤 البيانات:', minimalMember);
    
    const postResponse = await fetch(`${baseUrl}/api/team-members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalMember)
    });
    
    console.log('POST Status:', postResponse.status);
    console.log('POST Headers:', Object.fromEntries(postResponse.headers.entries()));
    
    const postResult = await postResponse.text();
    console.log('POST Raw Response:', postResult);
    
    if (postResponse.ok) {
      try {
        const jsonResult = JSON.parse(postResult);
        console.log('✅ POST نجح:', jsonResult);
      } catch (parseError) {
        console.log('⚠️ استجابة غير JSON:', postResult);
      }
    } else {
      console.log('❌ POST فشل:', {
        status: postResponse.status,
        statusText: postResponse.statusText,
        body: postResult
      });
    }
    
    // اختبار 3: التحقق من ملف البيانات
    console.log('\n📁 التحقق من ملف البيانات...');
    const dataFile = path.join(process.cwd(), 'data', 'team-members.json');
    
    try {
      const fileStats = await fs.stat(dataFile);
      console.log('✅ الملف موجود:', {
        size: fileStats.size,
        lastModified: fileStats.mtime
      });
      
      const fileContent = await fs.readFile(dataFile, 'utf-8');
      const data = JSON.parse(fileContent);
      console.log('📊 محتوى الملف:', {
        membersCount: data.length,
        lastMember: data[data.length - 1]?.name || 'لا يوجد'
      });
      
    } catch (fileError) {
      console.log('❌ مشكلة في الملف:', fileError.message);
    }
    
  } catch (error) {
    console.error('💥 خطأ في التشخيص:', error);
  }
}

// تشغيل التشخيص
diagnoseTeamError();