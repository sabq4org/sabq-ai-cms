# 🤝 دليل المساهمة في مشروع سبق الذكية

مرحباً بك في مجتمع مطوري سبق الذكية! نحن نقدر مساهماتك ونرحب بأي تحسينات أو إضافات للمشروع.

## 📋 جدول المحتويات

- [قواعد السلوك](#قواعد-السلوك)
- [كيفية المساهمة](#كيفية-المساهمة)
- [إرشادات التطوير](#إرشادات-التطوير)
- [إرشادات الكود](#إرشادات-الكود)
- [عملية المراجعة](#عملية-المراجعة)
- [الإبلاغ عن الأخطاء](#الإبلاغ-عن-الأخطاء)
- [اقتراح الميزات](#اقتراح-الميزات)

## 🤝 قواعد السلوك

### التزامنا
نحن نلتزم بتوفير بيئة مفتوحة ومرحبة للجميع، بغض النظر عن العمر أو الجنس أو الجنسية أو العرق أو الدين أو مستوى الخبرة.

### معاييرنا
**السلوك المقبول:**
- ✅ استخدام لغة مهذبة ومحترمة
- ✅ احترام وجهات النظر المختلفة
- ✅ تقبل النقد البناء بصدر رحب
- ✅ التركيز على ما هو الأفضل للمجتمع
- ✅ إظهار التعاطف مع أعضاء المجتمع الآخرين

**السلوك غير المقبول:**
- ❌ استخدام لغة أو صور جنسية
- ❌ التنمر أو التحرش أو التصيد
- ❌ الهجمات الشخصية أو السياسية
- ❌ نشر معلومات خاصة بالآخرين دون إذن

## 🚀 كيفية المساهمة

### للمطورين الجدد
1. **ابدأ بالقضايا البسيطة**: ابحث عن issues مع تسمية `good first issue`
2. **اقرأ التوثيق**: راجع [README.md](./README.md) و[PODCAST_README.md](./PODCAST_README.md)
3. **تواصل معنا**: لا تتردد في طرح الأسئلة في [Discussions](https://github.com/sabq4org/sabq-ai-cms/discussions)

### خطوات المساهمة

#### 1. إعداد البيئة المحلية
```bash
# استنساخ المشروع
git clone https://github.com/sabq4org/sabq-ai-cms.git
cd sabq-ai-cms

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
cp .env.example .env.local
# تحرير .env.local بالقيم المناسبة

# إعداد قاعدة البيانات
npx prisma generate
npx prisma db push

# تشغيل الخادم
npm run dev
```

#### 2. إنشاء فرع جديد
```bash
git checkout -b feature/your-feature-name
# أو
git checkout -b fix/your-fix-name
```

#### 3. تنفيذ التغييرات
- اكتب كود نظيف ومفهوم
- أضف تعليقات توضيحية عند الحاجة
- اتبع إرشادات الكود المحددة

#### 4. اختبار التغييرات
```bash
# تشغيل الاختبارات
npm run test

# فحص TypeScript
npm run type-check

# فحص ESLint
npm run lint

# فحص Prettier
npm run format:check
```

#### 5. إنشاء Commit
```bash
git add .
git commit -m "type: وصف واضح للتغيير"
```

**أنواع الـ Commits:**
- `feat:` - ميزة جديدة
- `fix:` - إصلاح خطأ
- `docs:` - تحديث التوثيق
- `style:` - تحسينات التصميم
- `refactor:` - إعادة هيكلة الكود
- `test:` - إضافة أو تحديث الاختبارات
- `chore:` - تحديثات صيانة

#### 6. دفع التغييرات
```bash
git push origin feature/your-feature-name
```

#### 7. إنشاء Pull Request
1. اذهب إلى صفحة المشروع على GitHub
2. انقر على "New Pull Request"
3. اختر الفرع الخاص بك
4. أضف عنوان ووصف واضح
5. اربط بـ Issues ذات الصلة

## 🛠️ إرشادات التطوير

### بنية المشروع
```
app/                 # صفحات Next.js
├── admin/          # لوحة التحكم
├── api/            # API Routes
├── auth/           # المصادقة
└── podcast/        # نظام البودكاست

components/         # مكونات React
├── ui/            # مكونات UI أساسية
├── home/          # مكونات الصفحة الرئيسية
└── admin/         # مكونات لوحة التحكم

lib/               # مكتبات مساعدة
utils/             # أدوات مساعدة
styles/            # ملفات CSS
prisma/            # قاعدة البيانات
```

### التقنيات المستخدمة
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Framer Motion
- **Database**: Prisma, PostgreSQL
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI, Vercel AI SDK

### متطلبات النظام
- Node.js 18+
- npm/yarn/pnpm
- PostgreSQL 14+
- Git

## 📝 إرشادات الكود

### TypeScript
```typescript
// ✅ جيد
interface UserProps {
  id: string;
  name: string;
  email: string;
}

const getUserById = async (id: string): Promise<UserProps | null> => {
  // implementation
};

// ❌ سيء
const getUser = (id) => {
  // implementation
};
```

### React Components
```tsx
// ✅ جيد
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  onClick 
}) => {
  return (
    <button 
      className={cn('btn', `btn-${variant}`)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ❌ سيء
export const Button = (props) => {
  return <button {...props} />;
};
```

### CSS/Tailwind
```tsx
// ✅ جيد - استخدم Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">

// ✅ جيد - استخدم cn() للشروط
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'large' && 'large-classes'
)}>

// ❌ سيء - تجنب inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### API Routes
```typescript
// ✅ جيد
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateUserSchema.parse(body);
    
    // implementation
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid data' },
      { status: 400 }
    );
  }
}
```

### Database (Prisma)
```typescript
// ✅ جيد
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    articles: {
      select: {
        id: true,
        title: true,
        publishedAt: true,
      },
    },
  },
});

// ❌ سيء - تجنب N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  const articles = await prisma.article.findMany({
    where: { authorId: user.id },
  });
}
```

## 🔍 عملية المراجعة

### معايير المراجعة
1. **الوظائف**: هل الكود يعمل كما هو متوقع؟
2. **الجودة**: هل الكود نظيف ومقروء؟
3. **الأداء**: هل هناك تحسينات ممكنة؟
4. **الأمان**: هل يتبع ممارسات الأمان؟
5. **الاختبارات**: هل الاختبارات كافية؟

### عملية المراجعة
1. **مراجعة تلقائية**: CI/CD checks
2. **مراجعة الكود**: من قبل maintainer
3. **اختبار الوظائف**: التأكد من العمل الصحيح
4. **دمج**: merge إلى main branch

### نصائح للمراجعين
- كن بناءً ومفيداً في التعليقات
- اشرح السبب وراء اقتراحاتك
- قدر الوقت والجهد المبذول
- ركز على الكود وليس الشخص

## 🐛 الإبلاغ عن الأخطاء

### قبل الإبلاغ
1. تحقق من [Issues الموجودة](https://github.com/sabq4org/sabq-ai-cms/issues)
2. حاول إعادة إنتاج الخطأ
3. اجمع معلومات مفيدة

### قالب الإبلاغ
```markdown
## وصف الخطأ
وصف واضح ومختصر للخطأ.

## خطوات إعادة الإنتاج
1. اذهب إلى '...'
2. انقر على '...'
3. مرر إلى '...'
4. شاهد الخطأ

## السلوك المتوقع
وصف واضح لما كان متوقعاً أن يحدث.

## لقطات الشاشة
إذا كان ممكناً، أضف لقطات شاشة لتوضيح المشكلة.

## معلومات البيئة
- النظام: [e.g. iOS, Windows]
- المتصفح: [e.g. chrome, safari]
- الإصدار: [e.g. 22]

## معلومات إضافية
أي معلومات أخرى مفيدة حول المشكلة.
```

## 💡 اقتراح الميزات

### قبل الاقتراح
1. تحقق من [roadmap المشروع](https://github.com/sabq4org/sabq-ai-cms/projects)
2. ابحث في Issues الموجودة
3. فكر في الفائدة للمجتمع

### قالب الاقتراح
```markdown
## هل طلبك مرتبط بمشكلة؟
وصف واضح للمشكلة. مثال: أنا محبط دائماً عندما [...]

## وصف الحل المقترح
وصف واضح ومختصر لما تريده أن يحدث.

## وصف البدائل
وصف واضح لأي حلول أو ميزات بديلة فكرت فيها.

## معلومات إضافية
أي معلومات أخرى أو لقطات شاشة حول طلب الميزة.
```

## 🏷️ التسميات (Labels)

### أنواع القضايا
- `bug` - خطأ يحتاج إصلاح
- `enhancement` - تحسين على ميزة موجودة
- `feature` - ميزة جديدة
- `documentation` - تحسينات على التوثيق
- `good first issue` - مناسب للمطورين الجدد
- `help wanted` - نحتاج مساعدة المجتمع

### الأولوية
- `priority: high` - أولوية عالية
- `priority: medium` - أولوية متوسطة
- `priority: low` - أولوية منخفضة

### المكونات
- `component: ui` - مكونات واجهة المستخدم
- `component: api` - API وBackend
- `component: database` - قاعدة البيانات
- `component: podcast` - نظام البودكاست
- `component: admin` - لوحة التحكم

## 🎉 الاعتراف بالمساهمين

نحن نقدر جميع المساهمين ونعترف بجهودهم:

- 📝 في [README.md](./README.md)
- 🏆 في [All Contributors](https://allcontributors.org/) bot
- 🎖️ شارات خاصة للمساهمين النشطين
- 📱 دعوات لقنوات التطوير الخاصة

## 📞 التواصل

### للأسئلة العامة
- 💬 [GitHub Discussions](https://github.com/sabq4org/sabq-ai-cms/discussions)
- 📧 [tech@sabq.org](mailto:tech@sabq.org)

### للتواصل المباشر
- 🔧 **للمطورين**: [Discord Server](https://discord.gg/sabq-dev)
- 📱 **للمجتمع**: [Telegram Group](https://t.me/sabq_community)

---

## 🙏 شكراً لك!

مساهمتك تجعل سبق الذكية أفضل للجميع. كل سطر كود، كل اقتراح، وكل إبلاغ عن خطأ يساهم في تحسين المنصة.

**مع تقديرنا العميق،**
**فريق سبق الذكية** 🚀

---

*آخر تحديث: ديسمبر 2024*
