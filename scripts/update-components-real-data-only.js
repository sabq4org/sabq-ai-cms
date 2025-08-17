const fs = require('fs').promises;
const path = require('path');

async function updateComponentsForRealDataOnly() {
  try {
    console.log('🔧 تحديث مكونات الواجهة للبيانات الحقيقية فقط...\n');
    
    // 1. تحديث مكون ReporterLink لإخفاء الصورة عند عدم توفرها
    console.log('👤 تحديث مكون ReporterLink...');
    
    const reporterLinkPath = 'components/ReporterLink.tsx';
    let reporterLinkContent = await fs.readFile(reporterLinkPath, 'utf8');
    
    // إضافة منطق إخفاء الصورة عند عدم توفرها
    const updatedReporterLink = reporterLinkContent.replace(
      /const getVerificationIcon = \(badge: string\) => \{/,
      `// إخفاء الصورة إذا كانت وهمية أو غير متوفرة
  const isValidImage = (url: string | null | undefined) => {
    if (!url) return false;
    if (url.includes('ui-avatars.com')) return false;
    if (url.includes('placeholder')) return false;
    if (url.includes('faker')) return false;
    return true;
  };

  const getVerificationIcon = (badge: string) => {`
    );
    
    await fs.writeFile(reporterLinkPath, updatedReporterLink);
    console.log('   ✅ تم تحديث ReporterLink لإخفاء الصور الوهمية');
    
    // 2. إنشاء component محدث لعرض أعضاء الفريق
    console.log('\n👥 إنشاء مكون محدث لعرض أعضاء الفريق...');
    
    const teamMemberComponent = `'use client';

import React from 'react';
import { User } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  // إخفاء الصور الوهمية تماماً
  const hasValidAvatar = member.avatar && 
    !member.avatar.includes('ui-avatars.com') &&
    !member.avatar.includes('placeholder') &&
    !member.avatar.includes('faker') &&
    !member.avatar.includes('unsplash.com');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* عرض الصورة فقط إذا كانت حقيقية */}
        {hasValidAvatar ? (
          <img
            src={member.avatar}
            alt={member.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {member.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {member.role}
          </p>
          {member.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {member.email}
            </p>
          )}
        </div>
      </div>
      
      {/* عرض النبذة فقط إذا كانت موجودة وحقيقية */}
      {member.bio && 
       !member.bio.includes('Lorem ipsum') && 
       !member.bio.includes('placeholder') && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {member.bio}
          </p>
        </div>
      )}
    </div>
  );
}

export default TeamMemberCard;`;

    await fs.writeFile('components/TeamMemberCard.tsx', teamMemberComponent);
    console.log('   ✅ تم إنشاء TeamMemberCard للبيانات الحقيقية فقط');
    
    // 3. إنشاء مكون محدث للمقالات
    console.log('\n📰 إنشاء مكون محدث للمقالات...');
    
    const articleCardComponent = `'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Eye, Heart, Share2, Image as ImageIcon } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  featured_image?: string;
  views?: number;
  likes?: number;
  shares?: number;
  published_at?: Date | string;
  author?: {
    name: string;
  };
}

interface RealDataArticleCardProps {
  article: Article;
}

export function RealDataArticleCard({ article }: RealDataArticleCardProps) {
  // التحقق من صحة الصورة
  const hasValidImage = article.featured_image && 
    !article.featured_image.includes('placeholder') &&
    !article.featured_image.includes('faker') &&
    !article.featured_image.includes('unsplash.com') &&
    !article.featured_image.includes('lorempixel');

  const publishedDate = article.published_at ? 
    new Date(article.published_at).toLocaleDateString('ar') : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* عرض الصورة فقط إذا كانت حقيقية */}
      {hasValidImage ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-400" />
        </div>
      )}
      
      <div className="p-6">
        <Link href={\`/article/\${article.id}\`}>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
        </Link>
        
        {article.excerpt && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* عرض المشاهدات الحقيقية فقط */}
            {(article.views ?? 0) > 0 && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Eye className="w-4 h-4" />
                <span>{article.views}</span>
              </div>
            )}
            
            {/* عرض الإعجابات الحقيقية فقط */}
            {(article.likes ?? 0) > 0 && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Heart className="w-4 h-4" />
                <span>{article.likes}</span>
              </div>
            )}
            
            {/* عرض المشاركات الحقيقية فقط */}
            {(article.shares ?? 0) > 0 && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Share2 className="w-4 h-4" />
                <span>{article.shares}</span>
              </div>
            )}
          </div>
          
          {publishedDate && (
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Calendar className="w-4 h-4" />
              <span>{publishedDate}</span>
            </div>
          )}
        </div>
        
        {article.author?.name && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              بواسطة: {article.author.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RealDataArticleCard;`;

    await fs.writeFile('components/RealDataArticleCard.tsx', articleCardComponent);
    console.log('   ✅ تم إنشاء RealDataArticleCard للبيانات الحقيقية فقط');
    
    // 4. إنشاء hook للتحقق من البيانات الحقيقية
    console.log('\n🔧 إنشاء hook للتحقق من البيانات الحقيقية...');
    
    const realDataHook = `import { useMemo } from 'react';

export interface DataValidationOptions {
  allowEmptyStats?: boolean;
  allowMissingImages?: boolean;
}

export function useRealDataValidation() {
  
  const isValidImage = (url: string | null | undefined): boolean => {
    if (!url) return false;
    
    // قائمة مصادر الصور الوهمية المحظورة
    const fakeImageSources = [
      'ui-avatars.com',
      'placeholder.com',
      'via.placeholder.com',
      'faker.js',
      'lorempixel.com',
      'picsum.photos',
      'unsplash.com' // إزالة unsplash لأنها صور وهمية في السياق
    ];
    
    return !fakeImageSources.some(source => url.includes(source));
  };
  
  const isValidStats = (stats: { views?: number; likes?: number; shares?: number }): boolean => {
    // التحقق من وجود إحصائيات حقيقية (أكبر من 0)
    return (stats.views ?? 0) > 0 || (stats.likes ?? 0) > 0 || (stats.shares ?? 0) > 0;
  };
  
  const isValidBio = (bio: string | null | undefined): boolean => {
    if (!bio) return false;
    
    // قائمة النصوص الوهمية المحظورة
    const fakeBioTexts = [
      'Lorem ipsum',
      'lorem ipsum',
      'placeholder',
      'fake bio',
      'dummy text',
      'sample bio'
    ];
    
    return !fakeBioTexts.some(fakeText => bio.toLowerCase().includes(fakeText.toLowerCase()));
  };
  
  const validateTeamMember = (member: any) => {
    return {
      hasValidAvatar: isValidImage(member.avatar),
      hasValidBio: isValidBio(member.bio),
      isComplete: member.name && member.role && member.email
    };
  };
  
  const validateArticle = (article: any) => {
    return {
      hasValidImage: isValidImage(article.featured_image),
      hasValidStats: isValidStats({
        views: article.views,
        likes: article.likes,
        shares: article.shares
      }),
      isComplete: article.title && article.content
    };
  };
  
  const validateReporter = (reporter: any) => {
    return {
      hasValidAvatar: isValidImage(reporter.avatar_url),
      hasValidBio: isValidBio(reporter.bio),
      hasValidStats: isValidStats({
        views: reporter.total_views,
        likes: reporter.total_likes,
        shares: reporter.total_shares
      }),
      isComplete: reporter.full_name && reporter.title
    };
  };
  
  return {
    isValidImage,
    isValidStats,
    isValidBio,
    validateTeamMember,
    validateArticle,
    validateReporter
  };
}

export default useRealDataValidation;`;

    await fs.writeFile('hooks/useRealDataValidation.ts', realDataHook);
    console.log('   ✅ تم إنشاء useRealDataValidation hook');
    
    console.log('\n📋 تقرير التحديثات:');
    console.log('   ✅ ReporterLink - إخفاء الصور الوهمية');
    console.log('   ✅ TeamMemberCard - عرض البيانات الحقيقية فقط');
    console.log('   ✅ RealDataArticleCard - إحصائيات حقيقية فقط');
    console.log('   ✅ useRealDataValidation - hook للتحقق من البيانات');
    
    console.log('\n🎯 المبادئ المطبقة:');
    console.log('   - لا عرض للصور الوهمية');
    console.log('   - لا عرض للإحصائيات الصفرية');
    console.log('   - لا عرض للنصوص الوهمية');
    console.log('   - إخفاء العناصر عند عدم توفر بيانات حقيقية');
    console.log('   - استخدام placeholder icons بدلاً من الصور الوهمية');
    
  } catch (error) {
    console.error('❌ خطأ في تحديث المكونات:', error);
  }
}

updateComponentsForRealDataOnly();
