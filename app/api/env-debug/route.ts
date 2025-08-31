import { NextResponse } from 'next/server';

export async function GET() {
  // عرض متغير DATABASE_URL بشكل آمن للتشخيص
  const dbUrl = process.env.DATABASE_URL || '';
  
  let dbInfo = {
    exists: Boolean(dbUrl),
    length: dbUrl.length,
    startsWithPostgres: dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'),
    containsDollarBrace: dbUrl.includes('${'),
    firstChars: dbUrl.substring(0, 20),
    lastChars: dbUrl.length > 20 ? dbUrl.substring(dbUrl.length - 10) : '',
  };
  
  // فحص متغيرات أخرى محتملة
  const alternativeVars = {
    POSTGRES_URL: process.env.POSTGRES_URL ? 'موجود' : 'غير موجود',
    POSTGRES_URI: process.env.POSTGRES_URI ? 'موجود' : 'غير موجود', 
    POSTGRES_DATABASE_URL: process.env.POSTGRES_DATABASE_URL ? 'موجود' : 'غير موجود',
    DB_URL: process.env.DB_URL ? 'موجود' : 'غير موجود',
    POSTGRES_URI_INTERNAL: process.env.POSTGRES_URI_INTERNAL ? 'موجود' : 'غير موجود'
  };
  
  // فحص جميع متغيرات البيئة التي تحتوي على "POSTGRES" أو "DATABASE"
  const relevantEnvVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.includes('POSTGRES') || key.includes('DATABASE') || key.includes('DB_')) {
      // إخفاء القيم الحساسة
      relevantEnvVars[key] = value ? `${value.substring(0, 15)}...` : 'فارغ';
    }
  }
  
  return NextResponse.json({
    databaseUrl: dbInfo,
    alternativeVars,
    allDatabaseVars: relevantEnvVars,
    northflankInfo: {
      isNorthflank: process.env.NORTHFLANK === 'true',
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT
    }
  });
}
