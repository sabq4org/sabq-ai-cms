# نظام تتبع سلوك المستخدم - سبق الذكية

<div align="center">

![Sabq AI Logo](https://sabq.ai/logo.png)

**نظام متقدم لتتبع وتحليل سلوك المستخدمين في منصة سبق الذكية**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-orange.svg)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7+-red.svg)](https://redis.io)
[![License](https://img.shields.io/badge/License-Proprietary-yellow.svg)]()

</div>

## 📋 نظرة عامة

نظام تتبع سلوك المستخدم هو مكون متقدم في منصة سبق الذكية مصمم لجمع وتحليل بيانات سلوك المستخدمين بطريقة ذكية ومتطورة. يهدف النظام إلى فهم أنماط التفاعل والقراءة لتحسين تجربة المستخدم وتقديم توصيات مخصصة.

### ✨ الميزات الأساسية

- **📊 تتبع التفاعلات الشامل**: تسجيل جميع أنواع التفاعلات (إعجاب، حفظ، مشاركة، تعليق)
- **📖 تحليل سلوك القراءة**: مراقبة أنماط القراءة والتمرير ونقاط الاهتمام
- **🌍 جمع بيانات السياق**: تحليل البيئة الزمنية والجغرافية والتقنية
- **⚡ معالجة في الوقت الفعلي**: استجابة فورية وتحديثات مباشرة
- **🔒 خصوصية متقدمة**: امتثال كامل لمعايير GDPR وحماية البيانات
- **📈 تحليلات ذكية**: استخراج الرؤى والأنماط السلوكية
- **🔌 تكامل سلس**: API موحد وسهل الاستخدام

## 🏗️ البنية التقنية

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ SmartInteraction│  │ UserTracking    │  │ React Hooks  │ │
│  │ Bar             │  │ Integration     │  │             │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ CORS & Auth     │  │ Rate Limiting   │  │ Load Balancer│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              User Behavior Tracking API (FastAPI)          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Interactions    │  │ Reading Sessions│  │ Context Data │ │
│  │ Endpoint        │  │ Endpoint        │  │ Endpoint     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│    PostgreSQL           │  │       Redis             │
│  ┌─────────────────┐    │  │  ┌─────────────────┐    │
│  │ User Interactions│    │  │  │ Session Cache   │    │
│  │ Reading Sessions │    │  │  │ Real-time Data  │    │
│  │ Context Data    │    │  │  │ Rate Limiting   │    │
│  │ Scroll Events   │    │  │  └─────────────────┘    │
│  └─────────────────┘    │  └─────────────────────────┘
└─────────────────────────┘
```

## 🚀 التثبيت والتشغيل

### المتطلبات المسبقة

- **Python 3.11+**
- **PostgreSQL 15+**
- **Redis 7+**
- **Docker & Docker Compose** (اختياري)

### التثبيت السريع باستخدام Docker

```bash
# استنساخ المشروع
git clone https://github.com/sabq-ai/user-tracking-system.git
cd user-tracking-system

# نسخ ملف الإعدادات
cp config.env.example .env

# تحرير الإعدادات
nano .env

# تشغيل النظام
docker-compose up -d

# مراقبة السجلات
docker-compose logs -f tracking-api
```

### التثبيت اليدوي

```bash
# إنشاء بيئة Python افتراضية
python -m venv venv
source venv/bin/activate  # في Linux/Mac
# أو
venv\Scripts\activate     # في Windows

# تثبيت المتطلبات
pip install -r requirements.txt

# إعداد قاعدة البيانات
# تأكد من تشغيل PostgreSQL و Redis

# تشغيل الخادم
python start_server.py
```

## 📖 الاستخدام

### 1. تكامل مع React/Next.js

```typescript
import { useUserTracking } from '@/lib/user-tracking-integration';

function ArticlePage({ articleId, userId }) {
  const { tracker, trackInteraction } = useUserTracking(userId, articleId);
  
  const handleLike = async () => {
    const success = await trackInteraction('like', {
      metadata: { source: 'article_page' }
    });
    
    if (success) {
      // تحديث الواجهة
    }
  };
  
  return (
    <div>
      <SmartInteractionBar 
        articleId={articleId}
        articleTitle="عنوان المقال"
        onInteraction={handleInteraction}
      />
    </div>
  );
}
```

### 2. تتبع التفاعلات

```typescript
// تسجيل إعجاب
await trackInteraction('like', {
  metadata: {
    source: 'homepage',
    position: 'featured_article'
  }
});

// تسجيل حفظ مقال
await trackInteraction('save', {
  metadata: {
    collection: 'reading_list',
    tags: ['technology', 'ai']
  }
});

// تسجيل مشاركة
await trackInteraction('share', {
  metadata: {
    platform: 'twitter',
    audience: 'public'
  }
});
```

### 3. تتبع جلسات القراءة

```typescript
// بدء تتبع القراءة
tracker.startReadingTracking(articleId);

// إيقاف التتبع (تلقائي عند مغادرة الصفحة)
tracker.stopReadingTracking();
```

## 🔧 API Reference

### Endpoints الأساسية

#### تسجيل تفاعل
```http
POST /api/v1/interactions
Content-Type: application/json

{
  "user_id": "user123",
  "session_id": "session456",
  "content_id": "article789",
  "content_type": "article",
  "interaction_type": "like",
  "metadata": {
    "source": "homepage",
    "device": "mobile"
  }
}
```

#### جلب تحليلات المستخدم
```http
GET /api/v1/analytics/user/{user_id}?days=30
```

#### فحص صحة النظام
```http
GET /health
```

### Response Format

```json
{
  "success": true,
  "data": {
    "interaction_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-20T10:30:00Z",
    "points_earned": 5
  },
  "message": "تم تسجيل التفاعل بنجاح"
}
```

## 📊 نماذج البيانات

### UserInteraction
```json
{
  "id": "uuid",
  "user_id": "string",
  "session_id": "string", 
  "content_id": "string",
  "content_type": "article|video|podcast",
  "interaction_type": "like|save|share|comment|view",
  "interaction_value": "number",
  "timestamp": "datetime",
  "metadata": "json"
}
```

### ReadingSession
```json
{
  "id": "uuid",
  "user_id": "string",
  "content_id": "string",
  "reading_session_id": "string",
  "start_time": "datetime",
  "end_time": "datetime",
  "total_reading_time": "seconds",
  "scroll_depth_max": "percentage",
  "engagement_score": "0.0-1.0",
  "is_completed": "boolean"
}
```

## 🔒 الأمان والخصوصية

### إعدادات الخصوصية

```python
# في config.py
PRIVACY_CONFIG = {
    "anonymize_ip": True,           # إخفاء عناوين IP
    "respect_do_not_track": True,   # احترام Do Not Track
    "gdpr_compliance": True,        # الامتثال لـ GDPR
    "data_retention_days": 365      # فترة الاحتفاظ بالبيانات
}
```

### التشفير

- **البيانات في النقل**: TLS 1.3
- **البيانات المخزنة**: AES-256
- **المصادقة**: JWT مع RSA256
- **Session Management**: آمن مع انتهاء صلاحية

### امتثال GDPR

- ✅ الحق في الوصول للبيانات
- ✅ الحق في تصحيح البيانات  
- ✅ الحق في حذف البيانات
- ✅ الحق في نقل البيانات
- ✅ الحق في تقييد المعالجة

## 📈 المراقبة والتحليل

### Metrics المتاحة

```python
# أداء النظام
- response_time_ms
- requests_per_second  
- error_rate_percentage
- active_sessions_count

# بيانات المستخدمين
- daily_active_users
- average_session_duration
- interaction_rate_by_type
- content_engagement_score

# صحة النظام
- database_health
- redis_health
- memory_usage
- cpu_usage
```

### Dashboards

- **Grafana Dashboard**: مراقبة في الوقت الفعلي
- **Health Check Endpoint**: `/health`
- **Metrics Endpoint**: `/metrics`

## 🧪 الاختبار

### تشغيل الاختبارات

```bash
# اختبارات الوحدة
pytest tests/unit/

# اختبارات التكامل  
pytest tests/integration/

# اختبارات الأداء
pytest tests/performance/

# تقرير التغطية
pytest --cov=src tests/
```

### اختبار الأحمال

```bash
# اختبار الحمولة باستخدام locust
locust -f tests/load/locustfile.py --host=http://localhost:8000
```

## 🐳 إعداد الإنتاج

### متطلبات الإنتاج

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  tracking-api:
    image: sabq/user-tracking:latest
    environment:
      - ENVIRONMENT=production
      - DEBUG=false
      - WORKER_PROCESSES=8
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### إعدادات الأمان للإنتاج

```bash
# تشفير كامل
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/sabq.pem
SSL_KEY_PATH=/etc/ssl/private/sabq.key

# قواعد جدار الحماية
ufw allow 443/tcp   # HTTPS only
ufw deny 8000/tcp   # Block direct API access
```

## 🔄 النسخ الاحتياطي والاستعادة

### النسخ الاحتياطي التلقائي

```bash
# إعداد النسخ الاحتياطي اليومي
0 2 * * * /opt/sabq/backup.sh

# النسخ الاحتياطي اليدوي
docker-compose exec postgres pg_dump -U sabq_user sabq_tracking > backup.sql
```

### الاستعادة

```bash
# استعادة قاعدة البيانات
docker-compose exec postgres psql -U sabq_user sabq_tracking < backup.sql

# استعادة Redis
docker-compose exec redis redis-cli --rdb dump.rdb
```

## 🤝 المساهمة

### معايير الكود

```bash
# تنسيق الكود
black src/
isort src/

# فحص الجودة
flake8 src/
mypy src/

# الاختبارات
pytest tests/
```

### Git Workflow

1. Fork المشروع
2. إنشاء feature branch
3. Commit التغييرات
4. Push للـ branch
5. إنشاء Pull Request

## 📞 الدعم

### قنوات الدعم

- **البريد الإلكتروني**: [tech@sabq.ai](mailto:tech@sabq.ai)
- **Slack**: `#user-tracking-support`
- **Documentation**: [docs.sabq.ai/tracking](https://docs.sabq.ai/tracking)

### الإبلاغ عن المشاكل

```bash
# جمع معلومات التشخيص
python diagnostic.py > system_info.txt

# إرسال السجلات
tar -czf logs.tar.gz logs/
```

## 📝 Changelog

### v1.0.0 (2024-01-20)
- ✨ إطلاق النسخة الأولى
- 🚀 تتبع التفاعلات الأساسية
- 📊 تحليل جلسات القراءة
- 🔒 إعدادات الخصوصية المتقدمة
- 📈 لوحة مراقبة شاملة

## 📄 الترخيص

هذا المشروع مملوك لشركة سبق الذكية ومحمي بحقوق الطبع والنشر.

---

<div align="center">

**تم تطويره بواسطة فريق سبق الذكية التقني** 💚

[الموقع الرسمي](https://sabq.ai) • [التوثيق](https://docs.sabq.ai) • [المدونة التقنية](https://tech.sabq.ai)

</div>
