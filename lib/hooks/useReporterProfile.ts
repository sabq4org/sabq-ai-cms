import { useState, useEffect } from 'react';

interface ReporterProfile {
  id: string;
  slug: string;
  full_name: string;
  title: string;
  avatar_url: string;
  is_verified: boolean;
  verification_badge: string;
  is_active: boolean;
  profileUrl: string;
}

interface UseReporterProfileReturn {
  reporter: ReporterProfile | null;
  hasProfile: boolean;
  loading: boolean;
  error: string | null;
}

export function useReporterProfile(userId: string | null | undefined): UseReporterProfileReturn {
  const [reporter, setReporter] = useState<ReporterProfile | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setReporter(null);
      setHasProfile(false);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchReporterProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/reporters/by-user/${userId}`);
        const data = await response.json();

        if (data.success && data.hasProfile) {
          setReporter(data.reporter);
          setHasProfile(true);
        } else {
          setReporter(null);
          setHasProfile(false);
        }
      } catch (error) {
        console.error('خطأ في جلب بروفايل المراسل:', error);
        setError('فشل في تحميل بروفايل المراسل');
        setReporter(null);
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    fetchReporterProfile();
  }, [userId]);

  return {
    reporter,
    hasProfile,
    loading,
    error
  };
}