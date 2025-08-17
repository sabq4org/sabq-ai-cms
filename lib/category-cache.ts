// كاش مشترك للتصنيفات
export const categoryCache = {
  data: null as any,
  timestamp: 0,
  duration: 5 * 60 * 1000, // 5 دقائق
  
  // مسح الكاش
  clear() {
    console.log('🧹 مسح كاش التصنيفات...');
    this.data = null;
    this.timestamp = 0;
  },
  
  // التحقق من صلاحية الكاش
  isValid() {
    return this.data && Date.now() - this.timestamp < this.duration;
  },
  
  // حفظ في الكاش
  set(data: any) {
    this.data = data;
    this.timestamp = Date.now();
    console.log('💾 تم حفظ التصنيفات في الكاش');
  }
}; 