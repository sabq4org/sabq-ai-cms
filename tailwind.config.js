/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        arabic: [
          "var(--font-ibm-plex-arabic)",
          "IBM Plex Sans Arabic",
          "Tajawal",
          "Noto Sans Arabic",
          "system-ui",
          "sans-serif",
        ],
        sans: [
          "var(--font-ibm-plex-arabic)",
          "IBM Plex Sans Arabic", 
          "Tajawal",
          "Noto Sans Arabic",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        // لوحة ألوان هوية "سبق الذكية" - النظام المحسّن
        brand: {
          // الألوان الأساسية (Primary Colors)
          primary: '#172554',      // Navy Blue - للعناوين والعناصر الرئيسية
          primaryFg: '#FFFFFF',    // White - نص على الأساسي
          primaryLight: '#1e3a8a', // Navy Blue Light
          primaryDark: '#0f172a',  // Navy Blue Dark
          
          // الألوان الثانوية (Secondary Colors)
          secondary: '#f1f5f9',    // Slate Gray - للخلفيات والبطاقات
          secondaryFg: '#0f172a',  // Dark text on secondary
          secondaryDark: '#e2e8f0',
          
          // لون التمييز (Accent Color)
          accent: '#10b981',       // Emerald Green - للأزرار والمؤشرات الذكية
          accentFg: '#FFFFFF',     // White text on accent
          accentLight: '#34d399',
          accentDark: '#059669',
          
          // ألوان الحالات
          danger: '#DC2626',
          warning: '#f59e0b',
          success: '#10b981',
          info: '#0ea5e9',
          
          // الخلفيات والحدود
          bg: '#FFFFFF',
          surface: '#F8F8F7',
          border: '#e5e7eb',
          borderLight: '#f3f4f6',
          
          // النصوص
          fg: '#0F172A',           // نص أساسي داكن
          fgMuted: '#64748b',      // نص ثانوي
          fgLight: '#94a3b8',      // نص فاتح
          
          ring: '#93C5FD',
        },
        // خلفية المشروع الموحدة
        background: {
          primary: "#f8f8f7",
          secondary: "#F5F5F5",
        },
        
        // ألوان ناعمة مريحة للعين
        soft: {
          cream: "#FAFAF9",
          white: "#F7F7F5",
          gray: "#F5F5F4",
          beige: "#F9F7F4",
        },

        // ألوان جرعة الأساسية
        "jura-primary": {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        "jura-secondary": {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        "jura-success": "#10b981",
        "jura-warning": "#f59e0b",
        "jura-error": "#ef4444",
        "jura-info": "#8b5cf6",

        // الألوان الأصلية للمشروع
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "16px",
      },
      fontFamily: {
        sans: [
          "var(--font-ibm-plex-arabic)",
          "IBM Plex Sans Arabic",
          "system-ui",
          "sans-serif",
        ],
        arabic: [
          "var(--font-ibm-plex-arabic)",
          "IBM Plex Sans Arabic",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        "jura-sm": "0 2px 8px rgba(0, 0, 0, 0.04)",
        "jura-md": "0 10px 40px rgba(0, 0, 0, 0.08)",
        "jura-lg": "0 20px 60px rgba(0, 0, 0, 0.12)",
        "jura-colored": "0 20px 60px rgba(59, 130, 246, 0.15)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("tailwindcss-rtl"), require("@tailwindcss/typography")],
};
