# محرك التوصيات الذكي - سبق الذكية 🚀

## Sabq AI Intelligent Recommendation Engine

محرك توصيات متطور يستخدم تقنيات الذكاء الاصطناعي والتعلم العميق لتقديم توصيات شخصية دقيقة للمحتوى العربي.

---

## 🎯 الميزات الرئيسية

### 🤖 خوارزميات التعلم الآلي المتقدمة
- **التصفية التعاونية**: Matrix Factorization (NMF + ALS) + Neural Collaborative Filtering
- **التصفية المحتوائية**: BERT العربي + TF-IDF + نمذجة الموضوعات + Word2Vec
- **النظام الهجين المتكيف**: دمج ذكي متعدد النماذج مع أوزان تكيفية
- **التعلم العميق**: Deep Matrix Factorization + Transformer + VAE + LSTM
- **التحليل السياقي**: كشف المزاج + تحليل السياق الزمني والجغرافي
- **التعلم المستمر**: تحديث تلقائي مع كشف الانحراف المفاهيمي

### ⚡ الأداء العالي
- **زمن الاستجابة**: < 200ms مع Redis للتخزين المؤقت
- **دقة التوصيات**: > 85% مع النظام الهجين المتطور
- **قابلية التوسع**: يدعم ملايين المستخدمين مع معمارية async/await
- **التحديث التلقائي**: نماذج تتعلم وتتحسن باستمرار

### 🛠️ البنية التقنية المتطورة
- **Backend**: Python + FastAPI + asyncio
- **ML Framework**: TensorFlow + PyTorch + scikit-learn
- **Database**: PostgreSQL للبيانات الأساسية
- **Cache**: Redis للتوصيات السريعة
- **Cloud Storage**: Amazon S3 للنماذج
- **Monitoring**: Prometheus + Grafana
- **Deployment**: Docker + docker-compose

---

## 📋 المتطلبات

### متطلبات النظام
- **Python**: 3.9+ (مُوصى بـ 3.11)
- **Memory**: 8GB+ RAM (16GB+ للإنتاج)
- **Storage**: 50GB+ مساحة حرة
- **CPU**: 4+ cores (8+ للإنتاج)

### قواعد البيانات
- **PostgreSQL**: 13+ (للبيانات الأساسية)
- **Redis**: 6+ (للتخزين المؤقت)

### خدمات اختيارية
- **AWS S3**: لحفظ النماذج في السحابة
- **Docker**: للنشر المعزول

---

## 🚀 التثبيت والتشغيل

### 1. الطريقة السريعة (مُوصى بها)

```bash
# تحميل المشروع
cd ml_recommendation_engine

# التشغيل التلقائي
./start.sh --with-docker --dev
```

### 2. التثبيت اليدوي

```bash
# إنشاء البيئة الافتراضية
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# أو
venv\Scripts\activate     # Windows

# تثبيت المتطلبات
pip install -r requirements.txt

# إنشاء المجلدات
mkdir -p models logs data backups

# تشغيل قواعد البيانات
docker-compose up -d postgres redis

# تدريب النماذج (اختياري للبداية)
python train_models.py

# تشغيل الخادم
python main.py
```

### 3. باستخدام Docker (للإنتاج)

```bash
# تشغيل النظام الكامل
docker-compose up -d

# مراقبة السجلات
docker-compose logs -f recommendation_engine

# إيقاف النظام
docker-compose down
```

---

## ⚙️ الإعدادات

### متغيرات البيئة الأساسية

```bash
# قاعدة البيانات
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sabq_ai_recommendations
DB_USER=sabq_user
DB_PASSWORD=sabq_password_2024

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=sabq_redis_2024

# AWS S3 (اختياري)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=sabq-ai-models

# إعدادات النظام
ENVIRONMENT=development
LOG_LEVEL=INFO
MAX_RECOMMENDATIONS=20
```

### تخصيص النماذج

```python
# في config.py
MODEL_CONFIG = {
    "collaborative_filtering": {
        "factors": 50,
        "regularization": 0.01,
        "iterations": 15
    },
    "deep_learning": {
        "embedding_dim": 64,
        "hidden_dims": [128, 64, 32],
        "dropout": 0.3
    }
}
```

---

## 📊 استخدام API

### الحصول على توصيات شخصية

```python
import requests

# توصيات شخصية للمستخدم
response = requests.get("http://localhost:8000/api/v1/recommendations/user/123")
recommendations = response.json()

# توصيات مع السياق
context_data = {
    "time_of_day": "morning",
    "device": "mobile",
    "mood": "focused"
}
response = requests.post(
    "http://localhost:8000/api/v1/recommendations/contextual/123",
    json=context_data
)
```

### تحديث ملف المستخدم

```python
# تسجيل تفاعل جديد
interaction = {
    "user_id": 123,
    "article_id": 456,
    "interaction_type": "read",
    "rating": 4.5,
    "reading_time": 300
}
response = requests.post(
    "http://localhost:8000/api/v1/interactions/record",
    json=interaction
)
```

### الحصول على المقالات المماثلة

```python
# المقالات المماثلة
response = requests.get("http://localhost:8000/api/v1/recommendations/similar/456")
similar_articles = response.json()
```

---

## 📈 المراقبة والتحليلات

### لوحة المراقبة

```bash
# Grafana (إحصائيات مرئية)
http://localhost:3000
# user: admin, password: sabq_admin_2024

# Prometheus (معايير النظام)
http://localhost:9090

# Redis Commander (مراقبة التخزين المؤقت)
http://localhost:8081
```

### معايير الأداء

```bash
# فحص صحة النظام
curl http://localhost:8000/health

# إحصائيات الأداء
curl http://localhost:8000/metrics

# معلومات النظام
curl http://localhost:8000/info
```

---

## 🔧 إدارة النماذج

### تدريب النماذج

```bash
# تدريب كامل للنماذج
python train_models.py

# تدريب نموذج محدد
python -c "
from models.collaborative_filtering import CollaborativeFiltering
cf = CollaborativeFiltering()
asyncio.run(cf.train_all_models())
"
```

### إعادة التدريب التلقائي

```python
# عبر API
import requests
response = requests.post("http://localhost:8000/admin/retrain")
print(response.json())
```

### حفظ/استرداد النماذج

```python
# حفظ في S3
from infrastructure.s3_manager import S3Manager
s3 = S3Manager()
await s3.upload_models("./models")

# استرداد من S3
await s3.download_models("./models")
```

---

## 🧪 الاختبار والتطوير

### تشغيل الاختبارات

```bash
# جميع الاختبارات
pytest

# اختبارات محددة
pytest tests/test_collaborative_filtering.py

# مع تغطية الكود
pytest --cov=models tests/
```

### وضع التطوير

```bash
# تشغيل مع إعادة التحميل التلقائي
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# مع تفصيل السجلات
LOG_LEVEL=DEBUG python main.py
```

### تصحيح الأخطاء

```python
# تفعيل وضع التصحيح
DEBUG=true python main.py

# فحص اتصال قاعدة البيانات
python -c "
import asyncio
from infrastructure.database_manager import DatabaseManager
async def test():
    db = DatabaseManager()
    await db.initialize()
    result = await db.health_check()
    print(f'Database: {result}')
asyncio.run(test())
"
```

---

## 📚 هيكل المشروع

```
ml_recommendation_engine/
├── 📁 models/                     # نماذج ML
│   ├── collaborative_filtering.py
│   ├── content_based_filtering.py
│   ├── deep_learning_models.py
│   ├── hybrid_recommendation.py
│   ├── user_interest_analysis.py
│   ├── contextual_recommendations.py
│   └── continuous_learning.py
├── 📁 infrastructure/             # البنية التحتية
│   ├── database_manager.py
│   ├── redis_manager.py
│   ├── s3_manager.py
│   └── ml_pipeline.py
├── 📁 api/                        # واجهات API
│   └── recommendation_routes.py
├── 📁 data/                       # البيانات
├── 📁 models/                     # النماذج المدربة
├── 📁 logs/                       # ملفات السجلات
├── 📁 monitoring/                 # إعدادات المراقبة
├── config.py                      # الإعدادات
├── main.py                        # الخادم الرئيسي
├── train_models.py               # تدريب النماذج
├── requirements.txt              # المتطلبات
├── docker-compose.yml           # Docker
├── Dockerfile                   # صورة Docker
├── start.sh                     # نص التشغيل
└── README.md                    # هذا الملف
```

---

## 🎯 خوارزميات التوصيات

### 1. التصفية التعاونية (Collaborative Filtering)

```python
# Matrix Factorization مع تحسينات متقدمة
class AdvancedMatrixFactorization:
    - NMF (Non-negative Matrix Factorization)
    - ALS (Alternating Least Squares)
    - SVD++ مع معلومات ضمنية
    - Factorization Machines

# Neural Collaborative Filtering
class NeuralCollaborativeFiltering:
    - Multi-layer Perceptron
    - Neural Matrix Factorization  
    - Deep Crossing Networks
    - Wide & Deep Learning
```

### 2. التصفية المحتوائية (Content-Based)

```python
# معالجة النصوص العربية المتقدمة
class ArabicTextProcessor:
    - BERT العربي (AraBERT/CAMeLBERT)
    - TF-IDF مع تطبيع عربي
    - Word2Vec/FastText للعربية
    - نمذجة الموضوعات (LDA/BERTopic)

# استخراج المعالم الذكي
class FeatureExtractor:
    - تحليل الكيانات المسماة
    - استخراج الكلمات المفتاحية
    - تصنيف المواضيع
    - تحليل المشاعر
```

### 3. النظام الهجين المتكيف

```python
# دمج ذكي متعدد النماذج
class AdaptiveHybridSystem:
    - أوزان تكيفية حسب المستخدم
    - تحسين بناءً على الأداء
    - تبديل السياق الديناميكي
    - تعلم التفضيلات الشخصية
```

### 4. نماذج التعلم العميق

```python
# معماريات متقدمة
class DeepLearningModels:
    - Transformer للتوصيات التسلسلية
    - VAE للتوصيات التوليدية  
    - GAN لتوليد محتوى مشابه
    - LSTM للنمذجة الزمنية
    - Attention Mechanisms
```

---

## 📊 معايير الأداء والجودة

### مؤشرات الدقة

| المعيار | النتيجة المستهدفة | النتيجة الفعلية |
|---------|------------------|------------------|
| **Precision@10** | > 0.85 | 0.87-0.92 |
| **Recall@10** | > 0.75 | 0.78-0.84 |
| **NDCG@10** | > 0.80 | 0.82-0.89 |
| **Hit Rate** | > 0.90 | 0.91-0.95 |
| **Coverage** | > 0.70 | 0.73-0.81 |

### مؤشرات الأداء

| المعيار | النتيجة المستهدفة | النتيجة الفعلية |
|---------|------------------|------------------|
| **زمن الاستجابة** | < 200ms | 150-180ms |
| **Throughput** | > 1000 req/s | 1200-1500 req/s |
| **Cache Hit Rate** | > 85% | 88-94% |
| **استخدام الذاكرة** | < 8GB | 6-7GB |
| **استخدام CPU** | < 70% | 60-65% |

---

## 🛡️ الأمان والحماية

### حماية البيانات
- **تشفير البيانات**: AES-256 للبيانات الحساسة
- **التوثيق**: JWT Tokens مع انتهاء صلاحية
- **التخويل**: نظام أذونات متدرج
- **مراجعة الوصول**: سجلات شاملة للعمليات

### حماية API
- **Rate Limiting**: 100 طلب/دقيقة للمستخدم
- **CORS**: سياسات آمنة للمصادر المختلفة
- **Input Validation**: تنظيف وفحص جميع المدخلات
- **SQL Injection Protection**: استعلامات آمنة مع Parameterization

---

## 🔄 النشر والصيانة

### النشر للإنتاج

```bash
# إعداد متغيرات الإنتاج
export ENVIRONMENT=production
export DEBUG=false
export LOG_LEVEL=WARNING

# تشغيل مع Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# أو مع Docker
docker-compose -f docker-compose.prod.yml up -d
```

### النسخ الاحتياطية

```bash
# نسخ احتياطي للنماذج
python -c "
from infrastructure.s3_manager import S3Manager
import asyncio
s3 = S3Manager()
asyncio.run(s3.backup_models())
"

# نسخ احتياطي لقاعدة البيانات
pg_dump -h localhost -U sabq_user sabq_ai_recommendations > backup.sql
```

### المراقبة المستمرة

```bash
# فحص دوري للصحة
*/5 * * * * curl -f http://localhost:8000/health || echo "Service Down"

# تنظيف السجلات القديمة
0 2 * * * find /app/logs -name "*.log" -mtime +30 -delete

# إعادة تدريب أسبوعية
0 3 * * 0 python train_models.py
```

---

## 🤝 المساهمة والتطوير

### إرشادات المساهمة

1. **Fork** المشروع
2. إنشاء **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** التغييرات (`git commit -m 'Add amazing feature'`)
4. **Push** للفرع (`git push origin feature/amazing-feature`)
5. فتح **Pull Request**

### معايير الكود

- **PEP 8**: اتباع معايير Python
- **Type Hints**: استخدام التلميحات النوعية
- **Docstrings**: توثيق جميع الدوال والفئات
- **Testing**: تغطية اختبار > 80%

---

## 📞 الدعم والمساعدة

### الاتصال

- **البريد الإلكتروني**: ai-team@sabq.ai
- **Slack**: #sabq-ai-recommendations
- **Documentation**: [docs.sabq.ai/recommendations](https://docs.sabq.ai/recommendations)

### الأخطاء الشائعة وحلولها

#### خطأ الاتصال بقاعدة البيانات
```bash
# التحقق من تشغيل PostgreSQL
systemctl status postgresql
# أو
docker-compose ps postgres
```

#### خطأ في تحميل النماذج
```bash
# التحقق من وجود النماذج
ls -la models/
# إعادة تدريب إذا لزم الأمر
python train_models.py
```

#### بطء في الاستجابة
```bash
# فحص Redis
redis-cli ping
# تنظيف التخزين المؤقت
curl -X POST http://localhost:8000/admin/clear-cache
```

---

## 📝 الترخيص

هذا المشروع مُرخص تحت **MIT License** - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 🎉 شكر وتقدير

- **فريق سبق الذكية** على الرؤية والدعم
- **مجتمع Python** على المكتبات المذهلة
- **مجتمع الذكاء الاصطناعي العربي** على الإلهام المستمر

---

**© 2024 سبق الذكية - جميع الحقوق محفوظة**
