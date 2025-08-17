
// إضافة debugging للمتصفح
if (typeof window !== 'undefined') {
  window.sabqDebug = {
    logs: [],
    addLog: function(message, data) {
      const log = { timestamp: new Date().toISOString(), message, data };
      this.logs.push(log);
      console.log('🔍 SABQ Debug:', message, data);
      
      // الاحتفاظ بآخر 100 log فقط
      if (this.logs.length > 100) {
        this.logs = this.logs.slice(-100);
      }
    },
    getLogs: function() {
      return this.logs;
    },
    exportLogs: function() {
      const blob = new Blob([JSON.stringify(this.logs, null, 2)], 
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sabq-debug-logs.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  // تسجيل أخطاء JavaScript العامة
  window.addEventListener('error', function(e) {
    window.sabqDebug.addLog('JavaScript Error', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error?.stack
    });
  });
  
  // تسجيل Unhandled Promise Rejections
  window.addEventListener('unhandledrejection', function(e) {
    window.sabqDebug.addLog('Unhandled Promise Rejection', {
      reason: e.reason,
      promise: e.promise
    });
  });
  
  console.log('🛠️ SABQ Debug tools loaded. Use window.sabqDebug for debugging.');
}