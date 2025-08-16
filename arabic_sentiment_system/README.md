# نظام تحليل المشاعر العربي المتقدم
## Advanced Arabic Sentiment Analysis System

![النسخة](https://img.shields.io/badge/النسخة-1.0.0-blue.svg)
![الحالة](https://img.shields.io/badge/الحالة-متاح-green.svg)
![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![Docker](https://img.shields.io/badge/Docker-متاح-blue.svg)

نظام متطور لتحليل المشاعر والذكاء الاصطناعي مخصص للمحتوى العربي، يدعم تحليل المشاعر متعدد الأبعاد، كشف اللهجات، تحليل الاتجاهات، وتحليل الرأي العام.

## 📋 المحتويات

- [المميزات الرئيسية](#-المميزات-الرئيسية)
- [متطلبات النظام](#-متطلبات-النظام)
- [التثبيت السريع](#-التثبيت-السريع)
- [الاستخدام](#-الاستخدام)
- [واجهات API](#-واجهات-api)
- [التكوين](#-التكوين)
- [الأداء والمراقبة](#-الأداء-والمراقبة)
- [التطوير](#-التطوير)
- [الاختبار](#-الاختبار)
- [النشر](#-النشر)
- [المساهمة](#-المساهمة)
- [الترخيص](#-الترخيص)

## 🌟 المميزات الرئيسية

### تحليل المشاعر المتقدم
- **تحليل أساسي**: إيجابي/سلبي/محايد مع مستوى الثقة
- **تحليل متعدد الأبعاد**: 8 عواطف أساسية (فرح، حزن، غضب، خوف، مفاجأة، اشمئزاز، ثقة، توقع)
- **تحليل ضمني وصريح**: كشف المشاعر المخفية في النصوص
- **تحليل سياقي**: فهم المعنى حسب السياق والموقف

### دعم اللغة العربية الشامل
- **اللهجات المحلية**: سعودي، مصري، شامي، خليجي، مغربي
- **الفصحى المعاصرة**: دعم كامل للعربية الفصيحة
- **معالجة متقدمة**: تطبيع النصوص، إزالة التشكيل، معالجة التكرار
- **كشف اللهجة**: تحديد اللهجة المستخدمة تلقائياً

### نماذج الذكاء الاصطناعي
- **BERT العربي**: استخدام نماذج محولات متطورة
- **نماذج هجينة**: دمج عدة تقنيات للحصول على أفضل دقة
- **تعلم مستمر**: تحديث النماذج بناءً على البيانات الجديدة
- **تحسين تلقائي**: ضبط النماذج حسب نوع المحتوى

### تحليل الاتجاهات والرأي العام
- **تحليل زمني**: تتبع تغير المشاعر عبر الوقت
- **كشف الأنماط**: تحديد الاتجاهات والأنماط الدورية
- **تحليل الاستقطاب**: قياس مستوى الخلاف في الآراء
- **الرأي العام**: تحليل شامل للرأي العام حول المواضيع

### الأداء والموثوقية
- **سرعة عالية**: معالجة 1000+ نص في الثانية
- **دقة متميزة**: أكثر من 90% دقة في تحليل المشاعر
- **قابلية التوسع**: دعم ملايين المستخدمين
- **موثوقية عالية**: نسبة تشغيل 99.9%

## 💻 متطلبات النظام

### الحد الأدنى
- **نظام التشغيل**: Linux/Windows/macOS
- **الذاكرة**: 4 GB RAM
- **المعالج**: 2 CPU cores
- **التخزين**: 10 GB مساحة فارغة
- **Python**: 3.11 أو أحدث

### المُوصى به للإنتاج
- **نظام التشغيل**: Ubuntu 20.04+ / CentOS 8+
- **الذاكرة**: 16 GB RAM
- **المعالج**: 8 CPU cores
- **التخزين**: 100 GB SSD
- **GPU**: NVIDIA GPU مع CUDA (اختياري)

## 🚀 التثبيت السريع

### باستخدام Docker (مُوصى به)

```bash
# استنساخ المشروع
git clone https://github.com/sabq-ai/arabic-sentiment-system.git
cd arabic-sentiment-system

# بناء وتشغيل النظام
docker-compose up -d

# التحقق من الحالة
docker-compose ps

# عرض السجلات
docker-compose logs -f sentiment_api
```

### التثبيت اليدوي

```bash
# إنشاء بيئة افتراضية
python -m venv sentiment_env
source sentiment_env/bin/activate  # Linux/Mac
# أو
sentiment_env\Scripts\activate     # Windows

# تثبيت المتطلبات
pip install -r requirements.txt

# إعداد قاعدة البيانات
python -m alembic upgrade head

# تشغيل الخادم
python start_server.py
```

### التحقق من التثبيت

```bash
# اختبار API
curl http://localhost:8001/health

# اختبار تحليل بسيط
curl -X POST "http://localhost:8001/analyze/sentiment" \
  -H "Content-Type: application/json" \
  -d '{"text": "أحب هذا المنتج كثيراً!"}'
```

## 📚 الاستخدام

### 1. تحليل المشاعر الأساسي

```python
import requests

# تحليل نص واحد
response = requests.post('http://localhost:8001/analyze/sentiment', json={
    'text': 'هذا المقال رائع ومفيد جداً!',
    'analysis_type': 'comprehensive',
    'detect_dialect': True
})

result = response.json()
print(f"المشاعر: {result['data']['sentiment_analysis']['predicted_sentiment']}")
print(f"الثقة: {result['data']['sentiment_analysis']['confidence']:.2f}")
```

### 2. تحليل مجمع

```python
# تحليل عدة نصوص
texts = [
    "أحب هذا التطبيق كثيراً",
    "الخدمة سيئة ولا أنصح بها",
    "التطبيق عادي، لا شيء مميز"
]

response = requests.post('http://localhost:8001/analyze/batch', json={
    'texts': texts,
    'analysis_type': 'comprehensive'
})

results = response.json()
for i, result in enumerate(results['data']):
    print(f"النص {i+1}: {result['predicted_sentiment']}")
```

### 3. تحليل الاتجاهات

```python
# تحليل اتجاهات موضوع معين
response = requests.post('http://localhost:8001/analyze/trends', json={
    'category': 'technology',
    'time_range': '7d',
    'include_emotions': True
})

trends = response.json()
print(f"اتجاه الترند: {trends['data']['trend_analysis']['trend_direction']}")
```

### 4. تحليل الرأي العام

```python
# تحليل الرأي العام حول موضوع
response = requests.post('http://localhost:8001/analyze/public-opinion', json={
    'topic': 'التعليم الإلكتروني',
    'sources': ['twitter', 'news_comments', 'surveys'],
    'time_range': '30d'
})

opinion = response.json()
print(f"الرأي العام: {opinion['data']['overall_sentiment']}")
print(f"مستوى الاستقطاب: {opinion['data']['polarization_level']:.2f}")
```

## 🔌 واجهات API

### نقاط النهاية الرئيسية

| المسار | الطريقة | الوصف |
|--------|----------|--------|
| `/` | GET | معلومات النظام |
| `/health` | GET | فحص صحة النظام |
| `/analyze/sentiment` | POST | تحليل المشاعر |
| `/analyze/batch` | POST | تحليل مجمع |
| `/analyze/trends` | POST | تحليل الاتجاهات |
| `/analyze/public-opinion` | POST | تحليل الرأي العام |
| `/classify/mood` | POST | تصنيف المزاج |
| `/stats` | GET | إحصائيات النظام |

### مثال على الاستجابة

```json
{
  "success": true,
  "data": {
    "sentiment_analysis": {
      "predicted_sentiment": "positive",
      "confidence": 0.92,
      "probabilities": {
        "positive": 0.92,
        "negative": 0.05,
        "neutral": 0.03
      }
    },
    "emotion_analysis": {
      "dominant_emotion": {
        "emotion": "joy",
        "probability": 0.85
      },
      "emotions": {
        "joy": {"probability": 0.85, "present": true},
        "sadness": {"probability": 0.1, "present": false}
      }
    },
    "dialect_analysis": {
      "predicted_dialect": "saudi",
      "confidence": 0.78
    }
  },
  "processing_time_ms": 156.2,
  "timestamp": "2024-01-15T12:34:56Z"
}
```

### رموز الأخطاء

| الرمز | الوصف |
|-------|--------|
| 200 | نجح التحليل |
| 400 | خطأ في البيانات المدخلة |
| 429 | تجاوز الحد المسموح |
| 500 | خطأ داخلي في الخادم |
| 503 | الخدمة غير متاحة |

## ⚙️ التكوين

### متغيرات البيئة

```bash
# التطبيق
APP_NAME="Arabic Sentiment Analysis System"
DEBUG=false
LOG_LEVEL=INFO

# قاعدة البيانات
DATABASE_URL=postgresql://user:pass@localhost:5432/sentiment_db
DATABASE_POOL_SIZE=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# النماذج
ARABIC_BERT_MODEL=aubmindlab/bert-base-arabert
MAX_SEQUENCE_LENGTH=512
BATCH_SIZE=16

# الأداء
ENABLE_CACHING=true
CACHE_TTL=3600
MAX_CONCURRENT_REQUESTS=100
RATE_LIMIT_PER_MINUTE=1000
```

### تكوين النماذج

```python
# في config/settings.py
class SentimentConfig(BaseSettings):
    # إعدادات النماذج
    models_path: str = "./models"
    arabic_bert_model: str = "aubmindlab/bert-base-arabert"
    
    # إعدادات التحليل
    sentiment_threshold: float = 0.6
    emotion_threshold: float = 0.5
    confidence_threshold: float = 0.7
    
    # أنواع المشاعر
    sentiment_labels: List[str] = ["positive", "negative", "neutral"]
    emotion_labels: List[str] = ["joy", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation"]
```

## 📊 الأداء والمراقبة

### مقاييس الأداء

- **السرعة**: 150-300ms لكل طلب
- **الإنتاجية**: 1000+ طلب/ثانية
- **الدقة**: 90%+ في تحليل المشاعر
- **التوفر**: 99.9% uptime

### لوحة المراقبة

```bash
# الوصول للوحة Grafana
http://localhost:3000
# المستخدم: admin
# كلمة المرور: admin123

# مقاييس Prometheus
http://localhost:9090

# إحصائيات النظام
http://localhost:8001/stats
```

### التنبيهات

النظام يرسل تنبيهات في الحالات التالية:
- ارتفاع زمن الاستجابة عن 500ms
- انخفاض دقة التحليل عن 85%
- ارتفاع استخدام الذاكرة عن 90%
- فشل في الاتصال بقاعدة البيانات

## 🛠️ التطوير

### هيكل المشروع

```
arabic_sentiment_system/
├── api/                    # واجهات API
├── models/                 # نماذج الذكاء الاصطناعي
├── services/              # الخدمات الأساسية
├── utils/                 # أدوات مساعدة
├── config/                # ملفات التكوين
├── data/                  # البيانات والنماذج
├── tests/                 # الاختبارات
├── scripts/               # نصوص الإعداد
├── docker-compose.yml     # إعداد Docker
├── Dockerfile            # صورة Docker
├── requirements.txt      # متطلبات Python
└── README.md            # هذا الملف
```

### إعداد بيئة التطوير

```bash
# استنساخ المشروع
git clone https://github.com/sabq-ai/arabic-sentiment-system.git
cd arabic-sentiment-system

# إنشاء بيئة التطوير
python -m venv dev_env
source dev_env/bin/activate

# تثبيت متطلبات التطوير
pip install -r requirements.txt
pip install -r requirements-dev.txt

# تثبيت Git hooks
pre-commit install

# تشغيل في وضع التطوير
python start_server.py --reload
```

### معايير الكود

```bash
# فحص جودة الكود
flake8 .
black .
isort .

# فحص الأنواع
mypy .

# فحص الأمان
bandit -r .
```

## 🧪 الاختبار

### تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات
pytest

# اختبارات وحدة معينة
pytest tests/test_sentiment_analysis.py

# اختبارات مع التغطية
pytest --cov=arabic_sentiment_system

# اختبارات الأداء
pytest tests/performance/
```

### أنواع الاختبارات

- **اختبارات الوحدة**: اختبار الوظائف الفردية
- **اختبارات التكامل**: اختبار التفاعل بين المكونات
- **اختبارات الأداء**: قياس السرعة والاستهلاك
- **اختبارات الأمان**: فحص الثغرات الأمنية

### بيانات الاختبار

```python
# مثال على بيانات اختبار
test_texts = [
    "أحب هذا المنتج كثيراً! إنه رائع جداً 😍",
    "هذا المحتوى سيء ومملل، لا أنصح به",
    "المقال عادي، لا شيء مميز فيه",
    "واو! هذا مفاجئ ومثير للاهتمام",
    "أشعر بالحزن والإحباط من هذا الخبر"
]
```

## 🚀 النشر

### النشر باستخدام Docker

```bash
# بناء الصورة للإنتاج
docker build -t sentiment-system:latest .

# تشغيل مع docker-compose
docker-compose -f docker-compose.prod.yml up -d

# تحديث النظام
docker-compose pull
docker-compose up -d
```

### النشر على Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentiment-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sentiment-api
  template:
    metadata:
      labels:
        app: sentiment-api
    spec:
      containers:
      - name: sentiment-api
        image: sentiment-system:latest
        ports:
        - containerPort: 8001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

### النشر السحابي

#### AWS
```bash
# نشر على AWS ECS
aws ecs create-cluster --cluster-name sentiment-cluster
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

#### Google Cloud
```bash
# نشر على Google Cloud Run
gcloud run deploy sentiment-api --image gcr.io/project/sentiment-system
```

#### Azure
```bash
# نشر على Azure Container Instances
az container create --resource-group rg --name sentiment-api --image sentiment-system:latest
```

## 📈 تحسين الأداء

### نصائح للحصول على أفضل أداء

1. **استخدام GPU**: تفعيل CUDA للنماذج الكبيرة
2. **التخزين المؤقت**: تفعيل Redis لتسريع الاستجابات
3. **المعالجة المجمعة**: معالجة عدة نصوص مرة واحدة
4. **ضغط البيانات**: استخدام ضغط gzip للطلبات الكبيرة

### مراقبة الأداء

```python
# مثال على مراقبة الأداء
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter('sentiment_requests_total', 'Total requests')
REQUEST_DURATION = Histogram('sentiment_request_duration_seconds', 'Request duration')

@REQUEST_DURATION.time()
def analyze_sentiment(text):
    REQUEST_COUNT.inc()
    # تحليل النص...
```

## 🔐 الأمان

### إرشادات الأمان

1. **مصادقة API**: استخدام مفاتيح API للحماية
2. **تشفير البيانات**: تشفير البيانات الحساسة
3. **حدود المعدل**: منع الإفراط في الاستخدام
4. **التسجيل الآمن**: تسجيل الأحداث دون كشف البيانات الحساسة

### مثال على تكوين الأمان

```python
# في config/settings.py
class SecuritySettings(BaseSettings):
    api_key_required: bool = True
    rate_limit_per_minute: int = 100
    max_text_length: int = 5000
    allowed_origins: List[str] = ["https://yourapp.com"]
```

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء فرع للميزة (`git checkout -b feature/amazing-feature`)
3. التأكد من اتباع معايير الكود
4. تشغيل الاختبارات
5. Commit التغييرات (`git commit -m 'إضافة ميزة رائعة'`)
6. Push للفرع (`git push origin feature/amazing-feature`)
7. فتح Pull Request

### متطلبات المساهمة

- تغطية اختبارية لا تقل عن 80%
- توثيق شامل للكود
- اتباع معايير Python PEP 8
- اختبار على Python 3.11+

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم والتواصل

- **الوثائق**: https://docs.sabq-ai.com/sentiment
- **المشاكل**: https://github.com/sabq-ai/arabic-sentiment-system/issues
- **المناقشات**: https://github.com/sabq-ai/arabic-sentiment-system/discussions
- **البريد الإلكتروني**: support@sabq-ai.com

## 🙏 شكر وتقدير

- فريق [AubmindLab](https://github.com/aub-mind) لنماذج BERT العربية
- مكتبة [CAMeL Tools](https://github.com/CAMeL-Lab/camel_tools) لمعالجة النصوص العربية
- مجتمع [Hugging Face](https://huggingface.co/) للنماذج المدربة مسبقاً
- جميع المساهمين في هذا المشروع

---

تم تطوير هذا النظام بـ ❤️ من فريق سبق الذكية لخدمة المحتوى العربي

**نسخة المستند**: 1.0.0 | **آخر تحديث**: 15 يناير 2024
