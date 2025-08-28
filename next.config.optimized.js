/** @type {import('next').NextConfig} */
const nextConfig = {
  // تحسينات الأداء العامة
  experimental: {
    // تحسين imports للمكتبات الكبيرة
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@headlessui/react',
      'framer-motion',
      'react-hot-toast'
    ],
    
    // تحسين Server Components
    serverComponentsExternalPackages: [
      'prisma',
      '@prisma/client'
    ],
    
    // تحسين الـ bundling
    bundlePagesRouterDependencies: true,
    
    // تحسين CSS
    optimizeCss: true,
    
    // تحسين الخطوط
    optimizeServerReact: true,
    
    // تحسين الصور
    images: {
      allowFutureImage: true
    }
  },

  // تحسينات الصور
  images: {
    // تنسيقات الصور المحسنة
    formats: ['image/webp', 'image/avif'],
    
    // أحجام الأجهزة المختلفة
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // أحجام الصور المختلفة
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // جودة الصور الافتراضية
    quality: 85,
    
    // تحسين الصور الخارجية
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sabq.org',
        port: '',
        pathname: '/**',
      }
    ],
    
    // تحسين التحميل
    loader: 'default',
    loaderFile: '',
    
    // تحسين الـ cache
    minimumCacheTTL: 60 * 60 * 24 * 7, // أسبوع
    
    // تحسين الأمان
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // تحسينات الـ bundling
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // تحسين الـ bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // مكتبات React منفصلة
          react: {
            name: 'react',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 20,
          },
          // مكتبات UI منفصلة
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|lucide-react)[\\/]/,
            priority: 15,
          },
          // مكتبات أخرى
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
        },
      };
    }

    // تحسين الـ aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };

    // تحسين الـ performance
    config.performance = {
      maxAssetSize: 250000,
      maxEntrypointSize: 250000,
    };

    return config;
  },

  // تحسينات الـ compression
  compress: true,
  
  // تحسينات الـ headers
  async headers() {
    return [
      // تحسين cache للـ static assets
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // تحسين الأمان
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // تحسينات الـ redirects
  async redirects() {
    return [
      // إعادة توجيه الروابط القديمة
      {
        source: '/article/:id',
        destination: '/news/:id',
        permanent: true,
      },
    ];
  },

  // تحسينات الـ rewrites
  async rewrites() {
    return [
      // تحسين SEO للصور
      {
        source: '/images/:path*',
        destination: '/_next/image/:path*',
      },
    ];
  },

  // تحسينات الـ build
  generateBuildId: async () => {
    // استخدام timestamp للـ build ID
    return `build-${Date.now()}`;
  },

  // تحسينات الـ output
  output: 'standalone',
  
  // تحسينات الـ TypeScript
  typescript: {
    // تجاهل أخطاء TypeScript في الـ build (للسرعة)
    ignoreBuildErrors: false,
  },

  // تحسينات الـ ESLint
  eslint: {
    // تجاهل أخطاء ESLint في الـ build (للسرعة)
    ignoreDuringBuilds: false,
  },

  // تحسينات الـ SWC
  swcMinify: true,
  
  // تحسينات الـ runtime
  poweredByHeader: false,
  
  // تحسينات الـ trailing slash
  trailingSlash: false,
  
  // تحسينات الـ etag
  generateEtags: true,
  
  // تحسينات الـ page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // تحسينات الـ environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // تحسينات الـ public runtime config
  publicRuntimeConfig: {
    // متغيرات عامة متاحة للعميل
  },

  // تحسينات الـ server runtime config
  serverRuntimeConfig: {
    // متغيرات خاصة بالخادم فقط
  },

  // تحسينات الـ basePath (إذا كان التطبيق في مجلد فرعي)
  // basePath: '/sabq',

  // تحسينات الـ assetPrefix (للـ CDN)
  // assetPrefix: 'https://cdn.sabq.org',

  // تحسينات الـ i18n
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
    localeDetection: true,
  },

  // تحسينات الـ API routes
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: '8mb',
    externalResolver: true,
  },

  // تحسينات الـ middleware
  skipMiddlewareUrlNormalize: false,
  skipTrailingSlashRedirect: false,

  // تحسينات الـ React
  reactStrictMode: true,
  
  // تحسينات الـ compiler
  compiler: {
    // إزالة console.log في الإنتاج
    removeConsole: process.env.NODE_ENV === 'production',
    
    // تحسين styled-components
    styledComponents: true,
  },

  // تحسينات الـ logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;

