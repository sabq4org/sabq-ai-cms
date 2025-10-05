/**
 * Script to check and create admin_announcements table
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndCreateAdminAnnouncementsTable() {
  try {
    console.log('🔍 Checking if admin_announcements table exists...');
    
    // Try to query the table
    try {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'admin_announcements'
        );
      `;
      
      const tableExists = result[0]?.exists;
      console.log('Table exists:', tableExists);
      
      if (!tableExists) {
        console.log('⚠️  Table does not exist. Running Prisma db push...');
        
        // Use Prisma CLI to push the schema
        const { execSync } = require('child_process');
        execSync('npx prisma db push --accept-data-loss', {
          stdio: 'inherit',
          cwd: process.cwd()
        });
        
        console.log('✅ Database schema pushed successfully');
      } else {
        console.log('✅ admin_announcements table already exists');
      }
      
      // Test a simple query
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM admin_announcements;
      `;
      
      console.log('📊 Current announcements count:', count[0]?.count || 0);
      
    } catch (error) {
      console.error('❌ Error checking table:', error.message);
      
      if (error.message.includes('does not exist')) {
        console.log('🔧 Creating table using Prisma push...');
        
        const { execSync } = require('child_process');
        try {
          execSync('npx prisma db push --accept-data-loss', {
            stdio: 'inherit',
            cwd: process.cwd()
          });
          console.log('✅ Table created successfully');
        } catch (pushError) {
          console.error('❌ Failed to create table:', pushError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdminAnnouncementsTable();
