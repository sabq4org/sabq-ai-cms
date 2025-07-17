#!/bin/sh

echo "🚨 Emergency Build Script"
echo "========================"

# Set environment
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export SKIP_ENV_VALIDATION=1

# Set dummy env vars if not present
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
fi

# Clean
rm -rf .next

# Try to build
echo "🏗️ Attempting build..."
if npx next build; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed, trying without type checking..."
  # Try build without type checking
  export SKIP_TYPE_CHECK=1
  if npx next build; then
    echo "✅ Build successful (without type check)!"
  else
    echo "❌ All build attempts failed!"
    exit 1
  fi
fi

# Check results
if [ -d ".next" ]; then
  echo "✅ .next directory created"
  ls -la .next/
else
  echo "❌ No .next directory found!"
  exit 1
fi

echo "🎉 Emergency build completed!" 