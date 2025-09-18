"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Save, X, CheckCircle, AlertCircle, Palette, Tag, Hash, ChevronRight } from "lucide-react";

type CategoryResponse = {
  id: string | number;
  name?: string;
  name_ar?: string;
  description?: string;
  is_active?: boolean;
  color?: string;
  metadata?: any;
  created_at?: string;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = useMemo(() => String((params as any)?.id || ""), [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [color, setColor] = useState("#3B82F6");
  const [templateType, setTemplateType] = useState<"grid" | "featured" | "mixed">("grid");

  useEffect(() => {
    if (!id) return;
    let canceled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // حاول الحصول على التصنيف عبر /api/categories/:id، وإن فشل جرّب by-id
        const tryFetch = async (url: string) => {
          const res = await fetch(url, { cache: "no-store", credentials: "include" });
          if (!res.ok) throw new Error(String(res.status));
          return res.json();
        };

        let data: any = null;
        try {
          data = await tryFetch(`/api/categories/${id}`);
        } catch {
          data = await tryFetch(`/api/categories/by-id/${id}`);
        }

        const cat: CategoryResponse = data?.category || data?.data || data;
        if (!cat) throw new Error("NOT_FOUND");

        if (!canceled) {
          setName(cat.name_ar || cat.name || "");
          setDescription(cat.description || "");
          setIsActive(cat.is_active !== false);
          setColor(cat.color || cat?.metadata?.color_hex || "#3B82F6");
          try {
            const meta = typeof cat.metadata === "string" ? JSON.parse(cat.metadata) : (cat.metadata || {});
            const tpl = (meta.template_type || meta.templateType || "grid").toString().toLowerCase();
            setTemplateType(["grid","featured","mixed"].includes(tpl) ? (tpl as any) : "grid");
          } catch {
            setTemplateType("grid");
          }
        }
      } catch (e: any) {
        if (!canceled) setError("تعذر جلب بيانات التصنيف");
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    load();
    return () => { canceled = true; };
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // دمج metadata الحالية مع template_type
      const payload: any = {
        name,
        description,
        is_active: isActive,
        color,
        metadata: {
          template_type: templateType,
        },
      };

      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("فشل الحفظ");
      }

      setSuccess("تم حفظ التعديلات بنجاح");
      setTimeout(() => {
        router.push("/admin/categories");
      }, 900);
    } catch (e: any) {
      setError(e?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <div className="text-gray-600">معرّف التصنيف غير صالح</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "hsl(var(--bg))", minHeight: "100vh" }}>
      <link rel="stylesheet" href="/manus-ui.css" />

      <div className="card card-accent" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/admin/categories" className="btn btn-sm btn-ghost">التصنيفات</Link>
          <ChevronRight className="w-4 h-4 text-[hsl(var(--muted))]" />
          <span className="text-sm text-muted">تعديل</span>
          <span className="text-sm">#{id}</span>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-muted">جاري تحميل بيانات التصنيف...</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {error && (
              <div className="card" style={{ border: '1px solid hsl(var(--danger) / 0.3)', background: 'hsl(var(--danger) / 0.05)', padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'hsl(var(--danger))' }}>
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="card" style={{ border: '1px solid hsl(var(--success) / 0.3)', background: 'hsl(var(--success) / 0.05)', padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'hsl(var(--success))' }}>
                  <CheckCircle className="w-4 h-4" />
                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* الاسم */}
            <div>
              <label className="label">اسم التصنيف</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="أدخل اسم التصنيف"
              />
            </div>

            {/* الوصف */}
            <div>
              <label className="label">الوصف</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                placeholder="وصف مختصر للتصنيف"
                rows={3}
              />
            </div>

            {/* الحالة والقالب */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">الحالة</label>
                <select value={isActive ? 'active' : 'inactive'} onChange={(e) => setIsActive(e.target.value === 'active')} className="input">
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
              <div>
                <label className="label">قالب العرض (template_type)</label>
                <select value={templateType} onChange={(e) => setTemplateType(e.target.value as any)} className="input">
                  <option value="grid">Grid</option>
                  <option value="featured">Featured + List</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            {/* اللون */}
            <div>
              <label className="label">لون التصنيف</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="input" style={{ width: 60, padding: 2 }} />
                <input value={color} onChange={(e) => setColor(e.target.value)} className="input" placeholder="#3B82F6" />
              </div>
            </div>

            {/* الأزرار */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', marginTop: 8 }}>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                حفظ التعديلات
              </button>
              <button onClick={() => router.push('/admin/categories')} className="btn btn-outline">
                <X className="w-4 h-4" />
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


