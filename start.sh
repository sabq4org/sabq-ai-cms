#!/bin/sh

# Start script for Sabq AI CMS Docker Container
echo "🚀 Starting Sabq AI CMS..."

# Set default values if not provided
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}
export HOSTNAME=${HOSTNAME:-0.0.0.0}

echo "📊 Environment:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - PORT: $PORT"
echo "  - HOSTNAME: $HOSTNAME"
echo "  - DATABASE_URL: ${DATABASE_URL:0:30}..." # Show only first 30 chars for security

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set!"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERROR: JWT_SECRET is not set!"
    exit 1
fi

# Check if Next.js build exists
if [ ! -d ".next" ]; then
    echo "❌ ERROR: .next directory not found! Build may have failed."
    exit 1
fi

# Check for server.js (standalone mode) or use npm start
if [ -f ".next/standalone/server.js" ]; then
    echo "🔧 Using standalone mode..."
    cd .next/standalone
    exec node server.js
elif [ -f "server.js" ]; then
    echo "🔧 Using root server.js..."
    exec node server.js
elif [ -f ".next/server.js" ]; then
    echo "🔧 Using .next/server.js..."
    exec node .next/server.js
else
    echo "🔧 Using npm start..."
    exec npm start
fi
