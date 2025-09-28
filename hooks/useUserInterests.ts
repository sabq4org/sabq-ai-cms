import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface Interest {
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface InterestsResponse {
  success: boolean;
  userId: string;
  interests: Interest[];
  categoryIds: string[];
  count: number;
  timestamp: string;
}

interface UpdateInterestsPayload {
  categoryIds: string[];
}

/**
 * Hook لإدارة اهتمامات المستخدم
 */
export function useUserInterests() {
  const queryClient = useQueryClient();

  // جلب الاهتمامات
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<InterestsResponse>({
    queryKey: ["profile", "interests"],
    queryFn: async () => {
      const response = await fetch("/api/profile/interests", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("غير مصرح بالوصول");
        }
        throw new Error("فشل في جلب الاهتمامات");
      }

      return response.json();
    },
    staleTime: 0, // البيانات تصبح قديمة فوراً
    gcTime: 0, // عدم الاحتفاظ بالكاش
    refetchOnMount: true, // إعادة الجلب عند التركيب
    refetchOnWindowFocus: true, // إعادة الجلب عند التركيز
  });

  // تحديث الاهتمامات
  const updateMutation = useMutation<
    any,
    Error,
    UpdateInterestsPayload
  >({
    mutationFn: async (payload) => {
      const response = await fetch("/api/profile/interests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في حفظ الاهتمامات");
      }

      return response.json();
    },
    onMutate: async (newData) => {
      // إلغاء أي جلب جاري
      await queryClient.cancelQueries({ queryKey: ["profile", "interests"] });

      // حفظ البيانات السابقة للرجوع إليها في حالة الفشل
      const previousData = queryClient.getQueryData(["profile", "interests"]);

      // تحديث متفائل (اختياري)
      // queryClient.setQueryData(["profile", "interests"], (old: any) => ({
      //   ...old,
      //   categoryIds: newData.categoryIds,
      // }));

      return { previousData };
    },
    onError: (error, newData, context) => {
      // الرجوع للبيانات السابقة في حالة الفشل
      if (context?.previousData) {
        queryClient.setQueryData(["profile", "interests"], context.previousData);
      }
      toast.error(error.message || "فشل في حفظ الاهتمامات");
    },
    onSuccess: async (data) => {
      // إبطال الكاش وإعادة الجلب
      await queryClient.invalidateQueries({ queryKey: ["profile", "interests"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      // إعادة الجلب الفوري للتأكد من التزامن
      await refetch();
      
      toast.success("تم حفظ الاهتمامات بنجاح ✨");
    },
    onSettled: () => {
      // إعادة الجلب النهائية للتأكد
      queryClient.invalidateQueries({ queryKey: ["profile", "interests"] });
    },
  });

  // إضافة/إزالة اهتمام واحد
  const toggleInterest = useMutation<
    any,
    Error,
    { categoryId: string; action?: "add" | "remove" | "toggle" }
  >({
    mutationFn: async ({ categoryId, action = "toggle" }) => {
      const response = await fetch("/api/profile/interests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryId, action }),
      });

      if (!response.ok) {
        throw new Error("فشل في تحديث الاهتمام");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", "interests"] });
      await refetch();
    },
  });

  // حذف جميع الاهتمامات
  const clearInterests = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/profile/interests", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("فشل في حذف الاهتمامات");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", "interests"] });
      toast.success("تم حذف جميع الاهتمامات");
    },
  });

  return {
    // البيانات
    interests: data?.interests || [],
    categoryIds: data?.categoryIds || [],
    count: data?.count || 0,
    
    // الحالات
    isLoading,
    error,
    
    // العمليات
    updateInterests: updateMutation.mutate,
    toggleInterest: toggleInterest.mutate,
    clearInterests: clearInterests.mutate,
    refetch,
    
    // حالات العمليات
    isUpdating: updateMutation.isPending,
    isToggling: toggleInterest.isPending,
    isClearing: clearInterests.isPending,
  };
}