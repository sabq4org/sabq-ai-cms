/** @type {import('next').NextConfig} */
const nextConfig = {
  // إضافة معرف فريد للملفات الثابتة
  generateBuildId: async () => {
    return "build-" + Date.now();
  },

  // Note: api config moved to individual route handlers

  experimental: {
    // Experimental support for optimizing stylesheets
    optimizeCss: {
      files: ["styles/globals.css", "styles/ArabicStyles.css"],
      preload: false, // منع التحميل المسبق للـ CSS
    },
    cssChunking: "strict",
    // turbo config moved to turbopack object
    webpackBuildWorker: true,
    // تحسين التحميل
    ppr: false,
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
    // تمكين التحسين لحل مشكلة عرض الصور
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
    ],
  },

  // تحسين الكمبايل
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
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
};

module.exports = nextConfig;
