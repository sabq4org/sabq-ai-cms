// معالج آمن لـ console logs لتجنب الأخطاء في الإنتاج

export const safeConsole = {
  log: (...args: any[]) => {
    if (typeof window !== 'undefined' && console && console.log) {
      try {
        console.log(...args);
      } catch (error) {
        // تجاهل أخطاء console
      }
    }
  },
  
  warn: (...args: any[]) => {
    if (typeof window !== 'undefined' && console && console.warn) {
      try {
        console.warn(...args);
      } catch (error) {
        // تجاهل أخطاء console
      }
    }
  },
  
  error: (...args: any[]) => {
    if (typeof window !== 'undefined' && console && console.error) {
      try {
        console.error(...args);
      } catch (error) {
        // تجاهل أخطاء console
      }
    }
  }
};

// للاستخدام في Server Components
export const serverConsole = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  
  error: (...args: any[]) => {
    console.error(...args);
  }
}; 