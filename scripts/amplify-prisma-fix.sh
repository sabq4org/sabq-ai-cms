#!/bin/bash

# Script to fix Prisma binary issues in AWS Amplify
echo "🔧 Starting Prisma fix for AWS Amplify..."

# 1. Detect the environment
echo "📍 Environment: $AWS_EXECUTION_ENV"
echo "📍 Lambda Root: $LAMBDA_TASK_ROOT"
echo "📍 Platform: $(uname -a)"

# 2. Fix Prisma binary targets
echo "🔧 Updating Prisma schema..."
if [ -f "prisma/schema.prisma" ]; then
    # Add all possible binary targets
    sed -i 's/binaryTargets.*=.*/binaryTargets = ["native", "rhel-openssl-1.0.x", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x", "linux-musl", "linux-musl-openssl-3.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x"]/' prisma/schema.prisma
    echo "✅ Schema updated"
else
    echo "❌ Schema file not found!"
fi

# 3. Clean and regenerate Prisma
echo "🧹 Cleaning old Prisma files..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
rm -rf /tmp/prisma-*

# 4. Set environment variable for binary
echo "🔧 Setting Prisma binary path..."
export PRISMA_QUERY_ENGINE_BINARY="${LAMBDA_TASK_ROOT}/node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node"
export PRISMA_QUERY_ENGINE_LIBRARY="${LAMBDA_TASK_ROOT}/node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node"

# 5. Generate Prisma Client
echo "🔄 Generating Prisma Client..."
npx prisma generate --force

# 6. Check generated files
echo "📁 Checking generated files..."
ls -la node_modules/.prisma/client/

# 7. Copy binary to /tmp if needed
if [ -n "$AWS_LAMBDA_FUNCTION_NAME" ]; then
    echo "🔧 Copying binaries to /tmp for Lambda..."
    cp -f node_modules/.prisma/client/*.node /tmp/ 2>/dev/null || true
fi

echo "✅ Prisma fix completed!" 