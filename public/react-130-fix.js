
// Temporary fix for React Error #130
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args) {
    if (args[0] && args[0].includes && args[0].includes('Minified React error #130')) {
      console.warn('🔧 React Error #130 detected and suppressed');
      return;
    }
    originalError.apply(console, args);
  };
}
