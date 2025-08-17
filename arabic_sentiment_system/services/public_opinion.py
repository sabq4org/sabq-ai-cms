# خدمة تحليل الرأي العام
# Public Opinion Analysis Service

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.decomposition import LatentDirichletAllocation
import redis.asyncio as redis
import re
import hashlib

logger = logging.getLogger(__name__)

@dataclass
class OpinionData:
    """بيانات الرأي"""
    text: str
    timestamp: datetime
    source: str
    sentiment_score: float
    sentiment_label: str
    emotion_scores: Dict[str, float]
    confidence: float
    user_id: Optional[str] = None
    location: Optional[str] = None
    influence_score: float = 1.0
    topic_relevance: float = 1.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'text': self.text,
            'timestamp': self.timestamp.isoformat(),
            'source': self.source,
            'sentiment_score': self.sentiment_score,
            'sentiment_label': self.sentiment_label,
            'emotion_scores': self.emotion_scores,
            'confidence': self.confidence,
            'user_id': self.user_id,
            'location': self.location,
            'influence_score': self.influence_score,
            'topic_relevance': self.topic_relevance
        }

@dataclass
class OpinionTrend:
    """اتجاه الرأي العام"""
    topic: str
    overall_sentiment: str
    sentiment_distribution: Dict[str, float]
    opinion_strength: float
    polarization_level: float
    dominant_emotions: List[Tuple[str, float]]
    key_themes: List[str]
    influencer_opinions: List[Dict[str, Any]]
    geographic_distribution: Dict[str, Any]
    temporal_trends: Dict[str, float]
    controversy_score: float
    reliability_score: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'topic': self.topic,
            'overall_sentiment': self.overall_sentiment,
            'sentiment_distribution': self.sentiment_distribution,
            'opinion_strength': self.opinion_strength,
            'polarization_level': self.polarization_level,
            'dominant_emotions': self.dominant_emotions,
            'key_themes': self.key_themes,
            'influencer_opinions': self.influencer_opinions,
            'geographic_distribution': self.geographic_distribution,
            'temporal_trends': self.temporal_trends,
            'controversy_score': self.controversy_score,
            'reliability_score': self.reliability_score
        }

class PublicOpinionAnalyzer:
    """محلل الرأي العام المتقدم"""
    
    def __init__(self, redis_client: redis.Redis = None):
        self.redis_client = redis_client
        
        # إعدادات التحليل
        self.min_opinions_threshold = 20
        self.polarization_threshold = 0.6
        self.controversy_threshold = 0.7
        self.influence_weight_factor = 0.3
        self.geographic_weight_factor = 0.2
        
        # مصادر البيانات المدعومة
        self.supported_sources = {
            'twitter', 'facebook', 'instagram', 'tiktok', 'youtube',
            'news_comments', 'forums', 'blogs', 'surveys', 'interviews'
        }
        
        # فئات المواضيع
        self.topic_categories = {
            'politics': ['سياسة', 'حكومة', 'انتخابات', 'سياسي', 'وزير', 'رئيس'],
            'economy': ['اقتصاد', 'مالي', 'تجارة', 'أسعار', 'رواتب', 'استثمار'],
            'sports': ['رياضة', 'كرة', 'فريق', 'بطولة', 'لاعب', 'مباراة'],
            'technology': ['تقنية', 'تكنولوجيا', 'ذكي', 'تطبيق', 'برنامج', 'رقمي'],
            'health': ['صحة', 'طب', 'مرض', 'علاج', 'دواء', 'مستشفى'],
            'education': ['تعليم', 'مدرسة', 'جامعة', 'طالب', 'معلم', 'تربية'],
            'social': ['اجتماعي', 'مجتمع', 'أسرة', 'زواج', 'شباب', 'نساء'],
            'culture': ['ثقافة', 'فن', 'أدب', 'موسيقى', 'مسرح', 'تراث']
        }
        
        # مفاتيح Redis
        self.keys = {
            'opinions': 'opinion:data',
            'topics': 'opinion:topics',
            'trends': 'opinion:trends',
            'influencers': 'opinion:influencers',
            'analysis_cache': 'opinion:cache'
        }
        
        # أوزان المصادر (مدى المصداقية)
        self.source_weights = {
            'surveys': 1.0,
            'interviews': 0.9,
            'news_comments': 0.8,
            'forums': 0.7,
            'blogs': 0.6,
            'twitter': 0.5,
            'facebook': 0.4,
            'instagram': 0.3,
            'tiktok': 0.2,
            'youtube': 0.4
        }
    
    async def collect_opinion_data(self, topic: str, sources: List[str], 
                                 time_range: str = "7d") -> List[OpinionData]:
        """جمع بيانات الرأي العام حول موضوع معين"""
        try:
            # تحويل النطاق الزمني
            hours = self._parse_time_range(time_range)
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            all_opinions = []
            
            for source in sources:
                if source in self.supported_sources:
                    source_opinions = await self._collect_from_source(
                        topic, source, cutoff_time
                    )
                    all_opinions.extend(source_opinions)
            
            # فلترة وتنظيف البيانات
            filtered_opinions = await self._filter_and_clean_opinions(
                all_opinions, topic
            )
            
            # حساب درجات الصلة بالموضوع
            for opinion in filtered_opinions:
                opinion.topic_relevance = self._calculate_topic_relevance(
                    opinion.text, topic
                )
            
            # ترتيب حسب الصلة والتأثير
            filtered_opinions.sort(
                key=lambda x: x.topic_relevance * x.influence_score,
                reverse=True
            )
            
            logger.info(f"✅ تم جمع {len(filtered_opinions)} رأي حول موضوع '{topic}'")
            return filtered_opinions
            
        except Exception as e:
            logger.error(f"❌ فشل في جمع بيانات الرأي: {str(e)}")
            return []
    
    def _parse_time_range(self, time_range: str) -> int:
        """تحويل النطاق الزمني إلى ساعات"""
        if time_range.endswith('d'):
            return int(time_range[:-1]) * 24
        elif time_range.endswith('h'):
            return int(time_range[:-1])
        else:
            return 168  # أسبوع افتراضي
    
    async def _collect_from_source(self, topic: str, source: str, 
                                 cutoff_time: datetime) -> List[OpinionData]:
        """جمع البيانات من مصدر معين"""
        # في التطبيق الحقيقي، هنا سيتم الاتصال بـ APIs المختلفة
        # حالياً سنستخدم بيانات محاكاة من Redis
        
        try:
            source_key = f"{self.keys['opinions']}:{source}:{topic}"
            
            # جلب البيانات المخزنة
            stored_data = await self.redis_client.lrange(source_key, 0, -1)
            
            opinions = []
            for data_str in stored_data:
                try:
                    data = json.loads(data_str)
                    timestamp = datetime.fromisoformat(data['timestamp'])
                    
                    if timestamp >= cutoff_time:
                        opinion = OpinionData(
                            text=data['text'],
                            timestamp=timestamp,
                            source=source,
                            sentiment_score=data['sentiment_score'],
                            sentiment_label=data['sentiment_label'],
                            emotion_scores=data['emotion_scores'],
                            confidence=data['confidence'],
                            user_id=data.get('user_id'),
                            location=data.get('location'),
                            influence_score=data.get('influence_score', 1.0)
                        )
                        opinions.append(opinion)
                        
                except (json.JSONDecodeError, KeyError, ValueError) as e:
                    logger.warning(f"⚠️ فشل في تحليل بيانات الرأي: {str(e)}")
                    continue
            
            return opinions
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في جمع البيانات من {source}: {str(e)}")
            return []
    
    async def _filter_and_clean_opinions(self, opinions: List[OpinionData], 
                                       topic: str) -> List[OpinionData]:
        """فلترة وتنظيف بيانات الآراء"""
        filtered = []
        seen_texts = set()
        
        for opinion in opinions:
            # إزالة التكرارات
            text_hash = hashlib.md5(opinion.text.encode()).hexdigest()
            if text_hash in seen_texts:
                continue
            seen_texts.add(text_hash)
            
            # فلترة النصوص القصيرة جداً أو الطويلة جداً
            if len(opinion.text) < 10 or len(opinion.text) > 1000:
                continue
            
            # فلترة النصوص ذات الثقة المنخفضة
            if opinion.confidence < 0.5:
                continue
            
            # التحقق من جودة النص
            if self._is_quality_text(opinion.text):
                filtered.append(opinion)
        
        return filtered
    
    def _is_quality_text(self, text: str) -> bool:
        """التحقق من جودة النص"""
        # إزالة النصوص التي تحتوي على رموز كثيرة
        symbol_ratio = len(re.findall(r'[^\w\s\u0600-\u06FF]', text)) / len(text)
        if symbol_ratio > 0.3:
            return False
        
        # إزالة النصوص المكررة (تكرار نفس الكلمة)
        words = text.split()
        if len(words) > 3:
            unique_words = set(words)
            if len(unique_words) / len(words) < 0.5:
                return False
        
        # التحقق من وجود كلمات عربية
        arabic_chars = len(re.findall(r'[\u0600-\u06FF]', text))
        if arabic_chars / len(text) < 0.3:
            return False
        
        return True
    
    def _calculate_topic_relevance(self, text: str, topic: str) -> float:
        """حساب درجة الصلة بالموضوع"""
        text_lower = text.lower()
        topic_lower = topic.lower()
        
        # البحث المباشر عن الموضوع
        if topic_lower in text_lower:
            base_score = 1.0
        else:
            base_score = 0.5
        
        # البحث عن كلمات مفتاحية ذات صلة
        relevance_boost = 0.0
        
        for category, keywords in self.topic_categories.items():
            for keyword in keywords:
                if keyword in text_lower:
                    # إذا كان الموضوع يتعلق بهذه الفئة
                    if any(cat_word in topic_lower for cat_word in keywords):
                        relevance_boost += 0.1
                    else:
                        relevance_boost += 0.05
        
        final_score = min(1.0, base_score + relevance_boost)
        return final_score
    
    async def analyze_opinion(self, topic: str, sources: Optional[List[str]] = None,
                            time_range: str = "7d", 
                            sentiment_threshold: float = 0.6) -> Dict[str, Any]:
        """تحليل الرأي العام حول موضوع معين"""
        try:
            # تحديد المصادر إذا لم تُحدد
            if not sources:
                sources = list(self.supported_sources)
            
            # جمع البيانات
            opinions = await self.collect_opinion_data(topic, sources, time_range)
            
            if len(opinions) < self.min_opinions_threshold:
                return {
                    'success': False,
                    'error': 'insufficient_data',
                    'message': f'البيانات غير كافية للتحليل. المطلوب: {self.min_opinions_threshold}, المتوفر: {len(opinions)}',
                    'available_opinions': len(opinions)
                }
            
            # التحليل الأساسي
            sentiment_analysis = self._analyze_sentiment_distribution(opinions)
            
            # تحليل الاستقطاب
            polarization_analysis = self._analyze_polarization(opinions)
            
            # تحليل العواطف
            emotion_analysis = self._analyze_emotions(opinions)
            
            # استخراج المواضيع والثيمات
            theme_analysis = await self._extract_themes(opinions)
            
            # تحليل المؤثرين
            influencer_analysis = self._analyze_influencers(opinions)
            
            # التحليل الجغرافي
            geographic_analysis = self._analyze_geographic_distribution(opinions)
            
            # تحليل الاتجاهات الزمنية
            temporal_analysis = self._analyze_temporal_trends(opinions)
            
            # حساب نقاط الجدل والموثوقية
            controversy_score = self._calculate_controversy_score(
                sentiment_analysis, polarization_analysis
            )
            reliability_score = self._calculate_reliability_score(
                opinions, sources
            )
            
            # تحديد الرأي العام العام
            overall_sentiment = self._determine_overall_sentiment(
                sentiment_analysis, sentiment_threshold
            )
            
            # إنشاء كائن النتيجة
            opinion_trend = OpinionTrend(
                topic=topic,
                overall_sentiment=overall_sentiment,
                sentiment_distribution=sentiment_analysis['distribution'],
                opinion_strength=sentiment_analysis['strength'],
                polarization_level=polarization_analysis['level'],
                dominant_emotions=emotion_analysis['dominant'],
                key_themes=theme_analysis['themes'],
                influencer_opinions=influencer_analysis['top_influencers'],
                geographic_distribution=geographic_analysis,
                temporal_trends=temporal_analysis['trends'],
                controversy_score=controversy_score,
                reliability_score=reliability_score
            )
            
            # تخزين النتيجة في التخزين المؤقت
            await self._cache_analysis_result(topic, opinion_trend)
            
            # إنشاء التوصيات
            recommendations = self._generate_recommendations(opinion_trend)
            
            # إحصائيات تفصيلية
            detailed_stats = self._generate_detailed_statistics(
                opinions, sentiment_analysis, emotion_analysis
            )
            
            return {
                'success': True,
                'data': {
                    'opinion_trend': opinion_trend.to_dict(),
                    'sentiment_analysis': sentiment_analysis,
                    'polarization_analysis': polarization_analysis,
                    'emotion_analysis': emotion_analysis,
                    'theme_analysis': theme_analysis,
                    'influencer_analysis': influencer_analysis,
                    'geographic_analysis': geographic_analysis,
                    'temporal_analysis': temporal_analysis,
                    'recommendations': recommendations,
                    'detailed_statistics': detailed_stats,
                    'metadata': {
                        'total_opinions': len(opinions),
                        'sources_used': sources,
                        'time_range': time_range,
                        'analysis_timestamp': datetime.now().isoformat(),
                        'sentiment_threshold': sentiment_threshold
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"❌ فشل في تحليل الرأي العام: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في تحليل الرأي العام'
            }
    
    def _analyze_sentiment_distribution(self, opinions: List[OpinionData]) -> Dict[str, Any]:
        """تحليل توزيع المشاعر"""
        positive_count = sum(1 for op in opinions if op.sentiment_label == 'positive')
        negative_count = sum(1 for op in opinions if op.sentiment_label == 'negative')
        neutral_count = sum(1 for op in opinions if op.sentiment_label == 'neutral')
        
        total = len(opinions)
        
        distribution = {
            'positive': positive_count / total,
            'negative': negative_count / total,
            'neutral': neutral_count / total
        }
        
        # حساب قوة الرأي (مدى وضوح الاتجاه)
        max_sentiment = max(distribution.values())
        strength = max_sentiment - (1/3)  # القيمة المتوقعة للتوزيع المتساوي
        
        # المتوسط المرجح للمشاعر
        weighted_scores = []
        for opinion in opinions:
            weight = opinion.influence_score * opinion.topic_relevance
            weighted_scores.append(opinion.sentiment_score * weight)
        
        weighted_average = np.mean(weighted_scores) if weighted_scores else 0.0
        
        return {
            'distribution': distribution,
            'counts': {
                'positive': positive_count,
                'negative': negative_count,
                'neutral': neutral_count,
                'total': total
            },
            'strength': strength,
            'weighted_average': weighted_average,
            'standard_deviation': np.std([op.sentiment_score for op in opinions])
        }
    
    def _analyze_polarization(self, opinions: List[OpinionData]) -> Dict[str, Any]:
        """تحليل مستوى الاستقطاب"""
        sentiment_scores = [op.sentiment_score for op in opinions]
        
        # حساب مستوى الاستقطاب بناءً على التوزيع
        # الاستقطاب عالي عندما تتجمع الآراء في الأطراف
        extreme_positive = sum(1 for score in sentiment_scores if score > 0.5)
        extreme_negative = sum(1 for score in sentiment_scores if score < -0.5)
        moderate = len(sentiment_scores) - extreme_positive - extreme_negative
        
        total = len(sentiment_scores)
        extreme_ratio = (extreme_positive + extreme_negative) / total
        
        # حساب مؤشر الاستقطاب
        # يتراوح من 0 (إجماع تام) إلى 1 (استقطاب تام)
        if total > 1:
            # استخدام الانحراف المعياري كمؤشر
            polarization_index = np.std(sentiment_scores) / 1.0  # تطبيع على أقصى انحراف ممكن
        else:
            polarization_index = 0.0
        
        # تصنيف مستوى الاستقطاب
        if polarization_index < 0.3:
            polarization_level = 'low'
            polarization_desc = 'إجماع نسبي'
        elif polarization_index < 0.6:
            polarization_level = 'moderate'
            polarization_desc = 'اختلاف معتدل'
        else:
            polarization_level = 'high'
            polarization_desc = 'استقطاب واضح'
        
        return {
            'level': polarization_index,
            'level_category': polarization_level,
            'description': polarization_desc,
            'extreme_opinions_ratio': extreme_ratio,
            'distribution': {
                'extreme_positive': extreme_positive,
                'extreme_negative': extreme_negative,
                'moderate': moderate
            }
        }
    
    def _analyze_emotions(self, opinions: List[OpinionData]) -> Dict[str, Any]:
        """تحليل العواطف في الآراء"""
        emotion_totals = defaultdict(list)
        
        for opinion in opinions:
            for emotion, score in opinion.emotion_scores.items():
                emotion_totals[emotion].append(score)
        
        # حساب متوسط كل عاطفة
        emotion_averages = {
            emotion: np.mean(scores) 
            for emotion, scores in emotion_totals.items()
        }
        
        # ترتيب العواطف حسب الشدة
        dominant_emotions = sorted(
            emotion_averages.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # حساب التنوع العاطفي
        emotion_values = list(emotion_averages.values())
        emotional_diversity = 1 - np.std(emotion_values) if emotion_values else 0
        
        # تحديد النمط العاطفي السائد
        top_emotion = dominant_emotions[0] if dominant_emotions else ('neutral', 0.0)
        
        if top_emotion[1] > 0.6:
            emotional_pattern = f'هيمنة عاطفة {top_emotion[0]}'
        elif len([e for e in emotion_averages.values() if e > 0.4]) > 2:
            emotional_pattern = 'تنوع عاطفي'
        else:
            emotional_pattern = 'حيادية عاطفية'
        
        return {
            'averages': emotion_averages,
            'dominant': dominant_emotions[:3],  # أقوى 3 عواطف
            'diversity': emotional_diversity,
            'pattern': emotional_pattern,
            'intensity_distribution': {
                'high_intensity': len([op for op in opinions if max(op.emotion_scores.values()) > 0.7]),
                'medium_intensity': len([op for op in opinions if 0.4 < max(op.emotion_scores.values()) <= 0.7]),
                'low_intensity': len([op for op in opinions if max(op.emotion_scores.values()) <= 0.4])
            }
        }
    
    async def _extract_themes(self, opinions: List[OpinionData]) -> Dict[str, Any]:
        """استخراج المواضيع والثيمات الرئيسية"""
        try:
            texts = [op.text for op in opinions if len(op.text) > 20]
            
            if len(texts) < 5:
                return {'themes': [], 'topics': [], 'keywords': []}
            
            # استخراج الكلمات المفتاحية باستخدام TF-IDF
            vectorizer = TfidfVectorizer(
                max_features=100,
                stop_words=self._get_arabic_stop_words(),
                ngram_range=(1, 2),
                max_df=0.8,
                min_df=2
            )
            
            tfidf_matrix = vectorizer.fit_transform(texts)
            feature_names = vectorizer.get_feature_names_out()
            
            # الحصول على أهم الكلمات
            scores = tfidf_matrix.sum(axis=0).A1
            word_scores = list(zip(feature_names, scores))
            word_scores.sort(key=lambda x: x[1], reverse=True)
            
            keywords = [word for word, score in word_scores[:20]]
            
            # تجميع النصوص (Topic Modeling) إذا كان لدينا بيانات كافية
            themes = []
            topics = []
            
            if len(texts) >= 10:
                try:
                    # استخدام LDA لاستخراج المواضيع
                    lda = LatentDirichletAllocation(
                        n_components=min(5, len(texts) // 3),
                        random_state=42,
                        max_iter=10
                    )
                    
                    lda.fit(tfidf_matrix)
                    
                    # استخراج المواضيع
                    for topic_idx, topic in enumerate(lda.components_):
                        top_words_idx = topic.argsort()[-5:][::-1]
                        top_words = [feature_names[i] for i in top_words_idx]
                        topics.append({
                            'id': topic_idx,
                            'words': top_words,
                            'weight': float(topic.max())
                        })
                    
                    # استخراج الثيمات العامة
                    themes = self._identify_themes_from_keywords(keywords)
                    
                except Exception as e:
                    logger.warning(f"⚠️ فشل في استخراج المواضيع: {str(e)}")
            
            return {
                'themes': themes,
                'topics': topics,
                'keywords': keywords[:10],
                'total_texts_analyzed': len(texts)
            }
            
        except Exception as e:
            logger.error(f"❌ فشل في استخراج الثيمات: {str(e)}")
            return {'themes': [], 'topics': [], 'keywords': []}
    
    def _get_arabic_stop_words(self) -> List[str]:
        """الحصول على كلمات الإيقاف العربية"""
        return [
            'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
            'التي', 'الذي', 'اللذان', 'اللتان', 'اللذين', 'اللتين', 'اللائي', 'اللواتي',
            'كان', 'كانت', 'يكون', 'تكون', 'أن', 'إن', 'لكن', 'لكن', 'غير', 'سوى',
            'ليس', 'ليست', 'ما', 'لا', 'لم', 'لن', 'قد', 'فقد', 'كل', 'بعض',
            'جميع', 'كافة', 'معظم', 'أكثر', 'أقل', 'أول', 'آخر', 'نفس', 'ذات'
        ]
    
    def _identify_themes_from_keywords(self, keywords: List[str]) -> List[str]:
        """تحديد الثيمات من الكلمات المفتاحية"""
        themes = []
        
        # مجموعات كلمات مفتاحية لثيمات مختلفة
        theme_patterns = {
            'الاقتصاد والمال': ['اقتصاد', 'مال', 'أسعار', 'تكلفة', 'راتب', 'دخل', 'استثمار'],
            'السياسة والحكم': ['سياسة', 'حكومة', 'وزير', 'قرار', 'قانون', 'سياسي'],
            'التعليم والتربية': ['تعليم', 'مدرسة', 'جامعة', 'طالب', 'معلم', 'تربية'],
            'الصحة والطب': ['صحة', 'طب', 'مرض', 'علاج', 'دواء', 'مستشفى'],
            'التقنية والتطوير': ['تقنية', 'تطوير', 'تكنولوجيا', 'برنامج', 'تطبيق'],
            'المجتمع والثقافة': ['مجتمع', 'ثقافة', 'تقليد', 'عادة', 'اجتماعي'],
            'البيئة والطبيعة': ['بيئة', 'طبيعة', 'مناخ', 'تلوث', 'نظافة']
        }
        
        for theme, pattern_words in theme_patterns.items():
            matches = sum(1 for keyword in keywords if any(word in keyword for word in pattern_words))
            if matches >= 2:  # على الأقل كلمتان مطابقتان
                themes.append(theme)
        
        return themes
    
    def _analyze_influencers(self, opinions: List[OpinionData]) -> Dict[str, Any]:
        """تحليل المؤثرين في الرأي العام"""
        # تجميع الآراء حسب المستخدم
        user_opinions = defaultdict(list)
        
        for opinion in opinions:
            if opinion.user_id:
                user_opinions[opinion.user_id].append(opinion)
        
        # تحليل المؤثرين
        influencers = []
        
        for user_id, user_ops in user_opinions.items():
            if len(user_ops) >= 2:  # المؤثر له أكثر من رأي واحد
                avg_influence = np.mean([op.influence_score for op in user_ops])
                avg_sentiment = np.mean([op.sentiment_score for op in user_ops])
                total_reach = sum(op.influence_score for op in user_ops)
                
                influencer_data = {
                    'user_id': user_id,
                    'opinion_count': len(user_ops),
                    'average_influence': avg_influence,
                    'average_sentiment': avg_sentiment,
                    'total_reach': total_reach,
                    'sentiment_consistency': 1 - np.std([op.sentiment_score for op in user_ops]),
                    'recent_opinions': [
                        {
                            'text': op.text[:100] + '...' if len(op.text) > 100 else op.text,
                            'sentiment': op.sentiment_label,
                            'timestamp': op.timestamp.isoformat()
                        }
                        for op in sorted(user_ops, key=lambda x: x.timestamp, reverse=True)[:3]
                    ]
                }
                
                influencers.append(influencer_data)
        
        # ترتيب المؤثرين
        influencers.sort(key=lambda x: x['total_reach'], reverse=True)
        
        return {
            'total_influencers': len(influencers),
            'top_influencers': influencers[:10],
            'influence_distribution': {
                'high_influence': len([inf for inf in influencers if inf['average_influence'] > 5.0]),
                'medium_influence': len([inf for inf in influencers if 2.0 < inf['average_influence'] <= 5.0]),
                'low_influence': len([inf for inf in influencers if inf['average_influence'] <= 2.0])
            }
        }
    
    def _analyze_geographic_distribution(self, opinions: List[OpinionData]) -> Dict[str, Any]:
        """تحليل التوزيع الجغرافي للآراء"""
        location_sentiments = defaultdict(list)
        
        for opinion in opinions:
            if opinion.location:
                location_sentiments[opinion.location].append(opinion.sentiment_score)
        
        geographic_analysis = {}
        
        for location, sentiments in location_sentiments.items():
            if len(sentiments) >= 3:  # الحد الأدنى للتحليل
                geographic_analysis[location] = {
                    'opinion_count': len(sentiments),
                    'average_sentiment': np.mean(sentiments),
                    'sentiment_std': np.std(sentiments),
                    'positive_ratio': len([s for s in sentiments if s > 0.1]) / len(sentiments),
                    'negative_ratio': len([s for s in sentiments if s < -0.1]) / len(sentiments)
                }
        
        # تحديد المناطق الأكثر إيجابية وسلبية
        if geographic_analysis:
            most_positive = max(geographic_analysis.items(), key=lambda x: x[1]['average_sentiment'])
            most_negative = min(geographic_analysis.items(), key=lambda x: x[1]['average_sentiment'])
            
            return {
                'regions': geographic_analysis,
                'most_positive_region': {
                    'name': most_positive[0],
                    'sentiment': most_positive[1]['average_sentiment']
                },
                'most_negative_region': {
                    'name': most_negative[0],
                    'sentiment': most_negative[1]['average_sentiment']
                },
                'total_regions': len(geographic_analysis)
            }
        
        return {'regions': {}, 'total_regions': 0}
    
    def _analyze_temporal_trends(self, opinions: List[OpinionData]) -> Dict[str, Any]:
        """تحليل الاتجاهات الزمنية"""
        # تجميع الآراء حسب الوقت
        daily_sentiments = defaultdict(list)
        
        for opinion in opinions:
            date_key = opinion.timestamp.strftime('%Y-%m-%d')
            daily_sentiments[date_key].append(opinion.sentiment_score)
        
        # حساب متوسط المشاعر لكل يوم
        daily_averages = {
            date: np.mean(sentiments)
            for date, sentiments in daily_sentiments.items()
            if len(sentiments) >= 2
        }
        
        # تحليل الاتجاه
        if len(daily_averages) >= 3:
            dates = sorted(daily_averages.keys())
            values = [daily_averages[date] for date in dates]
            
            # حساب الاتجاه الخطي
            x = list(range(len(values)))
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, values)
            
            trend_direction = 'stable'
            if abs(slope) > 0.01:
                trend_direction = 'improving' if slope > 0 else 'declining'
            
            # كشف نقاط التحول
            turning_points = []
            for i in range(1, len(values) - 1):
                if (values[i] > values[i-1] and values[i] > values[i+1]) or \
                   (values[i] < values[i-1] and values[i] < values[i+1]):
                    turning_points.append({
                        'date': dates[i],
                        'sentiment': values[i],
                        'type': 'peak' if values[i] > values[i-1] else 'valley'
                    })
            
            return {
                'trends': daily_averages,
                'trend_direction': trend_direction,
                'trend_strength': abs(r_value),
                'slope': slope,
                'turning_points': turning_points,
                'volatility': np.std(values),
                'total_days': len(daily_averages)
            }
        
        return {'trends': daily_averages, 'trend_direction': 'insufficient_data'}
    
    def _calculate_controversy_score(self, sentiment_analysis: Dict[str, Any],
                                   polarization_analysis: Dict[str, Any]) -> float:
        """حساب نقاط الجدل"""
        # الجدل عالي عندما يكون هناك استقطاب ومشاعر قوية
        polarization = polarization_analysis['level']
        opinion_strength = sentiment_analysis['strength']
        
        # تطبيع النقاط
        controversy = (polarization * 0.7) + (opinion_strength * 0.3)
        return min(1.0, controversy)
    
    def _calculate_reliability_score(self, opinions: List[OpinionData], 
                                   sources: List[str]) -> float:
        """حساب نقاط الموثوقية"""
        # اعتماد على جودة المصادر وتنوعها
        source_weights = [self.source_weights.get(source, 0.5) for source in sources]
        source_reliability = np.mean(source_weights) if source_weights else 0.5
        
        # تنوع المصادر
        source_diversity = len(set(sources)) / len(self.supported_sources)
        
        # حجم البيانات
        data_size_factor = min(1.0, len(opinions) / 100)  # تطبيع على 100 رأي
        
        # متوسط الثقة في التحليل
        avg_confidence = np.mean([op.confidence for op in opinions])
        
        # النقاط الإجمالية
        reliability = (
            source_reliability * 0.3 +
            source_diversity * 0.2 +
            data_size_factor * 0.2 +
            avg_confidence * 0.3
        )
        
        return min(1.0, reliability)
    
    def _determine_overall_sentiment(self, sentiment_analysis: Dict[str, Any],
                                   threshold: float) -> str:
        """تحديد الرأي العام الإجمالي"""
        distribution = sentiment_analysis['distribution']
        
        if distribution['positive'] > threshold:
            return 'positive'
        elif distribution['negative'] > threshold:
            return 'negative'
        elif abs(distribution['positive'] - distribution['negative']) < 0.1:
            return 'neutral'
        elif distribution['positive'] > distribution['negative']:
            return 'lean_positive'
        else:
            return 'lean_negative'
    
    async def _cache_analysis_result(self, topic: str, opinion_trend: OpinionTrend):
        """تخزين نتيجة التحليل في التخزين المؤقت"""
        try:
            if not self.redis_client:
                return
            
            cache_key = f"{self.keys['analysis_cache']}:{topic}"
            cache_data = {
                'opinion_trend': opinion_trend.to_dict(),
                'cached_at': datetime.now().isoformat()
            }
            
            await self.redis_client.setex(
                cache_key,
                3600 * 6,  # صالح لـ 6 ساعات
                json.dumps(cache_data, default=str)
            )
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في تخزين النتيجة مؤقتاً: {str(e)}")
    
    def _generate_recommendations(self, opinion_trend: OpinionTrend) -> List[Dict[str, str]]:
        """إنشاء التوصيات بناءً على تحليل الرأي العام"""
        recommendations = []
        
        # توصيات بناءً على المشاعر العامة
        if opinion_trend.overall_sentiment == 'negative':
            recommendations.append({
                'type': 'sentiment_improvement',
                'priority': 'high',
                'title': 'تحسين المشاعر العامة',
                'description': 'الرأي العام سلبي حول هذا الموضوع',
                'action': 'مراجعة السياسات أو الاستراتيجيات المتعلقة بالموضوع'
            })
        
        # توصيات بناءً على الاستقطاب
        if opinion_trend.polarization_level > 0.7:
            recommendations.append({
                'type': 'polarization_management',
                'priority': 'high',
                'title': 'إدارة الاستقطاب',
                'description': 'مستوى عالي من الاستقطاب في الآراء',
                'action': 'تنظيم حوارات مجتمعية لتقريب وجهات النظر'
            })
        
        # توصيات بناءً على الجدل
        if opinion_trend.controversy_score > 0.8:
            recommendations.append({
                'type': 'controversy_handling',
                'priority': 'medium',
                'title': 'إدارة الجدل',
                'description': 'الموضوع مثير للجدل',
                'action': 'توضيح المعلومات وتعزيز الشفافية'
            })
        
        # توصيات بناءً على الموثوقية
        if opinion_trend.reliability_score < 0.6:
            recommendations.append({
                'type': 'data_quality',
                'priority': 'medium',
                'title': 'تحسين جودة البيانات',
                'description': 'مصداقية البيانات قابلة للتحسين',
                'action': 'توسيع مصادر جمع الآراء وتحسين طرق التحليل'
            })
        
        # توصيات بناءً على العواطف المهيمنة
        if opinion_trend.dominant_emotions:
            top_emotion = opinion_trend.dominant_emotions[0]
            if top_emotion[0] in ['anger', 'fear', 'sadness'] and top_emotion[1] > 0.6:
                recommendations.append({
                    'type': 'emotion_management',
                    'priority': 'high',
                    'title': f'التعامل مع عاطفة {top_emotion[0]}',
                    'description': f'العاطفة المهيمنة هي {top_emotion[0]}',
                    'action': 'تطوير استراتيجيات للتعامل مع هذه العاطفة'
                })
        
        return recommendations
    
    def _generate_detailed_statistics(self, opinions: List[OpinionData],
                                    sentiment_analysis: Dict[str, Any],
                                    emotion_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء إحصائيات تفصيلية"""
        return {
            'total_opinions': len(opinions),
            'unique_users': len(set(op.user_id for op in opinions if op.user_id)),
            'source_breakdown': dict(Counter(op.source for op in opinions)),
            'confidence_stats': {
                'average': np.mean([op.confidence for op in opinions]),
                'min': np.min([op.confidence for op in opinions]),
                'max': np.max([op.confidence for op in opinions]),
                'std': np.std([op.confidence for op in opinions])
            },
            'influence_stats': {
                'average': np.mean([op.influence_score for op in opinions]),
                'total': np.sum([op.influence_score for op in opinions]),
                'high_influence_count': len([op for op in opinions if op.influence_score > 5.0])
            },
            'temporal_spread': {
                'earliest': min(op.timestamp for op in opinions).isoformat(),
                'latest': max(op.timestamp for op in opinions).isoformat(),
                'span_hours': (max(op.timestamp for op in opinions) - 
                             min(op.timestamp for op in opinions)).total_seconds() / 3600
            },
            'text_length_stats': {
                'average': np.mean([len(op.text) for op in opinions]),
                'min': np.min([len(op.text) for op in opinions]),
                'max': np.max([len(op.text) for op in opinions])
            }
        }

# مثال على الاستخدام
if __name__ == "__main__":
    import asyncio
    
    async def test_public_opinion():
        # إنشاء محلل الرأي العام
        analyzer = PublicOpinionAnalyzer()
        
        # محاكاة بيانات آراء متنوعة
        sample_opinions = []
        topics = ['التعليم الإلكتروني', 'الصحة العامة', 'الاقتصاد الرقمي']
        
        for i in range(50):
            # توزيع المشاعر: 40% إيجابي، 30% سلبي، 30% محايد
            if i % 10 < 4:
                sentiment_score = np.random.uniform(0.2, 0.9)
                sentiment_label = 'positive'
            elif i % 10 < 7:
                sentiment_score = np.random.uniform(-0.9, -0.2)
                sentiment_label = 'negative'
            else:
                sentiment_score = np.random.uniform(-0.2, 0.2)
                sentiment_label = 'neutral'
            
            opinion = OpinionData(
                text=f"رأي تجريبي رقم {i} حول {np.random.choice(topics)}. هذا نص محاكاة للتحليل.",
                timestamp=datetime.now() - timedelta(hours=np.random.randint(1, 168)),
                source=np.random.choice(['twitter', 'facebook', 'surveys', 'news_comments']),
                sentiment_score=sentiment_score,
                sentiment_label=sentiment_label,
                emotion_scores={
                    'joy': max(0, sentiment_score + np.random.normal(0, 0.1)),
                    'sadness': max(0, -sentiment_score + np.random.normal(0, 0.1)),
                    'anger': max(0, np.random.normal(0, 0.1)),
                    'fear': max(0, np.random.normal(0, 0.1)),
                    'trust': max(0, sentiment_score * 0.8 + np.random.normal(0, 0.05))
                },
                confidence=np.random.uniform(0.6, 0.95),
                user_id=f"user_{np.random.randint(1, 20)}",
                location=np.random.choice(['الرياض', 'جدة', 'الدمام', 'المدينة']),
                influence_score=np.random.uniform(1.0, 10.0)
            )
            
            sample_opinions.append(opinion)
        
        # تشغيل تحليل الرأي العام
        result = await analyzer.analyze_opinion(
            topic='التعليم الإلكتروني',
            sources=['twitter', 'facebook', 'surveys'],
            time_range='7d',
            sentiment_threshold=0.6
        )
        
        if result['success']:
            opinion_data = result['data']['opinion_trend']
            print(f"📊 تحليل الرأي العام حول: {opinion_data['topic']}")
            print(f"🎯 الرأي العام: {opinion_data['overall_sentiment']}")
            print(f"💪 قوة الرأي: {opinion_data['opinion_strength']:.2f}")
            print(f"⚖️ مستوى الاستقطاب: {opinion_data['polarization_level']:.2f}")
            print(f"🔥 نقاط الجدل: {opinion_data['controversy_score']:.2f}")
            print(f"✅ نقاط الموثوقية: {opinion_data['reliability_score']:.2f}")
            
            print(f"\n📈 توزيع المشاعر:")
            for sentiment, ratio in opinion_data['sentiment_distribution'].items():
                print(f"  {sentiment}: {ratio:.2%}")
            
            print(f"\n🎭 العواطف المهيمنة:")
            for emotion, intensity in opinion_data['dominant_emotions'][:3]:
                print(f"  {emotion}: {intensity:.2f}")
            
            print(f"\n🏷️ المواضيع الرئيسية:")
            themes = result['data']['theme_analysis']['themes']
            for theme in themes[:5]:
                print(f"  - {theme}")
            
            recommendations = result['data']['recommendations']
            if recommendations:
                print(f"\n💡 التوصيات:")
                for rec in recommendations[:3]:
                    print(f"  - {rec['title']}: {rec['description']}")
            
        else:
            print(f"❌ فشل التحليل: {result.get('message', 'خطأ غير معروف')}")
    
    # تشغيل الاختبار
    asyncio.run(test_public_opinion())
