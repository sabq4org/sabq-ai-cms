"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Loader2
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
  thumbnail_url: string;
  status: "draft" | "published" | "scheduled";
  breaking: boolean;
  scheduled_at?: string;
}

export default function MobileNewsCreatePage() {
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
    thumbnail_url: "",
    status: "draft",
    breaking: false,
  });

  const [newKeyword, setNewKeyword] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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
        thumbnail_url: article.thumbnail_url || "",
        status: article.status || "draft",
        breaking: article.breaking || false,
        scheduled_at: article.scheduled_at,
      });
    } catch (error) {
      toast.error("حدث خطأ في تحميل بيانات الخبر");
      console.error("Error loading article:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.content.trim()) {
      toast.error("يرجى كتابة محتوى الخبر أولاً");
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch("/api/ai/smart-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: formData.content }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          title: data.data.title || prev.title,
          subtitle: data.data.subtitle || prev.subtitle,
          excerpt: data.data.smart_summary?.slice(0, 160) || prev.excerpt,
          smart_summary: data.data.smart_summary || prev.smart_summary,
          keywords: data.data.keywords || prev.keywords,
          seo_title: data.data.seo_title || prev.seo_title,
          seo_description: data.data.seo_description || prev.seo_description,
        }));
        toast.success("تم توليد المحتوى بنجاح");
      }
    } catch (error) {
      toast.error("حدث خطأ في توليد المحتوى");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      const endpoint = isEditMode
        ? `/api/articles/${articleId}`
        : "/api/articles";
      
      const method = isEditMode ? "PATCH" : "POST";
      
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: publish ? "published" : formData.status,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(publish ? "تم نشر الخبر بنجاح" : "تم حفظ الخبر بنجاح");
        router.push("/admin-mobile/news");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("حدث خطأ في حفظ الخبر");
      console.error("Error saving article:", error);
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={{ padding: "16px" }}>
            <h2 className="heading-2" style={{ marginBottom: "20px" }}>المعلومات الأساسية</h2>
            
            {/* العنوان الرئيسي */}
            <div style={{ marginBottom: "20px" }}>
              <label className="label" style={{ marginBottom: "8px", display: "block" }}>
                <Type size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                العنوان الرئيسي
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input"
                style={{ width: "100%", fontSize: "16px" }}
                placeholder="أدخل عنوان الخبر الرئيسي..."
              />
            </div>

            {/* العنوان الفرعي */}
            <div style={{ marginBottom: "20px" }}>
              <label className="label" style={{ marginBottom: "8px", display: "block" }}>
                <Type size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                العنوان الفرعي (اختياري)
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="input"
                style={{ width: "100%", fontSize: "16px" }}
                placeholder="أدخل عنوان فرعي إن وجد..."
              />
            </div>

            {/* التصنيف */}
            <div style={{ marginBottom: "20px" }}>
              <label className="label" style={{ marginBottom: "8px", display: "block" }}>
                <Hash size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                التصنيف
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="input"
                style={{ width: "100%", fontSize: "16px" }}
              >
                <option value="">اختر التصنيف</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* الصورة المميزة */}
            <div style={{ marginBottom: "20px" }}>
              <label className="label" style={{ marginBottom: "8px", display: "block" }}>
                <ImageIcon size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                الصورة المميزة
              </label>
              <div className="card" style={{
                padding: "20px",
                textAlign: "center",
                border: "2px dashed hsl(var(--line))",
                background: "hsl(var(--muted) / 0.05)"
              }}>
                {formData.thumbnail_url ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={formData.thumbnail_url}
                      alt="صورة مميزة"
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "cover",
                        borderRadius: "8px"
                      }}
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: "" }))}
                      className="btn btn-sm"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "hsl(var(--danger))",
                        color: "white",
                        padding: "4px 8px"
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={48} style={{ color: "hsl(var(--muted))", marginBottom: "12px" }} />
                    <p className="text-muted" style={{ marginBottom: "12px" }}>اسحب صورة هنا أو انقر للاختيار</p>
                    <input
                      type="text"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                      className="input"
                      style={{ fontSize: "14px" }}
                      placeholder="أو الصق رابط الصورة هنا..."
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ padding: "16px" }}>
            <h2 className="heading-2" style={{ marginBottom: "20px" }}>محتوى الخبر</h2>
            
            {/* محتوى الخبر */}
            <div style={{ marginBottom: "20px" }}>
              <label className="label" style={{ marginBottom: "8px", display: "block" }}>
                <FileText size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                نص الخبر
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="input"
                style={{
                  width: "100%",
                  minHeight: "300px",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  resize: "vertical"
                }}
                placeholder="اكتب محتوى الخبر هنا..."
              />
              <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="text-xs text-muted">
                  {formData.content.length} حرف
                </span>
                <button
                  onClick={handleAiGenerate}
                  disabled={aiGenerating || !formData.content.trim()}
                  className="btn btn-sm"
                  style={{
                    background: "hsl(var(--accent))",
                    color: "white",
                    opacity: aiGenerating || !formData.content.trim() ? 0.5 : 1
                  }}
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      توليد تلقائي
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* الموجز الذكي */}
            <div style={{ marginBottom: "20px" }}>
              <label className="label" style={{ marginBottom: "8px", display: "block" }}>
                <Sparkles size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                الموجز الذكي
              </label>
              <textarea
                value={formData.smart_summary}
                onChange={(e) => setFormData(prev => ({ ...prev, smart_summary: e.target.value }))}
                className="input"
                style={{
                  width: "100%",
                  minHeight: "100px",
                  fontSize: "14px",
                  resize: "vertical"
                }}
                placeholder="موجز ذكي للخبر..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ padding: "16px" }}>
            <h2 className="heading-2" style={{ marginBottom: "20px" }}>تحسين محركات البحث</h2>
            
            {/* الكلمات المفتاحية */}
            <div style={{ marginBottom: "20px" }}>
              <label className="label" style={{ marginBottom: "8px", display: "block" }}>
                <Hash size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                الكلمات المفتاحية
              </label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                  className="input"
                  style={{ flex: 1, fontSize: "14px" }}
                  placeholder="أضف كلمة مفتاحية..."
                />
                <button
                  onClick={addKeyword}
                  className="btn"
                  style={{ background: "hsl(var(--accent))", color: "white" }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="chip"
                    style={{
                      background: "hsl(var(--accent) / 0.1)",
                      color: "hsl(var(--accent))",
                      border: "1px solid hsl(var(--accent) / 0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "0",
                        cursor: "pointer",
                        color: "inherit"
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* عنوان SEO */}
            <div style={{ marginBottom: "20px" }}>
              <label className="label" style={{ marginBottom: "8px", display: "block" }}>
                <Globe size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                عنوان SEO
              </label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                className="input"
                style={{ width: "100%", fontSize: "14px" }}
                placeholder="عنوان محسّن لمحركات البحث..."
              />
            </div>

            {/* وصف SEO */}
            <div style={{ marginBottom: "20px" }}>
              <label className="label" style={{ marginBottom: "8px", display: "block" }}>
                <Globe size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                وصف SEO
              </label>
              <textarea
                value={formData.seo_description}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                className="input"
                style={{
                  width: "100%",
                  minHeight: "80px",
                  fontSize: "14px",
                  resize: "vertical"
                }}
                placeholder="وصف محسّن لمحركات البحث..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div style={{ padding: "16px" }}>
            <h2 className="heading-2" style={{ marginBottom: "20px" }}>إعدادات النشر</h2>
            
            {/* حالة النشر */}
            <div style={{ marginBottom: "20px" }}>
              <label className="label" style={{ marginBottom: "12px", display: "block" }}>حالة النشر</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {[
                  { value: "draft", label: "مسودة", icon: FileText, color: "hsl(var(--muted))" },
                  { value: "published", label: "منشور", icon: Send, color: "hsl(var(--success))" },
                  { value: "scheduled", label: "مجدول", icon: Clock, color: "hsl(var(--info))" }
                ].map(status => (
                  <button
                    key={status.value}
                    onClick={() => setFormData(prev => ({ ...prev, status: status.value as any }))}
                    className="card"
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      border: formData.status === status.value ? `2px solid ${status.color}` : "1px solid hsl(var(--line))",
                      background: formData.status === status.value ? `${status.color}10` : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <status.icon size={24} style={{ color: status.color, marginBottom: "8px" }} />
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>{status.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* خبر عاجل */}
            <div className="card" style={{
              padding: "16px",
              marginBottom: "20px",
              background: formData.breaking ? "hsl(var(--danger) / 0.05)" : "transparent",
              border: formData.breaking ? "1px solid hsl(var(--danger) / 0.2)" : "1px solid hsl(var(--line))"
            }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <AlertCircle size={20} style={{ color: formData.breaking ? "hsl(var(--danger))" : "hsl(var(--muted))" }} />
                  <div>
                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>خبر عاجل</div>
                    <div className="text-xs text-muted">سيظهر في شريط الأخبار العاجلة</div>
                  </div>
                </div>
                <div
                  onClick={() => setFormData(prev => ({ ...prev, breaking: !prev.breaking }))}
                  style={{
                    width: "48px",
                    height: "28px",
                    background: formData.breaking ? "hsl(var(--danger))" : "#E5E5EA",
                    borderRadius: "14px",
                    position: "relative",
                    transition: "background 0.3s ease",
                    cursor: "pointer"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: formData.breaking ? "2px" : "22px",
                      width: "24px",
                      height: "24px",
                      background: "white",
                      borderRadius: "50%",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      transition: "right 0.3s ease"
                    }}
                  />
                </div>
              </label>
            </div>

            {/* تاريخ النشر المجدول */}
            {formData.status === "scheduled" && (
              <div style={{ marginBottom: "20px" }}>
                <label className="label" style={{ marginBottom: "8px", display: "block" }}>
                  <Clock size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                  تاريخ النشر المجدول
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  className="input"
                  style={{ width: "100%", fontSize: "14px" }}
                />
              </div>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "hsl(var(--bg))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div className="card" style={{ padding: "32px", textAlign: "center" }}>
          <Loader2 size={40} className="animate-spin" style={{ margin: "0 auto 16px", color: "hsl(var(--accent))" }} />
          <p className="text-muted">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--bg))" }}>
      {/* الهيدر */}
      <header style={{
        position: "sticky",
        top: 0,
        background: "hsl(var(--bg))",
        borderBottom: "1px solid hsl(var(--line))",
        zIndex: 100
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/admin-mobile/news" style={{ color: "hsl(var(--fg))", textDecoration: "none" }}>
              <ArrowLeft size={24} />
            </Link>
            <h1 className="heading-3">{isEditMode ? "تعديل الخبر" : "خبر جديد"}</h1>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="btn btn-outline"
              style={{ minWidth: "80px" }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              حفظ
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="btn"
              style={{ background: "hsl(var(--accent))", color: "white", minWidth: "80px" }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              نشر
            </button>
          </div>
        </div>

        {/* مؤشر التقدم */}
        <div style={{
          height: "4px",
          background: "hsl(var(--line))",
          position: "relative",
          overflow: "hidden"
        }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              height: "100%",
              background: "hsl(var(--accent))",
              width: `${(currentStep / totalSteps) * 100}%`,
              transition: "width 0.3s ease"
            }}
          />
        </div>
      </header>

      {/* المحتوى */}
      <main style={{ paddingBottom: "80px" }}>
        {renderStep()}
      </main>

      {/* شريط التنقل بين الخطوات */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "hsl(var(--bg))",
        borderTop: "1px solid hsl(var(--line))",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100
      }}>
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="btn btn-outline"
          style={{ opacity: currentStep === 1 ? 0.5 : 1 }}
        >
          السابق
        </button>
        
        <div style={{ display: "flex", gap: "6px" }}>
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              onClick={() => setCurrentStep(step)}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: step === currentStep ? "hsl(var(--accent))" : "hsl(var(--line))",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
          disabled={currentStep === totalSteps}
          className="btn"
          style={{
            background: "hsl(var(--accent))",
            color: "white",
            opacity: currentStep === totalSteps ? 0.5 : 1
          }}
        >
          التالي
        </button>
      </div>
    </div>
  );
}
