"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Angle, MuqtarabArticleForm } from "@/types/muqtarab";
import {
  ArrowLeft,
  Brain,
  Calendar,
  Clock,
  Edit3,
  Eye,
  Hash,
  Image as ImageIcon,
  Loader2,
  Save,
  Send,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// محرر المحتوى المتقدم مع Markdown وميزات احترافية
const AdvancedContentEditor = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) => {
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editorStats, setEditorStats] = useState({
    words: 0,
    characters: 0,
    paragraphs: 0,
    readingTime: 0,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // حساب الإحصائيات
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    const paragraphs = content.split("\n\n").filter((p) => p.trim()).length;
    const readingTime = Math.ceil(words / 200); // متوسط 200 كلمة في الدقيقة

    setEditorStats({ words, characters, paragraphs, readingTime });
  }, [content]);

  // وظائف التنسيق
  const insertFormatting = (
    before: string,
    after: string = "",
    placeholder: string = ""
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const text = selectedText || placeholder;

    const newContent =
      content.substring(0, start) +
      before +
      text +
      after +
      content.substring(end);

    onChange(newContent);

    // إعادة تحديد النص المدرج
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + text.length
      );
    }, 0);
  };

  const toolbarActions = [
    {
      id: "bold",
      icon: "B",
      title: "عريض",
      action: () => insertFormatting("**", "**", "نص عريض"),
      shortcut: "Ctrl+B",
    },
    {
      id: "italic",
      icon: "I",
      title: "مائل",
      action: () => insertFormatting("*", "*", "نص مائل"),
      shortcut: "Ctrl+I",
    },
    {
      id: "underline",
      icon: "U",
      title: "تسطير",
      action: () => insertFormatting("<u>", "</u>", "نص مسطر"),
      shortcut: "Ctrl+U",
    },
    {
      id: "strike",
      icon: "S",
      title: "يتوسطه خط",
      action: () => insertFormatting("~~", "~~", "نص محذوف"),
      shortcut: "Alt+S",
    },
    {
      id: "h1",
      icon: "H1",
      title: "عنوان رئيسي",
      action: () => insertFormatting("\n# ", "\n", "عنوان رئيسي"),
      shortcut: "Ctrl+1",
    },
    {
      id: "h2",
      icon: "H2",
      title: "عنوان فرعي",
      action: () => insertFormatting("\n## ", "\n", "عنوان فرعي"),
      shortcut: "Ctrl+2",
    },
    {
      id: "h3",
      icon: "H3",
      title: "عنوان صغير",
      action: () => insertFormatting("\n### ", "\n", "عنوان صغير"),
      shortcut: "Ctrl+3",
    },
    {
      id: "quote",
      icon: '"',
      title: "اقتباس",
      action: () => insertFormatting("\n> ", "\n", "نص الاقتباس"),
      shortcut: "Ctrl+Q",
    },
    {
      id: "ul",
      icon: "•",
      title: "قائمة نقطية",
      action: () => insertFormatting("\n- ", "\n", "عنصر القائمة"),
      shortcut: "Ctrl+L",
    },
    {
      id: "ol",
      icon: "1.",
      title: "قائمة مرقمة",
      action: () => insertFormatting("\n1. ", "\n", "عنصر مرقم"),
      shortcut: "Ctrl+Shift+L",
    },
    {
      id: "link",
      icon: "🔗",
      title: "رابط",
      action: () => insertFormatting("[", "](http://example.com)", "نص الرابط"),
      shortcut: "Ctrl+K",
    },
    {
      id: "code",
      icon: "<>",
      title: "كود",
      action: () => insertFormatting("`", "`", "كود"),
      shortcut: "Ctrl+E",
    },
    {
      id: "codeblock",
      icon: "{ }",
      title: "مجموعة كود",
      action: () => insertFormatting("\n```\n", "\n```\n", "كود متعدد الأسطر"),
      shortcut: "Ctrl+Shift+E",
    },
  ];

  // معاينة المحتوى المنسق
  const renderPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")
      .replace(/^- (.*$)/gm, "<li>$1</li>")
      .replace(/^1\. (.*$)/gm, "<li>$1</li>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, "<br>");
  };

  // اختصارات الكيبورد
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { ctrlKey, altKey, shiftKey, key } = e;

    if (ctrlKey) {
      switch (key) {
        case "b":
          e.preventDefault();
          insertFormatting("**", "**", "نص عريض");
          break;
        case "i":
          e.preventDefault();
          insertFormatting("*", "*", "نص مائل");
          break;
        case "u":
          e.preventDefault();
          insertFormatting("<u>", "</u>", "نص مسطر");
          break;
        case "q":
          e.preventDefault();
          insertFormatting("\n> ", "\n", "نص الاقتباس");
          break;
        case "k":
          e.preventDefault();
          insertFormatting("[", "](http://example.com)", "نص الرابط");
          break;
        case "e":
          e.preventDefault();
          if (shiftKey) {
            insertFormatting("\n```\n", "\n```\n", "كود متعدد الأسطر");
          } else {
            insertFormatting("`", "`", "كود");
          }
          break;
        case "1":
        case "2":
        case "3":
          e.preventDefault();
          const level = "#".repeat(parseInt(key));
          insertFormatting(`\n${level} `, "\n", `عنوان مستوى ${key}`);
          break;
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* شريط الأدوات المتقدم */}
      <div className="bg-white border rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-wrap">
              {toolbarActions.map((tool) => (
                <Button
                  key={tool.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs font-medium hover:bg-gray-100 transition-colors"
                  onClick={tool.action}
                  title={`${tool.title} (${tool.shortcut})`}
                >
                  {tool.icon}
                </Button>
              ))}
            </div>
            <div className="border-l h-6 mx-2"></div>
            <Button
              type="button"
              variant={showPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-8 px-3 text-xs"
            >
              {showPreview ? "📝 تحرير" : "👁️ معاينة"}
            </Button>
          </div>

          {/* إحصائيات المحرر */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{editorStats.words} كلمة</span>
            <span>{editorStats.characters} حرف</span>
            <span>{editorStats.paragraphs} فقرة</span>
            <span>{editorStats.readingTime} د قراءة</span>
          </div>
        </div>

        {/* منطقة التحرير */}
        <div className="border rounded-lg overflow-hidden">
          {showPreview ? (
            <div
              className="p-4 min-h-[400px] bg-gray-50 prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  renderPreview(content) ||
                  '<p class="text-gray-400">لا يوجد محتوى للمعاينة...</p>',
              }}
            />
          ) : (
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ابدأ الكتابة هنا... يمكنك استخدام Markdown للتنسيق أو الأزرار أعلاه

أمثلة على التنسيق:
**نص عريض** *نص مائل* ~~نص محذوف~~
# عنوان رئيسي
## عنوان فرعي
> اقتباس مهم
- عنصر في قائمة
1. عنصر مرقم
[رابط](http://example.com)
`كود مضمن`

```
مجموعة كود
متعددة الأسطر
```"
              className="min-h-[400px] border-0 focus:ring-0 resize-none bg-white"
            />
          )}
        </div>

        {/* نصائح سريعة */}
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          💡 <strong>نصائح:</strong> استخدم Ctrl+B للخط العريض، Ctrl+I للمائل،
          Ctrl+K للروابط، Ctrl+1/2/3 للعناوين
        </div>
      </div>
    </div>
  );
};

// مكون رفع الصور
const ImageUploader = ({
  onImageUpload,
  currentImage,
}: {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صحيح");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "article-cover");

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onImageUpload(data.imageUrl);
          toast.success("تم رفع الصورة بنجاح");
          if (data.fallback) {
            toast("✅ تم حفظ الصورة محلياً - تعمل بشكل طبيعي", {
              icon: "💾",
              duration: 4000,
            });
          }
        } else {
          toast.error(data.error || "فشل في رفع الصورة");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "فشل في رفع الصورة");
      }
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
      toast.error("حدث خطأ في رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {currentImage && (
        <div className="relative">
          <Image
            src={currentImage}
            alt="صورة الغلاف"
            width={400}
            height={200}
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onImageUpload("")}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>جاري رفع الصورة...</span>
          </div>
        ) : (
          <>
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                اسحب وأفلت صورة هنا أو انقر لاختيار صورة
              </p>
              <p className="text-xs text-gray-500">PNG، JPG، GIF حتى 5MB</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                };
                input.click();
              }}
            >
              <Upload className="w-4 h-4 ml-2" />
              اختيار صورة
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default function EditAngleArticlePage() {
  const router = useRouter();
  const params = useParams();
  const angleId = params?.angleId as string;
  const articleSlug = params?.slug as string;

  // حالات البيانات
  const [angle, setAngle] = useState<Angle | null>(null);
  const [angleLoading, setAngleLoading] = useState(true);
  const [articleLoading, setArticleLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [user, setUser] = useState<any>(null);

  // بيانات النموذج
  const [formData, setFormData] = useState<MuqtarabArticleForm>({
    angleId: angleId,
    title: "",
    excerpt: "",
    content: "",
    tags: [],
    readingTime: 1,
    authorId: "",
    sentiment: "neutral",
    coverImage: "",
    isPublished: false,
    publishDate: undefined,
  });

  const [newTag, setNewTag] = useState("");

  // جلب بيانات المستخدم والزاوية والمقال
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب بيانات المستخدم
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setFormData((prev) => ({
            ...prev,
            authorId: parsedUser.id,
          }));
        } else {
          // fallback: استخدام أول مستخدم من النظام
          try {
            const usersResponse = await fetch("/api/users");
            if (usersResponse.ok) {
              const usersData = await usersResponse.json();
              if (usersData.users && usersData.users.length > 0) {
                setFormData((prev) => ({
                  ...prev,
                  authorId: usersData.users[0].id,
                }));
              }
            }
          } catch (error) {
            console.error("خطأ في جلب المستخدمين:", error);
          }
        }

        // جلب بيانات الزاوية
        console.log("🔍 جاري جلب بيانات الزاوية:", angleId);
        const angleResponse = await fetch(`/api/muqtarab/angles/${angleId}`);
        if (angleResponse.ok) {
          const angleData = await angleResponse.json();
          console.log("✅ تم جلب بيانات الزاوية:", angleData);
          setAngle(angleData.angle);
        } else {
          const errorText = await angleResponse.text();
          console.error("❌ خطأ في استجابة الزاوية:", {
            status: angleResponse.status,
            statusText: angleResponse.statusText,
            error: errorText,
          });
          toast.error(`الزاوية غير موجودة (${angleResponse.status})`);
          router.push("/admin/muqtarab");
          return;
        }

        // جلب بيانات المقال
        console.log("🔍 جاري جلب بيانات المقال:", articleSlug);
        const articleResponse = await fetch(
          `/api/muqtarab/articles/${articleSlug}`
        );

        if (articleResponse.ok) {
          const articleData = await articleResponse.json();
          console.log("✅ تم جلب بيانات المقال:", articleData);

          if (articleData.success && articleData.article) {
            const article = articleData.article;
            setFormData({
              angleId: angleId,
              title: article.title || "",
              excerpt: article.excerpt || "",
              content: article.content || "",
              tags: article.tags || [],
              readingTime: article.readingTime || 1,
              authorId: article.authorId || "",
              sentiment: article.sentiment || "neutral",
              coverImage: article.coverImage || "",
              isPublished: article.isPublished || false,
              publishDate: article.publishDate || null,
            });
          } else {
            console.error("❌ فشل في جلب بيانات المقال:", articleData);
            toast.error("فشل في جلب بيانات المقال");
            router.push(`/admin/muqtarab/angles/${angleId}`);
            return;
          }
        } else {
          const errorText = await articleResponse.text();
          console.error("❌ خطأ في استجابة المقال:", {
            status: articleResponse.status,
            statusText: articleResponse.statusText,
            error: errorText,
          });
          toast.error(`المقال غير موجود (${articleResponse.status})`);
          router.push(`/admin/muqtarab/angles/${angleId}`);
          return;
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        toast.error("حدث خطأ في تحميل البيانات");
      } finally {
        setAngleLoading(false);
        setArticleLoading(false);
      }
    };

    fetchData();
  }, [angleId, articleSlug, router]);

  // حساب وقت القراءة تلقائياً
  useEffect(() => {
    const wordCount = formData.content
      .split(" ")
      .filter((word) => word.trim()).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 كلمة في الدقيقة
    setFormData((prev) => ({ ...prev, readingTime }));
  }, [formData.content]);

  // تحليل اتجاه المقال بالذكاء الاصطناعي
  const handleSentimentAnalysis = async () => {
    if (!formData.content.trim()) {
      toast.error("يرجى كتابة محتوى المقال أولاً");
      return;
    }

    try {
      setAnalyzing(true);
      const response = await fetch("/api/ai/sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: formData.content,
          title: formData.title,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, sentiment: data.sentiment }));
        toast.success(
          `تم تحليل الاتجاه: ${
            data.sentiment === "positive"
              ? "إيجابي"
              : data.sentiment === "critical"
              ? "نقدي"
              : "محايد"
          }`
        );
      } else {
        toast.error("فشل في تحليل الاتجاه");
      }
    } catch (error) {
      console.error("خطأ في تحليل الاتجاه:", error);
      toast.error("حدث خطأ في تحليل الاتجاه");
    } finally {
      setAnalyzing(false);
    }
  };

  // رفع صورة الغلاف
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صحيح");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("type", "article-cover");

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFormData((prev) => ({ ...prev, coverImage: data.imageUrl }));
          toast.success("تم رفع الصورة بنجاح");
          if (data.fallback) {
            toast("✅ تم حفظ الصورة محلياً - تعمل بشكل طبيعي", {
              icon: "💾",
              duration: 4000,
            });
          }
        } else {
          toast.error(data.error || "فشل في رفع الصورة");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "فشل في رفع الصورة");
      }
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
      toast.error("حدث خطأ في رفع الصورة");
    }
  };

  // إضافة كلمة مفتاحية
  const handleAddTag = () => {
    if (newTag.trim() && !(formData.tags || []).includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  // إزالة كلمة مفتاحية
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  // حفظ التعديلات
  const handleSubmit = async (publish: boolean = false) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("يرجى ملء العنوان والمحتوى");
      return;
    }

    if (!formData.authorId) {
      toast.error("خطأ في تحديد المؤلف، يرجى تسجيل الدخول مرة أخرى");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        isPublished: publish,
        publishDate: publish ? new Date().toISOString() : null,
      };

      console.log("📤 إرسال تعديلات المقال:", payload);

      const response = await fetch(`/api/muqtarab/articles/${articleSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📡 استجابة تحديث المقال:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ تم تحديث المقال بنجاح:", data);

        toast.success(
          publish ? "تم نشر المقال بنجاح!" : "تم حفظ التعديلات بنجاح!"
        );

        // العودة إلى صفحة الزاوية
        router.push(`/admin/muqtarab/angles/${angleId}`);
      } else {
        const errorData = await response.json();
        console.error("❌ خطأ في تحديث المقال:", errorData);
        toast.error(errorData.error || "حدث خطأ في حفظ التعديلات");
      }
    } catch (error) {
      console.error("خطأ في حفظ التعديلات:", error);
      toast.error("حدث خطأ في حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  if (angleLoading || articleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/admin/muqtarab/angles/${angleId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة
              </Button>
              <div>
                <h1 className="text-2xl font-bold">تعديل المقال</h1>
                <p className="text-gray-600">
                  تعديل مقال في زاوية{" "}
                  <span className="font-medium">{angle?.title}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                حفظ التعديلات
              </Button>
              <Button
                onClick={() => handleSubmit(true)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                نشر التحديث
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-2 space-y-6">
            {/* العنوان */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  عنوان المقال
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="اكتب عنوان المقال..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="text-lg"
                />
              </CardContent>
            </Card>

            {/* المقدمة */}
            <Card>
              <CardHeader>
                <CardTitle>المقدمة (اختيارية)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="اكتب مقدمة مختصرة للمقال..."
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* المحتوى */}
            <Card>
              <CardHeader>
                <CardTitle>محتوى المقال</CardTitle>
              </CardHeader>
              <CardContent>
                <AdvancedContentEditor
                  content={formData.content}
                  onChange={(content) =>
                    setFormData((prev) => ({ ...prev, content }))
                  }
                />
              </CardContent>
            </Card>

            {/* صورة الغلاف */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  صورة الغلاف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  onImageUpload={(imageUrl) =>
                    setFormData((prev) => ({ ...prev, coverImage: imageUrl }))
                  }
                  currentImage={formData.coverImage}
                />
              </CardContent>
            </Card>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* تفاصيل النشر */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  تفاصيل النشر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published">نشر المقال</Label>
                  <Switch
                    id="published"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isPublished: checked }))
                    }
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  وقت القراءة: {formData.readingTime} دقيقة
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  المؤلف: {user?.name || "غير محدد"}
                </div>
              </CardContent>
            </Card>

            {/* الكلمات المفتاحية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  الكلمات المفتاحية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="أضف كلمة مفتاحية"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button onClick={handleAddTag} size="sm">
                    إضافة
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* تحليل الاتجاه */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  تحليل الاتجاه
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleSentimentAnalysis}
                  disabled={analyzing || !formData.content.trim()}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {analyzing ? "جاري التحليل..." : "تحليل بالذكاء الاصطناعي"}
                </Button>

                <div className="text-center">
                  <Label>الاتجاه الحالي:</Label>
                  <Badge
                    className="mt-2 block w-fit mx-auto"
                    variant={
                      formData.sentiment === "positive"
                        ? "default"
                        : formData.sentiment === "critical"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {formData.sentiment === "positive"
                      ? "إيجابي"
                      : formData.sentiment === "critical"
                      ? "نقدي"
                      : "محايد"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* معاينة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  معاينة سريعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>العنوان:</strong> {formData.title || "بدون عنوان"}
                  </div>
                  <div>
                    <strong>الكلمات:</strong>{" "}
                    {formData.content.split(" ").filter((w) => w.trim()).length}
                  </div>
                  <div>
                    <strong>الكلمات المفتاحية:</strong>{" "}
                    {(formData.tags || []).length}
                  </div>
                  <div>
                    <strong>الحالة:</strong>{" "}
                    {formData.isPublished ? "منشور" : "مسودة"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
