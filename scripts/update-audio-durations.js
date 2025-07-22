#!/usr/bin/env node

/**
 * نص لتحديث مدة جميع النشرات الصوتية بالقيم الحقيقية
 */

const { updateAllAudioDurations } = require('../lib/server-audio-utils');

async function main() {
  console.log('🚀 بدء تحديث مدة النشرات الصوتية...');
  
  try {
    await updateAllAudioDurations();
    console.log('✅ تم تحديث جميع مدة النشرات بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('❌ فشل في تحديث مدة النشرات:', error);
    process.exit(1);
  }
}

main();
