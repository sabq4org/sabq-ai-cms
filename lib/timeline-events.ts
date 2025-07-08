// Helper functions لإضافة أحداث إلى timeline

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const TimelineEventTypes = {
  ARTICLE_PUBLISHED: 'article_published',
  ARTICLE_UPDATED: 'article_updated',
  ARTICLE_FEATURED: 'article_featured',
  ARTICLE_BREAKING: 'article_breaking',
  COMMENT_ADDED: 'comment_added',
  CATEGORY_CREATED: 'category_created',
  AUTHOR_JOINED: 'author_joined',
  ANALYSIS_COMPLETED: 'analysis_completed',
  USER_MILESTONE: 'user_milestone',
  SYSTEM_UPDATE: 'system_update',
  DAILY_DOSE_PUBLISHED: 'daily_dose_published',
  FORUM_TOPIC_CREATED: 'forum_topic_created',
  FORUM_REPLY_ADDED: 'forum_reply_added',
  TEAM_MEMBER_JOINED: 'team_member_joined',
  TEMPLATE_CREATED: 'template_created',
  SMART_BLOCK_UPDATED: 'smart_block_updated',
  KEYWORD_TRENDING: 'keyword_trending',
  USER_VERIFIED: 'user_verified',
  LOYALTY_ACHIEVEMENT: 'loyalty_achievement'
};

export interface TimelineEventData {
  event_type: string;
  entity_type: string;
  entity_id?: string;
  title: string;
  description?: string;
  icon?: string;
  url?: string;
  user_id?: string;
  author_name?: string;
  author_avatar?: string;
  category_name?: string;
  category_color?: string;
  metadata?: any;
  is_important?: boolean;
}

// إضافة حدث جديد إلى timeline
export async function addTimelineEvent(eventData: TimelineEventData): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/timeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error adding timeline event:', error);
    return false;
  }
}

// إضافة حدث نشر مقال
export async function addArticlePublishedEvent(article: any, author: any, category: any) {
  return addTimelineEvent({
    event_type: article.breaking ? TimelineEventTypes.ARTICLE_BREAKING : 
                article.featured ? TimelineEventTypes.ARTICLE_FEATURED : 
                TimelineEventTypes.ARTICLE_PUBLISHED,
    entity_type: 'article',
    entity_id: article.id,
    title: article.title,
    description: article.excerpt || '',
    icon: article.breaking ? '🚨' : (article.featured ? '⭐' : '📰'),
    url: `/article/${article.id}`,
    user_id: author?.id,
    author_name: author?.name,
    author_avatar: author?.avatar,
    category_name: category?.name,
    category_color: category?.color || '#6B7280',
    metadata: {
      views: article.views || 0,
      featured: article.featured,
      breaking: article.breaking,
      readingTime: article.reading_time
    },
    is_important: article.breaking || article.featured
  });
}

// إضافة حدث تعليق جديد
export async function addCommentEvent(comment: any, article: any, user: any, category: any) {
  return addTimelineEvent({
    event_type: TimelineEventTypes.COMMENT_ADDED,
    entity_type: 'comment',
    entity_id: comment.id,
    title: `تعليق جديد على: ${article?.title || 'مقال'}`,
    description: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
    icon: '💬',
    url: `/article/${comment.article_id}#comment-${comment.id}`,
    user_id: user?.id,
    author_name: user?.name,
    author_avatar: user?.avatar,
    category_name: category?.name || 'تعليقات',
    category_color: '#10B981',
    metadata: {
      likes: comment.likes || 0
    }
  });
}

// إضافة حدث إنجاز نقاط الولاء
export async function addLoyaltyAchievementEvent(user: any, points: number, action: string) {
  return addTimelineEvent({
    event_type: TimelineEventTypes.LOYALTY_ACHIEVEMENT,
    entity_type: 'loyalty',
    entity_id: user.id,
    title: `إنجاز: ${user.name}`,
    description: `حصل على ${points} نقطة - ${action}`,
    icon: '🏆',
    url: `/profile/${user.id}`,
    user_id: user.id,
    author_name: user.name,
    author_avatar: user.avatar,
    category_name: 'الولاء',
    category_color: '#F59E0B',
    metadata: {
      points,
      action
    },
    is_important: points >= 100
  });
}

// إضافة حدث موضوع منتدى جديد
export async function addForumTopicEvent(topic: any, author: any, category: any) {
  return addTimelineEvent({
    event_type: TimelineEventTypes.FORUM_TOPIC_CREATED,
    entity_type: 'forum_topic',
    entity_id: topic.id,
    title: `موضوع جديد: ${topic.title}`,
    description: topic.content.substring(0, 150) + '...',
    icon: '💬',
    url: `/forum/topic/${topic.id}`,
    user_id: author?.id,
    author_name: author?.name,
    author_avatar: author?.avatar,
    category_name: category?.name || 'المنتدى',
    category_color: '#059669',
    metadata: {
      views: topic.views || 0,
      isPinned: topic.is_pinned,
      isFeatured: topic.is_featured
    },
    is_important: topic.is_featured || topic.is_pinned
  });
}

// إضافة حدث تحديث نظام
export async function addSystemUpdateEvent(title: string, description: string, isImportant = false) {
  return addTimelineEvent({
    event_type: TimelineEventTypes.SYSTEM_UPDATE,
    entity_type: 'system',
    title,
    description,
    icon: '🛠️',
    category_name: 'النظام',
    category_color: '#6B7280',
    is_important: isImportant
  });
} 