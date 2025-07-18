#!/bin/bash

echo "🔧 إصلاح باقي أخطاء البناء..."

# إصلاح enhanced-stats
echo "📝 إصلاح app/api/user/enhanced-stats/route.ts..."
sed -i '' 's/completed: true/read_percentage: { gte: 90 }/g' app/api/user/enhanced-stats/route.ts
sed -i '' 's/\.total_duration/.duration_seconds/g' app/api/user/enhanced-stats/route.ts
sed -i '' 's/\.active_duration/.duration_seconds/g' app/api/user/enhanced-stats/route.ts
sed -i '' 's/\.words_read/\/*words_read removed*\//g' app/api/user/enhanced-stats/route.ts
sed -i '' 's/\.engagement_score/.scroll_depth/g' app/api/user/enhanced-stats/route.ts
sed -i '' 's/\.reading_progress/.read_percentage/g' app/api/user/enhanced-stats/route.ts
sed -i '' 's/\.reading_speed/\/*reading_speed removed*\//g' app/api/user/enhanced-stats/route.ts
sed -i '' 's/total_duration: true/duration_seconds: true/g' app/api/user/enhanced-stats/route.ts
sed -i '' 's/reading_sessions/user_reading_sessions/g' app/api/user/enhanced-stats/route.ts

# إصلاح article to articles في interactions
echo "📝 إصلاح interactions includes..."
for file in $(grep -l "article: {" app/api/**/*.ts 2>/dev/null | grep -E "(interactions|interaction)")
do
  if [ -f "$file" ]; then
    echo "  - $file"
    sed -i '' '/include: {/,/}/ s/article: {/articles: {/g' "$file"
    sed -i '' 's/\.article\./.articles\./g' "$file"
  fi
done

echo "✅ تم إصلاح الملفات!" 