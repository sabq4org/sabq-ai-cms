import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // منع انقطاع الاتصال
  // @ts-ignore
  __internal: {
    engine: {
      binaryTarget: undefined
    }
  }
})

// تأكد من الاتصال عند بدء التطبيق
if (!globalForPrisma.prismaConnected) {
  prisma.$connect().then(() => {
    console.log('✅ Prisma متصل بنجاح')
    globalForPrisma.prismaConnected = true
  }).catch((error) => {
    console.error('❌ خطأ في اتصال Prisma:', error)
  })
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// معالجة انقطاع الاتصال
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
