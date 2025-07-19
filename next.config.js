/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  serverExternalPackages: ['prisma', '@prisma/client'],

  // إعدادات الصور
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.sabq.org',
      },
      {
        protocol: 'https',
        hostname: 'www.sabq.org',
      },
      {
        protocol: 'https',
        hostname: 'sabq.org',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sabq.org',
      },
      {
        protocol: 'https',
        hostname: 'sabq-bucket.fra1.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'sabq-bucket.nyc3.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'sabq-bucket.sgp1.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'sabq-bucket.ams3.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'sabq-bucket.sfo3.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'fra1.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },

  // إعادة توجيه الصور الفاشلة
  async rewrites() {
    return [
      {
        source: '/images/failed/:path*',
        destination: '/images/placeholder.jpg',
      },
    ];
  },

  // إعدادات بسيطة
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },

  // تخطي أخطاء البناء
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // إعدادات CSS محسّنة
  experimental: {
    optimizeCss: true,
    cssChunking: 'strict',
  },

  // تحسين الأداء
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Headers لتحسين التحميل
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // إعادة التوجيه
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/preferences',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig 