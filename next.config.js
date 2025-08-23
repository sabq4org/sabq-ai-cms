/** @type {import('next').NextConfig} */
// FORCE REBUILD: 2025-08-15T21:02 - Emergency deployment
const nextConfig = {
  // إضافة معرف فريد للملفات الثابتة
  generateBuildId: async () => {
    return "build-" + Date.now();
  },

  // تعطيل التخزين المؤقت للتطوير
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },

  // Note: api config moved to individual route handlers

  experimental: {
    // تبسيط الإعدادات التجريبية
    webpackBuildWorker: true,
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
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
    formats: ["image/webp", "image/avif"], // إضافة avif للأداء الأفضل
    minimumCacheTTL: 300, // cache لمدة 5 دقائق
    deviceSizes: [640, 750, 1080, 1920], // تقليل الأحجام
    imageSizes: [16, 32, 64, 128, 256], // تبسيط الأحجام
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // تقليل التايم أوت
    loader: "default",
    loaderFile: undefined,
    // تفعيل تحسين الصور لتحسين الأداء
    unoptimized: false,
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

  // Headers للتحكم في التخزين المؤقت
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/api/featured-news",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=300, stale-while-revalidate=59",
          },
        ],
      },
    ];
  },

  // تحسين Webpack للأداء - مبسط للتطوير
  webpack: (config, { dev, isServer }) => {
    // إضافة استثناءات للمكتبات المشاكسة
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // تحسين bundle size للإنتاج فقط
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all",
          },
          common: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // إزالة devtool customization لتجنب التحذيرات
    // if (dev) {
    //   config.devtool = "eval-cheap-module-source-map";
    // }

    return config;
  },

  // نقل serverComponentsExternalPackages خارج experimental
  serverExternalPackages: ["sharp"],

  // تحسينات الأداء لحل مشاكل Build Timeouts
  productionBrowserSourceMaps: false,

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
    ];
  },
};

module.exports = nextConfig;
