#!/bin/bash
echo "🔧 AWS Lambda Prisma Binary Targets Fix"
echo "📍 Working directory: $(pwd)"

echo "📄 Current generator config:"
head -10 prisma/schema.prisma

echo "🛠️ Creating optimized schema for AWS Lambda..."
# نسخ احتياطي
cp prisma/schema.prisma prisma/schema.prisma.backup

# حل أبسط: استبدال كامل لكتلة generator
cat > temp_generator.txt << 'EOF'
generator client {
  provider        = "prisma-client-js"
  binaryTargets   = ["native", "rhel-openssl-1.0.x"]
  previewFeatures = ["relationJoins"]
}
EOF

# استبدال كتلة generator كاملة
awk '
BEGIN { in_generator = 0; skip = 0 }
/^generator client \{/ { 
    in_generator = 1; 
    skip = 1;
    system("cat temp_generator.txt");
    next 
}
in_generator && /^\}/ { 
    in_generator = 0; 
    skip = 0;
    next 
}
!skip { print }
' prisma/schema.prisma > prisma/schema.prisma.tmp

mv prisma/schema.prisma.tmp prisma/schema.prisma
rm temp_generator.txt

echo "📄 Updated generator config:"
head -10 prisma/schema.prisma

echo "🚀 Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated successfully for AWS Lambda"
    rm prisma/schema.prisma.backup
else
    echo "❌ Prisma generate failed, restoring backup"
    cp prisma/schema.prisma.backup prisma/schema.prisma
    exit 1
fi
