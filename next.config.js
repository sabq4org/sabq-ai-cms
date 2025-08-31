/** @type {import('next').NextConfig} */
// NORTHFLANK DEPLOYMENT: 2025-08-30 - Database migration to Northflank
const nextConfig = {
  // إعداد standalone output لـ Northflank
  output: 'standalone',
  
  // إضافة معرف فريد للملفات الثابتة
  generateBuildId: async () => {
    return "build-" + Date.now();
  },

  // تعطيل التخزين المؤقت للتطوير - تم نقله لأسفل

  // Note: api config moved to individual route handlers

  experimental: {
    // تحسينات الأداء المتقدمة
    webpackBuildWorker: true,
    
    // تحسين imports للمكتبات الكبيرة - الأولوية العليا
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@headlessui/react',
      'framer-motion',
      'react-hot-toast',
      '@tanstack/react-query',
      'date-fns'
    ],
    
    // تحسين Bundle Size
    bundlePagesRouterDependencies: true,
    optimizeCss: true,
    
    // تحسين Cache للصفحات
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    
    // تحسين CSS
    optimizeCss: true
  },

  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  images: {
    formats: ["image/avif", "image/webp"], // أولوية للـ AVIF ثم WebP
    minimumCacheTTL: 86400, // 24 ساعة بدلاً من 5 دقائق
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // أحجام محسنة
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // أحجام responsive
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: "default",
    loaderFile: undefined,
    unoptimized: false,
    // إضافة domains للأداء الأفضل
    domains: [
      "res.cloudinary.com",
      "images.unsplash.com",
      "sabq-cms-content.s3.amazonaws.com",
      "ui-avatars.com",
      "cdn.sabq.org",
      "sabq-prod.imgix.net"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sabq-cms-content.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sabq-cms-content.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sabq-ai-cms-images.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sabq-ai-cms-images.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "d2kdkzp4dtcikk.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sabq.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sabq-prod.imgix.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sabq-storage.s3.amazonaws.com",
        pathname: "/**",
      },
      // السماح بعرض الصور من دومين الموقع مباشرةً
      {
        protocol: "https",
        hostname: "sabq.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.sabq.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
  },

  // تحسين الكمبايل - إزالة removeConsole لتجنب التعارض
  compiler: {
    // لا نحتاج إزالة console.log في بيئة التطوير
  },

  // Headers محسنة للأداء والتخزين المؤقت
  async headers() {
    return [
      // API Routes - cache قصير مع revalidation
      {
        source: "/api/news/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, max-age=30, stale-while-revalidate=120",
          },
        ],
      },
      {
        source: "/api/articles/:path*", 
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, max-age=60, stale-while-revalidate=600",
          },
        ],
      },
      // Static Assets - cache طويل
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control", 
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Pages - cache ديناميكي حسب البيئة
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: process.env.NODE_ENV === 'development' 
              ? "no-store, no-cache, must-revalidate"
              : "public, s-maxage=60, max-age=30, stale-while-revalidate=120",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://va.vercel-scripts.com https://vercel.live wss:; frame-src 'self' https://vercel.live;",
          },
          // إضافة headers للأداء
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin"
          }
        ],
      },
    ];
  },

  // تحسين Webpack للأداء العالي
  webpack: (config, { dev, isServer }) => {
    // إضافة استثناءات للمكتبات المشاكسة
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // تحسينات للإنتاج
    if (!dev) {
      // تحسين Bundle Splitting
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: "all",
          cacheGroups: {
            // React vendor chunk منفصل
            react: {
              name: "react-vendor",
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              chunks: "all",
              priority: 30,
            },
            // UI Libraries chunk
            ui: {
              name: "ui-vendor", 
              test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|lucide-react)[\\/]/,
              chunks: "all",
              priority: 25,
            },
            // Other vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendor",
              chunks: "all",
              priority: 20,
            },
            // Common code chunk
            common: {
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        };
      }
      
      // تحسين Performance Budget
      config.performance = {
        maxAssetSize: 250000, // 250KB
        maxEntrypointSize: 250000,
        hints: "warning"
      };
    }

    return config;
  },

  // نقل serverComponentsExternalPackages خارج experimental
  serverExternalPackages: ["sharp"],

  // تحسينات الأداء لحل مشاكل Build Timeouts
  productionBrowserSourceMaps: false,
  
  // تعطيل source maps في التطوير لتقليل طلبات 404
  devIndicators: {
    position: 'bottom-right',
  },

  // زيادة timeout للصفحات الثقيلة
  staticPageGenerationTimeout: 90,

  // تعطيل type checking أثناء البناء (مؤقتاً)
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // معالجة مراجع الصوت النسبية مثل /some/path/test.mp3 → /test.mp3
  async rewrites() {
    return [
      {
        source: '/:path*/test.mp3',
        destination: '/test.mp3',
      },
      // توجيه placeholder الخاص بالأخبار إلى الصورة الافتراضية الحالية
      {
        source: '/system/placeholders/news-default.png',
        destination: '/images/placeholder-featured.jpg',
      },
    ];
  },
};

module.exports = nextConfig;
