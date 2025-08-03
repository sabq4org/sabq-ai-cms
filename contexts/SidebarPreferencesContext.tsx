"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SidebarPreferences {
  sidebar_order: string[];
  sidebar_hidden: string[];
}

interface SidebarPreferencesContextType {
  preferences: SidebarPreferences;
  loading: boolean;
  updatePreferences: (preferences: SidebarPreferences) => void;
  resetPreferences: () => void;
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

  const updatePreferences = (newPreferences: SidebarPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem("sidebar-preferences", JSON.stringify(newPreferences));
  };

  const resetPreferences = () => {
    const defaultPreferences = {
      sidebar_order: [],
      sidebar_hidden: [],
    };
    setPreferences(defaultPreferences);
    localStorage.removeItem("sidebar-preferences");
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
