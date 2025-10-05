/** @type {import('next').NextConfig} */

// Detect deployment platform
const isCloudflare = process.env.CF_PAGES === '1' || process.env.CLOUDFLARE_ENV;
const isVercel = process.env.VERCEL === '1';

console.log('🚀 Platform Detection:', { isCloudflare, isVercel, env: process.env.NODE_ENV });

// ULTRA FAST CLOUDFLARE EDGE CONFIGURATION
const nextConfig = {
  // Force dynamic rendering for edge optimization
  generateBuildId: async () => {
    return "edge-" + Date.now();
  },

  // Platform-specific configuration
  ...(isCloudflare && {
    output: 'export',
    trailingSlash: true,
    experimental: {
      runtime: 'experimental-edge',
    },
  }),

  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [640, 750, 1080, 1920],
    imageSizes: [16, 32, 64, 128, 256],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: isCloudflare, // Let Cloudflare handle optimization, Vercel handle its own
    remotePatterns: [
      {
        protocol: "https",
        hostname: "REPLACE_WITH_R2_PUBLIC_DOMAIN",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "REPLACE_WITH_CF_IMAGES_DOMAIN",
        pathname: "/**",
      },
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

  // تحسين الكمبايل
  compiler: {
    // Production optimizations only
    ...(process.env.NODE_ENV === 'production' && {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    }),
  },

  // Ultra-fast headers for Edge optimization
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=30, stale-while-revalidate=300",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=60",
          },
        ],
      },
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
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control", 
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=60",
          },
        ],
      },
    ];
  },

  // تحسين Webpack للأداء
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

    return config;
  },

  // Externals for server optimization
  serverExternalPackages: ["sharp"],

  // تحسينات الأداء لحل مشاكل Build Timeouts
  productionBrowserSourceMaps: false,
  
  // تعطيل source maps في التطوير لتقليل طلبات 404
  devIndicators: {
    buildActivityPosition: 'bottom-right',
    appIsrStatus: false,
  },

  // زيادة timeout للصفحات الثقيلة
  staticPageGenerationTimeout: 90,

  // Build optimizations
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
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
