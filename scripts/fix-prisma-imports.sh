#!/bin/bash

echo "🔧 تحديث جميع imports من Prisma..."

# تحديث جميع الملفات التي تستخدم default import
find . -name "*.ts" -type f -not -path "./node_modules/*" -not -path "./.next/*" | while read file; do
  if grep -q "^import prisma from ['\"]\@/lib/prisma['\"]" "$file"; then
    echo "✅ تحديث: $file"
    # استخدام sed للاستبدال
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s/import prisma from '\@\/lib\/prisma'/import { prisma } from '\@\/lib\/prisma'/g" "$file"
      sed -i '' 's/import prisma from "@\/lib\/prisma"/import { prisma } from "@\/lib\/prisma"/g' "$file"
    else
      # Linux
      sed -i "s/import prisma from '\@\/lib\/prisma'/import { prisma } from '\@\/lib\/prisma'/g" "$file"
      sed -i 's/import prisma from "@\/lib\/prisma"/import { prisma } from "@\/lib\/prisma"/g' "$file"
    fi
  fi
done

echo "✨ تم تحديث جميع imports من Prisma!" 