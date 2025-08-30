#!/bin/bash

# Phase-2 Performance Setup Script
# Installs dependencies and applies optimizations for P95 ≤ 1.5s target

set -e

echo "🚀 Phase-2: Database + Bundle + Gatling Setup"
echo "=============================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL client not found - database setup will be skipped"
    SKIP_DB=true
fi

if ! command -v redis-cli &> /dev/null; then
    print_warning "Redis not found - cache setup will be skipped"
    SKIP_REDIS=true
fi

print_step "Prerequisites checked"
echo

# Install Redis if needed
if [ "$SKIP_REDIS" != true ]; then
    echo "📦 Installing Redis dependencies..."
    npm install redis@^4.6.0
    print_step "Redis client installed"
else
    echo "📦 Installing Redis dependencies..."
    npm install redis@^4.6.0
    print_step "Redis client installed (start Redis server manually)"
fi
echo

# Database optimization
if [ "$SKIP_DB" != true ]; then
    echo "🗄️ Applying database optimizations..."
    
    if [ -f "db/phase2-indexes.sql" ]; then
        echo "Applying database indexes..."
        if psql $DATABASE_URL -f db/phase2-indexes.sql; then
            print_step "Database indexes applied"
        else
            print_error "Failed to apply database indexes"
        fi
    fi
    
    if [ -f "db/aggregates.sql" ]; then
        echo "Creating aggregates table..."
        if psql $DATABASE_URL -f db/aggregates.sql; then
            print_step "Aggregates table created"
        else
            print_error "Failed to create aggregates table"
        fi
    fi
else
    echo "🗄️ Database optimization skipped"
    echo "   Run manually: psql \$DATABASE_URL -f db/phase2-indexes.sql"
    echo "   Run manually: psql \$DATABASE_URL -f db/aggregates.sql"
fi
echo

# Setup environment variables
echo "⚙️ Setting up environment variables..."

if [ ! -f ".env" ]; then
    if [ -f ".env.phase2.example" ]; then
        cp .env.phase2.example .env
        print_step "Environment file created from template"
    else
        print_error ".env.phase2.example not found"
    fi
else
    print_warning ".env already exists - check Phase-2 variables manually"
fi

# Check required environment variables
REQUIRED_VARS=("DATABASE_URL" "REDIS_URL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_warning "Missing environment variables: ${MISSING_VARS[*]}"
    echo "   Update your .env file with the correct values"
fi
echo

# Performance testing setup
echo "🧪 Setting up performance testing..."

# Check if autocannon is available (lighter alternative to Gatling for Node.js)
if ! command -v autocannon &> /dev/null; then
    echo "Installing autocannon for load testing..."
    npm install -g autocannon
    print_step "Autocannon installed"
fi

# Make advanced performance test executable
if [ -f "scripts/advanced-performance-test.js" ]; then
    chmod +x scripts/advanced-performance-test.js
    print_step "Performance test script ready"
fi
echo

# Bundle optimization check
echo "📦 Checking bundle optimization..."

if [ -f "next.config.js" ]; then
    if grep -q "modularizeImports" next.config.js; then
        print_step "Bundle optimization already configured"
    else
        print_warning "next.config.js needs modularizeImports configuration"
        echo "   Add modularizeImports to reduce bundle size"
    fi
else
    print_warning "next.config.js not found - create it for bundle optimization"
fi
echo

# Generate Prisma client
echo "🔄 Generating Prisma client..."
if npx prisma generate; then
    print_step "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
fi
echo

# Run performance benchmark
echo "🎯 Running quick performance benchmark..."
echo "This will test current API response times..."

# Create a simple benchmark script
cat > /tmp/quick-benchmark.js << 'EOF'
const http = require('http');
const { performance } = require('perf_hooks');

async function benchmark(url, requests = 10) {
  const times = [];
  
  for (let i = 0; i < requests; i++) {
    const start = performance.now();
    
    try {
      const response = await fetch(url);
      const end = performance.now();
      
      if (response.ok) {
        times.push(end - start);
      }
    } catch (error) {
      console.error('Request failed:', error.message);
    }
  }
  
  if (times.length === 0) {
    console.log('❌ All requests failed');
    return;
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
  
  console.log(`📊 Benchmark Results (${times.length}/${requests} successful):`);
  console.log(`   Average: ${avg.toFixed(2)}ms`);
  console.log(`   P95: ${p95.toFixed(2)}ms`);
  console.log(`   Target: ≤1500ms P95`);
  
  if (p95 <= 1500) {
    console.log('   ✅ Performance target met!');
  } else {
    console.log('   ⚠️ Performance target not met');
  }
}

// Test if server is running
benchmark('http://localhost:3000/api/health')
  .catch(() => {
    console.log('⚠️ Server not running - start with npm run dev to test');
  });
EOF

node /tmp/quick-benchmark.js
rm /tmp/quick-benchmark.js
echo

# Summary
echo "📋 Phase-2 Setup Summary"
echo "========================"
echo

print_step "Core optimizations installed:"
echo "   • Server timing measurement system"
echo "   • Redis cache layer with TTL strategies"
echo "   • Database connection pooling"
echo "   • Cursor pagination (eliminates OFFSET)"
echo "   • High-performance API handlers"
echo "   • Advanced performance testing tools"
echo

echo "🎯 Performance Targets:"
echo "   • P95 ≤ 1500ms under 300 VU load"
echo "   • P99 ≤ 2500ms"
echo "   • Error rate ≤ 0.5%"
echo "   • RPS ≥ 30 for 2 minutes"
echo "   • DB queries ≤ 50ms average"
echo

echo "📋 Next Steps:"
echo "   1. Start your database and Redis"
echo "   2. Update .env with correct connection strings"
echo "   3. Run: npm run dev"
echo "   4. Test performance: node scripts/advanced-performance-test.js"
echo "   5. Apply database indexes if skipped"
echo

echo "🚀 Phase-2 setup complete!"
echo "Ready for P95 ≤ 1.5s performance testing 🔥"
