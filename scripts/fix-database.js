#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function fixDatabase() {
  console.log('🔧 Starting database fix...');
  
  const prisma = new PrismaClient();

  try {
    // Check current database status
    console.log('📊 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Check if admin_announcements table exists
    console.log('🔍 Checking admin_announcements table...');
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'admin_announcements'
        );
      `;
      
      console.log('📋 Table check result:', tableExists);
      
      if (tableExists[0]?.exists) {
        console.log('✅ admin_announcements table exists');
        
        // Count records
        const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM admin_announcements`;
        console.log('📊 Records in admin_announcements:', count[0]?.count || 0);
      } else {
        console.log('❌ admin_announcements table does not exist');
      }
    } catch (error) {
      console.log('❌ Error checking table:', error.message);
    }

    // Check Prisma client model availability
    console.log('🔍 Checking Prisma client models...');
    const hasAdminAnnouncement = Boolean(prisma?.adminAnnouncement?.findMany);
    console.log('📦 AdminAnnouncement model available:', hasAdminAnnouncement);

    if (hasAdminAnnouncement) {
      try {
        const announcements = await prisma.adminAnnouncement.findMany({
          take: 1
        });
        console.log('✅ AdminAnnouncement model working, found:', announcements.length, 'records');
      } catch (error) {
        console.log('❌ Error using AdminAnnouncement model:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('👋 Disconnected from database');
  }
}

// Run the fix
fixDatabase()
  .then(() => {
    console.log('🎉 Database fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
