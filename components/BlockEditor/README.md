# محرر البلوكات الذكي - Sabq Block Editor

محرر محتوى قائم على البلوكات مشابه لـ Notion، مصمم خصيصاً لمنصة سبق الإخبارية.

## المميزات الرئيسية

### ✨ أنواع البلوكات المدعومة

1. **فقرة (Paragraph)** - نص عادي مع خيارات المحاذاة
2. **عنوان (Heading)** - 6 مستويات من العناوين (H1-H6)
3. **صورة (Image)** - دعم الصور من رابط مع نص بديل ووصف
4. **فيديو (Video)** - دعم YouTube وVimeo والفيديوهات المباشرة
5. **اقتباس (Quote)** - اقتباسات مع المصدر
6. **قائمة (List)** - قوائم نقطية ورقمية
7. **فاصل (Divider)** - خطوط فاصلة بأنماط مختلفة

### 🎯 ميزات التحرير

- **السحب والإفلات** - إعادة ترتيب البلوكات بسهولة
- **أدوات تحكم لكل بلوك** - نقل، حذف، تكرار، إضافة
- **اختصارات لوحة المفاتيح**:
  - `Enter` - إنشاء بلوك جديد
  - `Backspace` في بداية بلوك فارغ - حذف البلوك
  - `/` في بداية بلوك - فتح قائمة البلوكات

### 🤖 تكامل الذكاء الاصطناعي

كل بلوك يحتوي على قائمة إجراءات AI:
- توليد محتوى
- تحسين النص
- توسيع المحتوى
- تلخيص
- إعادة صياغة
- ترجمة

## الاستخدام

```tsx
import BlockEditor from '@/components/BlockEditor/BlockEditor';
import { Block } from '@/components/BlockEditor/types';

function ArticleEditor() {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const handleAIAction = async (action: AIAction) => {
    // معالجة إجراءات الذكاء الاصطناعي
    const response = await fetch('/api/ai/editor', {
      method: 'POST',
      body: JSON.stringify(action)
    });
    // تحديث البلوك بالنتيجة
  };

  return (
    <BlockEditor
      blocks={blocks}
      onChange={setBlocks}
      onAIAction={handleAIAction}
      placeholder="ابدأ الكتابة أو اضغط / لإضافة بلوك..."
    />
  );
}
```

## هيكل البيانات

كل بلوك يتبع هذا الهيكل:

```typescript
interface Block {
  id: string;           // معرف فريد
  type: BlockType;      // نوع البلوك
  data: BlockData;      // بيانات البلوك حسب النوع
  order: number;        // ترتيب البلوك
}
```

مثال على البيانات:

```json
[
  {
    "id": "block_123",
    "type": "heading",
    "data": {
      "heading": {
        "text": "عنوان المقال",
        "level": 2,
        "alignment": "center"
      }
    },
    "order": 0
  },
  {
    "id": "block_124",
    "type": "paragraph",
    "data": {
      "paragraph": {
        "text": "محتوى الفقرة الأولى...",
        "alignment": "right"
      }
    },
    "order": 1
  }
]
```

## إضافة بلوك جديد

لإضافة نوع بلوك جديد:

1. أنشئ مكون البلوك في `components/BlockEditor/blocks/`
2. أضف النوع في `types.ts`
3. صدّر المكون من `blocks/index.ts`
4. أضف الحالة في `BlockItem.tsx`
5. أضف في قائمة `BlockMenu.tsx`

## التخصيص

يمكن تخصيص المحرر عبر:
- الألوان والأنماط عبر Tailwind classes
- إضافة بلوكات مخصصة
- تعديل إجراءات AI
- إضافة اختصارات لوحة مفاتيح

## المتطلبات

- React 18+
- Tailwind CSS
- @hello-pangea/dnd للسحب والإفلات
- lucide-react للأيقونات 