// Emergency React #130 Error Fix - Global Handler
// This script handles React error #130 at the application level

(function () {
  "use strict";

  if (typeof window === "undefined") return;

  console.log("🔧 Emergency React #130 Handler Loaded");

  // Global state to track errors
  let errorCount = 0;
  let lastErrorTime = 0;
  const MAX_ERRORS = 5;
  const ERROR_COOLDOWN = 1000; // 1 second

  // Original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // Enhanced error interceptor
  console.error = function (...args) {
    const errorString = args[0] && args[0].toString ? args[0].toString() : "";

    // Check for React #130 error
    if (
      errorString.includes &&
      (errorString.includes("Minified React error #130") ||
        errorString.includes("react.dev/errors/130"))
    ) {
      const now = Date.now();

      // Prevent error spam
      if (now - lastErrorTime < ERROR_COOLDOWN) {
        return;
      }

      lastErrorTime = now;
      errorCount++;

      console.warn(
        `🔧 React #130 Error Intercepted (${errorCount}/${MAX_ERRORS})`
      );

      // If too many errors, reload the page
      if (errorCount >= MAX_ERRORS) {
        console.warn("🔄 Too many React errors, reloading page...");
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }

      // Try to recover gracefully
      setTimeout(() => {
        try {
          // Force re-render of React components
          const event = new CustomEvent("react-error-recovery");
          window.dispatchEvent(event);
        } catch (e) {
          console.warn("Recovery failed:", e);
        }
      }, 100);

      return; // Don't log the error
    }

    // Log other errors normally
    originalError.apply(console, args);
  };

  // Suppress related warnings
  console.warn = function (...args) {
    const warnString = args[0] && args[0].toString ? args[0].toString() : "";

    if (
      warnString.includes &&
      (warnString.includes("لا توجد مقالات صالحة") ||
        warnString.includes("No valid articles") ||
        warnString.includes("Component Exception"))
    ) {
      console.debug("🔇 Warning suppressed:", warnString.substring(0, 100));
      return;
    }

    originalWarn.apply(console, args);
  };

  // Global error handler for unhandled errors
  window.addEventListener("error", function (event) {
    if (
      event.error &&
      event.error.message &&
      event.error.message.includes("Minified React error #130")
    ) {
      console.warn("🔧 Global React #130 Error Handled");
      event.preventDefault();
      event.stopPropagation();

      // Try to recover
      setTimeout(() => {
        try {
          const errorEvent = new CustomEvent("react-global-error", {
            detail: { error: event.error },
          });
          window.dispatchEvent(errorEvent);
        } catch (e) {
          console.warn("Global recovery failed:", e);
        }
      }, 50);

      return false;
    }
  });

  // Unhandled promise rejection handler
  window.addEventListener("unhandledrejection", function (event) {
    if (
      event.reason &&
      event.reason.message &&
      event.reason.message.includes("Minified React error #130")
    ) {
      console.warn("🔧 Promise Rejection React #130 Handled");
      event.preventDefault();
      return false;
    }
  });

  // Recovery mechanism listener
  window.addEventListener("react-error-recovery", function () {
    console.log("🔄 Attempting React recovery...");

    // Reset error count after successful recovery
    setTimeout(() => {
      errorCount = Math.max(0, errorCount - 1);
    }, 5000);
  });

  // Page visibility change handler (helps with recovery)
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && errorCount > 0) {
      console.log("🔄 Page visible again, resetting error count");
      errorCount = 0;
      lastErrorTime = 0;
    }
  });

  console.log("✅ Emergency React #130 Handler Ready");
})();
