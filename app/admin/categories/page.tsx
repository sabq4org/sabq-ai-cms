"use client";

import { DesignComponents } from "@/components/design-system/DesignSystemGuide";
import { Button } from "@/components/ui/button";
import { formatDashboardStat } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Calendar,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Folder,
  FolderOpen,
  Hash,
  Plus,
  Search,
  Sparkles,
  Tag,
  Target,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  createdAt: string;
  status: "active" | "inactive";
  color: string;
}

// سيتم جلب التصنيفات فعليًا من /api/categories

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        const raw = data.categories || data.data || [];
        const mapped: Category[] = (raw as any[]).map((c) => ({
          id: String(c.id),
          name: c.name_ar || c.name || "",
          description: c.description || "",
          articleCount: Number(c.articles_count ?? c.articleCount ?? 0),
          createdAt: c.created_at || c.createdAt || new Date().toISOString(),
          status: c.is_active === false ? "inactive" : "active",
          color: c.color || "blue",
        }));
        setCategories(mapped);
      } catch (e) {
        setError("تعذر جلب التصنيفات");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const getCategoryStats = () => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter(
      (cat) => cat.status === "active"
    ).length;
    const totalArticles = categories.reduce(
      (sum, cat) => sum + cat.articleCount,
      0
    );
    const averageArticles = Math.round(totalArticles / totalCategories);

    return {
      total: totalCategories,
      active: activeCategories,
      totalArticles,
      average: averageArticles,
    };
  };

  const stats = getCategoryStats();

  const statsCards = [
    {
      title: "إجمالي الفئات",
      value: stats.total.toString(),
      icon: Folder,
      change: "+2",
      changeType: "increase" as const,
      color: "blue",
    },
    {
      title: "الفئات النشطة",
      value: stats.active.toString(),
      icon: FolderOpen,
      change: "+1",
      changeType: "increase" as const,
      color: "green",
    },
    {
      title: "إجمالي المقالات",
      value: formatDashboardStat(stats.totalArticles),
      icon: FileText,
      change: "+12%",
      changeType: "increase" as const,
      color: "purple",
    },
    {
      title: "متوسط المقالات",
      value: stats.average.toString(),
      icon: Target,
      change: "+5%",
      changeType: "increase" as const,
      color: "orange",
    },
  ];

  return (
    <>
      <div className="space-y-8">
        {loading && (
          <DesignComponents.StandardCard className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-300">جاري التحميل...</div>
          </DesignComponents.StandardCard>
        )}
        {error && (
          <DesignComponents.StandardCard className="p-6">
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          </DesignComponents.StandardCard>
        )}
        {/* رسالة الترحيب الاحترافية */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                إدارة التصنيفات
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                تنظيم وإدارة فئات المحتوى بطريقة احترافية ومنظمة
              </p>
              <div className="flex gap-3">
                <DesignComponents.StatusIndicator
                  status="success"
                  text={`${stats.active} فئة نشطة`}
                />
                <DesignComponents.StatusIndicator
                  status="info"
                  text={`${formatDashboardStat(stats.totalArticles)} مقال`}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                آخر تحديث
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Date().toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        {/* الإحصائيات الرئيسية */}
        <div>
          <DesignComponents.SectionHeader
            title="إحصائيات التصنيفات"
            description="نظرة سريعة على أداء التصنيفات"
            action={
              <DesignComponents.ActionBar>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 ml-2" />
                  تصفية
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة فئة
                </Button>
              </DesignComponents.ActionBar>
            }
          />

          <DesignComponents.DynamicGrid minItemWidth="280px" className="mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              const ChangeIcon = ArrowUpRight;
              return (
                <DesignComponents.StandardCard
                  key={index}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </p>
                        <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                          <ChangeIcon className="w-3 h-3" />
                          {stat.change}
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        stat.color === "blue" &&
                          "bg-blue-100 dark:bg-blue-900/30",
                        stat.color === "green" &&
                          "bg-green-100 dark:bg-green-900/30",
                        stat.color === "purple" &&
                          "bg-purple-100 dark:bg-purple-900/30",
                        stat.color === "orange" &&
                          "bg-orange-100 dark:bg-orange-900/30"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6",
                          stat.color === "blue" &&
                            "text-blue-600 dark:text-blue-400",
                          stat.color === "green" &&
                            "text-green-600 dark:text-green-400",
                          stat.color === "purple" &&
                            "text-purple-600 dark:text-purple-400",
                          stat.color === "orange" &&
                            "text-orange-600 dark:text-orange-400"
                        )}
                      />
                    </div>
                  </div>
                </DesignComponents.StandardCard>
              );
            })}
          </DesignComponents.DynamicGrid>
        </div>

        {/* قائمة التصنيفات */}
        <div>
          <DesignComponents.SectionHeader
            title="قائمة التصنيفات"
            description="جميع التصنيفات المتاحة في النظام"
            action={
              <DesignComponents.ActionBar>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 ml-2" />
                  بحث
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
              </DesignComponents.ActionBar>
            }
          />

           <DesignComponents.DynamicGrid minItemWidth="350px">
            {categories.map((category) => (
              <DesignComponents.StandardCard
                key={category.id}
                className="p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        category.color === "red" &&
                          "bg-red-100 dark:bg-red-900/30",
                        category.color === "blue" &&
                          "bg-blue-100 dark:bg-blue-900/30",
                        category.color === "purple" &&
                          "bg-purple-100 dark:bg-purple-900/30",
                        category.color === "green" &&
                          "bg-green-100 dark:bg-green-900/30",
                        category.color === "orange" &&
                          "bg-orange-100 dark:bg-orange-900/30"
                      )}
                    >
                      <Hash
                        className={cn(
                          "w-5 h-5",
                          category.color === "red" &&
                            "text-red-600 dark:text-red-400",
                          category.color === "blue" &&
                            "text-blue-600 dark:text-blue-400",
                          category.color === "purple" &&
                            "text-purple-600 dark:text-purple-400",
                          category.color === "green" &&
                            "text-green-600 dark:text-green-400",
                          category.color === "orange" &&
                            "text-orange-600 dark:text-orange-400"
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {category.name}
                      </h3>
                      <DesignComponents.StatusIndicator
                        status={
                          category.status === "active" ? "success" : "warning"
                        }
                        text={category.status === "active" ? "نشط" : "غير نشط"}
                      />
                    </div>
                  </div>
                  <DesignComponents.ActionBar>
                    <button className="text-gray-400 hover:text-blue-600 p-1">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </DesignComponents.ActionBar>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatDashboardStat(category.articleCount)} مقال
                      </span>
                    </div>
                    {category.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {new Date(category.createdAt).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </DesignComponents.StandardCard>
            ))}
          </DesignComponents.DynamicGrid>
        </div>

        {/* رسالة النجاح */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                تنظيم ممتاز للمحتوى!
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                التصنيفات منظمة بشكل جيد مع توزيع متوازن للمقالات
              </p>
            </div>
            <DesignComponents.StatusIndicator
              status="success"
              text="منظم بكفاءة"
            />
          </div>
        </DesignComponents.StandardCard>
      </div>
    </>
  );
};

export default CategoriesPage;
