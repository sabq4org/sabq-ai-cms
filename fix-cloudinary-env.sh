#!/bin/bash

echo "🔧 تحديث متغير Cloudinary في .env.local..."

# تحديث NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
if grep -q "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" .env.local; then
    sed -i '' 's/NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=.*/NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb/' .env.local
    echo "✅ تم تحديث NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
else
    echo "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb" >> .env.local
    echo "✅ تم إضافة NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
fi

echo "📌 تذكير: يجب إضافة هذا المتغير في DigitalOcean أيضاً!"
echo "   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb" 