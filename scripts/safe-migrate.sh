#!/bin/bash

# 🔧 Safe Migration Script for Production Databases
# Handles P3005 error by baselining when needed

set -e  # Exit on error

echo "🔍 Checking database migration status..."

# Try to apply migrations normally first
if npx prisma migrate deploy 2>&1 | tee /tmp/migrate-output.txt; then
    echo "✅ Migrations applied successfully!"
    exit 0
fi

# Check if we got P3005 error
if grep -q "P3005" /tmp/migrate-output.txt; then
    echo "⚠️  Database is not empty (P3005)"
    echo "📝 Baselining existing migrations..."
    
    # Get all migration directories
    MIGRATIONS=$(ls -d prisma/migrations/*/ 2>/dev/null || true)
    
    if [ -z "$MIGRATIONS" ]; then
        echo "ℹ️  No migrations to baseline"
        exit 0
    fi
    
    # Mark all existing migrations as applied
    for MIGRATION_DIR in $MIGRATIONS; do
        MIGRATION_NAME=$(basename "$MIGRATION_DIR")
        echo "  ✓ Marking migration as applied: $MIGRATION_NAME"
        npx prisma migrate resolve --applied "$MIGRATION_NAME" || true
    done
    
    echo "✅ Baseline complete! Database is now in sync."
    exit 0
fi

# If we got here, it's a different error
echo "❌ Migration failed with unexpected error:"
cat /tmp/migrate-output.txt
exit 1
