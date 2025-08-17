# APIs نظام تحليل المشاعر العربي
# Arabic Sentiment Analysis System APIs

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union
from datetime import datetime, timedelta
import asyncio
import logging
import time
import hashlib
import json
from contextlib import asynccontextmanager
import uvicorn
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import redis.asyncio as redis
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import sys
import os

# إضافة مسار المشروع
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config.settings import settings, LOGGING_CONFIG
from models.arabic_bert_sentiment import ArabicSentimentAnalyzer, SentimentModelConfig
from services.analytics_service import SentimentAnalyticsService
from services.trend_analysis import TrendAnalysisService
from services.public_opinion import PublicOpinionAnalyzer

# إعداد التسجيل
logging.basicConfig(level=getattr(logging, settings.log_level))
logger = logging.getLogger(__name__)

# مقاييس Prometheus
REQUEST_COUNT = Counter('sentiment_requests_total', 'Total sentiment analysis requests', ['endpoint', 'method'])
REQUEST_DURATION = Histogram('sentiment_request_duration_seconds', 'Request duration', ['endpoint'])
ACTIVE_CONNECTIONS = Gauge('sentiment_active_connections', 'Active connections')
ERROR_COUNT = Counter('sentiment_errors_total', 'Total errors', ['type'])

# إعداد Rate Limiting
limiter = Limiter(key_func=get_remote_address)

# Security
security = HTTPBearer(auto_error=False)

# ========================= نماذج البيانات =========================

class SentimentRequest(BaseModel):
    """طلب تحليل المشاعر"""
    text: str = Field(..., min_length=1, max_length=5000, description="النص المراد تحليله")
    analysis_type: str = Field(
        default="comprehensive", 
        regex="^(sentiment|emotion|comprehensive)$",
        description="نوع التحليل المطلوب"
    )
    include_confidence: bool = Field(default=True, description="تضمين مستوى الثقة")
    detect_dialect: bool = Field(default=True, description="كشف اللهجة")
    cache_result: bool = Field(default=True, description="حفظ النتيجة في التخزين المؤقت")
    
    @validator('text')
    def validate_text(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('النص لا يمكن أن يكون فارغاً')
        return v.strip()

class BatchSentimentRequest(BaseModel):
    """طلب تحليل مجمع للمشاعر"""
    texts: List[str] = Field(..., min_items=1, max_items=100, description="قائمة النصوص")
    analysis_type: str = Field(default="comprehensive", regex="^(sentiment|emotion|comprehensive)$")
    include_confidence: bool = Field(default=True)
    detect_dialect: bool = Field(default=True)
    
    @validator('texts')
    def validate_texts(cls, v):
        if not v:
            raise ValueError('قائمة النصوص لا يمكن أن تكون فارغة')
        
        for i, text in enumerate(v):
            if not text or len(text.strip()) == 0:
                raise ValueError(f'النص رقم {i+1} فارغ')
            if len(text) > 5000:
                raise ValueError(f'النص رقم {i+1} طويل جداً (أكثر من 5000 حرف)')
        
        return [text.strip() for text in v]

class TrendAnalysisRequest(BaseModel):
    """طلب تحليل الاتجاهات"""
    category: Optional[str] = Field(None, description="فئة المحتوى")
    time_range: str = Field(
        default="24h", 
        regex="^(1h|6h|12h|24h|7d|30d)$",
        description="النطاق الزمني للتحليل"
    )
    include_emotions: bool = Field(default=True, description="تضمين تحليل العواطف")
    min_samples: int = Field(default=10, ge=1, le=1000, description="الحد الأدنى لعدد العينات")

class PublicOpinionRequest(BaseModel):
    """طلب تحليل الرأي العام"""
    topic: str = Field(..., min_length=2, max_length=100, description="الموضوع المراد تحليله")
    sources: Optional[List[str]] = Field(None, description="مصادر البيانات")
    time_range: str = Field(default="7d", regex="^(1d|7d|30d|90d)$")
    sentiment_threshold: float = Field(default=0.6, ge=0.1, le=1.0)

class ContentMoodRequest(BaseModel):
    """طلب تصنيف المحتوى حسب المزاج"""
    content: str = Field(..., min_length=10, max_length=10000)
    content_type: str = Field(
        default="article",
        regex="^(article|news|opinion|comment|social_post)$"
    )
    target_audience: Optional[str] = Field(None, regex="^(general|youth|adults|professionals)$")

# ========================= استجابات =========================

class SentimentResponse(BaseModel):
    """استجابة تحليل المشاعر"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: str
    processing_time_ms: float
    timestamp: datetime
    request_id: str

class BatchSentimentResponse(BaseModel):
    """استجابة التحليل المجمع"""
    success: bool
    data: Optional[List[Dict[str, Any]]] = None
    total_processed: int
    successful: int
    failed: int
    processing_time_ms: float
    timestamp: datetime
    request_id: str

class ErrorResponse(BaseModel):
    """استجابة الخطأ"""
    success: bool = False
    error: str
    error_code: str
    message: str
    timestamp: datetime
    request_id: str

# ========================= خدمات النظام =========================

class SentimentSystemManager:
    """مدير نظام تحليل المشاعر"""
    
    def __init__(self):
        self.analyzer = None
        self.analytics_service = None
        self.trend_service = None
        self.opinion_analyzer = None
        self.redis_client = None
        
        # إحصائيات النظام
        self.request_count = 0
        self.active_requests = 0
        self.system_start_time = datetime.now()
        
    async def initialize(self):
        """تهيئة النظام"""
        logger.info("🚀 بدء تهيئة نظام تحليل المشاعر...")
        
        try:
            # تهيئة Redis
            await self._initialize_redis()
            
            # تهيئة محلل المشاعر
            await self._initialize_sentiment_analyzer()
            
            # تهيئة الخدمات الإضافية
            await self._initialize_services()
            
            logger.info("✅ تم تهيئة نظام تحليل المشاعر بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة النظام: {str(e)}")
            raise
    
    async def _initialize_redis(self):
        """تهيئة Redis"""
        try:
            self.redis_client = redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                password=settings.redis_password,
                decode_responses=True
            )
            
            # اختبار الاتصال
            await self.redis_client.ping()
            logger.info("✅ تم تهيئة Redis بنجاح")
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في تهيئة Redis: {str(e)}")
            self.redis_client = None
    
    async def _initialize_sentiment_analyzer(self):
        """تهيئة محلل المشاعر"""
        config = SentimentModelConfig(
            model_name=settings.arabic_bert_model,
            max_length=settings.max_sequence_length,
            batch_size=settings.batch_size
        )
        
        self.analyzer = ArabicSentimentAnalyzer(config)
        self.analyzer.load_models()
        
        logger.info("✅ تم تهيئة محلل المشاعر")
    
    async def _initialize_services(self):
        """تهيئة الخدمات الإضافية"""
        try:
            self.analytics_service = SentimentAnalyticsService(self.redis_client)
            self.trend_service = TrendAnalysisService(self.redis_client)
            self.opinion_analyzer = PublicOpinionAnalyzer(self.redis_client)
            
            logger.info("✅ تم تهيئة الخدمات الإضافية")
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في تهيئة بعض الخدمات: {str(e)}")
    
    async def analyze_sentiment(self, request: SentimentRequest, request_id: str) -> Dict[str, Any]:
        """تحليل المشاعر"""
        start_time = time.time()
        
        try:
            # التحقق من التخزين المؤقت
            if request.cache_result and self.redis_client:
                cached_result = await self._get_cached_result(request.text)
                if cached_result:
                    logger.info(f"📦 إرجاع نتيجة محفوظة للطلب {request_id}")
                    return cached_result
            
            # تحليل النص
            if request.analysis_type == "sentiment":
                result = self.analyzer.analyze_sentiment(
                    request.text, 
                    include_confidence=request.include_confidence
                )
            elif request.analysis_type == "emotion":
                result = self.analyzer.analyze_emotions(request.text)
            else:
                result = self.analyzer.comprehensive_analysis(request.text)
            
            # إضافة معلومات إضافية
            result['request_id'] = request_id
            result['processing_time_ms'] = (time.time() - start_time) * 1000
            
            # حفظ في التخزين المؤقت
            if request.cache_result and self.redis_client:
                await self._cache_result(request.text, result)
            
            # تسجيل في التحليلات
            if self.analytics_service:
                await self.analytics_service.record_analysis(result)
            
            self.request_count += 1
            return result
            
        except Exception as e:
            ERROR_COUNT.labels(type='sentiment_analysis').inc()
            logger.error(f"❌ خطأ في تحليل المشاعر للطلب {request_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"فشل في تحليل المشاعر: {str(e)}"
            )
    
    async def batch_analyze(self, request: BatchSentimentRequest, request_id: str) -> Dict[str, Any]:
        """تحليل مجمع للمشاعر"""
        start_time = time.time()
        
        try:
            results = self.analyzer.batch_analyze(
                request.texts,
                analysis_type=request.analysis_type
            )
            
            # إحصائيات المعالجة
            successful = sum(1 for r in results if 'error' not in r.get('analysis_metadata', {}))
            failed = len(results) - successful
            
            # تسجيل في التحليلات
            if self.analytics_service:
                for result in results:
                    if 'error' not in result.get('analysis_metadata', {}):
                        await self.analytics_service.record_analysis(result)
            
            response_data = {
                'results': results,
                'statistics': {
                    'total_processed': len(results),
                    'successful': successful,
                    'failed': failed,
                    'success_rate': successful / len(results) if results else 0,
                    'processing_time_ms': (time.time() - start_time) * 1000
                },
                'request_id': request_id
            }
            
            self.request_count += len(request.texts)
            return response_data
            
        except Exception as e:
            ERROR_COUNT.labels(type='batch_analysis').inc()
            logger.error(f"❌ خطأ في التحليل المجمع للطلب {request_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"فشل في التحليل المجمع: {str(e)}"
            )
    
    async def _get_cached_result(self, text: str) -> Optional[Dict[str, Any]]:
        """جلب نتيجة من التخزين المؤقت"""
        if not self.redis_client:
            return None
        
        try:
            cache_key = f"{settings.redis_key_prefix}text:{hashlib.md5(text.encode()).hexdigest()}"
            cached_data = await self.redis_client.get(cache_key)
            
            if cached_data:
                return json.loads(cached_data)
                
        except Exception as e:
            logger.warning(f"⚠️ خطأ في جلب البيانات المخزنة مؤقتاً: {str(e)}")
        
        return None
    
    async def _cache_result(self, text: str, result: Dict[str, Any]) -> bool:
        """حفظ نتيجة في التخزين المؤقت"""
        if not self.redis_client:
            return False
        
        try:
            cache_key = f"{settings.redis_key_prefix}text:{hashlib.md5(text.encode()).hexdigest()}"
            await self.redis_client.setex(
                cache_key,
                settings.cache_ttl,
                json.dumps(result, default=str)
            )
            return True
            
        except Exception as e:
            logger.warning(f"⚠️ خطأ في حفظ البيانات في التخزين المؤقت: {str(e)}")
            return False
    
    async def get_system_health(self) -> Dict[str, Any]:
        """حالة صحة النظام"""
        uptime = datetime.now() - self.system_start_time
        
        return {
            'status': 'healthy',
            'uptime_seconds': uptime.total_seconds(),
            'total_requests': self.request_count,
            'active_requests': self.active_requests,
            'analyzer_loaded': self.analyzer is not None,
            'redis_connected': self.redis_client is not None,
            'services_status': {
                'analytics': self.analytics_service is not None,
                'trends': self.trend_service is not None,
                'opinion': self.opinion_analyzer is not None
            },
            'timestamp': datetime.now().isoformat()
        }
    
    async def shutdown(self):
        """إغلاق النظام"""
        logger.info("🔚 بدء إغلاق نظام تحليل المشاعر...")
        
        if self.redis_client:
            await self.redis_client.close()
        
        logger.info("✅ تم إغلاق النظام بنجاح")

# مدير النظام العام
system_manager = SentimentSystemManager()

# ========================= إعداد FastAPI =========================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """إدارة دورة حياة التطبيق"""
    # بدء التطبيق
    await system_manager.initialize()
    yield
    # إنهاء التطبيق
    await system_manager.shutdown()

# إنشاء تطبيق FastAPI
app = FastAPI(
    title="نظام تحليل المشاعر العربي",
    description="API شامل لتحليل المشاعر والعواطف في النصوص العربية",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# إضافة Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # في الإنتاج، يجب تحديد المصادر المسموحة
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # في الإنتاج، يجب تحديد المضيفين المسموحين
)

# إضافة Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ========================= وظائف مساعدة =========================

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """التحقق من المصادقة (اختياري)"""
    if settings.api_key_required and not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="مفتاح API مطلوب"
        )
    return credentials

def generate_request_id() -> str:
    """إنشاء معرف فريد للطلب"""
    return f"req_{int(time.time() * 1000)}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"

# ========================= نقاط النهاية =========================

@app.get("/", tags=["عام"])
async def root():
    """نقطة النهاية الجذر"""
    return {
        "message": "مرحباً بك في نظام تحليل المشاعر العربي",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs",
        "features": [
            "تحليل المشاعر (إيجابي/سلبي/محايد)",
            "تحليل العواطف متعدد الأبعاد",
            "كشف اللهجات العربية",
            "تحليل الاتجاهات",
            "تحليل الرأي العام",
            "تصنيف المحتوى حسب المزاج"
        ]
    }

@app.get("/health", tags=["عام"])
async def health_check():
    """فحص صحة النظام"""
    health_data = await system_manager.get_system_health()
    return health_data

@app.post("/analyze/sentiment", response_model=SentimentResponse, tags=["تحليل المشاعر"])
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def analyze_sentiment(
    request: Request,
    sentiment_request: SentimentRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """
    تحليل المشاعر لنص واحد
    
    يحلل النص ويحدد ما إذا كان إيجابياً أم سلبياً أم محايداً،
    مع إمكانية تحليل العواطف والكشف عن اللهجة.
    """
    REQUEST_COUNT.labels(endpoint='analyze_sentiment', method='POST').inc()
    
    request_id = generate_request_id()
    start_time = time.time()
    
    try:
        system_manager.active_requests += 1
        ACTIVE_CONNECTIONS.inc()
        
        # تحليل المشاعر
        with REQUEST_DURATION.labels(endpoint='analyze_sentiment').time():
            result = await system_manager.analyze_sentiment(sentiment_request, request_id)
        
        processing_time = (time.time() - start_time) * 1000
        
        return SentimentResponse(
            success=True,
            data=result,
            message="تم تحليل المشاعر بنجاح",
            processing_time_ms=processing_time,
            timestamp=datetime.now(),
            request_id=request_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        ERROR_COUNT.labels(type='unexpected_error').inc()
        logger.error(f"❌ خطأ غير متوقع في {request_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطأ داخلي في الخادم"
        )
    finally:
        system_manager.active_requests -= 1
        ACTIVE_CONNECTIONS.dec()

@app.post("/analyze/batch", response_model=BatchSentimentResponse, tags=["تحليل المشاعر"])
@limiter.limit(f"{settings.rate_limit_per_minute // 10}/minute")
async def analyze_batch_sentiment(
    request: Request,
    batch_request: BatchSentimentRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """
    تحليل مجمع للمشاعر
    
    يحلل عدة نصوص في طلب واحد لتحسين الأداء.
    """
    REQUEST_COUNT.labels(endpoint='analyze_batch', method='POST').inc()
    
    request_id = generate_request_id()
    start_time = time.time()
    
    try:
        system_manager.active_requests += 1
        ACTIVE_CONNECTIONS.inc()
        
        with REQUEST_DURATION.labels(endpoint='analyze_batch').time():
            result = await system_manager.batch_analyze(batch_request, request_id)
        
        processing_time = (time.time() - start_time) * 1000
        
        return BatchSentimentResponse(
            success=True,
            data=result['results'],
            total_processed=result['statistics']['total_processed'],
            successful=result['statistics']['successful'],
            failed=result['statistics']['failed'],
            processing_time_ms=processing_time,
            timestamp=datetime.now(),
            request_id=request_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        ERROR_COUNT.labels(type='unexpected_error').inc()
        logger.error(f"❌ خطأ غير متوقع في التحليل المجمع {request_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطأ داخلي في الخادم"
        )
    finally:
        system_manager.active_requests -= 1
        ACTIVE_CONNECTIONS.dec()

@app.post("/analyze/trends", tags=["التحليلات المتقدمة"])
@limiter.limit(f"{settings.rate_limit_per_minute // 5}/minute")
async def analyze_trends(
    request: Request,
    trend_request: TrendAnalysisRequest,
    current_user = Depends(get_current_user)
):
    """
    تحليل الاتجاهات العاطفية
    
    يحلل الاتجاهات العاطفية للمحتوى خلال فترة زمنية محددة.
    """
    REQUEST_COUNT.labels(endpoint='analyze_trends', method='POST').inc()
    
    if not system_manager.trend_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="خدمة تحليل الاتجاهات غير متاحة"
        )
    
    try:
        result = await system_manager.trend_service.analyze_trends(
            category=trend_request.category,
            time_range=trend_request.time_range,
            include_emotions=trend_request.include_emotions,
            min_samples=trend_request.min_samples
        )
        
        return {
            "success": True,
            "data": result,
            "message": "تم تحليل الاتجاهات بنجاح",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        ERROR_COUNT.labels(type='trend_analysis').inc()
        logger.error(f"❌ خطأ في تحليل الاتجاهات: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"فشل في تحليل الاتجاهات: {str(e)}"
        )

@app.post("/analyze/public-opinion", tags=["التحليلات المتقدمة"])
@limiter.limit(f"{settings.rate_limit_per_minute // 10}/minute")
async def analyze_public_opinion(
    request: Request,
    opinion_request: PublicOpinionRequest,
    current_user = Depends(get_current_user)
):
    """
    تحليل الرأي العام
    
    يحلل الرأي العام حول موضوع معين من مصادر مختلفة.
    """
    REQUEST_COUNT.labels(endpoint='analyze_opinion', method='POST').inc()
    
    if not system_manager.opinion_analyzer:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="خدمة تحليل الرأي العام غير متاحة"
        )
    
    try:
        result = await system_manager.opinion_analyzer.analyze_opinion(
            topic=opinion_request.topic,
            sources=opinion_request.sources,
            time_range=opinion_request.time_range,
            sentiment_threshold=opinion_request.sentiment_threshold
        )
        
        return {
            "success": True,
            "data": result,
            "message": "تم تحليل الرأي العام بنجاح",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        ERROR_COUNT.labels(type='opinion_analysis').inc()
        logger.error(f"❌ خطأ في تحليل الرأي العام: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"فشل في تحليل الرأي العام: {str(e)}"
        )

@app.post("/classify/mood", tags=["تصنيف المحتوى"])
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def classify_content_mood(
    request: Request,
    mood_request: ContentMoodRequest,
    current_user = Depends(get_current_user)
):
    """
    تصنيف المحتوى حسب المزاج
    
    يصنف المحتوى إلى فئات مزاجية مناسبة للجمهور المستهدف.
    """
    REQUEST_COUNT.labels(endpoint='classify_mood', method='POST').inc()
    
    try:
        # تحليل شامل للمحتوى
        analysis = system_manager.analyzer.comprehensive_analysis(mood_request.content)
        
        # تصنيف المزاج بناءً على التحليل
        mood_classification = _classify_content_mood(
            analysis,
            mood_request.content_type,
            mood_request.target_audience
        )
        
        return {
            "success": True,
            "data": {
                "content_analysis": analysis,
                "mood_classification": mood_classification,
                "content_type": mood_request.content_type,
                "target_audience": mood_request.target_audience
            },
            "message": "تم تصنيف المزاج بنجاح",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        ERROR_COUNT.labels(type='mood_classification').inc()
        logger.error(f"❌ خطأ في تصنيف المزاج: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"فشل في تصنيف المزاج: {str(e)}"
        )

def _classify_content_mood(analysis: Dict[str, Any], content_type: str, target_audience: Optional[str]) -> Dict[str, Any]:
    """تصنيف المزاج بناءً على التحليل"""
    sentiment = analysis['sentiment_analysis']['predicted_sentiment']
    emotions = analysis['emotion_analysis']['emotions']
    advanced = analysis['advanced_analysis']
    
    # تحديد المزاج الأساسي
    if sentiment == 'positive':
        if emotions['joy']['present']:
            mood = 'uplifting'
        elif emotions['trust']['present']:
            mood = 'informative'
        else:
            mood = 'positive'
    elif sentiment == 'negative':
        if emotions['anger']['present']:
            mood = 'serious'
        elif emotions['sadness']['present']:
            mood = 'emotional'
        else:
            mood = 'negative'
    else:
        mood = 'neutral'
    
    # تعديل حسب نوع المحتوى
    if content_type == 'news' and mood == 'uplifting':
        mood = 'informative'
    elif content_type == 'entertainment':
        if mood in ['serious', 'emotional']:
            mood = 'entertaining'
    
    # تعديل حسب الجمهور المستهدف
    audience_factor = 1.0
    if target_audience == 'youth':
        audience_factor = 1.2 if mood == 'entertaining' else 0.8
    elif target_audience == 'professionals':
        audience_factor = 1.2 if mood == 'informative' else 0.8
    
    return {
        'primary_mood': mood,
        'mood_confidence': advanced['analysis_confidence'] * audience_factor,
        'suitable_for_audience': audience_factor > 1.0,
        'recommended_timing': _recommend_timing(mood, emotions),
        'content_tags': _generate_content_tags(mood, emotions, content_type)
    }

def _recommend_timing(mood: str, emotions: Dict[str, Any]) -> List[str]:
    """توصية أوقات النشر المناسبة"""
    if mood == 'uplifting':
        return ['morning', 'afternoon']
    elif mood == 'serious':
        return ['morning', 'evening']
    elif mood == 'entertaining':
        return ['afternoon', 'evening', 'weekend']
    else:
        return ['anytime']

def _generate_content_tags(mood: str, emotions: Dict[str, Any], content_type: str) -> List[str]:
    """إنشاء تاغات للمحتوى"""
    tags = [mood, content_type]
    
    for emotion, data in emotions.items():
        if data['present'] and data['probability'] > 0.7:
            tags.append(emotion)
    
    return tags

@app.get("/metrics", tags=["مراقبة"])
async def get_metrics():
    """مقاييس Prometheus"""
    return generate_latest()

@app.get("/stats", tags=["إحصائيات"])
async def get_system_stats():
    """إحصائيات النظام"""
    health = await system_manager.get_system_health()
    
    model_info = system_manager.analyzer.get_model_info() if system_manager.analyzer else {}
    
    return {
        "system_health": health,
        "model_info": model_info,
        "performance_metrics": {
            "total_requests": system_manager.request_count,
            "active_requests": system_manager.active_requests,
            "uptime_hours": health['uptime_seconds'] / 3600
        }
    }

# ========================= معالجة الأخطاء =========================

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """معالج أخطاء القيم"""
    ERROR_COUNT.labels(type='validation_error').inc()
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": "خطأ في القيمة المدخلة",
            "message": str(exc),
            "timestamp": datetime.now().isoformat(),
            "request_id": generate_request_id()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """معالج الأخطاء العام"""
    ERROR_COUNT.labels(type='server_error').inc()
    logger.error(f"خطأ غير متوقع: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "خطأ داخلي في الخادم",
            "message": "حدث خطأ غير متوقع",
            "timestamp": datetime.now().isoformat(),
            "request_id": generate_request_id()
        }
    )

# ========================= تشغيل الخادم =========================

if __name__ == "__main__":
    uvicorn.run(
        "sentiment_api:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info",
        access_log=True
    )
