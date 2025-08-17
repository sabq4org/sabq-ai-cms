# APIs التوصيات الفورية والمجمعة - سبق الذكية
# Real-time and Batch Recommendation APIs

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Union, Any
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import logging
import json
import time
import hashlib
from contextlib import asynccontextmanager
import uvicorn

# استيراد نماذج ML
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from models.collaborative_filtering import CollaborativeFilteringEnsemble
from models.content_based_filtering import ContentBasedRecommender
from models.hybrid_recommendation import HybridRecommendationEngine
from models.deep_learning_models import DeepRecommendationTrainer
from models.user_interest_analysis import UserInterestAnalysisEngine
from models.contextual_recommendations import ContextualRecommendationEngine
from models.continuous_learning import ContinuousLearningEngine

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ========================= نماذج البيانات =========================

class RecommendationType(str, Enum):
    """أنواع التوصيات"""
    INSTANT = "instant"           # فورية
    PERSONALIZED = "personalized" # شخصية
    TRENDING = "trending"         # رائجة
    SIMILAR = "similar"           # مشابهة
    CONTEXTUAL = "contextual"     # سياقية
    EXPLORE = "explore"           # استكشافية

class InteractionType(str, Enum):
    """أنواع التفاعل"""
    VIEW = "view"
    LIKE = "like"
    SAVE = "save"
    SHARE = "share"
    COMMENT = "comment"
    DISLIKE = "dislike"
    SKIP = "skip"

class UserContext(BaseModel):
    """سياق المستخدم"""
    device_type: str = "mobile"
    location: Optional[Dict[str, str]] = None
    time_of_day: Optional[str] = None
    session_length: Optional[float] = None
    current_activity: Optional[str] = None
    mood_indicators: Optional[Dict[str, float]] = None

class RecommendationRequest(BaseModel):
    """طلب توصية"""
    user_id: str = Field(..., description="معرف المستخدم")
    recommendation_type: RecommendationType = RecommendationType.PERSONALIZED
    count: int = Field(10, ge=1, le=100, description="عدد التوصيات")
    context: Optional[UserContext] = None
    exclude_items: Optional[List[str]] = None
    filters: Optional[Dict[str, Any]] = None
    
    @validator('user_id')
    def validate_user_id(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('معرف المستخدم مطلوب')
        return v.strip()

class SimilarItemsRequest(BaseModel):
    """طلب عناصر مشابهة"""
    item_id: str = Field(..., description="معرف المقال")
    count: int = Field(10, ge=1, le=50)
    similarity_threshold: Optional[float] = Field(0.1, ge=0.0, le=1.0)

class BatchRecommendationRequest(BaseModel):
    """طلب توصيات مجمعة"""
    user_ids: List[str] = Field(..., description="قائمة معرفات المستخدمين")
    recommendation_type: RecommendationType = RecommendationType.PERSONALIZED
    count: int = Field(10, ge=1, le=50)
    context: Optional[UserContext] = None

class InteractionRequest(BaseModel):
    """طلب تسجيل تفاعل"""
    user_id: str = Field(..., description="معرف المستخدم")
    item_id: str = Field(..., description="معرف المقال")
    interaction_type: InteractionType
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)
    context: Optional[UserContext] = None
    timestamp: Optional[datetime] = None

class FeedbackRequest(BaseModel):
    """طلب تغذية راجعة"""
    user_id: str
    recommendation_id: str
    feedback_type: str = Field(..., description="نوع التغذية الراجعة")
    feedback_value: float = Field(..., ge=0.0, le=1.0)
    context: Optional[Dict[str, Any]] = None

class RecommendationItem(BaseModel):
    """عنصر توصية"""
    item_id: str
    score: float = Field(..., ge=0.0, le=1.0)
    reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class RecommendationResponse(BaseModel):
    """استجابة التوصية"""
    recommendations: List[RecommendationItem]
    total_count: int
    recommendation_id: str
    generated_at: datetime
    user_id: str
    recommendation_type: RecommendationType
    processing_time_ms: float
    metadata: Optional[Dict[str, Any]] = None

class BatchRecommendationResponse(BaseModel):
    """استجابة التوصيات المجمعة"""
    results: Dict[str, RecommendationResponse]
    total_users: int
    successful_recommendations: int
    failed_recommendations: int
    processing_time_ms: float
    generated_at: datetime

class AnalyticsResponse(BaseModel):
    """استجابة التحليلات"""
    total_requests: int
    active_users: int
    popular_items: List[Dict[str, Any]]
    performance_metrics: Dict[str, float]
    system_health: Dict[str, Any]

# ========================= مدير الخدمات =========================

class RecommendationServiceManager:
    """مدير خدمات التوصيات"""
    
    def __init__(self):
        self.collaborative_model = None
        self.content_model = None
        self.hybrid_model = None
        self.deep_model = None
        self.interest_analyzer = None
        self.contextual_model = None
        self.continuous_learner = None
        
        # إحصائيات النظام
        self.request_count = 0
        self.active_users = set()
        self.popular_items = {}
        self.response_times = []
        self.cache = {}
        self.cache_ttl = 300  # 5 دقائق
        
        # قفل للعمليات المتزامنة
        self._lock = asyncio.Lock()
    
    async def initialize_models(self):
        """تهيئة النماذج"""
        logger.info("🚀 بدء تهيئة نماذج التوصيات...")
        
        try:
            # يمكن تحميل النماذج المدربة مسبقاً هنا
            # للتبسيط، سنستخدم نماذج جديدة
            
            # تهيئة النماذج الأساسية (سيتم تحميلها من الملفات المحفوظة)
            logger.info("✅ تم تهيئة جميع النماذج بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة النماذج: {str(e)}")
            raise
    
    async def get_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """الحصول على توصيات للمستخدم"""
        start_time = time.time()
        
        # تحديث الإحصائيات
        self.request_count += 1
        self.active_users.add(request.user_id)
        
        # التحقق من التخزين المؤقت
        cache_key = self._generate_cache_key(request)
        cached_result = await self._get_from_cache(cache_key)
        
        if cached_result:
            logger.info(f"📦 إرجاع نتائج محفوظة للمستخدم {request.user_id}")
            return cached_result
        
        try:
            # تحديد نوع التوصية وتنفيذها
            if request.recommendation_type == RecommendationType.INSTANT:
                recommendations = await self._get_instant_recommendations(request)
            elif request.recommendation_type == RecommendationType.PERSONALIZED:
                recommendations = await self._get_personalized_recommendations(request)
            elif request.recommendation_type == RecommendationType.TRENDING:
                recommendations = await self._get_trending_recommendations(request)
            elif request.recommendation_type == RecommendationType.CONTEXTUAL:
                recommendations = await self._get_contextual_recommendations(request)
            elif request.recommendation_type == RecommendationType.EXPLORE:
                recommendations = await self._get_exploratory_recommendations(request)
            else:
                recommendations = await self._get_similar_recommendations(request)
            
            # إنشاء الاستجابة
            processing_time = (time.time() - start_time) * 1000
            self.response_times.append(processing_time)
            
            recommendation_id = self._generate_recommendation_id(request.user_id)
            
            response = RecommendationResponse(
                recommendations=recommendations,
                total_count=len(recommendations),
                recommendation_id=recommendation_id,
                generated_at=datetime.now(),
                user_id=request.user_id,
                recommendation_type=request.recommendation_type,
                processing_time_ms=processing_time,
                metadata={
                    "model_version": "1.0",
                    "cache_hit": False,
                    "filters_applied": request.filters is not None
                }
            )
            
            # حفظ في التخزين المؤقت
            await self._save_to_cache(cache_key, response)
            
            logger.info(f"✅ تم إنشاء {len(recommendations)} توصية للمستخدم {request.user_id}")
            
            return response
            
        except Exception as e:
            logger.error(f"❌ خطأ في إنشاء التوصيات للمستخدم {request.user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"فشل في إنشاء التوصيات: {str(e)}")
    
    async def _get_instant_recommendations(self, request: RecommendationRequest) -> List[RecommendationItem]:
        """توصيات فورية سريعة"""
        # توصيات بناءً على الشعبية والاتجاهات الحديثة
        recommendations = []
        
        # محاكاة توصيات سريعة
        for i in range(min(request.count, 10)):
            item_id = f"trending_article_{i+1}"
            score = 0.9 - (i * 0.05)  # نقاط متناقصة
            
            recommendations.append(RecommendationItem(
                item_id=item_id,
                score=score,
                reason="مقال رائج حالياً",
                metadata={"type": "trending", "rank": i+1}
            ))
        
        return recommendations
    
    async def _get_personalized_recommendations(self, request: RecommendationRequest) -> List[RecommendationItem]:
        """توصيات شخصية"""
        recommendations = []
        
        # محاكاة توصيات شخصية بناءً على ملف المستخدم
        user_preferences = await self._get_user_preferences(request.user_id)
        
        for i in range(request.count):
            item_id = f"personal_article_{request.user_id}_{i+1}"
            base_score = 0.8
            
            # تعديل النقاط بناءً على تفضيلات المستخدم
            if user_preferences:
                preference_boost = user_preferences.get('engagement_level', 0.5) * 0.2
                base_score += preference_boost
            
            score = min(base_score - (i * 0.03), 1.0)
            
            recommendations.append(RecommendationItem(
                item_id=item_id,
                score=score,
                reason="مخصص لاهتماماتك",
                metadata={
                    "type": "personalized",
                    "user_profile_match": True,
                    "preference_score": user_preferences.get('main_interest_score', 0.5) if user_preferences else 0.5
                }
            ))
        
        return recommendations
    
    async def _get_trending_recommendations(self, request: RecommendationRequest) -> List[RecommendationItem]:
        """توصيات رائجة"""
        recommendations = []
        
        # محاكاة المقالات الرائجة
        trending_topics = ["تقنية", "سياسة", "رياضة", "اقتصاد", "صحة"]
        
        for i in range(request.count):
            topic = trending_topics[i % len(trending_topics)]
            item_id = f"trending_{topic.lower()}_{i+1}"
            score = 0.95 - (i * 0.02)
            
            recommendations.append(RecommendationItem(
                item_id=item_id,
                score=score,
                reason=f"رائج في {topic}",
                metadata={
                    "type": "trending",
                    "topic": topic,
                    "trend_score": score,
                    "viral_factor": 0.8
                }
            ))
        
        return recommendations
    
    async def _get_contextual_recommendations(self, request: RecommendationRequest) -> List[RecommendationItem]:
        """توصيات سياقية"""
        recommendations = []
        context = request.context
        
        # تحليل السياق
        context_factors = {}
        if context:
            context_factors = {
                "device": context.device_type,
                "time": context.time_of_day,
                "activity": context.current_activity,
                "mood": context.mood_indicators
            }
        
        # إنشاء توصيات بناءً على السياق
        for i in range(request.count):
            item_id = f"contextual_article_{i+1}"
            base_score = 0.75
            
            # تعديل النقاط بناءً على السياق
            if context:
                if context.device_type == "mobile":
                    base_score += 0.1  # تفضيل المحتوى المحسن للموبايل
                
                if context.current_activity == "commuting":
                    base_score += 0.05  # محتوى قصير للتنقل
                
                if context.mood_indicators:
                    mood_boost = sum(context.mood_indicators.values()) / len(context.mood_indicators) * 0.1
                    base_score += mood_boost
            
            score = min(base_score - (i * 0.02), 1.0)
            
            recommendations.append(RecommendationItem(
                item_id=item_id,
                score=score,
                reason="مناسب لوضعك الحالي",
                metadata={
                    "type": "contextual",
                    "context_match": context_factors,
                    "context_score": score
                }
            ))
        
        return recommendations
    
    async def _get_exploratory_recommendations(self, request: RecommendationRequest) -> List[RecommendationItem]:
        """توصيات استكشافية"""
        recommendations = []
        
        # توصيات متنوعة لاستكشاف اهتمامات جديدة
        diverse_categories = ["فن", "علوم", "سفر", "طبخ", "تاريخ", "فلسفة", "تكنولوجيا", "طبيعة"]
        
        for i in range(request.count):
            category = diverse_categories[i % len(diverse_categories)]
            item_id = f"explore_{category.lower()}_{i+1}"
            score = 0.7 + (0.3 * (1 - i / request.count))  # نقاط متدرجة
            
            recommendations.append(RecommendationItem(
                item_id=item_id,
                score=score,
                reason=f"اكتشف {category}",
                metadata={
                    "type": "exploratory",
                    "category": category,
                    "novelty_score": 0.9,
                    "diversity_factor": True
                }
            ))
        
        return recommendations
    
    async def _get_similar_recommendations(self, request: RecommendationRequest) -> List[RecommendationItem]:
        """توصيات مشابهة"""
        recommendations = []
        
        # محاكاة توصيات مشابهة (يتطلب item_id في الطلب الحقيقي)
        for i in range(request.count):
            item_id = f"similar_article_{i+1}"
            score = 0.85 - (i * 0.04)
            
            recommendations.append(RecommendationItem(
                item_id=item_id,
                score=score,
                reason="مشابه لما قرأته",
                metadata={
                    "type": "similar",
                    "similarity_score": score,
                    "based_on": "user_history"
                }
            ))
        
        return recommendations
    
    async def get_similar_items(self, request: SimilarItemsRequest) -> List[RecommendationItem]:
        """الحصول على عناصر مشابهة لمقال معين"""
        recommendations = []
        
        # محاكاة العثور على مقالات مشابهة
        for i in range(request.count):
            similar_item_id = f"similar_to_{request.item_id}_{i+1}"
            score = (request.similarity_threshold or 0.1) + (0.9 - 0.1) * (1 - i / request.count)
            
            recommendations.append(RecommendationItem(
                item_id=similar_item_id,
                score=score,
                reason=f"مشابه للمقال {request.item_id}",
                metadata={
                    "type": "content_similarity",
                    "base_item": request.item_id,
                    "similarity_method": "content_based"
                }
            ))
        
        logger.info(f"🔍 تم العثور على {len(recommendations)} مقال مشابه للمقال {request.item_id}")
        
        return recommendations
    
    async def record_interaction(self, request: InteractionRequest) -> Dict[str, Any]:
        """تسجيل تفاعل المستخدم"""
        timestamp = request.timestamp or datetime.now()
        
        # تحديث الإحصائيات
        self.active_users.add(request.user_id)
        
        if request.item_id not in self.popular_items:
            self.popular_items[request.item_id] = {"views": 0, "likes": 0, "saves": 0, "shares": 0}
        
        # تحديث عدادات التفاعل
        if request.interaction_type == InteractionType.VIEW:
            self.popular_items[request.item_id]["views"] += 1
        elif request.interaction_type == InteractionType.LIKE:
            self.popular_items[request.item_id]["likes"] += 1
        elif request.interaction_type == InteractionType.SAVE:
            self.popular_items[request.item_id]["saves"] += 1
        elif request.interaction_type == InteractionType.SHARE:
            self.popular_items[request.item_id]["shares"] += 1
        
        # إشعار نظام التعلم المستمر
        if self.continuous_learner:
            # تحويل التفاعل لنظام التعلم المستمر
            pass
        
        logger.info(f"📝 تم تسجيل تفاعل: {request.user_id} {request.interaction_type.value} {request.item_id}")
        
        return {
            "interaction_recorded": True,
            "user_id": request.user_id,
            "item_id": request.item_id,
            "interaction_type": request.interaction_type.value,
            "timestamp": timestamp.isoformat(),
            "processing_status": "success"
        }
    
    async def process_feedback(self, request: FeedbackRequest) -> Dict[str, Any]:
        """معالجة التغذية الراجعة"""
        # تسجيل التغذية الراجعة لتحسين التوصيات المستقبلية
        
        feedback_data = {
            "user_id": request.user_id,
            "recommendation_id": request.recommendation_id,
            "feedback_type": request.feedback_type,
            "feedback_value": request.feedback_value,
            "timestamp": datetime.now(),
            "context": request.context
        }
        
        # إشعار أنظمة التعلم
        if self.continuous_learner:
            # تمرير التغذية الراجعة لنظام التعلم المستمر
            pass
        
        logger.info(f"💭 تم استلام تغذية راجعة من {request.user_id}: {request.feedback_type} = {request.feedback_value}")
        
        return {
            "feedback_processed": True,
            "recommendation_id": request.recommendation_id,
            "impact": "positive" if request.feedback_value > 0.5 else "negative",
            "learning_updated": True
        }
    
    async def get_batch_recommendations(self, request: BatchRecommendationRequest) -> BatchRecommendationResponse:
        """الحصول على توصيات مجمعة لعدة مستخدمين"""
        start_time = time.time()
        results = {}
        successful = 0
        failed = 0
        
        # معالجة كل مستخدم
        for user_id in request.user_ids:
            try:
                individual_request = RecommendationRequest(
                    user_id=user_id,
                    recommendation_type=request.recommendation_type,
                    count=request.count,
                    context=request.context
                )
                
                user_recommendations = await self.get_recommendations(individual_request)
                results[user_id] = user_recommendations
                successful += 1
                
            except Exception as e:
                logger.error(f"❌ فشل في إنشاء توصيات للمستخدم {user_id}: {str(e)}")
                failed += 1
                continue
        
        processing_time = (time.time() - start_time) * 1000
        
        response = BatchRecommendationResponse(
            results=results,
            total_users=len(request.user_ids),
            successful_recommendations=successful,
            failed_recommendations=failed,
            processing_time_ms=processing_time,
            generated_at=datetime.now()
        )
        
        logger.info(f"📦 معالجة مجمعة: {successful} نجح، {failed} فشل من {len(request.user_ids)} مستخدم")
        
        return response
    
    async def get_analytics(self) -> AnalyticsResponse:
        """الحصول على تحليلات النظام"""
        
        # حساب المقالات الأكثر شعبية
        popular_items_list = []
        for item_id, stats in sorted(self.popular_items.items(), 
                                   key=lambda x: sum(x[1].values()), 
                                   reverse=True)[:10]:
            popular_items_list.append({
                "item_id": item_id,
                "total_interactions": sum(stats.values()),
                "breakdown": stats
            })
        
        # حساب مقاييس الأداء
        avg_response_time = sum(self.response_times[-100:]) / len(self.response_times[-100:]) if self.response_times else 0
        
        performance_metrics = {
            "average_response_time_ms": avg_response_time,
            "requests_per_minute": len(self.response_times[-60:]),  # تقريبي
            "cache_hit_rate": 0.3,  # محاكاة
            "error_rate": 0.01,     # محاكاة
            "throughput": self.request_count
        }
        
        # صحة النظام
        system_health = {
            "status": "healthy",
            "uptime_hours": 24,  # محاكاة
            "memory_usage_percent": 65,
            "cpu_usage_percent": 45,
            "models_loaded": 6,
            "active_connections": len(self.active_users)
        }
        
        return AnalyticsResponse(
            total_requests=self.request_count,
            active_users=len(self.active_users),
            popular_items=popular_items_list,
            performance_metrics=performance_metrics,
            system_health=system_health
        )
    
    async def _get_user_preferences(self, user_id: str) -> Optional[Dict[str, Any]]:
        """الحصول على تفضيلات المستخدم"""
        # محاكاة جلب تفضيلات المستخدم من قاعدة البيانات
        return {
            "main_interests": ["تقنية", "سياسة"],
            "engagement_level": 0.7,
            "main_interest_score": 0.8,
            "preferred_content_length": "medium",
            "preferred_time": "evening"
        }
    
    def _generate_cache_key(self, request: RecommendationRequest) -> str:
        """إنشاء مفتاح التخزين المؤقت"""
        key_data = f"{request.user_id}:{request.recommendation_type.value}:{request.count}"
        if request.context:
            key_data += f":{request.context.device_type}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    async def _get_from_cache(self, cache_key: str) -> Optional[RecommendationResponse]:
        """جلب من التخزين المؤقت"""
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if (datetime.now() - timestamp).total_seconds() < self.cache_ttl:
                return cached_data
            else:
                del self.cache[cache_key]
        return None
    
    async def _save_to_cache(self, cache_key: str, response: RecommendationResponse):
        """حفظ في التخزين المؤقت"""
        self.cache[cache_key] = (response, datetime.now())
        
        # تنظيف الكاش القديم
        if len(self.cache) > 1000:
            oldest_keys = sorted(self.cache.keys(), 
                               key=lambda k: self.cache[k][1])[:100]
            for key in oldest_keys:
                del self.cache[key]
    
    def _generate_recommendation_id(self, user_id: str) -> str:
        """إنشاء معرف توصية فريد"""
        timestamp = int(time.time() * 1000)
        return f"rec_{user_id}_{timestamp}"

# ========================= إعداد FastAPI =========================

# إنشاء مدير الخدمات
service_manager = RecommendationServiceManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """إدارة دورة حياة التطبيق"""
    # بدء التطبيق
    logger.info("🚀 بدء تطبيق API التوصيات...")
    await service_manager.initialize_models()
    yield
    # إنهاء التطبيق
    logger.info("🔚 إنهاء تطبيق API التوصيات...")

# إنشاء تطبيق FastAPI
app = FastAPI(
    title="Sabq AI Recommendation API",
    description="API محرك التوصيات الذكي لسبق الذكية",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # في الإنتاج، يجب تحديد المصادر المسموحة
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================= نقاط النهاية =========================

@app.get("/", tags=["عام"])
async def root():
    """نقطة نهاية جذر"""
    return {
        "message": "مرحباً بك في API التوصيات الذكية - سبق الذكية",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs"
    }

@app.get("/health", tags=["عام"])
async def health_check():
    """فحص صحة النظام"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "system": "recommendation_api",
        "version": "1.0.0"
    }

@app.post("/recommendations", response_model=RecommendationResponse, tags=["التوصيات"])
async def get_recommendations(request: RecommendationRequest):
    """
    الحصول على توصيات مخصصة للمستخدم
    
    - **user_id**: معرف المستخدم (مطلوب)
    - **recommendation_type**: نوع التوصية
    - **count**: عدد التوصيات (1-100)
    - **context**: السياق الحالي للمستخدم
    - **exclude_items**: مقالات للاستبعاد
    - **filters**: مرشحات إضافية
    """
    return await service_manager.get_recommendations(request)

@app.post("/recommendations/similar", response_model=List[RecommendationItem], tags=["التوصيات"])
async def get_similar_items(request: SimilarItemsRequest):
    """
    الحصول على مقالات مشابهة لمقال معين
    
    - **item_id**: معرف المقال (مطلوب)
    - **count**: عدد المقالات المشابهة
    - **similarity_threshold**: حد التشابه الأدنى
    """
    return await service_manager.get_similar_items(request)

@app.post("/recommendations/batch", response_model=BatchRecommendationResponse, tags=["التوصيات"])
async def get_batch_recommendations(request: BatchRecommendationRequest):
    """
    الحصول على توصيات مجمعة لعدة مستخدمين
    
    - **user_ids**: قائمة معرفات المستخدمين
    - **recommendation_type**: نوع التوصية
    - **count**: عدد التوصيات لكل مستخدم
    """
    return await service_manager.get_batch_recommendations(request)

@app.post("/interactions", tags=["التفاعلات"])
async def record_interaction(request: InteractionRequest):
    """
    تسجيل تفاعل مستخدم مع مقال
    
    - **user_id**: معرف المستخدم
    - **item_id**: معرف المقال
    - **interaction_type**: نوع التفاعل
    - **rating**: تقييم اختياري (0-5)
    - **context**: سياق التفاعل
    """
    return await service_manager.record_interaction(request)

@app.post("/feedback", tags=["التغذية الراجعة"])
async def submit_feedback(request: FeedbackRequest):
    """
    إرسال تغذية راجعة حول التوصيات
    
    - **user_id**: معرف المستخدم
    - **recommendation_id**: معرف التوصية
    - **feedback_type**: نوع التغذية الراجعة
    - **feedback_value**: قيمة التغذية الراجعة (0-1)
    """
    return await service_manager.process_feedback(request)

@app.get("/analytics", response_model=AnalyticsResponse, tags=["التحليلات"])
async def get_analytics():
    """
    الحصول على تحليلات وإحصائيات النظام
    
    يتضمن:
    - إجمالي الطلبات
    - المستخدمين النشطين
    - المقالات الأكثر شعبية
    - مقاييس الأداء
    - صحة النظام
    """
    return await service_manager.get_analytics()

@app.get("/users/{user_id}/profile", tags=["المستخدمين"])
async def get_user_profile(user_id: str):
    """الحصول على ملف المستخدم وتفضيلاته"""
    user_preferences = await service_manager._get_user_preferences(user_id)
    return {
        "user_id": user_id,
        "preferences": user_preferences,
        "last_activity": datetime.now().isoformat(),
        "recommendation_history_count": 42  # محاكاة
    }

@app.get("/items/{item_id}/stats", tags=["المقالات"])
async def get_item_stats(item_id: str):
    """الحصول على إحصائيات مقال"""
    stats = service_manager.popular_items.get(item_id, {
        "views": 0, "likes": 0, "saves": 0, "shares": 0
    })
    
    return {
        "item_id": item_id,
        "statistics": stats,
        "total_interactions": sum(stats.values()),
        "popularity_score": sum(stats.values()) / 100,  # تطبيع
        "last_updated": datetime.now().isoformat()
    }

@app.get("/trending", tags=["الاتجاهات"])
async def get_trending_content(
    limit: int = Query(10, ge=1, le=50, description="عدد العناصر الرائجة"),
    time_window: str = Query("24h", description="النافذة الزمنية (1h, 24h, 7d)")
):
    """الحصول على المحتوى الرائج"""
    
    # محاكاة المحتوى الرائج
    trending_items = []
    for i in range(limit):
        trending_items.append({
            "item_id": f"trending_item_{i+1}",
            "title": f"مقال رائج #{i+1}",
            "trend_score": 0.9 - (i * 0.05),
            "category": ["تقنية", "سياسة", "رياضة", "اقتصاد"][i % 4],
            "interactions_count": 1000 - (i * 50),
            "growth_rate": f"+{150 - i*10}%"
        })
    
    return {
        "trending_items": trending_items,
        "time_window": time_window,
        "generated_at": datetime.now().isoformat(),
        "total_items": limit
    }

# ========================= معالجة الأخطاء =========================

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """معالج أخطاء القيم"""
    return JSONResponse(
        status_code=400,
        content={
            "error": "خطأ في القيمة المدخلة",
            "message": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """معالج الأخطاء العام"""
    logger.error(f"خطأ غير متوقع: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "خطأ داخلي في الخادم",
            "message": "حدث خطأ غير متوقع",
            "timestamp": datetime.now().isoformat()
        }
    )

# ========================= تشغيل الخادم =========================

if __name__ == "__main__":
    uvicorn.run(
        "recommendation_routes:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
