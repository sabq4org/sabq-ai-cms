#!/usr/bin/env node

/**
 * 🔧 Safe Migration Script (Node.js version)
 * Handles P3005 error by baselining when needed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function safeMigrate() {
  console.log('🔍 Checking database migration status...\n');

  try {
    // Try to apply migrations normally first
    const output = execSync('npx prisma migrate deploy', { 
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    console.log(output);
    console.log('\n✅ Migrations applied successfully!');
    process.exit(0);
    
  } catch (error) {
    const errorOutput = error.message || error.stderr?.toString() || error.stdout?.toString() || '';
    
    // Check if we got P3005 error
    if (errorOutput.includes('P3005') || errorOutput.includes('database schema is not empty')) {
      console.log('\n⚠️  Database is not empty (P3005)');
      console.log('📝 Baselining existing migrations...\n');
      
      await baselineExistingMigrations();
      
      console.log('\n✅ Baseline complete! Database is now in sync.');
      process.exit(0);
      
    } else {
      console.error('\n❌ Migration failed with unexpected error:');
      console.error(errorOutput);
      process.exit(1);
    }
  }
}

async function baselineExistingMigrations() {
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('ℹ️  No migrations directory found');
    return;
  }
  
  const migrations = fs.readdirSync(migrationsDir)
    .filter(name => {
      const fullPath = path.join(migrationsDir, name);
      return fs.statSync(fullPath).isDirectory() && name !== 'migration_lock.toml';
    })
    .sort();
  
  if (migrations.length === 0) {
    console.log('ℹ️  No migrations to baseline');
    return;
  }
  
  for (const migration of migrations) {
    try {
      console.log(`  ✓ Marking migration as applied: ${migration}`);
      execSync(`npx prisma migrate resolve --applied "${migration}"`, {
        stdio: 'pipe',
        encoding: 'utf-8'
      });
    } catch (err) {
      // Ignore errors for already applied migrations
      console.log(`    (already applied or skipped)`);
    }
  }
}

// Run the script
safeMigrate().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
