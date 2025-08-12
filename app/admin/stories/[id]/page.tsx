"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Event = {
  id: string;
  title: string;
  content: string;
  source?: string | null;
  event_date: string;
  importanceScore: string | number;
  created_at: string;
};

export default function AdminStoryDetailsPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);

  // form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  async function loadTimeline() {
    setLoading(true);
    try {
      const res = await fetch(`/api/stories/${id}/timeline`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) setEvents(data.events || []);
    } catch (e) {
      toast({ title: "خطأ", description: "فشل في جلب الخط الزمني" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadTimeline();
  }, [id]);

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: "البيانات مطلوبة", description: "العنوان والمحتوى مطلوبان" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        source: source.trim() || undefined,
        event_date: date ? new Date(date).toISOString() : undefined,
      };
      const res = await fetch(`/api/stories/${id}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ title: "فشل الإضافة", description: err.error || "تحقق من الصلاحيات" });
        return;
      }
      toast({ title: "تمت إضافة حدث", description: "تمت إضافة حدث جديد إلى القصة" });
      setTitle("");
      setContent("");
      setSource("");
      setDate("");
      await loadTimeline();
    } catch (e) {
      toast({ title: "خطأ", description: "تعذر إضافة الحدث" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/stories">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowRight className="w-4 h-4" />
              العودة
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">تفاصيل القصة</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* إضافة حدث */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">إضافة حدث</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">العنوان</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الحدث" />
              </div>
              <div>
                <label className="block text-sm mb-1">المحتوى</label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="تفاصيل الحدث" rows={4} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">المصدر (اختياري)</label>
                  <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="مثال: وكالة الأنباء" />
                </div>
                <div>
                  <label className="block text-sm mb-1">التاريخ (اختياري)</label>
                  <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                إضافة الحدث
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* الخط الزمني */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">الخط الزمني</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> جاري التحميل...</div>
            ) : events.length === 0 ? (
              <div className="text-sm text-gray-500">لا توجد أحداث بعد</div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => (
                  <div key={ev.id} className="border rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">{new Date(ev.event_date).toLocaleString("ar-SA")}</div>
                    <div className="font-medium mb-1">{ev.title}</div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{ev.content}</div>
                    {ev.source && <div className="text-xs text-gray-500 mt-1">المصدر: {ev.source}</div>}
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


