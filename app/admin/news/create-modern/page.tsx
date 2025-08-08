"use client";

import { DesignComponents } from "@/components/design-system/DesignSystemGuide";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FeaturedImageUpload from "@/components/FeaturedImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CheckSquare,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Save,
  Send,
  Sparkles,
  Star,
  Tag,
  User,
  Wand2,
  X,
  Zap,
  ArrowLeft,
} from "lucide-react";

const Editor = dynamic(() => import("@/components/Editor/Editor"), { ssr: false });

interface Category { id: string; name: string; name_ar?: string; slug: string; color?: string }
interface Reporter { id: string; name: string; email?: string; avatar?: string | null; title?: string; slug?: string }

export default function ModernCreateNewsPage() {
  const editorRef = useRef<any>(null);
  const [darkMode, setDarkMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error" | null; text: string }>({ type: null, text: "" });
  const [completionScore, setCompletionScore] = useState(0);
  const [isAILoading, setIsAILoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    excerpt: "",
    content: "",
    authorId: "",
    categoryId: "",
    type: "local" as "local" | "external",
    featuredImage: "",
    featuredImageCaption: "",
    gallery: [] as string[],
    externalLink: "",
    keywords: [] as string[],
    seoTitle: "",
    seoDescription: "",
    publishType: "now" as "now" | "scheduled",
    scheduledDate: "",
    isBreaking: false,
    isFeatured: false,
    status: "draft" as "draft" | "published",
  });

  const calculateCompletion = useCallback(() => {
    let score = 0;
    const checks = [
      { field: formData.title, weight: 20 },
      { field: formData.excerpt, weight: 15 },
      { field: formData.content, weight: 25 },
      { field: formData.authorId, weight: 10 },
      { field: formData.categoryId, weight: 10 },
      { field: formData.featuredImage, weight: 10 },
      { field: formData.keywords.length > 0, weight: 5 },
      { field: formData.seoTitle, weight: 5 },
    ];
    checks.forEach((c) => { if (c.field) score += c.weight; });
    setCompletionScore(Math.min(score, 100));
  }, [formData]);

  useEffect(() => { calculateCompletion(); }, [calculateCompletion]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cats, reps] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/admin/article-authors?active_only=true"),
        ]);
        if (cats.ok) {
          const j = await cats.json();
          setCategories(j.categories || j || []);
        }
        if (reps.ok) {
          const j = await reps.json();
          const authors = j?.authors || [];
          setReporters(authors.map((a: any) => ({ id: a.id, name: a.full_name || a.name, title: a.title })));
        }
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setFormData((p) => ({ ...p, content: newContent }));
  }, []);

  const handleSave = async (status: "draft" | "published") => {
    try {
      setSaving(true);
      let editorContent = "";
      if (editorRef.current?.getHTML) editorContent = editorRef.current.getHTML() || "";
      if (!editorContent && formData.content) editorContent = `<p>${formData.content}</p>`;
      if (!formData.title?.trim() || !editorContent.replace(/<[^>]*>/g, "").trim()) {
        toast.error("يرجى إدخال العنوان والمحتوى");
        setSaving(false);
        return;
      }
      const payload = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: editorContent,
        featured_image: formData.featuredImage || null,
        category_id: formData.categoryId,
        author_id: formData.authorId,
        status,
        featured: formData.isFeatured,
        breaking: formData.isBreaking,
        seo_title: formData.seoTitle || null,
        seo_description: formData.seoDescription || null,
        seo_keywords: formData.keywords.length ? formData.keywords.join(", ") : null,
        metadata: {
          subtitle: formData.subtitle || null,
          type: formData.type,
          image_caption: formData.featuredImageCaption || null,
          keywords: formData.keywords,
          gallery: formData.gallery || [],
          external_link: formData.externalLink || null,
        },
        ...(status === "published" && formData.publishType === "scheduled" && formData.scheduledDate
          ? { scheduled_for: formData.scheduledDate }
          : {}),
      };
      const res = await fetch("/api/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json())?.error || "فشل في الحفظ");
      setMessage({ type: "success", text: status === "draft" ? "💾 تم حفظ المسودة" : "🎉 تم نشر الخبر" });
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message || "فشل في الحفظ" });
      toast.error(e?.message || "فشل في الحفظ");
    } finally { setSaving(false); }
  };

  const suggestWithAI = async (field: "title" | "excerpt" | "keywords") => {
    try {
      setIsAILoading(true);
      let endpoint = "/api/ai/editor"; let body: any = {};
      if (field === "title") body = { service: "generate_title", content: formData.content || formData.excerpt };
      if (field === "excerpt") body = { service: "summarize", content: formData.content || "", context: { targetLength: "100-140" } };
      if (field === "keywords") { endpoint = "/api/ai/keywords"; body = { title: formData.title, content: formData.content, excerpt: formData.excerpt }; }
      const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (field === "keywords" && Array.isArray(j.keywords)) {
        setFormData((p) => ({ ...p, keywords: Array.from(new Set([...(p.keywords || []), ...j.keywords])).slice(0, 12) }));
        toast.success("تمت إضافة كلمات مفتاحية");
      } else if (j.result) {
        setFormData((p) => ({ ...p, [field]: j.result } as any));
        toast.success("تم التوليد");
      } else { toast.error("لم يتم توليد محتوى"); }
    } catch (e) { toast.error("خطأ في الذكاء الاصطناعي"); } finally { setIsAILoading(false); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <DesignComponents.SectionHeader
        title="إنشاء خبر (تصميم حديث)"
        description="تجربة تصميم حديثة لإنشاء الخبر"
        action={
          <div className="flex items-center gap-3">
            <Link href="/admin/news/unified" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-4 h-4" /> العودة للتصميم الحالي
            </Link>
            <div className="w-40">
              <Progress value={completionScore} className={cn("h-2", completionScore >= 60 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-orange-500")} />
              <p className={cn("text-xs mt-1", completionScore >= 60 ? "text-emerald-600" : "text-orange-600")}>{completionScore}% مكتمل</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ مسودة
            </Button>
            <Button size="sm" onClick={() => handleSave("published")} disabled={saving || loading}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} نشر
            </Button>
          </div>
        }
      />

      {message.type && (
        <Alert className={cn("shadow", message.type === "success" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50") }>
          {message.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <AlertDescription className="text-sm">{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="basic">أساسي</TabsTrigger>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
          <TabsTrigger value="media">الوسائط</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="publish">النشر</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card className="border-0 shadow">
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="title" className="mb-2">العنوان الرئيسي *</Label>
                <div className="flex items-center gap-2">
                  <Input id="title" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} placeholder="أدخل عنوان الخبر..." />
                  <Button size="sm" variant="ghost" onClick={() => suggestWithAI("title")} disabled={isAILoading}><Sparkles className="w-4 h-4" /> اقتراح</Button>
                </div>
              </div>
              <div>
                <Label htmlFor="subtitle" className="mb-2">العنوان الفرعي</Label>
                <Input id="subtitle" value={formData.subtitle} onChange={(e) => setFormData((p) => ({ ...p, subtitle: e.target.value }))} placeholder="عنوان فرعي اختياري" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reporter" className="mb-2">المراسل *</Label>
                  <select id="reporter" value={formData.authorId} onChange={(e) => setFormData((p) => ({ ...p, authorId: e.target.value }))} className="w-full p-2 border rounded-lg">
                    <option value="">اختر المراسل</option>
                    {reporters.map((r) => (<option key={r.id} value={r.id}>{r.name}{r.title ? ` - ${r.title}` : ""}</option>))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="category" className="mb-2">التصنيف *</Label>
                  <select id="category" value={formData.categoryId} onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))} className="w-full p-2 border rounded-lg">
                    <option value="">اختر التصنيف</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name_ar || c.name}</option>))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card className="border-0 shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> محتوى الخبر *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-0 bg-purple-50"><Sparkles className="w-4 h-4" /><AlertDescription>💡 اكتب 50+ حرف ثم استخدم الذكاء الاصطناعي للمساعدة</AlertDescription></Alert>
              <div className="min-h-[400px] rounded-lg bg-slate-50">
                <Editor ref={editorRef} content={formData.content} onChange={handleContentChange} placeholder="اكتب محتوى الخبر هنا..." />
              </div>
              <div className="flex items-center justify-end">
                <Button onClick={() => suggestWithAI("excerpt")} disabled={isAILoading}><Wand2 className="w-4 h-4" /> توليد موجز</Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow">
            <CardHeader><CardTitle>موجز الخبر *</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={formData.excerpt} onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))} rows={3} placeholder="اكتب موجزاً مختصراً" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card className="border-0 shadow">
            <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> الصورة المميزة</CardTitle></CardHeader>
            <CardContent>
              <FeaturedImageUpload value={formData.featuredImage} onChange={(url) => setFormData((p) => ({ ...p, featuredImage: url }))} darkMode={darkMode} />
            </CardContent>
          </Card>
          <Card className="border-0 shadow">
            <CardHeader><CardTitle>إعدادات إضافية</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 p-3 border rounded-lg">
                <input type="checkbox" checked={formData.isBreaking} onChange={(e) => setFormData((p) => ({ ...p, isBreaking: e.target.checked }))} />
                <Zap className="w-4 h-4 text-red-600" /> عاجل
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg">
                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData((p) => ({ ...p, isFeatured: e.target.checked }))} />
                <Star className="w-4 h-4 text-yellow-600" /> مميز
              </label>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card className="border-0 shadow">
            <CardHeader><CardTitle>الكلمات المفتاحية</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="أضف كلمة مفتاحية" onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const target = e.target as HTMLInputElement;
                    const kw = target.value.trim();
                    if (kw && !formData.keywords.includes(kw)) {
                      setFormData((p) => ({ ...p, keywords: [...p.keywords, kw] }));
                      target.value = "";
                    }
                  }
                }} />
                <Button variant="outline" size="sm" onClick={() => suggestWithAI("keywords")}><Sparkles className="w-4 h-4" /> اقتراح</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((k, i) => (
                  <Badge key={`${k}-${i}`} variant="secondary" className="gap-1">
                    {k}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setFormData((p) => ({ ...p, keywords: p.keywords.filter((_, idx) => idx !== i) }))} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow">
            <CardHeader><CardTitle>بيانات SEO</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seoTitle" className="mb-2">عنوان SEO</Label>
                <Input id="seoTitle" value={formData.seoTitle} onChange={(e) => setFormData((p) => ({ ...p, seoTitle: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="seoDesc" className="mb-2">وصف SEO</Label>
                <Input id="seoDesc" value={formData.seoDescription} onChange={(e) => setFormData((p) => ({ ...p, seoDescription: e.target.value }))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publish" className="space-y-6">
          <Card className="border-0 shadow">
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-4 h-4" /> طريقة النشر</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 p-3 border rounded-lg">
                <input type="radio" name="publish-type" checked={formData.publishType === "now"} onChange={() => setFormData((p) => ({ ...p, publishType: "now" }))} />
                نشر فوري
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg">
                <input type="radio" name="publish-type" checked={formData.publishType === "scheduled"} onChange={() => setFormData((p) => ({ ...p, publishType: "scheduled" }))} />
                نشر مجدول
              </label>
              {formData.publishType === "scheduled" && (
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="scheduledDate" className="mb-2">التاريخ والوقت</Label>
                    <Input id="scheduledDate" type="datetime-local" value={formData.scheduledDate} onChange={(e) => setFormData((p) => ({ ...p, scheduledDate: e.target.value }))} min={new Date().toISOString().slice(0,16)} />
                  </div>
                  <div className="text-xs text-blue-600 self-end">
                    {formData.scheduledDate && (
                      <>سيتم النشر في: {new Date(formData.scheduledDate).toLocaleString("ar-SA")}</>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="lg" onClick={() => handleSave("draft")} disabled={saving}>{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} حفظ مسودة</Button>
            <Button size="lg" onClick={() => handleSave("published")} disabled={saving || loading}>{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} نشر الآن</Button>
          </div>
        </TabsContent>
      </Tabs>

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </div>
  );
}


