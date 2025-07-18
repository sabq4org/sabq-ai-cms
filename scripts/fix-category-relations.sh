#!/bin/bash

echo "🔧 إصلاح علاقات category إلى categories..."

# قائمة الملفات التي تحتاج إلى إصلاح
files=(
  "app/api/timeline/route.ts"
  "app/api/forum/topics/[id]/route.ts"
  "app/api/forum/search/route.ts"
  "app/api/forum/topics/route.ts"
  "app/api/user/recommendation-of-the-day/route.ts"
  "app/api/user/similar-readers/route.ts"
  "app/api/voice-summary/route.ts"
  "app/api/interactions/liked-articles/route.ts"
  "app/api/interactions/saved-articles/route.ts"
)

# إصلاح كل ملف
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 إصلاح $file..."
    # استبدال category: { بـ categories: {
    sed -i '' 's/category: {/categories: {/g' "$file"
    # استبدال .category بـ .categories حيث يكون ذلك مناسباً
    sed -i '' 's/\.category\b/.categories/g' "$file"
    # استبدال article.category بـ article.categories
    sed -i '' 's/article\.category/article.categories/g' "$file"
  fi
done

echo "✅ تم إصلاح جميع الملفات!" 