/**
 * صفحة إضافة/تعديل الأخبار الموحدة - النسخة الحديثة
 * Unified Add/Edit News Page - Modern Version
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/admin/modern-dashboard/DashboardLayout";
import {
  ArrowLeft,
  Save,
  Send,
  Clock,
  Eye,
  AlertCircle,
  X,
  Plus,
  Image as ImageIcon,
  Type,
  FileText,
  Hash,
  Globe,
  Sparkles,
  Loader2,
  Calendar
} from "lucide-react";
import { toast } from "react-hot-toast";

interface FormData {
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  smart_summary: string;
  keywords: string[];
  seo_title: string;
  seo_description: string;
  category_id: string;
  featured_image: string;
  status: "draft" | "published" | "scheduled";
  breaking: boolean;
  scheduled_for?: string;
  publish_type?: "instant" | "scheduled";
}

export default function ModernNewsUnifiedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");
  const isEditMode = !!articleId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    subtitle: "",
    content: "",
    excerpt: "",
    smart_summary: "",
    keywords: [],
    seo_title: "",
    seo_description: "",
    category_id: "",
    featured_image: "",
    status: "draft",
    breaking: false,
    publish_type: "instant"
  });

  const [newKeyword, setNewKeyword] = useState("");

  // تحميل البيانات
  useEffect(() => {
    loadCategories();
    if (isEditMode) {
      loadArticleData();
    }
  }, [articleId]);

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories", { credentials: "include" });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadArticleData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        credentials: "include",
      });
      const { article } = await response.json();
      
      setFormData({
        title: article.title || "",
        subtitle: article.subtitle || "",
        content: article.content || "",
        excerpt: article.excerpt || "",
        smart_summary: article.smart_summary || "",
        keywords: article.keywords || [],
        seo_title: article.seo_title || "",
        seo_description: article.seo_description || "",
        category_id: article.category_id || "",
        featured_image: article.featured_image || "",
        status: article.status || "draft",
        breaking: article.breaking || false,
        scheduled_for: article.scheduled_for,
        publish_type: article.scheduled_for ? "scheduled" : "instant"
      });
    } catch (error) {
      console.error("Error loading article:", error);
      toast.error("فشل تحميل بيانات المقال");
    } finally {
      setLoading(false);
    }
  };

  // حفظ المقال
  const handleSave = async (publishStatus: "draft" | "published" | "scheduled") => {
    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        status: publishStatus,
        scheduled_for: formData.publish_type === "scheduled" ? formData.scheduled_for : undefined
      };

      const url = isEditMode ? `/api/articles/${articleId}` : "/api/articles";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("فشل حفظ المقال");

      toast.success(
        publishStatus === "published" 
          ? "تم نشر المقال بنجاح" 
          : publishStatus === "scheduled"
          ? "تم جدولة المقال بنجاح"
          : "تم حفظ المسودة بنجاح"
      );
      
      router.push("/admin/news");
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  // توليد محتوى بالذكاء الاصطناعي
  const generateAIContent = async () => {
    if (!formData.title || !formData.content) {
      toast.error("يرجى إدخال العنوان والمحتوى أولاً");
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      });

      if (!response.ok) throw new Error("فشل توليد المحتوى");

      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        subtitle: data.subtitle || prev.subtitle,
        excerpt: data.excerpt || prev.excerpt,
        smart_summary: data.smart_summary || prev.smart_summary,
        keywords: data.keywords || prev.keywords,
        seo_title: data.seo_title || prev.seo_title,
        seo_description: data.seo_description || prev.seo_description,
      }));

      toast.success("تم توليد المحتوى بنجاح");
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast.error("فشل توليد المحتوى بالذكاء الاصطناعي");
    } finally {
      setAiGenerating(false);
    }
  };

  // إضافة كلمة مفتاحية
  const addKeyword = () => {
    if (newKeyword && !formData.keywords.includes(newKeyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword]
      }));
      setNewKeyword("");
    }
  };

  // حذف كلمة مفتاحية
  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="تحميل...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      pageTitle={isEditMode ? "تعديل الخبر" : "إضافة خبر جديد"}
      pageDescription={isEditMode ? "تعديل محتوى الخبر وإعداداته" : "إنشاء خبر جديد ونشره"}
    >
      <div className="news-form-container">
        {/* زر العودة */}
        <div className="mb-4">
          <Link href="/admin/news" className="btn btn-sm">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للأخبار
          </Link>
        </div>

        {/* النموذج */}
        <div className="space-y-4">
          {/* العنوان الرئيسي */}
          <div className="card">
            <div className="card-header">
              <Type className="w-5 h-5 text-accent" />
              <h3 className="card-title">العنوان الرئيسي</h3>
            </div>
            <div className="card-content">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
                placeholder="أدخل العنوان الرئيسي للخبر"
              />
            </div>
          </div>

          {/* العنوان الفرعي */}
          <div className="card">
            <div className="card-header">
              <Type className="w-4 h-4 text-muted" />
              <h3 className="card-title">العنوان الفرعي</h3>
            </div>
            <div className="card-content">
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="form-input"
                placeholder="أدخل العنوان الفرعي (اختياري)"
              />
            </div>
          </div>

          {/* المحتوى */}
          <div className="card">
            <div className="card-header">
              <FileText className="w-5 h-5 text-accent" />
              <h3 className="card-title">محتوى الخبر</h3>
            </div>
            <div className="card-content">
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="form-textarea"
                rows={10}
                placeholder="اكتب محتوى الخبر هنا..."
              />
            </div>
          </div>

          {/* التصنيف والصورة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* التصنيف */}
            <div className="card">
              <div className="card-header">
                <Folder className="w-5 h-5 text-accent" />
                <h3 className="card-title">التصنيف</h3>
              </div>
              <div className="card-content">
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="form-select"
                >
                  <option value="">اختر التصنيف</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* الصورة المميزة */}
            <div className="card">
              <div className="card-header">
                <ImageIcon className="w-5 h-5 text-accent" />
                <h3 className="card-title">الصورة المميزة</h3>
              </div>
              <div className="card-content">
                <input
                  type="url"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  className="form-input"
                  placeholder="رابط الصورة"
                />
                {formData.featured_image && (
                  <img
                    src={formData.featured_image}
                    alt="معاينة"
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>

          {/* توليد بالذكاء الاصطناعي */}
          <div className="card">
            <div className="card-header">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="card-title">محتوى ذكي</h3>
              <button
                onClick={generateAIContent}
                disabled={aiGenerating || !formData.title || !formData.content}
                className="btn btn-sm btn-primary mr-auto"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 ml-2" />
                    توليد تلقائي
                  </>
                )}
              </button>
            </div>
            <div className="card-content space-y-3">
              {/* المقتطف */}
              <div>
                <label className="form-label">المقتطف</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="form-textarea"
                  rows={2}
                  placeholder="مقتطف قصير من المقال"
                />
              </div>

              {/* الملخص الذكي */}
              <div>
                <label className="form-label">الملخص الذكي</label>
                <textarea
                  value={formData.smart_summary}
                  onChange={(e) => setFormData({ ...formData, smart_summary: e.target.value })}
                  className="form-textarea"
                  rows={2}
                  placeholder="ملخص ذكي للمقال"
                />
              </div>

              {/* الكلمات المفتاحية */}
              <div>
                <label className="form-label">الكلمات المفتاحية</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                    className="form-input flex-1"
                    placeholder="أضف كلمة مفتاحية"
                  />
                  <button
                    onClick={addKeyword}
                    className="btn btn-sm btn-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-accent-hover"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="card">
            <div className="card-header">
              <Globe className="w-5 h-5 text-accent" />
              <h3 className="card-title">تحسين محركات البحث (SEO)</h3>
            </div>
            <div className="card-content space-y-3">
              <div>
                <label className="form-label">عنوان SEO</label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  className="form-input"
                  placeholder="العنوان الذي سيظهر في محركات البحث"
                />
              </div>
              <div>
                <label className="form-label">وصف SEO</label>
                <textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  className="form-textarea"
                  rows={2}
                  placeholder="الوصف الذي سيظهر في محركات البحث"
                />
              </div>
            </div>
          </div>

          {/* خيارات النشر */}
          <div className="card">
            <div className="card-header">
              <Calendar className="w-5 h-5 text-accent" />
              <h3 className="card-title">خيارات النشر</h3>
            </div>
            <div className="card-content space-y-3">
              {/* نوع النشر */}
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="instant"
                    checked={formData.publish_type === "instant"}
                    onChange={(e) => setFormData({ ...formData, publish_type: "instant" as any })}
                  />
                  <span>نشر فوري</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="scheduled"
                    checked={formData.publish_type === "scheduled"}
                    onChange={(e) => setFormData({ ...formData, publish_type: "scheduled" as any })}
                  />
                  <span>نشر مجدول</span>
                </label>
              </div>

              {/* تاريخ النشر المجدول */}
              {formData.publish_type === "scheduled" && (
                <div>
                  <label className="form-label">تاريخ ووقت النشر</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_for || ""}
                    onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                    className="form-input"
                  />
                </div>
              )}

              {/* خبر عاجل */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.breaking}
                  onChange={(e) => setFormData({ ...formData, breaking: e.target.checked })}
                  className="form-checkbox"
                />
                <span>خبر عاجل</span>
              </label>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="form-actions">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="btn btn-secondary"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                حفظ كمسودة
              </>
            )}
          </button>
          
          <button
            onClick={() => handleSave(formData.publish_type === "scheduled" ? "scheduled" : "published")}
            disabled={saving || !formData.title || !formData.content || !formData.category_id}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                جاري النشر...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 ml-2" />
                {formData.publish_type === "scheduled" ? "جدولة النشر" : "نشر الآن"}
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
