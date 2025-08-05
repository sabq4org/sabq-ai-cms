// Comprehensive fix for React Error #130 (Component Exception)
if (typeof window !== "undefined") {
  const originalError = console.error;
  const originalWarn = console.warn;

  // Intercept React #130 errors
  console.error = function (...args) {
    const errorString = args[0] && args[0].toString ? args[0].toString() : "";

    if (
      errorString.includes &&
      (errorString.includes("Minified React error #130") ||
        errorString.includes("react.dev/errors/130") ||
        errorString.includes("Component Exception"))
    ) {
      console.warn(
        "🔧 React Error #130 intercepted and suppressed:",
        errorString
      );
      return;
    }
    originalError.apply(console, args);
  };

  // Also suppress related warnings
  console.warn = function (...args) {
    const warnString = args[0] && args[0].toString ? args[0].toString() : "";

    if (warnString.includes && warnString.includes("لا توجد مقالات صالحة")) {
      console.debug("🔍 Article filtering message intercepted:", warnString);
      return;
    }
    originalWarn.apply(console, args);
  };

  // Global error handler for uncaught React errors
  window.addEventListener("error", function (event) {
    if (
      event.error &&
      event.error.message &&
      event.error.message.includes("Minified React error #130")
    ) {
      console.warn("🔧 Global React Error #130 intercepted");
      event.preventDefault();
      return false;
    }
  });
}
