#!/bin/bash

echo "🔧 إصلاح أخطاء البناء..."

# إصلاح ملف reading-sessions
echo "📝 إصلاح app/api/reading-sessions/route.ts..."

# استبدال duration بحقول أخرى (interactions table doesn't have duration)
sed -i '' 's/duration: /\/\/ duration removed - not in schema/g' app/api/reading-sessions/route.ts

# استبدال الحقول غير الموجودة
sed -i '' 's/start_time: /started_at: /g' app/api/reading-sessions/route.ts
sed -i '' 's/total_duration/duration_seconds/g' app/api/reading-sessions/route.ts
sed -i '' 's/engagement_score/scroll_depth/g' app/api/reading-sessions/route.ts
sed -i '' 's/reading_progress/read_percentage/g' app/api/reading-sessions/route.ts
sed -i '' 's/session_id/id/g' app/api/reading-sessions/route.ts
sed -i '' 's/completed: true/read_percentage: { gte: 90 }/g' app/api/reading-sessions/route.ts

# إزالة الأسطر التي تحتوي على completed
sed -i '' '/completed: session\.completed/d' app/api/reading-sessions/route.ts
sed -i '' '/reading_progress: session\.reading_progress/d' app/api/reading-sessions/route.ts

echo "✅ تم إصلاح الملفات!" 