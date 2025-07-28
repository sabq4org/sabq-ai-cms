import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // قراءة ملف النسخة
    const versionPath = path.join(process.cwd(), 'app-version.json');
    const versionData = fs.readFileSync(versionPath, 'utf8');
    const versionInfo = JSON.parse(versionData);

    // إضافة معلومات إضافية
    const response = {
      ...versionInfo,
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version,
      nextjsVersion: '15.4.1'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ خطأ في قراءة معلومات النسخة:', error);
    return NextResponse.json(
      { 
        error: 'فشل في قراءة معلومات النسخة',
        fallback: {
          version: '2.1.0-categories-management',
          status: 'error',
          serverTime: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
