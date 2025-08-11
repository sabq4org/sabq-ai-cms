"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export function ClearCacheButton() {
  const [loading, setLoading] = useState(false);

  const handleClearCache = async () => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/admin/clear-cache", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "نجح مسح الكاش",
          description: "ستظهر الأخبار الجديدة الآن في الواجهة الرئيسية",
        });
      } else {
        toast({
          title: "خطأ",
          description: data.error || "حدث خطأ أثناء مسح الكاش",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClearCache}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      مسح الكاش
    </Button>
  );
}
