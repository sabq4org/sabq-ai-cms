import { useMemo } from 'react';

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

export default useRealDataValidation;