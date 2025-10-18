#!/usr/bin/env node

/**
 * 🔧 Safe Migration Script (Node.js version)
 * Handles P3005 error by baselining when needed, but only for older migrations.
 * Then applies the latest migration(s) normally.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf-8', ...opts });
}

function listMigrations() {
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  if (!fs.existsSync(migrationsDir)) return [];
  return fs
    .readdirSync(migrationsDir)
    .filter((name) => {
      const fullPath = path.join(migrationsDir, name);
      return fs.statSync(fullPath).isDirectory() && name !== 'migration_lock.toml';
    })
    .sort();
}

function baselineAllExceptLatest(migrations) {
  if (migrations.length <= 1) return; // nothing to baseline if only one
  const toBaseline = migrations.slice(0, -1); // all except the last
  for (const migration of toBaseline) {
    try {
      console.log(`  ✓ Marking migration as applied: ${migration}`);
      run(`npx prisma migrate resolve --applied "${migration}"`);
    } catch (err) {
      console.log(`    (skip) ${migration}: ${err.message?.split('\n')[0] || 'already applied'}`);
    }
  }
}

async function safeMigrate() {
  console.log('🔍 Checking database migration status...\n');

  try {
    const out = run('npx prisma migrate deploy');
    console.log(out);
    console.log('\n✅ Migrations applied successfully!');
    process.exit(0);
  } catch (error) {
    const errorOutput = error.message || error.stderr?.toString() || error.stdout?.toString() || '';

    if (errorOutput.includes('P3005') || /database schema is not empty/i.test(errorOutput)) {
      console.log('\n⚠️  Database is not empty (P3005)');
      console.log('📝 Baselining existing migrations (all except latest)...\n');

      const migrations = listMigrations();
      if (migrations.length === 0) {
        console.log('ℹ️  No migrations to baseline');
        process.exit(0);
      }

      baselineAllExceptLatest(migrations);

      // Now try to apply the latest migration(s)
      try {
        const out2 = run('npx prisma migrate deploy');
        console.log(out2);
        console.log('\n✅ Baseline complete and latest migrations applied!');
        process.exit(0);
      } catch (err2) {
        console.error('\n❌ Failed to apply latest migrations after baseline:');
        console.error(err2.message || err2.stderr?.toString() || err2.stdout?.toString() || err2);
        process.exit(1);
      }
    }

    console.error('\n❌ Migration failed with unexpected error:');
    console.error(errorOutput);
    process.exit(1);
  }
}

safeMigrate().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
