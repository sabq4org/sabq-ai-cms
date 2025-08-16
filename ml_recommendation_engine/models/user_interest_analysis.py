# نظام تحليل اهتمامات المستخدم المتقدم - سبق الذكية
# Advanced User Interest Analysis System

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.decomposition import PCA, LatentDirichletAllocation, NMF
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.manifold import TSNE
import networkx as nx
from scipy.stats import entropy
from scipy.spatial.distance import pdist, squareform
import logging
from typing import Dict, List, Tuple, Optional, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from collections import defaultdict, Counter
import joblib
import pickle
import json
import re
from enum import Enum
import math

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class InterestType(Enum):
    """أنواع الاهتمامات"""
    TOPICAL = "موضوعي"           # اهتمام بموضوع معين
    TEMPORAL = "زمني"            # اهتمام بالأخبار في وقت معين
    SOCIAL = "اجتماعي"           # اهتمام بالمحتوى الشائع
    PERSONAL = "شخصي"           # اهتمام شخصي فريد
    TRENDING = "رائج"            # اهتمام بالاتجاهات الحديثة
    SEASONAL = "موسمي"          # اهتمام موسمي
    EXPLORATORY = "استكشافي"    # اهتمام بالتنويع والاستكشاف

@dataclass
class InterestProfile:
    """ملف اهتمامات المستخدم"""
    user_id: str
    interests: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    interest_evolution: List[Dict[str, Any]] = field(default_factory=list)
    personality_traits: Dict[str, float] = field(default_factory=dict)
    behavior_patterns: Dict[str, Any] = field(default_factory=dict)
    engagement_preferences: Dict[str, float] = field(default_factory=dict)
    temporal_preferences: Dict[str, Any] = field(default_factory=dict)
    diversity_score: float = 0.0
    curiosity_score: float = 0.0
    consistency_score: float = 0.0
    last_updated: datetime = field(default_factory=datetime.now)
    confidence_score: float = 0.0

@dataclass
class InterestAnalysisConfig:
    """إعدادات نظام تحليل الاهتمامات"""
    # Clustering settings
    n_clusters: int = 10
    clustering_algorithm: str = "kmeans"  # kmeans, dbscan, hierarchical
    min_cluster_size: int = 5
    
    # Temporal analysis
    temporal_window_days: int = 30
    trend_detection_threshold: float = 0.1
    seasonality_periods: List[int] = field(default_factory=lambda: [7, 30, 90, 365])
    
    # Interest evolution
    interest_decay_rate: float = 0.95
    min_interest_strength: float = 0.1
    max_interests_per_user: int = 20
    
    # Personality analysis
    personality_dimensions: List[str] = field(default_factory=lambda: [
        'openness', 'conscientiousness', 'extraversion', 
        'agreeableness', 'neuroticism', 'curiosity'
    ])
    
    # Behavior patterns
    min_pattern_support: float = 0.1
    max_pattern_length: int = 5
    
    # Feature extraction
    tfidf_max_features: int = 1000
    embedding_dim: int = 128
    
    # Similarity thresholds
    similarity_threshold: float = 0.3
    interest_merge_threshold: float = 0.8


class TemporalInterestAnalyzer:
    """
    محلل الاهتمامات الزمنية
    Temporal Interest Analyzer
    """
    
    def __init__(self, config: InterestAnalysisConfig):
        self.config = config
        self.temporal_patterns = {}
        self.seasonal_trends = {}
        
    def analyze_temporal_patterns(self, user_interactions: pd.DataFrame) -> Dict[str, Any]:
        """تحليل الأنماط الزمنية للاهتمامات"""
        logger.info(f"📅 تحليل الأنماط الزمنية لـ {len(user_interactions)} تفاعل...")
        
        # تحويل الوقت إلى معالم زمنية
        user_interactions['hour'] = pd.to_datetime(user_interactions['created_at']).dt.hour
        user_interactions['day_of_week'] = pd.to_datetime(user_interactions['created_at']).dt.dayofweek
        user_interactions['month'] = pd.to_datetime(user_interactions['created_at']).dt.month
        user_interactions['week_of_year'] = pd.to_datetime(user_interactions['created_at']).dt.isocalendar().week
        
        patterns = {
            'hourly_distribution': self._analyze_hourly_patterns(user_interactions),
            'daily_distribution': self._analyze_daily_patterns(user_interactions),
            'weekly_trends': self._analyze_weekly_trends(user_interactions),
            'monthly_seasonality': self._analyze_monthly_patterns(user_interactions),
            'reading_sessions': self._analyze_reading_sessions(user_interactions),
            'content_timing_preferences': self._analyze_content_timing(user_interactions)
        }
        
        # تحديد نمط الاستخدام الرئيسي
        patterns['primary_usage_pattern'] = self._identify_primary_pattern(patterns)
        patterns['activity_regularity'] = self._calculate_activity_regularity(user_interactions)
        
        return patterns
    
    def _analyze_hourly_patterns(self, interactions: pd.DataFrame) -> Dict[str, Any]:
        """تحليل أنماط الساعات"""
        hourly_activity = interactions.groupby('hour').size()
        
        # تحديد ساعات الذروة
        peak_hours = hourly_activity.nlargest(3).index.tolist()
        
        # تصنيف نمط الاستخدام
        if any(hour in [6, 7, 8, 9] for hour in peak_hours):
            pattern_type = "صباحي"
        elif any(hour in [12, 13, 14] for hour in peak_hours):
            pattern_type = "وقت الغداء"
        elif any(hour in [18, 19, 20, 21] for hour in peak_hours):
            pattern_type = "مسائي"
        elif any(hour in [22, 23, 0, 1] for hour in peak_hours):
            pattern_type = "ليلي"
        else:
            pattern_type = "متنوع"
        
        return {
            'distribution': hourly_activity.to_dict(),
            'peak_hours': peak_hours,
            'pattern_type': pattern_type,
            'consistency': self._calculate_temporal_consistency(hourly_activity)
        }
    
    def _analyze_daily_patterns(self, interactions: pd.DataFrame) -> Dict[str, Any]:
        """تحليل أنماط الأيام"""
        daily_activity = interactions.groupby('day_of_week').size()
        
        # أسماء الأيام بالعربية
        day_names = {0: 'الإثنين', 1: 'الثلاثاء', 2: 'الأربعاء', 3: 'الخميس', 
                    4: 'الجمعة', 5: 'السبت', 6: 'الأحد'}
        
        # تحديد نمط أيام الأسبوع مقابل عطلة نهاية الأسبوع
        weekday_activity = daily_activity[0:5].sum()
        weekend_activity = daily_activity[5:7].sum()
        
        if weekend_activity > weekday_activity:
            pattern_type = "عطلة نهاية الأسبوع"
        elif weekday_activity > weekend_activity * 2:
            pattern_type = "أيام العمل"
        else:
            pattern_type = "متوازن"
        
        return {
            'distribution': {day_names[day]: count for day, count in daily_activity.items()},
            'weekday_vs_weekend': {
                'weekdays': weekday_activity,
                'weekends': weekend_activity,
                'ratio': weekday_activity / max(weekend_activity, 1)
            },
            'pattern_type': pattern_type,
            'most_active_day': day_names[daily_activity.idxmax()]
        }
    
    def _analyze_weekly_trends(self, interactions: pd.DataFrame) -> Dict[str, Any]:
        """تحليل الاتجاهات الأسبوعية"""
        weekly_activity = interactions.groupby('week_of_year').size()
        
        # حساب الاتجاه العام
        weeks = list(weekly_activity.index)
        activities = list(weekly_activity.values)
        
        if len(weeks) > 1:
            # حساب معامل الارتباط للاتجاه
            correlation = np.corrcoef(weeks, activities)[0, 1]
            
            if correlation > 0.3:
                trend = "متزايد"
            elif correlation < -0.3:
                trend = "متناقص"
            else:
                trend = "مستقر"
        else:
            trend = "غير محدد"
        
        return {
            'weekly_distribution': weekly_activity.to_dict(),
            'trend': trend,
            'average_weekly_activity': weekly_activity.mean(),
            'activity_variance': weekly_activity.var()
        }
    
    def _analyze_monthly_patterns(self, interactions: pd.DataFrame) -> Dict[str, Any]:
        """تحليل الأنماط الشهرية"""
        monthly_activity = interactions.groupby('month').size()
        
        # أسماء الأشهر بالعربية
        month_names = {
            1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
            5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
            9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
        }
        
        # تحديد الموسمية
        if len(monthly_activity) >= 3:
            # تحليل الموسمية البسيط
            q1_activity = monthly_activity.get([1, 2, 3], pd.Series()).sum()  # الربع الأول
            q2_activity = monthly_activity.get([4, 5, 6], pd.Series()).sum()  # الربع الثاني
            q3_activity = monthly_activity.get([7, 8, 9], pd.Series()).sum()  # الربع الثالث
            q4_activity = monthly_activity.get([10, 11, 12], pd.Series()).sum()  # الربع الرابع
            
            seasonal_pattern = {
                'الشتاء': q1_activity,
                'الربيع': q2_activity,
                'الصيف': q3_activity,
                'الخريف': q4_activity
            }
            
            peak_season = max(seasonal_pattern, key=seasonal_pattern.get)
        else:
            seasonal_pattern = {}
            peak_season = "غير محدد"
        
        return {
            'monthly_distribution': {month_names.get(month, str(month)): count 
                                   for month, count in monthly_activity.items()},
            'seasonal_pattern': seasonal_pattern,
            'peak_season': peak_season,
            'seasonality_strength': np.std(list(seasonal_pattern.values())) if seasonal_pattern else 0
        }
    
    def _analyze_reading_sessions(self, interactions: pd.DataFrame) -> Dict[str, Any]:
        """تحليل جلسات القراءة"""
        # تجميع التفاعلات في جلسات (فجوة زمنية > 30 دقيقة = جلسة جديدة)
        interactions_sorted = interactions.sort_values('created_at')
        interactions_sorted['time_diff'] = pd.to_datetime(interactions_sorted['created_at']).diff()
        
        # تحديد بدايات الجلسات الجديدة
        session_breaks = interactions_sorted['time_diff'] > timedelta(minutes=30)
        interactions_sorted['session_id'] = session_breaks.cumsum()
        
        # تحليل الجلسات
        session_stats = interactions_sorted.groupby('session_id').agg({
            'created_at': ['min', 'max', 'count'],
            'reading_time': 'sum'
        }).reset_index()
        
        session_stats.columns = ['session_id', 'start_time', 'end_time', 'articles_count', 'total_reading_time']
        session_stats['session_duration'] = (
            pd.to_datetime(session_stats['end_time']) - 
            pd.to_datetime(session_stats['start_time'])
        ).dt.total_seconds() / 60  # بالدقائق
        
        return {
            'total_sessions': len(session_stats),
            'avg_session_duration': session_stats['session_duration'].mean(),
            'avg_articles_per_session': session_stats['articles_count'].mean(),
            'avg_reading_time_per_session': session_stats['total_reading_time'].mean(),
            'session_patterns': {
                'short_sessions': len(session_stats[session_stats['session_duration'] < 5]),
                'medium_sessions': len(session_stats[(session_stats['session_duration'] >= 5) & 
                                                   (session_stats['session_duration'] <= 30)]),
                'long_sessions': len(session_stats[session_stats['session_duration'] > 30])
            }
        }
    
    def _analyze_content_timing(self, interactions: pd.DataFrame) -> Dict[str, Any]:
        """تحليل تفضيلات توقيت المحتوى"""
        content_timing = {}
        
        # تحليل تفضيلات المحتوى حسب الوقت
        if 'category' in interactions.columns:
            for category in interactions['category'].unique():
                category_data = interactions[interactions['category'] == category]
                
                # تحليل التوزيع الزمني لكل فئة
                hourly_dist = category_data.groupby('hour').size()
                peak_hour = hourly_dist.idxmax() if len(hourly_dist) > 0 else 0
                
                content_timing[category] = {
                    'peak_hour': peak_hour,
                    'total_interactions': len(category_data),
                    'hourly_distribution': hourly_dist.to_dict()
                }
        
        return content_timing
    
    def _identify_primary_pattern(self, patterns: Dict[str, Any]) -> str:
        """تحديد النمط الأساسي للاستخدام"""
        # تحليل مبسط لتحديد النمط الأساسي
        hourly_pattern = patterns['hourly_distribution']['pattern_type']
        daily_pattern = patterns['daily_distribution']['pattern_type']
        
        # دمج الأنماط لتحديد النمط الرئيسي
        if hourly_pattern == "صباحي" and daily_pattern == "أيام العمل":
            return "محترف منظم"
        elif hourly_pattern == "مسائي" and daily_pattern == "متوازن":
            return "قارئ مسائي"
        elif daily_pattern == "عطلة نهاية الأسبوع":
            return "قارئ وقت الفراغ"
        elif hourly_pattern == "ليلي":
            return "قارئ ليلي"
        else:
            return "متنوع الأوقات"
    
    def _calculate_activity_regularity(self, interactions: pd.DataFrame) -> float:
        """حساب انتظام النشاط"""
        # حساب التباين في النشاط اليومي
        daily_counts = interactions.groupby(pd.to_datetime(interactions['created_at']).dt.date).size()
        
        if len(daily_counts) > 1:
            # حساب معامل التباين (أقل تباين = أكثر انتظاماً)
            cv = daily_counts.std() / daily_counts.mean() if daily_counts.mean() > 0 else 1
            regularity = max(0, 1 - cv)  # تحويل إلى نقاط من 0 إلى 1
        else:
            regularity = 0.5  # قيمة متوسطة للبيانات المحدودة
        
        return regularity
    
    def _calculate_temporal_consistency(self, activity_series: pd.Series) -> float:
        """حساب اتساق النشاط الزمني"""
        if len(activity_series) == 0:
            return 0.0
        
        # حساب التوزيع النسبي
        total_activity = activity_series.sum()
        if total_activity == 0:
            return 0.0
        
        distribution = activity_series / total_activity
        
        # حساب إنتروبيا التوزيع (أقل إنتروبيا = أكثر تركزاً)
        entropy_val = entropy(distribution + 1e-10)  # إضافة قيمة صغيرة لتجنب log(0)
        max_entropy = np.log(len(distribution))
        
        # تحويل إلى نقاط اتساق (1 = متسق جداً، 0 = متناثر جداً)
        consistency = 1 - (entropy_val / max_entropy) if max_entropy > 0 else 0
        
        return consistency


class TopicalInterestExtractor:
    """
    مستخرج الاهتمامات الموضوعية
    Topical Interest Extractor
    """
    
    def __init__(self, config: InterestAnalysisConfig):
        self.config = config
        self.topic_models = {}
        self.interest_embeddings = {}
        
    def extract_topical_interests(self, user_content: List[Dict[str, Any]]) -> Dict[str, Any]:
        """استخراج الاهتمامات الموضوعية"""
        logger.info(f"📚 استخراج الاهتمامات الموضوعية من {len(user_content)} محتوى...")
        
        if not user_content:
            return {}
        
        # تحضير النصوص
        texts = []
        for content in user_content:
            combined_text = f"{content.get('title', '')} {content.get('content', '')}"
            texts.append(combined_text)
        
        # استخراج المعالم النصية
        tfidf_features = self._extract_tfidf_features(texts)
        
        # تحليل الموضوعات
        topics = self._perform_topic_modeling(texts)
        
        # استخراج الكلمات المفتاحية
        keywords = self._extract_keywords(texts)
        
        # تحليل الفئات
        categories = self._analyze_categories(user_content)
        
        # حساب قوة الاهتمام لكل موضوع
        interest_strengths = self._calculate_interest_strengths(user_content, topics)
        
        return {
            'topics': topics,
            'keywords': keywords,
            'categories': categories,
            'interest_strengths': interest_strengths,
            'tfidf_features': tfidf_features,
            'content_diversity': self._calculate_content_diversity(texts)
        }
    
    def _extract_tfidf_features(self, texts: List[str]) -> Dict[str, float]:
        """استخراج معالم TF-IDF"""
        if not texts:
            return {}
        
        # إنشاء مُجمع TF-IDF
        vectorizer = TfidfVectorizer(
            max_features=self.config.tfidf_max_features,
            stop_words=None,  # سنتعامل مع كلمات الإيقاف العربية لاحقاً
            ngram_range=(1, 2)
        )
        
        try:
            tfidf_matrix = vectorizer.fit_transform(texts)
            feature_names = vectorizer.get_feature_names_out()
            
            # حساب أهمية كل معلم
            feature_scores = np.mean(tfidf_matrix.toarray(), axis=0)
            
            # إنشاء قاموس المعالم مع نقاطها
            features_dict = dict(zip(feature_names, feature_scores))
            
            # ترتيب المعالم حسب الأهمية
            sorted_features = dict(sorted(features_dict.items(), 
                                        key=lambda x: x[1], reverse=True)[:50])
            
            return sorted_features
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في استخراج معالم TF-IDF: {str(e)}")
            return {}
    
    def _perform_topic_modeling(self, texts: List[str]) -> Dict[str, Any]:
        """تحليل الموضوعات"""
        if len(texts) < 3:
            return {}
        
        try:
            # تحضير البيانات
            vectorizer = TfidfVectorizer(
                max_features=1000,
                min_df=2,
                max_df=0.8,
                ngram_range=(1, 2)
            )
            
            tfidf_matrix = vectorizer.fit_transform(texts)
            feature_names = vectorizer.get_feature_names_out()
            
            # تدريب نموذج LDA
            n_topics = min(self.config.n_clusters, len(texts) // 2)
            lda_model = LatentDirichletAllocation(
                n_components=n_topics,
                random_state=42,
                max_iter=100
            )
            
            doc_topic_matrix = lda_model.fit_transform(tfidf_matrix)
            
            # استخراج الموضوعات
            topics = {}
            for topic_idx, topic in enumerate(lda_model.components_):
                top_words_idx = topic.argsort()[-10:][::-1]
                top_words = [feature_names[i] for i in top_words_idx]
                topic_strength = np.mean(doc_topic_matrix[:, topic_idx])
                
                topics[f"موضوع_{topic_idx}"] = {
                    'keywords': top_words,
                    'strength': float(topic_strength),
                    'description': ', '.join(top_words[:3])
                }
            
            return topics
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في تحليل الموضوعات: {str(e)}")
            return {}
    
    def _extract_keywords(self, texts: List[str]) -> Dict[str, float]:
        """استخراج الكلمات المفتاحية"""
        if not texts:
            return {}
        
        # دمج جميع النصوص
        combined_text = ' '.join(texts)
        
        # تنظيف وتقسيم النص
        words = re.findall(r'\b\w+\b', combined_text.lower())
        
        # حساب تكرار الكلمات
        word_counts = Counter(words)
        
        # تصفية الكلمات القصيرة والشائعة
        filtered_words = {
            word: count for word, count in word_counts.items()
            if len(word) > 2 and count > 1
        }
        
        # تطبيع النقاط
        if filtered_words:
            max_count = max(filtered_words.values())
            normalized_keywords = {
                word: count / max_count 
                for word, count in filtered_words.items()
            }
            
            # أهم 20 كلمة
            top_keywords = dict(sorted(normalized_keywords.items(), 
                                     key=lambda x: x[1], reverse=True)[:20])
            
            return top_keywords
        
        return {}
    
    def _analyze_categories(self, user_content: List[Dict[str, Any]]) -> Dict[str, Any]:
        """تحليل الفئات"""
        categories = {}
        
        # جمع الفئات وحساب التكرارات
        category_counts = Counter()
        for content in user_content:
            category = content.get('category', 'أخرى')
            interaction_type = content.get('interaction_type', 'view')
            
            # وزن التفاعل حسب النوع
            weight = {
                'view': 1.0,
                'like': 3.0,
                'save': 4.0,
                'share': 5.0,
                'comment': 4.5
            }.get(interaction_type, 1.0)
            
            category_counts[category] += weight
        
        # تطبيع النقاط
        if category_counts:
            total_weight = sum(category_counts.values())
            
            for category, weight in category_counts.items():
                preference_score = weight / total_weight
                
                categories[category] = {
                    'preference_score': preference_score,
                    'total_interactions': weight,
                    'relative_interest': 'عالي' if preference_score > 0.3 else 
                                       'متوسط' if preference_score > 0.1 else 'منخفض'
                }
        
        return categories
    
    def _calculate_interest_strengths(self, user_content: List[Dict[str, Any]], 
                                    topics: Dict[str, Any]) -> Dict[str, float]:
        """حساب قوة الاهتمام لكل موضوع"""
        interest_strengths = {}
        
        # حساب قوة الاهتمام بناءً على التفاعلات
        for topic_name, topic_data in topics.items():
            total_strength = 0.0
            topic_keywords = topic_data.get('keywords', [])
            
            for content in user_content:
                content_text = f"{content.get('title', '')} {content.get('content', '')}"
                
                # حساب تطابق الكلمات المفتاحية
                keyword_matches = sum(1 for keyword in topic_keywords 
                                    if keyword.lower() in content_text.lower())
                
                if keyword_matches > 0:
                    # وزن التفاعل
                    interaction_weight = {
                        'view': 1.0, 'like': 3.0, 'save': 4.0, 
                        'share': 5.0, 'comment': 4.5
                    }.get(content.get('interaction_type', 'view'), 1.0)
                    
                    # قوة التطابق
                    match_strength = keyword_matches / len(topic_keywords)
                    
                    total_strength += match_strength * interaction_weight
            
            interest_strengths[topic_name] = total_strength
        
        # تطبيع القوة
        if interest_strengths:
            max_strength = max(interest_strengths.values())
            if max_strength > 0:
                interest_strengths = {
                    topic: strength / max_strength 
                    for topic, strength in interest_strengths.items()
                }
        
        return interest_strengths
    
    def _calculate_content_diversity(self, texts: List[str]) -> float:
        """حساب تنوع المحتوى"""
        if len(texts) < 2:
            return 0.0
        
        try:
            # إنشاء مصفوفة TF-IDF
            vectorizer = TfidfVectorizer(max_features=500)
            tfidf_matrix = vectorizer.fit_transform(texts)
            
            # حساب التشابه بين النصوص
            similarity_matrix = cosine_similarity(tfidf_matrix)
            
            # حساب متوسط التشابه (أقل تشابه = أكثر تنوعاً)
            avg_similarity = np.mean(similarity_matrix[np.triu_indices_from(similarity_matrix, k=1)])
            
            # تحويل إلى نقاط تنوع
            diversity_score = 1 - avg_similarity
            
            return max(0.0, min(1.0, diversity_score))
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في حساب تنوع المحتوى: {str(e)}")
            return 0.5


class PersonalityAnalyzer:
    """
    محلل الشخصية والسمات السلوكية
    Personality and Behavioral Traits Analyzer
    """
    
    def __init__(self, config: InterestAnalysisConfig):
        self.config = config
        self.personality_indicators = {
            'openness': ['تنوع', 'استكشاف', 'فضول', 'إبداع', 'جديد'],
            'conscientiousness': ['منتظم', 'مستمر', 'دقيق', 'مسؤول'],
            'extraversion': ['تفاعل', 'مشاركة', 'اجتماعي', 'نشط'],
            'agreeableness': ['تعاون', 'مساعدة', 'ود', 'تفهم'],
            'neuroticism': ['قلق', 'توتر', 'سلبي', 'عاطفي'],
            'curiosity': ['لماذا', 'كيف', 'معرفة', 'تعلم', 'فهم']
        }
    
    def analyze_personality(self, user_data: Dict[str, Any]) -> Dict[str, float]:
        """تحليل شخصية المستخدم"""
        logger.info("🧠 تحليل شخصية المستخدم...")
        
        personality_scores = {}
        
        # تحليل السمات من أنماط التفاعل
        interaction_patterns = user_data.get('behavior_patterns', {})
        content_preferences = user_data.get('topical_interests', {})
        temporal_patterns = user_data.get('temporal_patterns', {})
        
        # تحليل الانفتاح على التجارب الجديدة
        personality_scores['openness'] = self._analyze_openness(
            content_preferences, interaction_patterns
        )
        
        # تحليل الضمير والنظام
        personality_scores['conscientiousness'] = self._analyze_conscientiousness(
            temporal_patterns, interaction_patterns
        )
        
        # تحليل الانبساط
        personality_scores['extraversion'] = self._analyze_extraversion(
            interaction_patterns
        )
        
        # تحليل المقبولية
        personality_scores['agreeableness'] = self._analyze_agreeableness(
            interaction_patterns, content_preferences
        )
        
        # تحليل العصابية
        personality_scores['neuroticism'] = self._analyze_neuroticism(
            interaction_patterns, temporal_patterns
        )
        
        # تحليل الفضول
        personality_scores['curiosity'] = self._analyze_curiosity(
            content_preferences, interaction_patterns
        )
        
        return personality_scores
    
    def _analyze_openness(self, content_prefs: Dict, interaction_patterns: Dict) -> float:
        """تحليل الانفتاح على التجارب"""
        openness_score = 0.0
        
        # تنوع المحتوى
        content_diversity = content_prefs.get('content_diversity', 0.0)
        openness_score += content_diversity * 0.4
        
        # استكشاف فئات جديدة
        categories = content_prefs.get('categories', {})
        category_count = len(categories)
        category_diversity = min(category_count / 10, 1.0)  # تطبيع لـ 10 فئات
        openness_score += category_diversity * 0.3
        
        # تفاعل مع محتوى متنوع
        if 'exploration_rate' in interaction_patterns:
            exploration_rate = interaction_patterns['exploration_rate']
            openness_score += exploration_rate * 0.3
        
        return min(openness_score, 1.0)
    
    def _analyze_conscientiousness(self, temporal_patterns: Dict, 
                                 interaction_patterns: Dict) -> float:
        """تحليل الضمير والنظام"""
        conscientiousness_score = 0.0
        
        # انتظام النشاط
        if 'activity_regularity' in temporal_patterns:
            regularity = temporal_patterns['activity_regularity']
            conscientiousness_score += regularity * 0.5
        
        # اتساق أنماط القراءة
        if 'hourly_distribution' in temporal_patterns:
            consistency = temporal_patterns['hourly_distribution'].get('consistency', 0.0)
            conscientiousness_score += consistency * 0.3
        
        # معدل إكمال القراءة
        if 'completion_rate' in interaction_patterns:
            completion_rate = interaction_patterns['completion_rate']
            conscientiousness_score += completion_rate * 0.2
        
        return min(conscientiousness_score, 1.0)
    
    def _analyze_extraversion(self, interaction_patterns: Dict) -> float:
        """تحليل الانبساط"""
        extraversion_score = 0.0
        
        # معدل المشاركة
        sharing_rate = interaction_patterns.get('sharing_rate', 0.0)
        extraversion_score += sharing_rate * 0.4
        
        # معدل التعليقات
        commenting_rate = interaction_patterns.get('commenting_rate', 0.0)
        extraversion_score += commenting_rate * 0.4
        
        # تفاعل مع المحتوى الاجتماعي
        social_content_preference = interaction_patterns.get('social_content_preference', 0.0)
        extraversion_score += social_content_preference * 0.2
        
        return min(extraversion_score, 1.0)
    
    def _analyze_agreeableness(self, interaction_patterns: Dict, 
                             content_prefs: Dict) -> float:
        """تحليل المقبولية"""
        agreeableness_score = 0.0
        
        # تفضيل المحتوى الإيجابي
        positive_content_rate = interaction_patterns.get('positive_content_rate', 0.5)
        agreeableness_score += positive_content_rate * 0.4
        
        # معدل الإعجاب مقابل عدم الإعجاب
        like_rate = interaction_patterns.get('like_rate', 0.0)
        agreeableness_score += like_rate * 0.3
        
        # تجنب المحتوى المثير للجدل
        controversial_avoidance = 1.0 - interaction_patterns.get('controversial_content_rate', 0.0)
        agreeableness_score += controversial_avoidance * 0.3
        
        return min(agreeableness_score, 1.0)
    
    def _analyze_neuroticism(self, interaction_patterns: Dict, 
                           temporal_patterns: Dict) -> float:
        """تحليل العصابية"""
        neuroticism_score = 0.0
        
        # عدم انتظام أنماط النشاط
        if 'activity_regularity' in temporal_patterns:
            irregularity = 1.0 - temporal_patterns['activity_regularity']
            neuroticism_score += irregularity * 0.3
        
        # تفضيل المحتوى السلبي أو المقلق
        negative_content_rate = interaction_patterns.get('negative_content_rate', 0.0)
        neuroticism_score += negative_content_rate * 0.4
        
        # تقلبات في أنماط الاستخدام
        usage_variability = interaction_patterns.get('usage_variability', 0.0)
        neuroticism_score += usage_variability * 0.3
        
        return min(neuroticism_score, 1.0)
    
    def _analyze_curiosity(self, content_prefs: Dict, interaction_patterns: Dict) -> float:
        """تحليل الفضول"""
        curiosity_score = 0.0
        
        # تنوع الموضوعات
        topic_diversity = len(content_prefs.get('topics', {})) / 10  # تطبيع لـ 10 موضوعات
        curiosity_score += min(topic_diversity, 1.0) * 0.4
        
        # معدل استكشاف محتوى جديد
        exploration_rate = interaction_patterns.get('new_content_exploration_rate', 0.0)
        curiosity_score += exploration_rate * 0.4
        
        # عمق القراءة
        reading_depth = interaction_patterns.get('average_reading_depth', 0.0)
        curiosity_score += reading_depth * 0.2
        
        return min(curiosity_score, 1.0)


class UserInterestAnalysisEngine:
    """
    محرك تحليل اهتمامات المستخدم الرئيسي
    Main User Interest Analysis Engine
    """
    
    def __init__(self, config: InterestAnalysisConfig):
        self.config = config
        self.temporal_analyzer = TemporalInterestAnalyzer(config)
        self.topical_extractor = TopicalInterestExtractor(config)
        self.personality_analyzer = PersonalityAnalyzer(config)
        self.user_profiles = {}
        
    def analyze_user_interests(self, user_id: str, user_interactions: pd.DataFrame,
                             user_content: List[Dict[str, Any]]) -> InterestProfile:
        """تحليل اهتمامات المستخدم الشامل"""
        logger.info(f"🔍 تحليل اهتمامات المستخدم {user_id}...")
        
        # التحليل الزمني
        temporal_patterns = self.temporal_analyzer.analyze_temporal_patterns(user_interactions)
        
        # استخراج الاهتمامات الموضوعية
        topical_interests = self.topical_extractor.extract_topical_interests(user_content)
        
        # تحليل أنماط السلوك
        behavior_patterns = self._analyze_behavior_patterns(user_interactions)
        
        # تحليل الشخصية
        user_data = {
            'behavior_patterns': behavior_patterns,
            'topical_interests': topical_interests,
            'temporal_patterns': temporal_patterns
        }
        personality_traits = self.personality_analyzer.analyze_personality(user_data)
        
        # حساب تفضيلات التفاعل
        engagement_preferences = self._calculate_engagement_preferences(user_interactions)
        
        # حساب النقاط الإجمالية
        diversity_score = self._calculate_diversity_score(topical_interests, behavior_patterns)
        curiosity_score = personality_traits.get('curiosity', 0.0)
        consistency_score = temporal_patterns.get('activity_regularity', 0.0)
        
        # بناء ملف الاهتمامات
        interest_profile = InterestProfile(
            user_id=user_id,
            interests=self._build_interests_dict(topical_interests, temporal_patterns),
            personality_traits=personality_traits,
            behavior_patterns=behavior_patterns,
            engagement_preferences=engagement_preferences,
            temporal_preferences=temporal_patterns,
            diversity_score=diversity_score,
            curiosity_score=curiosity_score,
            consistency_score=consistency_score,
            confidence_score=self._calculate_confidence_score(user_interactions, user_content)
        )
        
        # حفظ الملف
        self.user_profiles[user_id] = interest_profile
        
        logger.info(f"✅ تم تحليل اهتمامات المستخدم {user_id}")
        return interest_profile
    
    def _analyze_behavior_patterns(self, interactions: pd.DataFrame) -> Dict[str, Any]:
        """تحليل أنماط السلوك"""
        patterns = {}
        
        if len(interactions) == 0:
            return patterns
        
        # معدلات التفاعل المختلفة
        total_interactions = len(interactions)
        
        interaction_counts = interactions['interaction_type'].value_counts()
        
        patterns['like_rate'] = interaction_counts.get('like', 0) / total_interactions
        patterns['save_rate'] = interaction_counts.get('save', 0) / total_interactions
        patterns['share_rate'] = interaction_counts.get('share', 0) / total_interactions
        patterns['comment_rate'] = interaction_counts.get('comment', 0) / total_interactions
        patterns['view_rate'] = interaction_counts.get('view', 0) / total_interactions
        
        # معدل إكمال القراءة
        if 'read_percentage' in interactions.columns:
            avg_read_percentage = interactions['read_percentage'].mean()
            patterns['completion_rate'] = avg_read_percentage / 100
        else:
            patterns['completion_rate'] = 0.5  # قيمة افتراضية
        
        # تفضيل أنواع المحتوى
        if 'category' in interactions.columns:
            category_distribution = interactions['category'].value_counts(normalize=True)
            patterns['category_preferences'] = category_distribution.to_dict()
        
        # تحليل عمق القراءة
        if 'reading_time' in interactions.columns:
            avg_reading_time = interactions['reading_time'].mean()
            patterns['average_reading_depth'] = min(avg_reading_time / 300, 1.0)  # تطبيع لـ 5 دقائق
        
        # معدل استكشاف محتوى جديد
        unique_articles = interactions['article_id'].nunique()
        patterns['exploration_rate'] = min(unique_articles / max(total_interactions, 1), 1.0)
        
        return patterns
    
    def _calculate_engagement_preferences(self, interactions: pd.DataFrame) -> Dict[str, float]:
        """حساب تفضيلات التفاعل"""
        preferences = {}
        
        if len(interactions) == 0:
            return preferences
        
        # تفضيل أوقات التفاعل
        if 'created_at' in interactions.columns:
            interactions['hour'] = pd.to_datetime(interactions['created_at']).dt.hour
            hourly_dist = interactions['hour'].value_counts(normalize=True)
            
            # تحديد فترات النشاط المفضلة
            morning_activity = hourly_dist.get(range(6, 12), pd.Series()).sum()
            afternoon_activity = hourly_dist.get(range(12, 18), pd.Series()).sum()
            evening_activity = hourly_dist.get(range(18, 24), pd.Series()).sum()
            night_activity = hourly_dist.get(range(0, 6), pd.Series()).sum()
            
            preferences['morning_preference'] = morning_activity
            preferences['afternoon_preference'] = afternoon_activity
            preferences['evening_preference'] = evening_activity
            preferences['night_preference'] = night_activity
        
        # تفضيل أنواع التفاعل
        interaction_dist = interactions['interaction_type'].value_counts(normalize=True)
        for interaction_type, ratio in interaction_dist.items():
            preferences[f'{interaction_type}_preference'] = ratio
        
        # تفضيل طول المحتوى
        if 'content_length' in interactions.columns:
            avg_content_length = interactions['content_length'].mean()
            preferences['content_length_preference'] = min(avg_content_length / 1000, 1.0)
        
        return preferences
    
    def _build_interests_dict(self, topical_interests: Dict[str, Any], 
                            temporal_patterns: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        """بناء قاموس الاهتمامات المنظم"""
        interests = {}
        
        # إضافة الاهتمامات الموضوعية
        topics = topical_interests.get('topics', {})
        for topic_name, topic_data in topics.items():
            interests[topic_name] = {
                'type': InterestType.TOPICAL.value,
                'strength': topic_data.get('strength', 0.0),
                'keywords': topic_data.get('keywords', []),
                'description': topic_data.get('description', ''),
                'last_interaction': datetime.now()
            }
        
        # إضافة الاهتمامات الفئوية
        categories = topical_interests.get('categories', {})
        for category, category_data in categories.items():
            interests[f"فئة_{category}"] = {
                'type': InterestType.TOPICAL.value,
                'strength': category_data.get('preference_score', 0.0),
                'keywords': [category],
                'description': f"اهتمام بفئة {category}",
                'last_interaction': datetime.now()
            }
        
        # إضافة الأنماط الزمنية كاهتمامات
        primary_pattern = temporal_patterns.get('primary_usage_pattern', '')
        if primary_pattern:
            interests[f"نمط_{primary_pattern}"] = {
                'type': InterestType.TEMPORAL.value,
                'strength': 0.8,
                'keywords': [primary_pattern],
                'description': f"نمط استخدام {primary_pattern}",
                'last_interaction': datetime.now()
            }
        
        return interests
    
    def _calculate_diversity_score(self, topical_interests: Dict[str, Any], 
                                 behavior_patterns: Dict[str, Any]) -> float:
        """حساب نقاط التنوع"""
        diversity_score = 0.0
        
        # تنوع المحتوى
        content_diversity = topical_interests.get('content_diversity', 0.0)
        diversity_score += content_diversity * 0.4
        
        # تنوع الفئات
        categories_count = len(topical_interests.get('categories', {}))
        category_diversity = min(categories_count / 10, 1.0)
        diversity_score += category_diversity * 0.3
        
        # تنوع أنواع التفاعل
        interaction_types = len([k for k in behavior_patterns.keys() if k.endswith('_rate') and behavior_patterns[k] > 0])
        interaction_diversity = min(interaction_types / 5, 1.0)
        diversity_score += interaction_diversity * 0.3
        
        return min(diversity_score, 1.0)
    
    def _calculate_confidence_score(self, interactions: pd.DataFrame, 
                                  content: List[Dict[str, Any]]) -> float:
        """حساب نقاط الثقة في التحليل"""
        confidence = 0.0
        
        # عدد التفاعلات
        interaction_count = len(interactions)
        interaction_confidence = min(interaction_count / 100, 1.0)
        confidence += interaction_confidence * 0.4
        
        # تنوع التفاعلات
        interaction_types = interactions['interaction_type'].nunique() if len(interactions) > 0 else 0
        type_confidence = min(interaction_types / 5, 1.0)
        confidence += type_confidence * 0.3
        
        # فترة البيانات
        if len(interactions) > 0 and 'created_at' in interactions.columns:
            date_range = (pd.to_datetime(interactions['created_at']).max() - 
                         pd.to_datetime(interactions['created_at']).min()).days
            time_confidence = min(date_range / 30, 1.0)
            confidence += time_confidence * 0.3
        
        return confidence
    
    def update_interest_profile(self, user_id: str, new_interactions: pd.DataFrame,
                              new_content: List[Dict[str, Any]]):
        """تحديث ملف الاهتمامات"""
        if user_id not in self.user_profiles:
            return self.analyze_user_interests(user_id, new_interactions, new_content)
        
        # دمج البيانات الجديدة مع الموجودة
        current_profile = self.user_profiles[user_id]
        
        # تطبيق تراجع زمني للاهتمامات القديمة
        for interest_name, interest_data in current_profile.interests.items():
            interest_data['strength'] *= self.config.interest_decay_rate
        
        # إضافة البيانات الجديدة
        new_profile = self.analyze_user_interests(user_id, new_interactions, new_content)
        
        # دمج الاهتمامات
        merged_interests = current_profile.interests.copy()
        for interest_name, interest_data in new_profile.interests.items():
            if interest_name in merged_interests:
                # دمج الاهتمامات المتشابهة
                merged_interests[interest_name]['strength'] = max(
                    merged_interests[interest_name]['strength'],
                    interest_data['strength']
                )
            else:
                merged_interests[interest_name] = interest_data
        
        # تصفية الاهتمامات الضعيفة
        filtered_interests = {
            name: data for name, data in merged_interests.items()
            if data['strength'] >= self.config.min_interest_strength
        }
        
        # تحديد أهم الاهتمامات
        if len(filtered_interests) > self.config.max_interests_per_user:
            sorted_interests = sorted(
                filtered_interests.items(),
                key=lambda x: x[1]['strength'],
                reverse=True
            )[:self.config.max_interests_per_user]
            filtered_interests = dict(sorted_interests)
        
        # تحديث الملف
        current_profile.interests = filtered_interests
        current_profile.last_updated = datetime.now()
        
        return current_profile
    
    def get_user_interest_summary(self, user_id: str) -> Dict[str, Any]:
        """الحصول على ملخص اهتمامات المستخدم"""
        if user_id not in self.user_profiles:
            return {}
        
        profile = self.user_profiles[user_id]
        
        # ترتيب الاهتمامات حسب القوة
        sorted_interests = sorted(
            profile.interests.items(),
            key=lambda x: x[1]['strength'],
            reverse=True
        )
        
        # تصنيف الاهتمامات حسب النوع
        interests_by_type = defaultdict(list)
        for name, data in sorted_interests:
            interests_by_type[data['type']].append({
                'name': name,
                'strength': data['strength'],
                'description': data.get('description', '')
            })
        
        return {
            'user_id': user_id,
            'total_interests': len(profile.interests),
            'top_interests': sorted_interests[:5],
            'interests_by_type': dict(interests_by_type),
            'personality_summary': self._summarize_personality(profile.personality_traits),
            'behavior_summary': self._summarize_behavior(profile.behavior_patterns),
            'scores': {
                'diversity': profile.diversity_score,
                'curiosity': profile.curiosity_score,
                'consistency': profile.consistency_score,
                'confidence': profile.confidence_score
            },
            'last_updated': profile.last_updated.isoformat()
        }
    
    def _summarize_personality(self, traits: Dict[str, float]) -> Dict[str, str]:
        """تلخيص الشخصية"""
        summary = {}
        
        trait_descriptions = {
            'openness': ('منفتح على التجارب', 'محافظ'),
            'conscientiousness': ('منظم ومنضبط', 'عفوي ومرن'),
            'extraversion': ('اجتماعي ونشط', 'هادئ ومتحفظ'),
            'agreeableness': ('متعاون ومتفهم', 'تنافسي ومباشر'),
            'neuroticism': ('حساس وعاطفي', 'مستقر وهادئ'),
            'curiosity': ('فضولي ومتعلم', 'عملي ومركز')
        }
        
        for trait, score in traits.items():
            if trait in trait_descriptions:
                high_desc, low_desc = trait_descriptions[trait]
                if score > 0.6:
                    summary[trait] = high_desc
                elif score < 0.4:
                    summary[trait] = low_desc
                else:
                    summary[trait] = 'متوازن'
        
        return summary
    
    def _summarize_behavior(self, patterns: Dict[str, Any]) -> Dict[str, str]:
        """تلخيص السلوك"""
        summary = {}
        
        # نمط التفاعل
        interaction_rates = {
            'like_rate': patterns.get('like_rate', 0),
            'save_rate': patterns.get('save_rate', 0),
            'share_rate': patterns.get('share_rate', 0),
            'comment_rate': patterns.get('comment_rate', 0)
        }
        
        dominant_interaction = max(interaction_rates, key=interaction_rates.get)
        interaction_labels = {
            'like_rate': 'معجب نشط',
            'save_rate': 'جامع للمحتوى',
            'share_rate': 'مشارك اجتماعي',
            'comment_rate': 'متفاعل بالتعليقات'
        }
        
        summary['interaction_style'] = interaction_labels.get(dominant_interaction, 'متفاعل متنوع')
        
        # نمط القراءة
        completion_rate = patterns.get('completion_rate', 0.5)
        if completion_rate > 0.8:
            summary['reading_style'] = 'قارئ عميق'
        elif completion_rate > 0.5:
            summary['reading_style'] = 'قارئ متوسط'
        else:
            summary['reading_style'] = 'متصفح سريع'
        
        # نمط الاستكشاف
        exploration_rate = patterns.get('exploration_rate', 0.5)
        if exploration_rate > 0.7:
            summary['exploration_style'] = 'مستكشف نشط'
        elif exploration_rate > 0.4:
            summary['exploration_style'] = 'متوازن'
        else:
            summary['exploration_style'] = 'يفضل المألوف'
        
        return summary
    
    def save_profiles(self, filepath: str):
        """حفظ ملفات المستخدمين"""
        logger.info(f"💾 حفظ ملفات اهتمامات المستخدمين في {filepath}")
        
        # تحويل ملفات المستخدمين إلى تنسيق قابل للحفظ
        serializable_profiles = {}
        for user_id, profile in self.user_profiles.items():
            serializable_profiles[user_id] = {
                'user_id': profile.user_id,
                'interests': profile.interests,
                'personality_traits': profile.personality_traits,
                'behavior_patterns': profile.behavior_patterns,
                'engagement_preferences': profile.engagement_preferences,
                'temporal_preferences': profile.temporal_preferences,
                'diversity_score': profile.diversity_score,
                'curiosity_score': profile.curiosity_score,
                'consistency_score': profile.consistency_score,
                'confidence_score': profile.confidence_score,
                'last_updated': profile.last_updated.isoformat()
            }
        
        save_data = {
            'config': self.config,
            'user_profiles': serializable_profiles,
            'save_timestamp': datetime.now().isoformat()
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(save_data, f)
        
        logger.info(f"✅ تم حفظ {len(self.user_profiles)} ملف مستخدم")
    
    def load_profiles(self, filepath: str):
        """تحميل ملفات المستخدمين"""
        logger.info(f"📂 تحميل ملفات اهتمامات المستخدمين من {filepath}")
        
        try:
            with open(filepath, 'rb') as f:
                save_data = pickle.load(f)
            
            self.config = save_data['config']
            
            # إعادة بناء ملفات المستخدمين
            self.user_profiles = {}
            for user_id, profile_data in save_data['user_profiles'].items():
                profile = InterestProfile(
                    user_id=profile_data['user_id'],
                    interests=profile_data['interests'],
                    personality_traits=profile_data['personality_traits'],
                    behavior_patterns=profile_data['behavior_patterns'],
                    engagement_preferences=profile_data['engagement_preferences'],
                    temporal_preferences=profile_data['temporal_preferences'],
                    diversity_score=profile_data['diversity_score'],
                    curiosity_score=profile_data['curiosity_score'],
                    consistency_score=profile_data['consistency_score'],
                    confidence_score=profile_data['confidence_score'],
                    last_updated=datetime.fromisoformat(profile_data['last_updated'])
                )
                self.user_profiles[user_id] = profile
            
            logger.info(f"✅ تم تحميل {len(self.user_profiles)} ملف مستخدم")
            
        except Exception as e:
            logger.error(f"❌ فشل في تحميل ملفات المستخدمين: {str(e)}")
            raise


# مثال على الاستخدام
if __name__ == "__main__":
    # إعداد التكوين
    config = InterestAnalysisConfig(
        n_clusters=8,
        temporal_window_days=30,
        max_interests_per_user=15
    )
    
    # إنشاء بيانات تجريبية
    sample_interactions = pd.DataFrame({
        'user_id': ['user_1'] * 100,
        'article_id': [f'article_{i}' for i in range(100)],
        'interaction_type': np.random.choice(['view', 'like', 'save', 'share'], 100),
        'created_at': pd.date_range('2024-01-01', periods=100, freq='H'),
        'reading_time': np.random.randint(30, 600, 100),
        'read_percentage': np.random.randint(20, 100, 100),
        'category': np.random.choice(['سياسة', 'رياضة', 'تقنية', 'اقتصاد'], 100)
    })
    
    sample_content = [
        {
            'id': f'article_{i}',
            'title': f'عنوان المقال {i}',
            'content': f'محتوى المقال {i} يتحدث عن موضوع مهم',
            'category': np.random.choice(['سياسة', 'رياضة', 'تقنية', 'اقتصاد']),
            'interaction_type': np.random.choice(['view', 'like', 'save'])
        }
        for i in range(50)
    ]
    
    # إنشاء وتشغيل محرك التحليل
    analysis_engine = UserInterestAnalysisEngine(config)
    
    # تحليل اهتمامات المستخدم
    interest_profile = analysis_engine.analyze_user_interests(
        user_id='user_1',
        user_interactions=sample_interactions,
        user_content=sample_content
    )
    
    # الحصول على ملخص الاهتمامات
    summary = analysis_engine.get_user_interest_summary('user_1')
    
    print("🎯 ملخص اهتمامات المستخدم:")
    print(f"عدد الاهتمامات: {summary['total_interests']}")
    print(f"نقاط التنوع: {summary['scores']['diversity']:.2f}")
    print(f"نقاط الفضول: {summary['scores']['curiosity']:.2f}")
    print(f"نقاط الثقة: {summary['scores']['confidence']:.2f}")
    
    print("\n🔝 أهم الاهتمامات:")
    for name, data in summary['top_interests'][:3]:
        print(f"  {name}: {data['strength']:.2f}")
    
    print(f"\n🧠 ملخص الشخصية:")
    for trait, desc in summary['personality_summary'].items():
        print(f"  {trait}: {desc}")
