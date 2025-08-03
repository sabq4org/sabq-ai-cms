"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SidebarPreferences {
  sidebar_order: string[];
  sidebar_hidden: string[];
}

interface SidebarPreferencesContextType {
  preferences: SidebarPreferences;
  loading: boolean;
  updatePreferences: (preferences: SidebarPreferences) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const SidebarPreferencesContext = createContext<
  SidebarPreferencesContextType | undefined
>(undefined);

export function SidebarPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] = useState<SidebarPreferences>({
    sidebar_order: [],
    sidebar_hidden: [],
  });
  const [loading, setLoading] = useState(true);

  // تحميل التفضيلات عند بدء التشغيل
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // محاولة التحميل من localStorage أولاً للسرعة
      const cached = localStorage.getItem("sidebar-preferences");
      if (cached) {
        setPreferences(JSON.parse(cached));
      }

      // ثم التحميل من الخادم
      const response = await fetch("/api/user/preferences/sidebar");
      if (response.ok) {
        const data = await response.json();
        const newPreferences = {
          sidebar_order: data.sidebar_order || [],
          sidebar_hidden: data.sidebar_hidden || [],
        };
        setPreferences(newPreferences);
        localStorage.setItem(
          "sidebar-preferences",
          JSON.stringify(newPreferences)
        );
      }
    } catch (error) {
      console.error("خطأ في تحميل تفضيلات الشريط الجانبي:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: SidebarPreferences) => {
    try {
      // تحديث الحالة المحلية فوراً
      setPreferences(newPreferences);
      localStorage.setItem(
        "sidebar-preferences",
        JSON.stringify(newPreferences)
      );

      // حفظ في قاعدة البيانات
      const response = await fetch("/api/user/preferences/sidebar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sidebar_order: newPreferences.sidebar_order,
          sidebar_hidden: newPreferences.sidebar_hidden,
        }),
      });

      if (!response.ok) {
        console.error("فشل في حفظ التفضيلات في قاعدة البيانات");
      } else {
        console.log("✅ تم حفظ تفضيلات الشريط الجانبي في قاعدة البيانات");
      }
    } catch (error) {
      console.error("خطأ في حفظ تفضيلات الشريط الجانبي:", error);
    }
  };

  const resetPreferences = async () => {
    try {
      const defaultPreferences = {
        sidebar_order: [],
        sidebar_hidden: [],
      };

      // تحديث الحالة المحلية
      setPreferences(defaultPreferences);
      localStorage.removeItem("sidebar-preferences");

      // حذف من قاعدة البيانات
      const response = await fetch("/api/user/preferences/sidebar", {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("فشل في حذف التفضيلات من قاعدة البيانات");
      } else {
        console.log("✅ تم حذف تفضيلات الشريط الجانبي من قاعدة البيانات");
      }
    } catch (error) {
      console.error("خطأ في حذف تفضيلات الشريط الجانبي:", error);
    }
  };

  return (
    <SidebarPreferencesContext.Provider
      value={{
        preferences,
        loading,
        updatePreferences,
        resetPreferences,
      }}
    >
      {children}
    </SidebarPreferencesContext.Provider>
  );
}

export function useSidebarPreferences() {
  const context = useContext(SidebarPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useSidebarPreferences must be used within a SidebarPreferencesProvider"
    );
  }
  return context;
}
