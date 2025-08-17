import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { SmartRecommendations } from '@/components/smart-integration/SmartRecommendations';
import { useGlobalStore } from '@/stores/globalStore';

// Mock the global store
jest.mock('@/stores/globalStore', () => ({
  useGlobalStore: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock OptimizedImage
jest.mock('@/components/OptimizedImage', () => ({
  OptimizedImage: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

// Mock React Query
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

describe('SmartRecommendations Component', () => {
  const mockUser = {
    id: 'user-1',
    name: 'محمد أحمد',
    email: 'mohamed@test.com',
    role: 'subscriber' as const,
  };

  const mockRecommendations = [
    {
      id: 'rec-1',
      type: 'trending' as const,
      title: 'الأخبار الأكثر تداولاً',
      reason: 'هذه المقالات تحظى بأكبر عدد من المشاهدات والتفاعل',
      confidence: 0.92,
      priority: 1,
      articles: [
        {
          id: 'article-1',
          title: 'أحدث التطورات في تكنولوجيا الذكاء الاصطناعي',
          slug: 'ai-developments',
          excerpt: 'تطورات مثيرة في عالم الذكاء الاصطناعي تعد بتغيير مستقبل التكنولوجيا',
          thumbnail: '/images/ai-article.jpg',
          category: { id: 'tech', name: 'تكنولوجيا', slug: 'technology' },
          author: { id: 'author-1', name: 'د. أحمد محمد', avatar: '/avatars/author1.jpg' },
          publishedAt: '2024-08-16T10:00:00Z',
          readingTime: 5,
          views: 1250,
          likes: 89,
        },
        {
          id: 'article-2',
          title: 'مستقبل الطاقة المتجددة في المنطقة',
          slug: 'renewable-energy',
          excerpt: 'نظرة على الخطط الطموحة لتطوير مصادر الطاقة المتجددة',
          thumbnail: '/images/energy-article.jpg',
          category: { id: 'environment', name: 'بيئة', slug: 'environment' },
          author: { id: 'author-2', name: 'سارة الخالدي', avatar: '/avatars/author2.jpg' },
          publishedAt: '2024-08-16T08:30:00Z',
          readingTime: 8,
          views: 950,
          likes: 67,
        },
      ],
    },
    {
      id: 'rec-2',
      type: 'personalized' as const,
      title: 'مخصص لك',
      reason: 'بناءً على اهتماماتك في التكنولوجيا والابتكار',
      confidence: 0.87,
      priority: 2,
      articles: [
        {
          id: 'article-3',
          title: 'الثورة الرقمية في التعليم',
          slug: 'digital-education',
          excerpt: 'كيف تعيد التكنولوجيا تشكيل مستقبل التعليم في العالم العربي',
          thumbnail: '/images/education-article.jpg',
          category: { id: 'education', name: 'تعليم', slug: 'education' },
          author: { id: 'author-3', name: 'عمر الزهراني', avatar: '/avatars/author3.jpg' },
          publishedAt: '2024-08-16T09:15:00Z',
          readingTime: 6,
          views: 720,
          likes: 45,
        },
      ],
    },
  ];

  const mockTrackInteraction = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock fetch globally
    global.fetch = jest.fn();
    
    // Mock the global store
    (useGlobalStore as jest.Mock).mockReturnValue({
      user: mockUser,
      trackInteraction: mockTrackInteraction,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Component Rendering', () => {
    it('يعرض العنوان الرئيسي بشكل صحيح', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ recommendations: mockRecommendations }),
      });

      renderWithProviders(<SmartRecommendations />);

      expect(screen.getByText('التوصيات الذكية')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('التوصيات الذكية');
    });

    it('يعرض حالة التحميل أثناء جلب البيانات', () => {
      // Mock pending API response
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProviders(<SmartRecommendations />);

      // Should show loading skeletons
      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(3);
    });

    it('يعرض التوصيات بعد تحميل البيانات', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ recommendations: mockRecommendations }),
      });

      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('الأخبار الأكثر تداولاً')).toBeInTheDocument();
        expect(screen.getByText('مخصص لك')).toBeInTheDocument();
      });

      // Check articles are displayed
      expect(screen.getByText('أحدث التطورات في تكنولوجيا الذكاء الاصطناعي')).toBeInTheDocument();
      expect(screen.getByText('مستقبل الطاقة المتجددة في المنطقة')).toBeInTheDocument();
    });

    it('يعرض رسالة خطأ عند فشل تحميل البيانات', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('حدث خطأ في تحميل التوصيات الذكية')).toBeInTheDocument();
        expect(screen.getByText('المحاولة مرة أخرى')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ recommendations: mockRecommendations }),
      });
    });

    it('يتتبع النقر على المقالات', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('أحدث التطورات في تكنولوجيا الذكاء الاصطناعي')).toBeInTheDocument();
      });

      const articleLink = screen.getByText('أحدث التطورات في تكنولوجيا الذكاء الاصطناعي').closest('a');
      expect(articleLink).toHaveAttribute('href', '/news/ai-developments');

      await user.click(articleLink!);

      expect(mockTrackInteraction).toHaveBeenCalledWith('recommendation_click', {
        articleId: 'article-1',
        type: 'smart_recommendation',
      });
    });

    it('يدعم فلترة التوصيات حسب النوع', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('الأكثر تداولاً')).toBeInTheDocument();
      });

      // Click on trending filter
      const trendingFilter = screen.getByRole('button', { name: /الأكثر تداولاً/ });
      await user.click(trendingFilter);

      // Should show only trending recommendations
      expect(screen.getByText('الأخبار الأكثر تداولاً')).toBeInTheDocument();
      expect(screen.queryByText('مخصص لك')).not.toBeInTheDocument();
    });

    it('يمكن إعادة تحميل التوصيات', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /تحديث/ })).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /تحديث/ });
      await user.click(refreshButton);

      expect(mockTrackInteraction).toHaveBeenCalledWith('refresh_recommendations');
      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + refresh
    });

    it('يدعم توسيع وطي أقسام التوصيات', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('أحدث التطورات في تكنولوجيا الذكاء الاصطناعي')).toBeInTheDocument();
      });

      // Find collapse button for trending section
      const trendingSection = screen.getByText('الأخبار الأكثر تداولاً').closest('div');
      const collapseButton = within(trendingSection!).getByRole('button');

      await user.click(collapseButton);

      // Articles should be hidden
      await waitFor(() => {
        expect(screen.queryByText('أحدث التطورات في تكنولوجيا الذكاء الاصطناعي')).not.toBeInTheDocument();
      });
    });
  });

  describe('Article Display', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ recommendations: mockRecommendations }),
      });
    });

    it('يعرض معلومات المقال بشكل صحيح', async () => {
      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('أحدث التطورات في تكنولوجيا الذكاء الاصطناعي')).toBeInTheDocument();
      });

      const articleCard = screen.getByText('أحدث التطورات في تكنولوجيا الذكاء الاصطناعي').closest('div');

      // Check article metadata
      expect(within(articleCard!).getByText('5 دقيقة')).toBeInTheDocument();
      expect(within(articleCard!).getByText('1,250')).toBeInTheDocument(); // views
      expect(within(articleCard!).getByText('د. أحمد محمد')).toBeInTheDocument();
      expect(within(articleCard!).getByText('تكنولوجيا')).toBeInTheDocument();
    });

    it('يعرض صور المقالات مع تحسين الأداء', async () => {
      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByAltText('أحدث التطورات في تكنولوجيا الذكاء الاصطناعي')).toBeInTheDocument();
      });

      const image = screen.getByAltText('أحدث التطورات في تكنولوجيا الذكاء الاصطناعي');
      expect(image).toHaveAttribute('src', '/images/ai-article.jpg');
    });

    it('يعرض معايير الثقة للتوصيات', async () => {
      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('92% دقة')).toBeInTheDocument();
        expect(screen.getByText('87% دقة')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('يتكيف مع أحجام الشاشات المختلفة', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ recommendations: mockRecommendations }),
      });

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('الأخبار الأكثر تداولاً')).toBeInTheDocument();
      });

      // Check responsive classes are applied
      const container = screen.getByText('التوصيات الذكية').closest('div');
      expect(container).toHaveClass('space-y-6');
    });
  });

  describe('Error Handling', () => {
    it('يتعامل مع استجابة API غير صحيحة', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server Error' }),
      });

      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('حدث خطأ في تحميل التوصيات الذكية')).toBeInTheDocument();
      });
    });

    it('يتعامل مع بيانات فارغة', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ recommendations: [] }),
      });

      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('لا توجد توصيات متاحة حالياً')).toBeInTheDocument();
        expect(screen.getByText('تفاعل أكثر مع المحتوى ليتمكن نظامنا الذكي من تقديم توصيات مخصصة لك')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication State', () => {
    it('يعمل بدون مستخدم مسجل الدخول', () => {
      (useGlobalStore as jest.Mock).mockReturnValue({
        user: null,
        trackInteraction: mockTrackInteraction,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ recommendations: mockRecommendations }),
      });

      renderWithProviders(<SmartRecommendations />);

      expect(screen.getByText('التوصيات الذكية')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('يحدث البيانات كل 5 دقائق', async () => {
      jest.useFakeTimers();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ recommendations: mockRecommendations }),
      });

      renderWithProviders(<SmartRecommendations />);

      // Fast-forward 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + auto-refresh
      });

      jest.useRealTimers();
    });

    it('يستخدم stale time للتخزين المؤقت', async () => {
      const queryClient = createTestQueryClient();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ recommendations: mockRecommendations }),
      });

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <SmartRecommendations />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('الأخبار الأكثر تداولاً')).toBeInTheDocument();
      });

      // Rerender component - should use cached data
      rerender(
        <QueryClientProvider client={queryClient}>
          <SmartRecommendations />
        </QueryClientProvider>
      );

      // Should not make additional API calls
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('يدعم التنقل بلوحة المفاتيح', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ recommendations: mockRecommendations }),
      });

      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('أحدث التطورات في تكنولوجيا الذكاء الاصطناعي')).toBeInTheDocument();
      });

      // Test keyboard navigation
      const firstArticle = screen.getByText('أحدث التطورات في تكنولوجيا الذكاء الاصطناعي').closest('a');
      firstArticle?.focus();
      
      await user.keyboard('{Enter}');
      expect(mockTrackInteraction).toHaveBeenCalled();
    });

    it('يحتوي على نصوص بديلة للصور', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ recommendations: mockRecommendations }),
      });

      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        images.forEach(img => {
          expect(img).toHaveAttribute('alt');
          expect(img.getAttribute('alt')).toBeTruthy();
        });
      });
    });

    it('يحتوي على معرفات ARIA مناسبة', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ recommendations: mockRecommendations }),
      });

      renderWithProviders(<SmartRecommendations />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getAllByRole('article')).toHaveLength(3); // 2 recommendations + articles
      });
    });
  });
});
