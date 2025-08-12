"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, RefreshCw, Hash } from "lucide-react";

type Story = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  status: string;
  importanceLevel: number;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export default function AdminStoriesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);

  // create form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  async function loadStories() {
    setLoading(true);
    try {
      const res = await fetch("/api/stories?limit=50", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setStories(data.stories || []);
    } catch (e) {
      toast({ title: "خطأ", description: "فشل في جلب القصص" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStories();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "العنوان مطلوب", description: "يرجى إدخال عنوان للقصة" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ title: "فشل الإنشاء", description: err.error || "تحقق من الصلاحيات" });
        return;
      }
      toast({ title: "تم الإنشاء", description: "تم إنشاء قصة جديدة" });
      setTitle("");
      setDescription("");
      setCategory("");
      setTags("");
      await loadStories();
    } catch (e) {
      toast({ title: "خطأ", description: "تعذر إنشاء القصة" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">القصص الذكية</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadStories} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            تحديث
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* إنشاء قصة */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">إنشاء قصة جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">العنوان</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان القصة" />
              </div>
              <div>
                <label className="block text-sm mb-1">الوصف (اختياري)</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف مختصر" rows={3} />
              </div>
              <div>
                <label className="block text-sm mb-1">التصنيف (اختياري)</label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="مثال: اقتصاد" />
              </div>
              <div>
                <label className="block text-sm mb-1 flex items-center gap-1">الكلمات المفتاحية <Hash className="w-3 h-3" /></label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="افصل بين الكلمات بفاصلة ," />
              </div>
              <Button type="submit" disabled={submitting} className="w-full gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                إنشاء
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* قائمة القصص */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">القائمة</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> جاري التحميل...</div>
            ) : stories.length === 0 ? (
              <div className="text-sm text-gray-500">لا توجد قصص بعد</div>
            ) : (
              <div className="space-y-2">
                {stories.map((s) => (
                  <div key={s.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-gray-500">التصنيف: {s.category || "—"} • الإنشاء: {new Date(s.created_at).toLocaleString("ar-SA")}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/stories/${s.id}`}>
                        <Button size="sm" variant="secondary">عرض</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


