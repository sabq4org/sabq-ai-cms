# 🔗 توثيق APIs - سبق الذكية

## 📋 نظرة عامة

يوفر نظام "سبق الذكية" مجموعة شاملة من APIs المصممة خصيصاً للتكامل مع أنظمة إدارة المحتوى والتطبيقات الذكية. جميع APIs مبنية على معايير REST ومدعومة بتوثيق OpenAPI/Swagger.

### 🌐 معلومات أساسية

| المعلومة | القيمة |
|---------|---------|
| **Base URL** | `https://api.sabq-ai.com/v1` |
| **Authentication** | Bearer Token + API Key |
| **Format** | JSON |
| **Rate Limiting** | 1000 requests/hour |
| **Versioning** | URL Path (`/v1/`, `/v2/`) |

---

## 🔐 المصادقة والأمان

### Bearer Token Authentication

```http
Authorization: Bearer <your_access_token>
X-API-Key: <your_api_key>
Content-Type: application/json
```

### الحصول على Access Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "subscriber"
    }
  }
}
```

### تجديد Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 📚 APIs الرئيسية

### 🧠 التوصيات الذكية

#### الحصول على التوصيات

```http
GET /recommendations
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | معرف المستخدم |
| `type` | string | No | نوع التوصية (`trending`, `personalized`, `similar`) |
| `limit` | integer | No | عدد النتائج (افتراضي: 10) |
| `category` | string | No | فئة المحتوى |

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "rec_123",
        "type": "personalized",
        "title": "توصيات مخصصة لك",
        "reason": "بناءً على اهتماماتك في التكنولوجيا",
        "confidence": 0.89,
        "priority": 1,
        "articles": [
          {
            "id": "article_456",
            "title": "أحدث تطورات الذكاء الاصطناعي",
            "slug": "ai-latest-developments",
            "excerpt": "تطورات مثيرة في عالم AI...",
            "thumbnail": "https://cdn.sabq-ai.com/images/ai-article.jpg",
            "category": {
              "id": "tech",
              "name": "تكنولوجيا",
              "slug": "technology"
            },
            "author": {
              "id": "author_789",
              "name": "د. أحمد محمد",
              "avatar": "https://cdn.sabq-ai.com/avatars/author1.jpg"
            },
            "publishedAt": "2024-12-16T10:00:00Z",
            "readingTime": 5,
            "views": 1250,
            "likes": 89,
            "engagement_score": 0.87
          }
        ]
      }
    ],
    "metadata": {
      "total": 25,
      "page": 1,
      "per_page": 10,
      "algorithm_version": "v2.1.0",
      "generated_at": "2024-12-16T15:30:00Z"
    }
  }
}
```

#### تتبع تفاعل التوصية

```http
POST /recommendations/track
Authorization: Bearer <token>
Content-Type: application/json

{
  "recommendation_id": "rec_123",
  "article_id": "article_456",
  "action": "click",
  "metadata": {
    "position": 1,
    "source": "homepage",
    "device_type": "desktop"
  }
}
```

### 🔔 الإشعارات الذكية

#### الحصول على الإشعارات

```http
GET /notifications
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | رقم الصفحة |
| `limit` | integer | No | عدد النتائج |
| `type` | string | No | نوع الإشعار |
| `unread_only` | boolean | No | الإشعارات غير المقروءة فقط |

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "content_recommendation",
        "title": "مقال جديد قد يهمك",
        "message": "تم نشر مقال جديد في التكنولوجيا",
        "priority": "medium",
        "is_read": false,
        "created_at": "2024-12-16T14:30:00Z",
        "metadata": {
          "article_id": "article_456",
          "category": "technology",
          "confidence_score": 0.89
        },
        "actions": [
          {
            "type": "read_article",
            "label": "قراءة المقال",
            "url": "/articles/article_456"
          },
          {
            "type": "dismiss",
            "label": "تجاهل"
          }
        ]
      }
    ],
    "unread_count": 5,
    "total": 50
  }
}
```

#### إرسال إشعار جديد

```http
POST /notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "social_interaction",
  "recipients": ["user_123", "user_456"],
  "title": "تفاعل جديد",
  "message": "أحمد علي أضاف تعليق على مقالك",
  "priority": "high",
  "metadata": {
    "article_id": "article_789",
    "comment_id": "comment_101",
    "actor_id": "user_555"
  },
  "scheduled_at": "2024-12-16T16:00:00Z"
}
```

#### تحديث حالة الإشعار

```http
PUT /notifications/{notification_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_read": true,
  "action_taken": "clicked"
}
```

### 🧠 تحليل المشاعر

#### تحليل نص

```http
POST /sentiment/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "هذا المقال رائع ومفيد جداً!",
  "language": "ar",
  "analysis_type": "comprehensive"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sentiment": {
      "overall": "positive",
      "confidence": 0.94,
      "score": 0.87
    },
    "emotions": {
      "joy": 0.82,
      "trust": 0.76,
      "surprise": 0.23,
      "fear": 0.05,
      "sadness": 0.03,
      "anger": 0.02
    },
    "dimensions": {
      "valence": 0.85,
      "arousal": 0.67,
      "dominance": 0.71
    },
    "analysis": {
      "language_detected": "ar",
      "dialect": "msa",
      "text_length": 25,
      "processing_time_ms": 150
    }
  }
}
```

#### تحليل اتجاهات المشاعر

```http
GET /sentiment/trends
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | الفترة الزمنية (`day`, `week`, `month`) |
| `category` | string | No | فئة المحتوى |
| `topic` | string | No | موضوع محدد |

### 📝 إدارة المحتوى

#### الحصول على المقالات

```http
GET /articles
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | رقم الصفحة |
| `limit` | integer | No | عدد النتائج |
| `category` | string | No | فئة المحتوى |
| `status` | string | No | حالة المقال |
| `search` | string | No | البحث في النص |
| `sort` | string | No | ترتيب النتائج |

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "article_123",
        "title": "مستقبل الذكاء الاصطناعي في التعليم",
        "slug": "ai-future-education",
        "content": "نص المقال الكامل...",
        "excerpt": "ملخص المقال...",
        "status": "published",
        "featured_image": "https://cdn.sabq-ai.com/images/ai-education.jpg",
        "category": {
          "id": "education",
          "name": "تعليم",
          "slug": "education"
        },
        "author": {
          "id": "author_456",
          "name": "د. سارة أحمد",
          "bio": "خبيرة في التكنولوجيا التعليمية",
          "avatar": "https://cdn.sabq-ai.com/avatars/author2.jpg"
        },
        "tags": ["ذكاء اصطناعي", "تعليم", "تكنولوجيا"],
        "published_at": "2024-12-16T09:00:00Z",
        "updated_at": "2024-12-16T10:30:00Z",
        "metrics": {
          "views": 2340,
          "likes": 156,
          "shares": 45,
          "comments": 23,
          "reading_time": 8,
          "engagement_rate": 0.78
        },
        "seo": {
          "meta_title": "مستقبل الذكاء الاصطناعي في التعليم - سبق الذكية",
          "meta_description": "اكتشف كيف يغير الذكاء الاصطناعي مستقبل التعليم...",
          "keywords": ["ذكاء اصطناعي", "تعليم", "مستقبل"]
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 500,
      "total_pages": 25,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### إنشاء مقال جديد

```http
POST /articles
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "عنوان المقال",
  "content": "محتوى المقال الكامل...",
  "excerpt": "ملخص المقال...",
  "category_id": "tech",
  "tags": ["تكنولوجيا", "ابتكار"],
  "featured_image": "https://example.com/image.jpg",
  "status": "draft",
  "seo": {
    "meta_title": "عنوان SEO",
    "meta_description": "وصف SEO",
    "keywords": ["كلمة1", "كلمة2"]
  },
  "settings": {
    "allow_comments": true,
    "featured": false,
    "scheduled_publish": "2024-12-17T09:00:00Z"
  }
}
```

#### تحديث مقال

```http
PUT /articles/{article_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "العنوان المحدث",
  "content": "المحتوى المحدث...",
  "status": "published"
}
```

#### حذف مقال

```http
DELETE /articles/{article_id}
Authorization: Bearer <token>
```

### 👥 إدارة المستخدمين

#### معلومات المستخدم الحالي

```http
GET /users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "username": "محمد أحمد",
      "role": "subscriber",
      "avatar": "https://cdn.sabq-ai.com/avatars/user123.jpg",
      "preferences": {
        "language": "ar",
        "theme": "light",
        "notifications": {
          "email": true,
          "push": true,
          "sms": false
        },
        "interests": ["تكنولوجيا", "رياضة", "اقتصاد"]
      },
      "statistics": {
        "articles_read": 456,
        "total_reading_time": 2340,
        "engagement_score": 0.85,
        "last_active": "2024-12-16T15:30:00Z"
      },
      "subscription": {
        "plan": "premium",
        "expires_at": "2025-12-16T00:00:00Z",
        "features": ["unlimited_articles", "ai_recommendations", "priority_support"]
      }
    }
  }
}
```

#### تحديث ملف المستخدم

```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "الاسم الجديد",
  "preferences": {
    "theme": "dark",
    "language": "en",
    "interests": ["تكنولوجيا", "صحة"]
  }
}
```

### 👤 التفاعلات والسلوك

#### تسجيل تفاعل

```http
POST /interactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "article_view",
  "article_id": "article_123",
  "duration": 180,
  "metadata": {
    "source": "homepage",
    "device": "mobile",
    "referrer": "google.com",
    "scroll_depth": 0.85
  }
}
```

#### إعجاب/إلغاء إعجاب

```http
POST /articles/{article_id}/like
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "toggle"
}
```

#### حفظ مقال

```http
POST /articles/{article_id}/save
Authorization: Bearer <token>
```

#### مشاركة مقال

```http
POST /articles/{article_id}/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "platform": "twitter",
  "metadata": {
    "custom_message": "رسالة مخصصة للمشاركة"
  }
}
```

### 📊 التحليلات والإحصائيات

#### لوحة القيادة

```http
GET /analytics/dashboard
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | الفترة (`today`, `week`, `month`) |
| `metrics` | array | No | المقاييس المطلوبة |

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_users": 50000,
      "active_users": 15000,
      "total_articles": 1200,
      "total_views": 2500000,
      "engagement_rate": 0.78
    },
    "traffic": {
      "today": {
        "page_views": 45000,
        "unique_visitors": 12000,
        "bounce_rate": 0.35,
        "avg_session_duration": 280
      },
      "trends": [
        {
          "date": "2024-12-15",
          "views": 42000,
          "visitors": 11500
        }
      ]
    },
    "content": {
      "top_articles": [
        {
          "id": "article_123",
          "title": "مقال شائع",
          "views": 5000,
          "engagement": 0.89
        }
      ],
      "categories_performance": [
        {
          "category": "تكنولوجيا",
          "articles": 150,
          "total_views": 500000,
          "avg_engagement": 0.82
        }
      ]
    }
  }
}
```

#### تقرير مفصل

```http
GET /analytics/reports
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | نوع التقرير |
| `date_from` | string | Yes | تاريخ البداية |
| `date_to` | string | Yes | تاريخ النهاية |
| `format` | string | No | تنسيق التقرير (`json`, `csv`, `pdf`) |

#### تتبع حدث مخصص

```http
POST /analytics/track
Authorization: Bearer <token>
Content-Type: application/json

{
  "event": "newsletter_signup",
  "properties": {
    "source": "article_page",
    "article_id": "article_123",
    "user_type": "anonymous"
  },
  "timestamp": "2024-12-16T15:30:00Z"
}
```

### 🔍 البحث والاستكشاف

#### البحث في المحتوى

```http
GET /search
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | نص البحث |
| `type` | string | No | نوع المحتوى |
| `category` | string | No | فئة المحتوى |
| `date_from` | string | No | تاريخ البداية |
| `date_to` | string | No | تاريخ النهاية |
| `sort` | string | No | ترتيب النتائج |

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "article",
        "id": "article_123",
        "title": "عنوان المقال",
        "excerpt": "ملخص...",
        "relevance_score": 0.95,
        "highlights": [
          "نص مُميز يحتوي على <mark>كلمة البحث</mark>"
        ]
      }
    ],
    "suggestions": [
      "ذكاء اصطناعي",
      "تعلم آلة",
      "تكنولوجيا"
    ],
    "facets": {
      "categories": [
        {"name": "تكنولوجيا", "count": 45},
        {"name": "علوم", "count": 23}
      ],
      "authors": [
        {"name": "د. أحمد محمد", "count": 12}
      ]
    },
    "total": 150,
    "took": 25
  }
}
```

---

## 📱 WebSocket APIs للوقت الفعلي

### الاتصال

```javascript
const socket = io('wss://api.sabq-ai.com', {
  auth: {
    token: 'your_access_token'
  }
});
```

### الأحداث المتاحة

#### الإشعارات المباشرة

```javascript
// الاستماع للإشعارات الجديدة
socket.on('notification', (data) => {
  console.log('إشعار جديد:', data);
});

// إرسال إشعار قراءة
socket.emit('notification_read', {
  notification_id: 'notif_123'
});
```

#### التحديثات المباشرة

```javascript
// تحديثات المقالات
socket.on('article_updated', (data) => {
  console.log('مقال محدث:', data);
});

// تحديثات الإحصائيات
socket.on('stats_update', (data) => {
  console.log('إحصائيات جديدة:', data);
});
```

#### غرف المحادثة

```javascript
// الانضمام لغرفة
socket.emit('join_room', 'article_123_comments');

// مغادرة غرفة
socket.emit('leave_room', 'article_123_comments');

// رسالة جديدة في الغرفة
socket.on('room_message', (data) => {
  console.log('رسالة جديدة:', data);
});
```

---

## 🚨 معالجة الأخطاء

### رموز الاستجابة

| الرمز | المعنى | الوصف |
|-------|---------|---------|
| `200` | نجح | العملية تمت بنجاح |
| `201` | تم الإنشاء | تم إنشاء المورد |
| `400` | خطأ في الطلب | بيانات غير صحيحة |
| `401` | غير مصرح | مطلوب مصادقة |
| `403` | ممنوع | لا توجد صلاحية |
| `404` | غير موجود | المورد غير موجود |
| `429` | تجاوز الحد | تجاوز معدل الطلبات |
| `500` | خطأ خادم | خطأ داخلي |

### تنسيق الأخطاء

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "خطأ في التحقق من البيانات",
    "details": [
      {
        "field": "email",
        "message": "البريد الإلكتروني مطلوب",
        "code": "REQUIRED"
      }
    ],
    "request_id": "req_123456789",
    "timestamp": "2024-12-16T15:30:00Z"
  }
}
```

### أكواد الأخطاء الشائعة

| الكود | الوصف |
|-------|---------|
| `INVALID_TOKEN` | رمز المصادقة غير صحيح |
| `EXPIRED_TOKEN` | انتهت صلاحية الرمز |
| `RATE_LIMIT_EXCEEDED` | تجاوز معدل الطلبات |
| `VALIDATION_ERROR` | خطأ في التحقق |
| `RESOURCE_NOT_FOUND` | المورد غير موجود |
| `PERMISSION_DENIED` | لا توجد صلاحية |
| `INTERNAL_ERROR` | خطأ داخلي |

---

## 📏 حدود الاستخدام

### Rate Limiting

| نوع المستخدم | الحد بالساعة | الحد باليوم |
|-------------|-------------|-------------|
| **Free** | 100 طلب | 1,000 طلب |
| **Premium** | 1,000 طلب | 10,000 طلب |
| **Enterprise** | 10,000 طلب | 100,000 طلب |

### حدود البيانات

| العملية | الحد الأقصى |
|---------|-------------|
| **حجم الطلب** | 10 MB |
| **حجم الملف** | 50 MB |
| **طول النص للتحليل** | 10,000 حرف |
| **عدد المقالات بالطلب** | 100 مقال |

---

## 🔧 SDK وأدوات التطوير

### JavaScript/TypeScript SDK

```bash
npm install @sabq-ai/sdk
```

```javascript
import { SabqAI } from '@sabq-ai/sdk';

const client = new SabqAI({
  apiKey: 'your_api_key',
  token: 'your_access_token',
  baseURL: 'https://api.sabq-ai.com/v1'
});

// استخدام الـ SDK
const recommendations = await client.recommendations.get({
  type: 'personalized',
  limit: 10
});
```

### Python SDK

```bash
pip install sabq-ai-sdk
```

```python
from sabq_ai import SabqAI

client = SabqAI(
    api_key="your_api_key",
    token="your_access_token"
)

# الحصول على توصيات
recommendations = client.recommendations.get(
    type="personalized",
    limit=10
)
```

### cURL أمثلة

```bash
# الحصول على التوصيات
curl -X GET "https://api.sabq-ai.com/v1/recommendations" \
  -H "Authorization: Bearer your_token" \
  -H "X-API-Key: your_api_key"

# إنشاء مقال جديد
curl -X POST "https://api.sabq-ai.com/v1/articles" \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "عنوان المقال",
    "content": "محتوى المقال...",
    "category_id": "tech"
  }'
```

---

## 📊 OpenAPI/Swagger Specification

### تحميل Specification

يمكن تحميل ملف OpenAPI الكامل من:
- **JSON**: `https://api.sabq-ai.com/v1/openapi.json`
- **YAML**: `https://api.sabq-ai.com/v1/openapi.yaml`
- **Swagger UI**: `https://api.sabq-ai.com/docs`

### مثال OpenAPI

```yaml
openapi: 3.0.3
info:
  title: Sabq AI CMS API
  description: نظام إدارة المحتوى الذكي
  version: 1.0.0
  contact:
    name: فريق سبق الذكية
    email: api-support@sabq-ai.com
    url: https://sabq-ai.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.sabq-ai.com/v1
    description: الخادم الرئيسي
  - url: https://staging-api.sabq-ai.com/v1
    description: خادم الاختبار

security:
  - BearerAuth: []
  - ApiKeyAuth: []

paths:
  /recommendations:
    get:
      summary: الحصول على التوصيات الذكية
      description: جلب التوصيات المخصصة للمستخدم
      tags:
        - التوصيات
      parameters:
        - name: type
          in: query
          schema:
            type: string
            enum: [trending, personalized, similar]
          description: نوع التوصية
      responses:
        '200':
          description: نجح
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecommendationsResponse'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

  schemas:
    RecommendationsResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            recommendations:
              type: array
              items:
                $ref: '#/components/schemas/Recommendation'
```

---

## 🧪 بيئة الاختبار (Sandbox)

### الوصول للبيئة

- **Base URL**: `https://sandbox.sabq-ai.com/v1`
- **API Key**: `sandbox_key_123456789`
- **Documentation**: `https://sandbox.sabq-ai.com/docs`

### البيانات التجريبية

```javascript
// حساب تجريبي
const testUser = {
  email: "test@sabq-ai.com",
  password: "test123456"
};

// مقالات تجريبية
const testArticles = [
  "test_article_ai_tech",
  "test_article_health_tips", 
  "test_article_sports_news"
];
```

---

## 📞 الدعم والمساعدة

### قنوات الدعم

| النوع | التواصل | وقت الاستجابة |
|-------|---------|---------|
| 📧 **البريد** | api-support@sabq-ai.com | 24 ساعة |
| 💬 **الدردشة** | https://sabq-ai.com/support | فوري |
| 📞 **الهاتف** | +966-11-234-5678 | ساعات العمل |
| 🐛 **GitHub** | https://github.com/sabq-ai/issues | 48 ساعة |

### مصادر إضافية

- 📚 **دليل المطور**: https://docs.sabq-ai.com
- 🎓 **دورات تدريبية**: https://learn.sabq-ai.com
- 💡 **أمثلة عملية**: https://examples.sabq-ai.com
- 📺 **فيديوهات تعليمية**: https://youtube.com/sabq-ai

---

**تم إعداد هذا التوثيق بواسطة فريق API - سبق الذكية**  
*آخر تحديث: ديسمبر 2024*

---

[🔙 العودة للدليل الرئيسي](../README.md) | [📚 المزيد من التوثيق](../docs/)
