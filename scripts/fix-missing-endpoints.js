const fs = require("fs");
const path = require("path");

// إنشاء endpoints مفقودة لتجنب أخطاء 404

const missingEndpoints = [
  {
    path: "app/api/categories/sports/route.ts",
    content: `import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to main categories
  return NextResponse.redirect(new URL('/categories', process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.io'));
}`,
  },
  {
    path: "app/api/categories/tech/route.ts",
    content: `import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to main categories
  return NextResponse.redirect(new URL('/categories', process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.io'));
}`,
  },
  {
    path: "app/api/categories/economy/route.ts",
    content: `import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to main categories
  return NextResponse.redirect(new URL('/categories', process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.io'));
}`,
  },
  {
    path: "app/api/categories/cars/route.ts",
    content: `import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to main categories
  return NextResponse.redirect(new URL('/categories', process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.io'));
}`,
  },
  {
    path: "app/api/categories/ads/route.ts",
    content: `import { NextResponse } from 'next/server';

export async function GET() {
  // Empty response for ads (handled by ad provider)
  return NextResponse.json({ ads: [] });
}`,
  },
  {
    path: "app/api/categories/subscriptions/route.ts",
    content: `import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder for subscriptions
  return NextResponse.json({
    subscriptions: [],
    message: 'Subscriptions feature coming soon'
  });
}`,
  },
  {
    path: "app/api/categories/archive/route.ts",
    content: `import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to main archive
  return NextResponse.redirect(new URL('/audio-archive', process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.io'));
}`,
  },
];

// إنشاء الملفات
missingEndpoints.forEach((endpoint) => {
  const filePath = path.join(process.cwd(), endpoint.path);
  const dir = path.dirname(filePath);

  // إنشاء المجلد إذا لم يكن موجود
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // كتابة الملف
  fs.writeFileSync(filePath, endpoint.content);
  console.log(`✅ تم إنشاء: ${endpoint.path}`);
});

console.log("\n✅ تم إنشاء جميع الـ endpoints المفقودة!");
