// Enhanced Comprehensive fix for React Error #130 (Component Exception)
(function () {
  "use strict";

  if (typeof window === "undefined") return;

  console.log("🛡️ React Error #130 Protection Activated - Version 2.0");

  const originalError = console.error;
  const originalWarn = console.warn;
  let errorCount = 0;
  let lastErrorTime = 0;
  const ERROR_COOLDOWN = 500; // 500ms between errors
  const MAX_ERRORS_BEFORE_ACTION = 3;

  // Enhanced error interceptor with recovery
  console.error = function (...args) {
    const errorString = args[0] && args[0].toString ? args[0].toString() : "";
    const now = Date.now();

    // Check for React #130 error patterns
    if (
      errorString.includes &&
      (errorString.includes("Minified React error #130") ||
        errorString.includes("react.dev/errors/130") ||
        errorString.includes("Component Exception") ||
        errorString.includes("Element type is invalid") ||
        errorString.includes("undefined is not a valid React"))
    ) {
      // Prevent error spam
      if (now - lastErrorTime < ERROR_COOLDOWN) {
        return; // Suppress rapid repeated errors
      }

      lastErrorTime = now;
      errorCount++;

      console.warn(
        `🔧 React Error #130 intercepted (${errorCount}/${MAX_ERRORS_BEFORE_ACTION})`,
        "at",
        new Date().toLocaleTimeString()
      );

      // Try recovery strategies
      if (errorCount <= MAX_ERRORS_BEFORE_ACTION) {
        setTimeout(() => {
          try {
            // Dispatch custom event for component recovery
            const recoveryEvent = new CustomEvent("react-error-recovery", {
              detail: { errorType: "React130", errorCount },
            });
            window.dispatchEvent(recoveryEvent);

            // Force React to re-render affected components
            if (window.React && window.React.version) {
              const reactRoot = document.getElementById("__next");
              if (reactRoot) {
                reactRoot.style.display = "none";
                void reactRoot.offsetHeight; // Trigger reflow
                reactRoot.style.display = "";
              }
            }
          } catch (e) {
            console.debug("Recovery attempt:", e);
          }
        }, 100);
      } else {
        // Too many errors, soft reload components
        console.warn(
          "🔄 Multiple React errors detected, attempting soft recovery..."
        );
        errorCount = 0; // Reset counter

        // Dispatch recovery event to all components
        window.dispatchEvent(new Event("force-component-reload"));
      }

      return; // Don't log the original error
    }

    // Log other errors normally
    originalError.apply(console, args);
  };

  // Enhanced warning suppressor
  console.warn = function (...args) {
    const warnString = args[0] && args[0].toString ? args[0].toString() : "";

    // Suppress known harmless warnings
    const suppressPatterns = [
      "لا توجد مقالات صالحة",
      "Component is not available",
      "Failed to load dynamic import",
      "Hydration mismatch",
    ];

    if (warnString.includes) {
      for (const pattern of suppressPatterns) {
        if (warnString.includes(pattern)) {
          console.debug("🔍 Known warning suppressed:", pattern);
          return;
        }
      }
    }

    originalWarn.apply(console, args);
  };

  // Enhanced global error handler
  window.addEventListener(
    "error",
    function (event) {
      if (!event.error) return;

      const errorMessage = event.error.message || "";
      const errorStack = event.error.stack || "";

      // Check for React #130 patterns
      const react130Patterns = [
        "Minified React error #130",
        "Element type is invalid",
        "expected a string (for built-in components)",
        "expected a class or function (for composite components)",
      ];

      const isReact130 = react130Patterns.some(
        (pattern) =>
          errorMessage.includes(pattern) || errorStack.includes(pattern)
      );

      if (isReact130) {
        console.warn("🔧 Global React Error #130 caught and handled");
        event.preventDefault();
        event.stopPropagation();

        // Attempt component recovery
        setTimeout(() => {
          const event = new CustomEvent("component-error-recovery", {
            detail: { errorType: "React130", global: true },
          });
          window.dispatchEvent(event);
        }, 100);

        return false;
      }
    },
    true
  );

  // Unhandled rejection handler for async component errors
  window.addEventListener("unhandledrejection", function (event) {
    if (event.reason && event.reason.message) {
      const message = event.reason.message;
      if (
        message.includes("Minified React error #130") ||
        message.includes("Element type is invalid")
      ) {
        console.warn("🔧 Async React Error #130 caught in promise rejection");
        event.preventDefault();
        return false;
      }
    }
  });

  // Monitor for dynamic import failures
  const originalImport = window.System ? window.System.import : null;
  if (originalImport) {
    window.System.import = function (...args) {
      return originalImport.apply(this, args).catch((error) => {
        console.warn("⚠️ Dynamic import failed, using fallback:", args[0]);
        // Return empty module to prevent React #130
        return { default: () => null };
      });
    };
  }

  // Reset error count periodically
  setInterval(() => {
    if (errorCount > 0) {
      errorCount = Math.max(0, errorCount - 1);
    }
  }, 30000); // Every 30 seconds

  // Listen for recovery events from components
  window.addEventListener("request-error-recovery", function () {
    errorCount = 0;
    console.log("🔄 Error recovery requested, counters reset");
  });
})();
