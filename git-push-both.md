# أوامر سريعة لرفع الفرعين

## الطريقة 1: استخدم السكريبت الجاهز
```bash
./push-both-branches.sh
```

## الطريقة 2: أمر واحد سريع

### إذا كنت في clean-main:
```bash
git add -A && git commit -m "رسالة التحديث" && git push origin clean-main && git checkout main && git merge clean-main && git push origin main && git checkout clean-main
```

### إذا كنت في main:
```bash
git add -A && git commit -m "رسالة التحديث" && git push origin main && git checkout clean-main && git merge main && git push origin clean-main && git checkout main
```

## الطريقة 3: دالة في .zshrc أو .bashrc

أضف هذا في ملف `~/.zshrc` أو `~/.bashrc`:

```bash
# دالة لرفع كلا الفرعين
push-both() {
    CURRENT=$(git branch --show-current)
    
    if [ "$CURRENT" = "clean-main" ]; then
        git push origin clean-main && \
        git checkout main && \
        git merge clean-main --no-edit && \
        git push origin main && \
        git checkout clean-main
    elif [ "$CURRENT" = "main" ]; then
        git push origin main && \
        git checkout clean-main && \
        git merge main --no-edit && \
        git push origin clean-main && \
        git checkout main
    else
        echo "⚠️ يجب أن تكون في main أو clean-main"
    fi
}
```

ثم استخدم:
```bash
push-both
```

## نصائح:
- تأكد من حفظ التغييرات قبل الرفع
- الفرعان يبقيان متزامنين دائماً
- يمكنك استخدام أي طريقة تناسبك 