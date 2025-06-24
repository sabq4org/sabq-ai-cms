import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // إعدادات webpack لحل مشاكل الملفات المفقودة
  webpack: (config, { isServer }) => {
    // تعطيل cache في بيئة التطوير
    if (!isServer) {
      config.cache = false;
    }
    
    // إضافة fallback للملفات المفقودة
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
  // إعدادات إضافية
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
