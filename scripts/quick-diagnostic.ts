#!/usr/bin/env node

/**
 * سكريبت التشخيص السريع
 */

import { syncDiagnostic } from '../lib/sync-diagnostic-tools';
import { deviceDetector } from '../lib/unified-device-detector';
import { unifiedCache } from '../lib/unified-cache-manager';

async function quickDiagnostic() {
  console.log('🔍 بدء التشخيص السريع...\n');
  
  // 1. فحص الجهاز
  console.log('📱 معلومات الجهاز:');
  console.log('  - النوع:', deviceDetector.getDeviceType());
  console.log('  - معلومات كاملة:', deviceDetector.getDeviceInfo());
  
  // 2. فحص الكاش
  console.log('\n💾 إحصائيات الكاش:');
  const cacheStats = unifiedCache.getStats();
  console.log('  - حجم كاش الذاكرة:', cacheStats.memoryCacheSize);
  console.log('  - آخر إبطال:', cacheStats.lastInvalidation);
  
  // 3. تشخيص شامل
  console.log('\n🔧 التشخيص الشامل:');
  const result = await syncDiagnostic.runFullDiagnostic();
  console.log('  - الصحة العامة:', result.overallHealth + '%');
  console.log('  - عدد المشاكل:', result.issues.length);
  console.log('  - يتطلب إجراء:', result.requiresAction ? 'نعم' : 'لا');
  
  if (result.issues.length > 0) {
    console.log('\n⚠️ المشاكل المكتشفة:');
    result.issues.forEach(issue => {
      console.log(`  - [${issue.severity}] ${issue.description}`);
      if (issue.suggestedFix) {
        console.log(`    الحل: ${issue.suggestedFix}`);
      }
    });
  }
  
  if (result.recommendations.length > 0) {
    console.log('\n💡 التوصيات:');
    result.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
  }
  
  // حفظ التقرير
  const report = syncDiagnostic.exportReport(result);
  const fs = require('fs');
  fs.writeFileSync('diagnostic-report.txt', report);
  console.log('\n📁 تم حفظ التقرير في: diagnostic-report.txt');
}

// تشغيل التشخيص
quickDiagnostic().catch(console.error);
