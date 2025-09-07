// نص لمسح الكاش المحلي في المتصفح
console.log('🧹 مسح كاش المحتوى الذكي...');
localStorage.removeItem('smart-content-fast-cache-v2');
localStorage.removeItem('smart-content-fast-cache-v3');
console.log('✅ تم مسح الكاش المحلي');
console.log('🔄 إعادة تحميل الصفحة...');
window.location.reload();
