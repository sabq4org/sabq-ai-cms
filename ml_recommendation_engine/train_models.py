#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
محرك التوصيات الذكي - سبق الذكية
نص تدريب النماذج من البيانات الفعلية
Sabq AI Recommendation Engine - Model Training Script
"""

import asyncio
import logging
import sys
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

# إضافة المسار الحالي لاستيراد المكتبات
sys.path.append(str(Path(__file__).parent))

from config import settings, MODEL_CONFIG
from infrastructure.database_manager import DatabaseManager
from infrastructure.redis_manager import RedisManager
from infrastructure.s3_manager import S3Manager
from models.collaborative_filtering import CollaborativeFiltering
from models.content_based_filtering import ContentBasedFiltering
from models.deep_learning_models import DeepLearningModels
from models.hybrid_recommendation import HybridRecommendation
from models.user_interest_analysis import UserInterestAnalysis
from models.contextual_recommendations import ContextualRecommendations
from models.continuous_learning import ContinuousLearning

# إعداد السجلات
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
)
logger = logging.getLogger(__name__)

class ModelTrainer:
    """مدرب النماذج الشامل"""
    
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.redis_manager = RedisManager()
        self.s3_manager = S3Manager()
        
        # النماذج
        self.collaborative_model = CollaborativeFiltering()
        self.content_model = ContentBasedFiltering()
        self.deep_models = DeepLearningModels()
        self.hybrid_model = HybridRecommendation()
        self.user_interest_model = UserInterestAnalysis()
        self.contextual_model = ContextualRecommendations()
        self.continuous_model = ContinuousLearning()
        
        # إحصائيات التدريب
        self.training_stats = {}
        
    async def initialize(self):
        """تهيئة الاتصالات"""
        try:
            await self.db_manager.initialize()
            await self.redis_manager.initialize()
            await self.s3_manager.initialize()
            logger.info("تم تهيئة جميع الاتصالات بنجاح")
        except Exception as e:
            logger.error(f"خطأ في تهيئة الاتصالات: {e}")
            raise
    
    async def load_training_data(self) -> Dict[str, pd.DataFrame]:
        """تحميل بيانات التدريب من قاعدة البيانات"""
        logger.info("بدء تحميل بيانات التدريب...")
        
        try:
            # تحميل تفاعلات المستخدمين
            interactions_query = """
            SELECT 
                user_id,
                article_id,
                interaction_type,
                rating,
                reading_time,
                scroll_depth,
                created_at,
                context_data
            FROM user_interactions 
            WHERE created_at >= NOW() - INTERVAL '6 months'
            ORDER BY created_at DESC
            """
            
            interactions_df = await self.db_manager.fetch_dataframe(interactions_query)
            logger.info(f"تم تحميل {len(interactions_df)} تفاعل مستخدم")
            
            # تحميل بيانات المقالات
            articles_query = """
            SELECT 
                id as article_id,
                title,
                content,
                category,
                tags,
                author_id,
                publish_date,
                view_count,
                like_count,
                share_count,
                reading_time_estimate,
                topic_classification,
                sentiment_score,
                keywords
            FROM articles 
            WHERE status = 'published'
            AND publish_date >= NOW() - INTERVAL '12 months'
            """
            
            articles_df = await self.db_manager.fetch_dataframe(articles_query)
            logger.info(f"تم تحميل {len(articles_df)} مقال")
            
            # تحميل بيانات المستخدمين
            users_query = """
            SELECT 
                id as user_id,
                age,
                gender,
                location,
                interests,
                reading_preferences,
                subscription_type,
                registration_date,
                last_active,
                behavior_profile
            FROM users 
            WHERE is_active = true
            """
            
            users_df = await self.db_manager.fetch_dataframe(users_query)
            logger.info(f"تم تحميل {len(users_df)} مستخدم")
            
            # تحميل السياق الزمني
            context_query = """
            SELECT 
                user_id,
                session_id,
                device_type,
                browser,
                location,
                time_of_day,
                day_of_week,
                weather,
                mood_indicator,
                session_duration,
                created_at
            FROM user_sessions 
            WHERE created_at >= NOW() - INTERVAL '3 months'
            """
            
            context_df = await self.db_manager.fetch_dataframe(context_query)
            logger.info(f"تم تحميل {len(context_df)} جلسة مستخدم")
            
            return {
                'interactions': interactions_df,
                'articles': articles_df,
                'users': users_df,
                'context': context_df
            }
            
        except Exception as e:
            logger.error(f"خطأ في تحميل بيانات التدريب: {e}")
            raise
    
    async def prepare_training_data(self, raw_data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """تحضير وتنظيف البيانات للتدريب"""
        logger.info("بدء تحضير البيانات للتدريب...")
        
        try:
            # دمج البيانات
            interactions = raw_data['interactions']
            articles = raw_data['articles']
            users = raw_data['users']
            context = raw_data['context']
            
            # إنشاء مصفوفة التفاعلات
            user_item_matrix = interactions.pivot_table(
                index='user_id',
                columns='article_id',
                values='rating',
                fill_value=0
            )
            
            # تحضير بيانات المحتوى
            content_features = await self.content_model.extract_features(articles)
            
            # تحضير ملفات المستخدمين
            user_profiles = await self.user_interest_model.build_profiles(
                interactions, users, context
            )
            
            # إنشاء مجموعات التدريب والاختبار
            train_interactions, test_interactions = self._split_temporal(
                interactions, test_ratio=0.2
            )
            
            logger.info("تم تحضير البيانات بنجاح")
            
            return {
                'user_item_matrix': user_item_matrix,
                'content_features': content_features,
                'user_profiles': user_profiles,
                'train_interactions': train_interactions,
                'test_interactions': test_interactions,
                'articles': articles,
                'users': users,
                'context': context
            }
            
        except Exception as e:
            logger.error(f"خطأ في تحضير البيانات: {e}")
            raise
    
    def _split_temporal(self, interactions: pd.DataFrame, test_ratio: float = 0.2):
        """تقسيم البيانات زمنياً"""
        interactions_sorted = interactions.sort_values('created_at')
        split_point = int(len(interactions_sorted) * (1 - test_ratio))
        
        train_data = interactions_sorted.iloc[:split_point]
        test_data = interactions_sorted.iloc[split_point:]
        
        return train_data, test_data
    
    async def train_collaborative_filtering(self, prepared_data: Dict[str, Any]):
        """تدريب نموذج التصفية التعاونية"""
        logger.info("بدء تدريب نموذج التصفية التعاونية...")
        
        try:
            user_item_matrix = prepared_data['user_item_matrix']
            
            # تدريب النماذج المختلفة
            models_performance = {}
            
            # Matrix Factorization
            logger.info("تدريب Matrix Factorization...")
            mf_performance = await self.collaborative_model.train_matrix_factorization(
                user_item_matrix,
                **MODEL_CONFIG['collaborative_filtering']
            )
            models_performance['matrix_factorization'] = mf_performance
            
            # Neural Collaborative Filtering
            logger.info("تدريب Neural Collaborative Filtering...")
            ncf_performance = await self.collaborative_model.train_neural_collaborative_filtering(
                prepared_data['train_interactions'],
                **MODEL_CONFIG['neural_collaborative']
            )
            models_performance['neural_collaborative'] = ncf_performance
            
            # حفظ النماذج
            await self.collaborative_model.save_models(settings.model_path)
            
            self.training_stats['collaborative_filtering'] = models_performance
            logger.info("تم تدريب نموذج التصفية التعاونية بنجاح")
            
        except Exception as e:
            logger.error(f"خطأ في تدريب التصفية التعاونية: {e}")
            raise
    
    async def train_content_based_filtering(self, prepared_data: Dict[str, Any]):
        """تدريب نموذج التصفية المحتوائية"""
        logger.info("بدء تدريب نموذج التصفية المحتوائية...")
        
        try:
            articles = prepared_data['articles']
            content_features = prepared_data['content_features']
            
            # تدريب نماذج مختلفة
            performance_metrics = {}
            
            # BERT العربي
            logger.info("تدريب نموذج BERT العربي...")
            bert_performance = await self.content_model.train_bert_model(
                articles['content'].tolist(),
                articles['category'].tolist()
            )
            performance_metrics['bert'] = bert_performance
            
            # TF-IDF
            logger.info("تدريب نموذج TF-IDF...")
            tfidf_performance = await self.content_model.train_tfidf_model(
                articles,
                **MODEL_CONFIG['content_based']
            )
            performance_metrics['tfidf'] = tfidf_performance
            
            # Word2Vec
            logger.info("تدريب نموذج Word2Vec...")
            w2v_performance = await self.content_model.train_word2vec_model(
                articles['content'].tolist()
            )
            performance_metrics['word2vec'] = w2v_performance
            
            # حفظ النماذج
            await self.content_model.save_models(settings.model_path)
            
            self.training_stats['content_based'] = performance_metrics
            logger.info("تم تدريب نموذج التصفية المحتوائية بنجاح")
            
        except Exception as e:
            logger.error(f"خطأ في تدريب التصفية المحتوائية: {e}")
            raise
    
    async def train_deep_learning_models(self, prepared_data: Dict[str, Any]):
        """تدريب نماذج التعلم العميق"""
        logger.info("بدء تدريب نماذج التعلم العميق...")
        
        try:
            train_interactions = prepared_data['train_interactions']
            test_interactions = prepared_data['test_interactions']
            
            # تدريب النماذج المتقدمة
            performance_metrics = {}
            
            # Deep Matrix Factorization
            logger.info("تدريب Deep Matrix Factorization...")
            dmf_performance = await self.deep_models.train_deep_matrix_factorization(
                train_interactions,
                test_interactions,
                **MODEL_CONFIG['deep_learning']
            )
            performance_metrics['deep_mf'] = dmf_performance
            
            # Transformer-based Model
            logger.info("تدريب Transformer Model...")
            transformer_performance = await self.deep_models.train_transformer_model(
                train_interactions,
                test_interactions
            )
            performance_metrics['transformer'] = transformer_performance
            
            # VAE Model
            logger.info("تدريب VAE Model...")
            vae_performance = await self.deep_models.train_vae_model(
                prepared_data['user_item_matrix']
            )
            performance_metrics['vae'] = vae_performance
            
            # حفظ النماذج
            await self.deep_models.save_models(settings.model_path)
            
            self.training_stats['deep_learning'] = performance_metrics
            logger.info("تم تدريب نماذج التعلم العميق بنجاح")
            
        except Exception as e:
            logger.error(f"خطأ في تدريب نماذج التعلم العميق: {e}")
            raise
    
    async def train_hybrid_system(self, prepared_data: Dict[str, Any]):
        """تدريب النظام الهجين"""
        logger.info("بدء تدريب النظام الهجين...")
        
        try:
            # تحضير النماذج المدربة
            await self.hybrid_model.load_base_models(settings.model_path)
            
            # تدريب وحدة الوزن المتكيف
            performance = await self.hybrid_model.train_adaptive_weighting(
                prepared_data['train_interactions'],
                prepared_data['test_interactions']
            )
            
            # حفظ النموذج الهجين
            await self.hybrid_model.save_model(settings.model_path)
            
            self.training_stats['hybrid'] = performance
            logger.info("تم تدريب النظام الهجين بنجاح")
            
        except Exception as e:
            logger.error(f"خطأ في تدريب النظام الهجين: {e}")
            raise
    
    async def train_contextual_models(self, prepared_data: Dict[str, Any]):
        """تدريب نماذج التوصيات السياقية"""
        logger.info("بدء تدريب نماذج التوصيات السياقية...")
        
        try:
            context_data = prepared_data['context']
            interactions = prepared_data['train_interactions']
            
            # تدريب كاشف المزاج
            mood_performance = await self.contextual_model.train_mood_detector(
                context_data, interactions
            )
            
            # تدريب محلل السياق
            context_performance = await self.contextual_model.train_context_analyzer(
                context_data, interactions
            )
            
            # حفظ النماذج
            await self.contextual_model.save_models(settings.model_path)
            
            self.training_stats['contextual'] = {
                'mood_detection': mood_performance,
                'context_analysis': context_performance
            }
            logger.info("تم تدريب نماذج التوصيات السياقية بنجاح")
            
        except Exception as e:
            logger.error(f"خطأ في تدريب النماذج السياقية: {e}")
            raise
    
    async def setup_continuous_learning(self, prepared_data: Dict[str, Any]):
        """إعداد نظام التعلم المستمر"""
        logger.info("بدء إعداد نظام التعلم المستمر...")
        
        try:
            # تهيئة ذاكرة التشغيل
            await self.continuous_model.initialize_memory(
                prepared_data['train_interactions']
            )
            
            # إعداد كاشف الانحراف المفاهيمي
            await self.continuous_model.setup_drift_detector(
                prepared_data['train_interactions']
            )
            
            # إعداد المتعلم النشط
            await self.continuous_model.setup_active_learner()
            
            logger.info("تم إعداد نظام التعلم المستمر بنجاح")
            
        except Exception as e:
            logger.error(f"خطأ في إعداد التعلم المستمر: {e}")
            raise
    
    async def evaluate_models(self, prepared_data: Dict[str, Any]):
        """تقييم جميع النماذج"""
        logger.info("بدء تقييم النماذج...")
        
        try:
            test_interactions = prepared_data['test_interactions']
            
            # تقييم شامل
            evaluation_results = {}
            
            # تقييم التصفية التعاونية
            cf_metrics = await self.collaborative_model.evaluate_models(test_interactions)
            evaluation_results['collaborative_filtering'] = cf_metrics
            
            # تقييم التصفية المحتوائية
            cb_metrics = await self.content_model.evaluate_models(test_interactions)
            evaluation_results['content_based'] = cb_metrics
            
            # تقييم التعلم العميق
            dl_metrics = await self.deep_models.evaluate_models(test_interactions)
            evaluation_results['deep_learning'] = dl_metrics
            
            # تقييم النظام الهجين
            hybrid_metrics = await self.hybrid_model.evaluate_model(test_interactions)
            evaluation_results['hybrid'] = hybrid_metrics
            
            self.training_stats['evaluation'] = evaluation_results
            
            # طباعة النتائج
            self._print_evaluation_results(evaluation_results)
            
            logger.info("تم تقييم جميع النماذج بنجاح")
            
        except Exception as e:
            logger.error(f"خطأ في تقييم النماذج: {e}")
            raise
    
    def _print_evaluation_results(self, results: Dict[str, Any]):
        """طباعة نتائج التقييم"""
        print("\n" + "="*80)
        print("تقرير تقييم النماذج - محرك التوصيات الذكي سبق")
        print("="*80)
        
        for model_name, metrics in results.items():
            print(f"\n{model_name.upper()}:")
            print("-" * 40)
            
            if isinstance(metrics, dict):
                for metric_name, value in metrics.items():
                    if isinstance(value, float):
                        print(f"  {metric_name}: {value:.4f}")
                    else:
                        print(f"  {metric_name}: {value}")
            else:
                print(f"  الأداء العام: {metrics}")
        
        print("\n" + "="*80)
    
    async def save_models_to_cloud(self):
        """حفظ النماذج في التخزين السحابي"""
        logger.info("بدء حفظ النماذج في S3...")
        
        try:
            model_files = []
            model_path = Path(settings.model_path)
            
            # جمع جميع ملفات النماذج
            for file_path in model_path.rglob("*"):
                if file_path.is_file():
                    model_files.append(file_path)
            
            # رفع الملفات
            upload_results = []
            for file_path in model_files:
                relative_path = file_path.relative_to(model_path)
                s3_key = f"models/{relative_path}"
                
                result = await self.s3_manager.upload_file(
                    str(file_path),
                    s3_key
                )
                upload_results.append(result)
            
            logger.info(f"تم رفع {len(upload_results)} ملف نموذج إلى S3")
            
        except Exception as e:
            logger.error(f"خطأ في حفظ النماذج في S3: {e}")
            raise
    
    async def generate_training_report(self):
        """إنشاء تقرير التدريب"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = Path(settings.log_path) / f"training_report_{timestamp}.json"
        
        try:
            import json
            
            training_report = {
                "timestamp": timestamp,
                "training_stats": self.training_stats,
                "model_config": MODEL_CONFIG,
                "settings": {
                    "environment": settings.environment,
                    "model_path": settings.model_path,
                    "max_recommendations": settings.max_recommendations
                }
            }
            
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(training_report, f, ensure_ascii=False, indent=2)
            
            logger.info(f"تم إنشاء تقرير التدريب: {report_path}")
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء تقرير التدريب: {e}")
    
    async def cleanup(self):
        """تنظيف الموارد"""
        try:
            await self.db_manager.close()
            await self.redis_manager.close()
            logger.info("تم تنظيف جميع الموارد")
        except Exception as e:
            logger.error(f"خطأ في تنظيف الموارد: {e}")

async def main():
    """الدالة الرئيسية للتدريب"""
    trainer = ModelTrainer()
    
    try:
        # تهيئة النظام
        await trainer.initialize()
        
        # تحميل البيانات
        raw_data = await trainer.load_training_data()
        
        # تحضير البيانات
        prepared_data = await trainer.prepare_training_data(raw_data)
        
        # تدريب النماذج
        await trainer.train_collaborative_filtering(prepared_data)
        await trainer.train_content_based_filtering(prepared_data)
        await trainer.train_deep_learning_models(prepared_data)
        await trainer.train_hybrid_system(prepared_data)
        await trainer.train_contextual_models(prepared_data)
        
        # إعداد التعلم المستمر
        await trainer.setup_continuous_learning(prepared_data)
        
        # تقييم النماذج
        await trainer.evaluate_models(prepared_data)
        
        # حفظ في السحابة
        if settings.aws_access_key_id:
            await trainer.save_models_to_cloud()
        
        # إنشاء التقرير
        await trainer.generate_training_report()
        
        logger.info("🎉 تم إكمال تدريب جميع النماذج بنجاح!")
        
    except Exception as e:
        logger.error(f"❌ خطأ في عملية التدريب: {e}")
        raise
    finally:
        await trainer.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
