# محرك التوصيات الهجين المتكيف - سبق الذكية
# Adaptive Hybrid Recommendation System

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import mean_squared_error, accuracy_score, precision_recall_fscore_support
from sklearn.model_selection import cross_val_score
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import logging
from typing import Dict, List, Tuple, Optional, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass
import joblib
import pickle
import asyncio
from concurrent.futures import ThreadPoolExecutor
import threading
import time
from collections import defaultdict, deque
import json

from .collaborative_filtering import CollaborativeFilteringEnsemble, MatrixFactorizationModel, NeuralCollaborativeFiltering
from .content_based_filtering import ContentBasedRecommender, ContentFilteringConfig

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class HybridConfig:
    """إعدادات النظام الهجين"""
    # Meta-learning settings
    meta_learning_rate: float = 0.001
    meta_epochs: int = 100
    meta_batch_size: int = 256
    
    # Ensemble settings
    ensemble_methods: List[str] = None
    base_weights: Dict[str, float] = None
    weight_update_frequency: int = 100  # عدد التفاعلات قبل تحديث الأوزان
    
    # Context awareness
    context_features: List[str] = None
    temporal_decay: float = 0.95  # تراجع زمني للتفاعلات القديمة
    recency_window: int = 30  # أيام
    
    # Cold start settings
    cold_start_threshold: int = 5  # عدد التفاعلات للمستخدم الجديد
    new_item_threshold: int = 10  # عدد التفاعلات للمقال الجديد
    
    # Performance settings
    min_confidence: float = 0.1
    max_recommendations: int = 100
    cache_ttl: int = 300  # ثواني
    
    # A/B Testing
    enable_ab_testing: bool = True
    test_ratio: float = 0.1  # نسبة المستخدمين للاختبار

    def __post_init__(self):
        if self.ensemble_methods is None:
            self.ensemble_methods = ['collaborative', 'content', 'popularity', 'temporal']
        
        if self.base_weights is None:
            self.base_weights = {
                'collaborative': 0.4,
                'content': 0.3,
                'popularity': 0.2,
                'temporal': 0.1
            }
        
        if self.context_features is None:
            self.context_features = [
                'time_of_day', 'day_of_week', 'device_type', 
                'location', 'session_length', 'user_activity_level'
            ]


class UserProfileManager:
    """
    مدير ملفات المستخدمين المتقدم
    Advanced User Profile Manager
    """
    
    def __init__(self, config: HybridConfig):
        self.config = config
        self.user_profiles = {}
        self.user_interactions = defaultdict(list)
        self.user_context_history = defaultdict(list)
        self.lock = threading.Lock()
    
    def update_user_profile(self, user_id: str, interaction_data: Dict[str, Any]):
        """تحديث ملف المستخدم بناءً على التفاعل الجديد"""
        with self.lock:
            # إضافة التفاعل الجديد
            interaction_data['timestamp'] = datetime.now()
            self.user_interactions[user_id].append(interaction_data)
            
            # الاحتفاظ بالتفاعلات الحديثة فقط
            cutoff_date = datetime.now() - timedelta(days=self.config.recency_window)
            self.user_interactions[user_id] = [
                interaction for interaction in self.user_interactions[user_id]
                if interaction['timestamp'] > cutoff_date
            ]
            
            # تحديث ملف المستخدم
            self._rebuild_user_profile(user_id)
    
    def _rebuild_user_profile(self, user_id: str):
        """إعادة بناء ملف المستخدم"""
        interactions = self.user_interactions[user_id]
        
        if not interactions:
            self.user_profiles[user_id] = self._get_default_profile()
            return
        
        profile = {
            'user_id': user_id,
            'total_interactions': len(interactions),
            'interaction_types': self._analyze_interaction_types(interactions),
            'category_preferences': self._analyze_category_preferences(interactions),
            'temporal_patterns': self._analyze_temporal_patterns(interactions),
            'engagement_level': self._calculate_engagement_level(interactions),
            'diversity_score': self._calculate_diversity_score(interactions),
            'recency_bias': self._calculate_recency_bias(interactions),
            'last_updated': datetime.now(),
            'profile_confidence': self._calculate_profile_confidence(interactions)
        }
        
        self.user_profiles[user_id] = profile
    
    def _analyze_interaction_types(self, interactions: List[Dict]) -> Dict[str, float]:
        """تحليل أنواع التفاعلات"""
        type_counts = defaultdict(int)
        for interaction in interactions:
            type_counts[interaction.get('interaction_type', 'view')] += 1
        
        total = len(interactions)
        return {itype: count / total for itype, count in type_counts.items()}
    
    def _analyze_category_preferences(self, interactions: List[Dict]) -> Dict[str, float]:
        """تحليل تفضيلات الفئات"""
        category_scores = defaultdict(float)
        total_weight = 0
        
        for interaction in interactions:
            category = interaction.get('category', 'other')
            weight = self._get_interaction_weight(interaction)
            category_scores[category] += weight
            total_weight += weight
        
        if total_weight > 0:
            return {cat: score / total_weight for cat, score in category_scores.items()}
        return {}
    
    def _analyze_temporal_patterns(self, interactions: List[Dict]) -> Dict[str, Any]:
        """تحليل الأنماط الزمنية"""
        hours = []
        days = []
        
        for interaction in interactions:
            timestamp = interaction['timestamp']
            hours.append(timestamp.hour)
            days.append(timestamp.weekday())
        
        return {
            'preferred_hours': list(set(hours)),
            'active_days': list(set(days)),
            'peak_hour': max(set(hours), key=hours.count) if hours else 12,
            'peak_day': max(set(days), key=days.count) if days else 0
        }
    
    def _calculate_engagement_level(self, interactions: List[Dict]) -> float:
        """حساب مستوى التفاعل"""
        if not interactions:
            return 0.0
        
        engagement_weights = {
            'view': 1.0,
            'like': 3.0,
            'save': 4.0,
            'share': 5.0,
            'comment': 4.5
        }
        
        total_score = sum(
            engagement_weights.get(interaction.get('interaction_type', 'view'), 1.0)
            for interaction in interactions
        )
        
        return min(total_score / len(interactions), 5.0)
    
    def _calculate_diversity_score(self, interactions: List[Dict]) -> float:
        """حساب درجة التنوع"""
        categories = [interaction.get('category', 'other') for interaction in interactions]
        unique_categories = len(set(categories))
        total_categories = len(categories)
        
        return unique_categories / max(total_categories, 1) if total_categories > 0 else 0.0
    
    def _calculate_recency_bias(self, interactions: List[Dict]) -> float:
        """حساب انحياز الحداثة"""
        if len(interactions) < 2:
            return 0.5
        
        # ترتيب التفاعلات حسب الوقت
        sorted_interactions = sorted(interactions, key=lambda x: x['timestamp'])
        
        # حساب متوسط الفجوة الزمنية
        time_gaps = []
        for i in range(1, len(sorted_interactions)):
            gap = (sorted_interactions[i]['timestamp'] - sorted_interactions[i-1]['timestamp']).total_seconds()
            time_gaps.append(gap)
        
        if not time_gaps:
            return 0.5
        
        avg_gap = np.mean(time_gaps)
        # تطبيع الانحياز بين 0 و 1
        return min(1.0, 3600 / max(avg_gap, 3600))  # ساعة واحدة كمرجع
    
    def _calculate_profile_confidence(self, interactions: List[Dict]) -> float:
        """حساب ثقة الملف الشخصي"""
        if len(interactions) < self.config.cold_start_threshold:
            return 0.2
        
        # عوامل الثقة
        quantity_factor = min(len(interactions) / 50, 1.0)  # ثقة بناءً على العدد
        diversity_factor = self._calculate_diversity_score(interactions)
        recency_factor = min(len([i for i in interactions 
                                if (datetime.now() - i['timestamp']).days <= 7]) / 10, 1.0)
        
        return (quantity_factor + diversity_factor + recency_factor) / 3
    
    def _get_interaction_weight(self, interaction: Dict) -> float:
        """حساب وزن التفاعل"""
        base_weights = {
            'view': 1.0,
            'like': 3.0,
            'save': 4.0,
            'share': 5.0,
            'comment': 4.5
        }
        
        base_weight = base_weights.get(interaction.get('interaction_type', 'view'), 1.0)
        
        # تطبيق تراجع زمني
        days_ago = (datetime.now() - interaction['timestamp']).days
        time_decay = self.config.temporal_decay ** days_ago
        
        return base_weight * time_decay
    
    def _get_default_profile(self) -> Dict[str, Any]:
        """ملف افتراضي للمستخدمين الجدد"""
        return {
            'user_id': None,
            'total_interactions': 0,
            'interaction_types': {},
            'category_preferences': {},
            'temporal_patterns': {},
            'engagement_level': 0.0,
            'diversity_score': 0.0,
            'recency_bias': 0.5,
            'last_updated': datetime.now(),
            'profile_confidence': 0.0
        }
    
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """الحصول على ملف المستخدم"""
        if user_id not in self.user_profiles:
            return self._get_default_profile()
        return self.user_profiles[user_id].copy()
    
    def is_cold_start_user(self, user_id: str) -> bool:
        """تحديد ما إذا كان المستخدم جديد"""
        profile = self.get_user_profile(user_id)
        return profile['total_interactions'] < self.config.cold_start_threshold


class ContextualFeatureExtractor:
    """
    مستخرج المعالم السياقية
    Contextual Feature Extractor
    """
    
    def __init__(self, config: HybridConfig):
        self.config = config
        self.feature_history = defaultdict(list)
    
    def extract_context_features(self, user_id: str, request_context: Dict[str, Any]) -> np.ndarray:
        """استخراج المعالم السياقية"""
        features = []
        
        # معالم زمنية
        now = datetime.now()
        features.extend([
            now.hour / 24.0,  # ساعة اليوم
            now.weekday() / 6.0,  # يوم الأسبوع
            now.day / 31.0,  # يوم الشهر
            (now.month - 1) / 11.0  # الشهر
        ])
        
        # معالم الجهاز
        device_type = request_context.get('device_type', 'desktop')
        device_features = [
            1.0 if device_type == 'mobile' else 0.0,
            1.0 if device_type == 'tablet' else 0.0,
            1.0 if device_type == 'desktop' else 0.0
        ]
        features.extend(device_features)
        
        # معالم الموقع (مبسطة)
        location = request_context.get('location', {})
        features.extend([
            hash(location.get('country', 'unknown')) % 100 / 100.0,
            hash(location.get('city', 'unknown')) % 100 / 100.0
        ])
        
        # معالم الجلسة
        features.extend([
            min(request_context.get('session_length', 0) / 3600, 1.0),  # طول الجلسة (ساعات)
            min(request_context.get('pages_visited', 0) / 20, 1.0),  # عدد الصفحات
            request_context.get('is_returning_user', 0)
        ])
        
        # معالم النشاط الحديث
        recent_activity = self._get_recent_activity_features(user_id)
        features.extend(recent_activity)
        
        # التأكد من أن عدد المعالم ثابت
        target_length = 20  # عدد المعالم المطلوب
        while len(features) < target_length:
            features.append(0.0)
        
        return np.array(features[:target_length])
    
    def _get_recent_activity_features(self, user_id: str) -> List[float]:
        """استخراج معالم النشاط الحديث"""
        # يمكن توسيعها للحصول على بيانات النشاط الحديث
        return [
            0.5,  # مستوى النشاط في آخر ساعة
            0.3,  # مستوى النشاط في آخر يوم
            0.7,  # مستوى النشاط في آخر أسبوع
            0.1   # النشاط المقارن بالمتوسط
        ]


class AdaptiveWeightingModule:
    """
    وحدة الوزن المتكيف
    Adaptive Weighting Module
    """
    
    def __init__(self, config: HybridConfig):
        self.config = config
        self.method_weights = config.base_weights.copy()
        self.performance_history = defaultdict(list)
        self.weight_model = None
        self.feature_extractor = ContextualFeatureExtractor(config)
        self._build_weight_model()
    
    def _build_weight_model(self):
        """بناء نموذج التوزين المتكيف"""
        input_dim = 20  # حجم المعالم السياقية
        n_methods = len(self.config.ensemble_methods)
        
        self.weight_model = keras.Sequential([
            layers.Dense(64, activation='relu', input_dim=input_dim),
            layers.Dropout(0.3),
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(16, activation='relu'),
            layers.Dense(n_methods, activation='softmax')
        ])
        
        self.weight_model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
    
    def get_adaptive_weights(self, user_id: str, context: Dict[str, Any]) -> Dict[str, float]:
        """الحصول على الأوزان المتكيفة"""
        # استخراج المعالم السياقية
        context_features = self.feature_extractor.extract_context_features(user_id, context)
        
        # التنبؤ بالأوزان
        if self.weight_model is not None:
            try:
                predicted_weights = self.weight_model.predict(
                    context_features.reshape(1, -1), 
                    verbose=0
                )[0]
                
                # تحويل إلى قاموس
                weights = {}
                for i, method in enumerate(self.config.ensemble_methods):
                    weights[method] = float(predicted_weights[i])
                
                return weights
            except:
                logger.warning("⚠️ فشل في التنبؤ بالأوزان، استخدام الأوزان الافتراضية")
        
        return self.method_weights.copy()
    
    def update_weights_from_feedback(self, user_id: str, context: Dict[str, Any],
                                   method_scores: Dict[str, float], 
                                   actual_feedback: float):
        """تحديث الأوزان بناءً على التغذية الراجعة"""
        # حفظ الأداء لكل طريقة
        for method, score in method_scores.items():
            self.performance_history[method].append({
                'predicted_score': score,
                'actual_feedback': actual_feedback,
                'context': context,
                'timestamp': datetime.now()
            })
        
        # تحديث الأوزان إذا توفرت بيانات كافية
        if sum(len(history) for history in self.performance_history.values()) >= self.config.weight_update_frequency:
            self._retrain_weight_model()
    
    def _retrain_weight_model(self):
        """إعادة تدريب نموذج الأوزان"""
        logger.info("🔄 إعادة تدريب نموذج الأوزان المتكيفة...")
        
        try:
            # تحضير بيانات التدريب
            X, y = self._prepare_weight_training_data()
            
            if len(X) > 50:  # تدريب فقط إذا توفرت بيانات كافية
                self.weight_model.fit(
                    X, y,
                    epochs=10,
                    batch_size=32,
                    verbose=0,
                    validation_split=0.2
                )
                logger.info("✅ تم إعادة تدريب نموذج الأوزان")
            
        except Exception as e:
            logger.error(f"❌ فشل في إعادة تدريب نموذج الأوزان: {str(e)}")
    
    def _prepare_weight_training_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """تحضير بيانات تدريب نموذج الأوزان"""
        X = []
        y = []
        
        # جمع البيانات من تاريخ الأداء
        for method, history in self.performance_history.items():
            for record in history[-100:]:  # آخر 100 سجل
                context_features = self.feature_extractor.extract_context_features(
                    'dummy_user', record['context']
                )
                X.append(context_features)
                
                # إنشاء تسمية الهدف (أفضل أداء يحصل على وزن أعلى)
                performance_score = abs(record['actual_feedback'] - record['predicted_score'])
                
                # تحويل إلى توزيع أوزان
                method_index = self.config.ensemble_methods.index(method)
                target_weights = np.zeros(len(self.config.ensemble_methods))
                target_weights[method_index] = 1.0 - performance_score  # كلما قل الخطأ، زاد الوزن
                
                y.append(target_weights)
        
        return np.array(X), np.array(y)


class HybridRecommendationEngine:
    """
    محرك التوصيات الهجين المتكيف الرئيسي
    Main Adaptive Hybrid Recommendation Engine
    """
    
    def __init__(self, config: HybridConfig):
        self.config = config
        self.collaborative_model = None
        self.content_model = None
        self.user_profile_manager = UserProfileManager(config)
        self.adaptive_weighting = AdaptiveWeightingModule(config)
        self.popularity_scores = {}
        self.recommendation_cache = {}
        self.performance_metrics = defaultdict(list)
        self.ab_test_groups = {}
        
        # قفل للعمليات المتزامنة
        self.lock = threading.Lock()
    
    def set_collaborative_model(self, model: CollaborativeFilteringEnsemble):
        """تعيين نموذج التصفية التعاونية"""
        self.collaborative_model = model
        logger.info("✅ تم تعيين نموذج التصفية التعاونية")
    
    def set_content_model(self, model: ContentBasedRecommender):
        """تعيين نموذج التصفية المحتوائية"""
        self.content_model = model
        logger.info("✅ تم تعيين نموذج التصفية المحتوائية")
    
    def update_popularity_scores(self, articles_df: pd.DataFrame):
        """تحديث نقاط الشعبية"""
        logger.info("📊 تحديث نقاط الشعبية...")
        
        # حساب نقاط الشعبية بناءً على التفاعلات
        for _, article in articles_df.iterrows():
            score = 0.0
            
            # عوامل الشعبية
            views = article.get('views', 0)
            likes = article.get('likes', 0)
            shares = article.get('shares', 0)
            comments = article.get('comments', 0)
            
            # حساب النقاط المرجحة
            score = (
                views * 1.0 +
                likes * 3.0 +
                shares * 5.0 +
                comments * 4.0
            )
            
            # تطبيق تراجع زمني
            if 'created_at' in article:
                days_old = (datetime.now() - pd.to_datetime(article['created_at'])).days
                time_decay = self.config.temporal_decay ** days_old
                score *= time_decay
            
            self.popularity_scores[article['id']] = score
        
        # تطبيع النقاط
        if self.popularity_scores:
            max_score = max(self.popularity_scores.values())
            if max_score > 0:
                for article_id in self.popularity_scores:
                    self.popularity_scores[article_id] /= max_score
        
        logger.info(f"✅ تم تحديث نقاط الشعبية لـ {len(self.popularity_scores)} مقال")
    
    def get_hybrid_recommendations(self, user_id: str, context: Dict[str, Any],
                                 n_recommendations: int = 10,
                                 exclude_articles: Optional[List[str]] = None) -> List[Tuple[str, float, Dict[str, Any]]]:
        """الحصول على التوصيات الهجينة"""
        # تحقق من التخزين المؤقت
        cache_key = f"{user_id}_{hash(str(context))}_{n_recommendations}"
        if cache_key in self.recommendation_cache:
            cached_result, timestamp = self.recommendation_cache[cache_key]
            if (datetime.now() - timestamp).seconds < self.config.cache_ttl:
                return cached_result
        
        # الحصول على ملف المستخدم
        user_profile = self.user_profile_manager.get_user_profile(user_id)
        is_cold_start = self.user_profile_manager.is_cold_start_user(user_id)
        
        # الحصول على الأوزان المتكيفة
        adaptive_weights = self.adaptive_weighting.get_adaptive_weights(user_id, context)
        
        # جمع التوصيات من الطرق المختلفة
        all_recommendations = defaultdict(lambda: {'score': 0.0, 'methods': {}, 'confidence': 0.0})
        total_weight = 0.0
        
        # التوصيات التعاونية
        if self.collaborative_model and not is_cold_start:
            try:
                collab_recs = self._get_collaborative_recommendations(
                    user_id, n_recommendations * 2, exclude_articles
                )
                weight = adaptive_weights.get('collaborative', 0.0)
                self._merge_recommendations(all_recommendations, collab_recs, 
                                         weight, 'collaborative')
                total_weight += weight
            except Exception as e:
                logger.warning(f"⚠️ فشل في الحصول على توصيات تعاونية: {str(e)}")
        
        # التوصيات المحتوائية
        if self.content_model:
            try:
                content_recs = self._get_content_recommendations(
                    user_id, user_profile, n_recommendations * 2, exclude_articles
                )
                weight = adaptive_weights.get('content', 0.0)
                self._merge_recommendations(all_recommendations, content_recs,
                                         weight, 'content')
                total_weight += weight
            except Exception as e:
                logger.warning(f"⚠️ فشل في الحصول على توصيات محتوائية: {str(e)}")
        
        # توصيات الشعبية
        try:
            popularity_recs = self._get_popularity_recommendations(
                n_recommendations * 2, exclude_articles
            )
            weight = adaptive_weights.get('popularity', 0.0)
            self._merge_recommendations(all_recommendations, popularity_recs,
                                     weight, 'popularity')
            total_weight += weight
        except Exception as e:
            logger.warning(f"⚠️ فشل في الحصول على توصيات الشعبية: {str(e)}")
        
        # توصيات زمنية (الحداثة)
        try:
            temporal_recs = self._get_temporal_recommendations(
                context, n_recommendations * 2, exclude_articles
            )
            weight = adaptive_weights.get('temporal', 0.0)
            self._merge_recommendations(all_recommendations, temporal_recs,
                                     weight, 'temporal')
            total_weight += weight
        except Exception as e:
            logger.warning(f"⚠️ فشل في الحصول على توصيات زمنية: {str(e)}")
        
        # تطبيع النقاط وحساب الثقة
        final_recommendations = []
        for article_id, rec_data in all_recommendations.items():
            if total_weight > 0:
                normalized_score = rec_data['score'] / total_weight
                
                # حساب الثقة بناءً على عدد الطرق المساهمة
                confidence = len(rec_data['methods']) / len(self.config.ensemble_methods)
                
                # إضافة عوامل إضافية للثقة
                confidence *= user_profile.get('profile_confidence', 0.5)
                
                if normalized_score >= self.config.min_confidence:
                    final_recommendations.append((
                        article_id,
                        normalized_score,
                        {
                            'methods': rec_data['methods'],
                            'confidence': confidence,
                            'weights_used': adaptive_weights
                        }
                    ))
        
        # ترتيب وتحديد العدد المطلوب
        final_recommendations.sort(key=lambda x: x[1], reverse=True)
        final_recommendations = final_recommendations[:n_recommendations]
        
        # تطبيق تنويع إضافي
        final_recommendations = self._apply_diversification(
            final_recommendations, user_profile
        )
        
        # حفظ في التخزين المؤقت
        self.recommendation_cache[cache_key] = (final_recommendations, datetime.now())
        
        logger.info(f"🎯 تم إنشاء {len(final_recommendations)} توصية هجينة للمستخدم {user_id}")
        
        return final_recommendations
    
    def _get_collaborative_recommendations(self, user_id: str, n_recs: int,
                                        exclude_articles: Optional[List[str]]) -> List[Tuple[str, float]]:
        """الحصول على توصيات تعاونية"""
        if not self.collaborative_model:
            return []
        
        seen_items = exclude_articles or []
        return self.collaborative_model.get_ensemble_recommendations(
            user_id=user_id,
            n_recommendations=n_recs,
            exclude_seen=True,
            seen_items=seen_items
        )
    
    def _get_content_recommendations(self, user_id: str, user_profile: Dict[str, Any],
                                   n_recs: int, exclude_articles: Optional[List[str]]) -> List[Tuple[str, float]]:
        """الحصول على توصيات محتوائية"""
        if not self.content_model:
            return []
        
        # استخدام تفضيلات المستخدم لتحسين التوصيات
        user_articles = []
        if 'liked_articles' in user_profile:
            user_articles = user_profile['liked_articles']
        
        return self.content_model.get_content_recommendations(
            user_articles=user_articles,
            n_recommendations=n_recs,
            exclude_articles=exclude_articles
        )
    
    def _get_popularity_recommendations(self, n_recs: int,
                                     exclude_articles: Optional[List[str]]) -> List[Tuple[str, float]]:
        """الحصول على توصيات الشعبية"""
        exclude_set = set(exclude_articles or [])
        
        # ترتيب المقالات حسب الشعبية
        popular_articles = [
            (article_id, score) for article_id, score in self.popularity_scores.items()
            if article_id not in exclude_set
        ]
        
        popular_articles.sort(key=lambda x: x[1], reverse=True)
        return popular_articles[:n_recs]
    
    def _get_temporal_recommendations(self, context: Dict[str, Any], n_recs: int,
                                    exclude_articles: Optional[List[str]]) -> List[Tuple[str, float]]:
        """الحصول على توصيات زمنية (حداثة)"""
        exclude_set = set(exclude_articles or [])
        
        # تفضيل المقالات الحديثة بناءً على السياق
        current_hour = datetime.now().hour
        
        # يمكن تحسين هذا ليأخذ في الاعتبار أوقات النشر والاتجاهات
        temporal_scores = {}
        for article_id, popularity_score in self.popularity_scores.items():
            if article_id not in exclude_set:
                # تطبيق عامل زمني بناءً على الوقت الحالي
                temporal_factor = 1.0
                if 6 <= current_hour <= 12:  # صباحاً - تفضيل الأخبار
                    temporal_factor = 1.2
                elif 18 <= current_hour <= 23:  # مساءً - تفضيل المحتوى الترفيهي
                    temporal_factor = 1.1
                
                temporal_scores[article_id] = popularity_score * temporal_factor
        
        # ترتيب حسب النقاط الزمنية
        temporal_recs = sorted(temporal_scores.items(), key=lambda x: x[1], reverse=True)
        return temporal_recs[:n_recs]
    
    def _merge_recommendations(self, all_recs: Dict, new_recs: List[Tuple[str, float]],
                             weight: float, method_name: str):
        """دمج توصيات جديدة مع الموجودة"""
        for article_id, score in new_recs:
            all_recs[article_id]['score'] += score * weight
            all_recs[article_id]['methods'][method_name] = score * weight
    
    def _apply_diversification(self, recommendations: List[Tuple[str, float, Dict]],
                             user_profile: Dict[str, Any]) -> List[Tuple[str, float, Dict]]:
        """تطبيق التنويع على التوصيات"""
        if len(recommendations) <= 3:
            return recommendations
        
        # تنويع بسيط بناءً على الفئات (إذا كانت متاحة)
        diversified = []
        used_categories = set()
        
        # إضافة أفضل التوصيات أولاً
        for rec in recommendations[:3]:
            diversified.append(rec)
            # يمكن إضافة منطق لتتبع الفئات
        
        # إضافة باقي التوصيات مع مراعاة التنويع
        for rec in recommendations[3:]:
            # يمكن إضافة منطق تنويع أكثر تطوراً هنا
            diversified.append(rec)
            if len(diversified) >= len(recommendations):
                break
        
        return diversified
    
    def record_user_feedback(self, user_id: str, article_id: str, 
                           feedback_type: str, feedback_value: float,
                           context: Dict[str, Any]):
        """تسجيل تغذية راجعة من المستخدم"""
        # تحديث ملف المستخدم
        interaction_data = {
            'article_id': article_id,
            'interaction_type': feedback_type,
            'rating': feedback_value,
            'context': context
        }
        
        self.user_profile_manager.update_user_profile(user_id, interaction_data)
        
        # تحديث أداء الطرق المختلفة
        # (يتطلب تتبع أي طريقة أوصت بهذا المقال)
        
        logger.info(f"📝 تم تسجيل تغذية راجعة: {user_id} -> {article_id} ({feedback_type}: {feedback_value})")
    
    def get_explanation(self, user_id: str, article_id: str, 
                       recommendation_data: Dict[str, Any]) -> Dict[str, Any]:
        """شرح سبب التوصية"""
        explanation = {
            'article_id': article_id,
            'user_id': user_id,
            'overall_confidence': recommendation_data.get('confidence', 0.0),
            'methods_contribution': recommendation_data.get('methods', {}),
            'weights_used': recommendation_data.get('weights_used', {}),
            'user_profile_factors': [],
            'contextual_factors': []
        }
        
        # إضافة عوامل ملف المستخدم
        user_profile = self.user_profile_manager.get_user_profile(user_id)
        if user_profile['category_preferences']:
            explanation['user_profile_factors'].append({
                'factor': 'category_preferences',
                'value': user_profile['category_preferences']
            })
        
        # إضافة عوامل سياقية
        explanation['contextual_factors'].append({
            'factor': 'recommendation_time',
            'value': datetime.now().isoformat()
        })
        
        return explanation
    
    def optimize_weights(self, validation_interactions: List[Dict[str, Any]]):
        """تحسين أوزان الطرق المختلفة"""
        logger.info("🎯 تحسين أوزان النظام الهجين...")
        
        # يمكن تطبيق خوارزمية تحسين متقدمة هنا
        # للبساطة، سنستخدم تقييم أداء بسيط
        
        method_performance = defaultdict(list)
        
        for interaction in validation_interactions:
            user_id = interaction['user_id']
            article_id = interaction['article_id']
            actual_rating = interaction.get('rating', 1.0)
            
            # محاكاة التوصيات من كل طريقة
            context = interaction.get('context', {})
            
            try:
                # الحصول على توصيات من كل طريقة منفصلة
                if self.collaborative_model:
                    collab_recs = self._get_collaborative_recommendations(user_id, 20, [])
                    collab_score = next((score for aid, score in collab_recs if aid == article_id), 0.0)
                    method_performance['collaborative'].append(abs(actual_rating - collab_score))
                
                if self.content_model:
                    user_profile = self.user_profile_manager.get_user_profile(user_id)
                    content_recs = self._get_content_recommendations(user_id, user_profile, 20, [])
                    content_score = next((score for aid, score in content_recs if aid == article_id), 0.0)
                    method_performance['content'].append(abs(actual_rating - content_score))
                
                # نفس الشيء للطرق الأخرى...
                
            except Exception as e:
                logger.warning(f"⚠️ خطأ في تقييم الأداء: {str(e)}")
                continue
        
        # حساب أوزان جديدة بناءً على الأداء
        new_weights = {}
        total_inverse_error = 0
        
        for method, errors in method_performance.items():
            if errors:
                avg_error = np.mean(errors)
                inverse_error = 1.0 / (1.0 + avg_error)
                new_weights[method] = inverse_error
                total_inverse_error += inverse_error
        
        # تطبيع الأوزان
        if total_inverse_error > 0:
            for method in new_weights:
                new_weights[method] /= total_inverse_error
            
            # تحديث الأوزان الأساسية
            self.config.base_weights.update(new_weights)
            logger.info(f"✅ تم تحديث الأوزان: {new_weights}")
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """الحصول على مقاييس الأداء"""
        return {
            'total_recommendations': sum(len(metrics) for metrics in self.performance_metrics.values()),
            'cache_hit_rate': len(self.recommendation_cache) / max(1, len(self.performance_metrics)),
            'active_users': len(self.user_profile_manager.user_profiles),
            'method_weights': self.config.base_weights.copy(),
            'last_update': datetime.now().isoformat()
        }
    
    def save_model(self, filepath: str):
        """حفظ النظام الهجين"""
        logger.info(f"💾 حفظ النظام الهجين في {filepath}")
        
        model_data = {
            'config': self.config,
            'user_profiles': dict(self.user_profile_manager.user_profiles),
            'popularity_scores': self.popularity_scores,
            'method_weights': self.config.base_weights,
            'performance_metrics': dict(self.performance_metrics),
            'save_timestamp': datetime.now().isoformat()
        }
        
        with open(f"{filepath}_hybrid_system.pkl", 'wb') as f:
            pickle.dump(model_data, f)
        
        # حفظ نموذج الأوزان المتكيفة
        if self.adaptive_weighting.weight_model:
            self.adaptive_weighting.weight_model.save(f"{filepath}_weight_model.h5")
        
        logger.info("✅ تم حفظ النظام الهجين")
    
    def load_model(self, filepath: str):
        """تحميل النظام الهجين"""
        logger.info(f"📂 تحميل النظام الهجين من {filepath}")
        
        try:
            with open(f"{filepath}_hybrid_system.pkl", 'rb') as f:
                model_data = pickle.load(f)
            
            self.config = model_data['config']
            self.user_profile_manager.user_profiles = model_data['user_profiles']
            self.popularity_scores = model_data['popularity_scores']
            self.performance_metrics = defaultdict(list, model_data['performance_metrics'])
            
            # تحميل نموذج الأوزان المتكيفة
            try:
                self.adaptive_weighting.weight_model = keras.models.load_model(
                    f"{filepath}_weight_model.h5"
                )
            except:
                logger.warning("⚠️ فشل في تحميل نموذج الأوزان المتكيفة")
            
            logger.info("✅ تم تحميل النظام الهجين")
            
        except Exception as e:
            logger.error(f"❌ فشل في تحميل النظام الهجين: {str(e)}")
            raise


# مثال على الاستخدام
if __name__ == "__main__":
    # إعداد التكوين
    config = HybridConfig(
        ensemble_methods=['collaborative', 'content', 'popularity', 'temporal'],
        base_weights={
            'collaborative': 0.4,
            'content': 0.3,
            'popularity': 0.2,
            'temporal': 0.1
        }
    )
    
    # إنشاء النظام الهجين
    hybrid_engine = HybridRecommendationEngine(config)
    
    # محاكاة تحديث نقاط الشعبية
    sample_articles = pd.DataFrame({
        'id': [f'article_{i}' for i in range(100)],
        'views': np.random.randint(100, 10000, 100),
        'likes': np.random.randint(0, 500, 100),
        'shares': np.random.randint(0, 100, 100),
        'comments': np.random.randint(0, 50, 100),
        'created_at': pd.date_range('2024-01-01', periods=100, freq='H')
    })
    
    hybrid_engine.update_popularity_scores(sample_articles)
    
    # محاكاة الحصول على توصيات
    context = {
        'device_type': 'mobile',
        'location': {'country': 'SA', 'city': 'Riyadh'},
        'session_length': 1800,
        'is_returning_user': True
    }
    
    recommendations = hybrid_engine.get_hybrid_recommendations(
        user_id='user_123',
        context=context,
        n_recommendations=5
    )
    
    print("🎯 التوصيات الهجينة:")
    for article_id, score, metadata in recommendations:
        print(f"  {article_id}: {score:.3f} (ثقة: {metadata['confidence']:.3f})")
    
    # تسجيل تغذية راجعة
    hybrid_engine.record_user_feedback(
        user_id='user_123',
        article_id='article_1',
        feedback_type='like',
        feedback_value=1.0,
        context=context
    )
