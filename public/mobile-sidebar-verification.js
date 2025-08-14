// ملف للتحقق من القائمة الجانبية في الموبايل
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔍 التحقق من القائمة الجانبية للموبايل...');
  
  // التحقق من وجود العناصر الصحيحة في القائمة
  const checkSidebar = () => {
    const sidebarNav = document.querySelector('.mobile-sidebar nav, nav.fixed');
    if (sidebarNav) {
      console.log('✅ تم العثور على القائمة الجانبية');
      
      // التحقق من العناصر الموجودة
      const links = sidebarNav.querySelectorAll('a');
      console.log(`📋 عدد الروابط: ${links.length}`);
      
      links.forEach((link, index) => {
        const text = link.textContent.trim();
        const href = link.getAttribute('href');
        console.log(`${index + 1}. ${text} -> ${href}`);
        
        // التحقق من وجود عناصر شخصية غير مرغوبة
        if (text.includes('الملف الشخصي') || 
            text.includes('رحلتك المعرفية') || 
            text.includes('الإعدادات') ||
            text.includes('تسجيل الخروج')) {
          console.warn(`⚠️ عنصر شخصي في القائمة الرئيسية: ${text}`);
        }
      });
      
      // التحقق من وجود أزرار
      const buttons = sidebarNav.querySelectorAll('button');
      buttons.forEach((button) => {
        const text = button.textContent.trim();
        if (text.includes('تسجيل الخروج') || text.includes('الإعدادات')) {
          console.warn(`⚠️ زر شخصي في القائمة الرئيسية: ${text}`);
        }
      });
    } else {
      console.log('❌ لم يتم العثور على القائمة الجانبية');
    }
  };
  
  // التحقق عند فتح القائمة
  document.addEventListener('click', function(e) {
    const menuButton = e.target.closest('[aria-label="القائمة الرئيسية"], .menu-button, button');
    if (menuButton && menuButton.querySelector('.lucide-menu, svg')) {
      console.log('🎯 تم النقر على زر القائمة');
      setTimeout(checkSidebar, 500);
    }
  });
  
  // التحقق الفوري
  setTimeout(checkSidebar, 1000);
});
