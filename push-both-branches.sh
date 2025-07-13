#!/bin/bash

# سكريبت لرفع التغييرات إلى كلا الفرعين main و clean-main

echo "🚀 بدء رفع التغييرات إلى الفرعين..."

# حفظ الفرع الحالي
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 الفرع الحالي: $CURRENT_BRANCH"

# التأكد من وجود التغييرات
if [[ -n $(git status -s) ]]; then
    echo "📝 يوجد تغييرات غير محفوظة. سيتم حفظها أولاً..."
    git add -A
    read -p "📝 أدخل رسالة الـ commit: " COMMIT_MSG
    git commit -m "$COMMIT_MSG"
fi

# رفع الفرع الحالي
echo "⬆️  رفع $CURRENT_BRANCH..."
git push origin $CURRENT_BRANCH

# إذا كنا في clean-main، نحدث main
if [ "$CURRENT_BRANCH" = "clean-main" ]; then
    echo "🔄 تحديث main من clean-main..."
    git checkout main
    git merge clean-main --no-edit
    git push origin main
    git checkout clean-main
    echo "✅ تم تحديث main بنجاح!"
    
# إذا كنا في main، نحدث clean-main
elif [ "$CURRENT_BRANCH" = "main" ]; then
    echo "🔄 تحديث clean-main من main..."
    git checkout clean-main
    git merge main --no-edit
    git push origin clean-main
    git checkout main
    echo "✅ تم تحديث clean-main بنجاح!"
else
    echo "⚠️  أنت في فرع $CURRENT_BRANCH. يجب أن تكون في main أو clean-main"
    exit 1
fi

echo "🎉 تم رفع التغييرات إلى كلا الفرعين بنجاح!" 