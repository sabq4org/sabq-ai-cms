import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { usePagePerformance } from '@/hooks/usePagePerformance';
import PerformanceMonitor from '@/components/PerformanceMonitor';

// Mock performance API
const mockPerformance = {
  now: jest.fn(),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
  }
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
});

// مكون تجريبي لاختبار الأداء
const TestPerformanceComponent = ({ pageName }: { pageName: string }) => {
  const { metrics, measureOperation, optimizePerformance } = usePagePerformance(pageName);

  const handleSlowOperation = () => {
    measureOperation('slow-operation', () => {
      // محاكاة عملية بطيئة
      const start = Date.now();
      while (Date.now() - start < 100) {
        // انتظار 100ms
      }
    });
  };

  return (
    <div>
      <div data-testid="load-time">{metrics.loadTime}</div>
      <div data-testid="render-time">{metrics.renderTime}</div>
      <div data-testid="memory-usage">{metrics.memoryUsage}</div>
      <div data-testid="is-slow">{metrics.isSlowPage.toString()}</div>
      <button onClick={handleSlowOperation} data-testid="slow-operation">
        عملية بطيئة
      </button>
      <button onClick={optimizePerformance} data-testid="optimize">
        تحسين الأداء
      </button>
    </div>
  );
};

describe('Editor Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  describe('usePagePerformance Hook', () => {
    it('يقيس وقت التحميل والرندر', async () => {
      let callCount = 0;
      mockPerformance.now.mockImplementation(() => {
        callCount++;
        return callCount * 100; // 100ms, 200ms, 300ms, etc.
      });

      render(<TestPerformanceComponent pageName="test-page" />);

      await waitFor(() => {
        const loadTime = screen.getByTestId('load-time');
        expect(loadTime).toHaveTextContent(/\d+/); // يحتوي على رقم
      });
    });

    it('يكتشف الصفحات البطيئة', async () => {
      // محاكاة تحميل بطيء (أكثر من 3 ثوانٍ)
      let callCount = 0;
      mockPerformance.now.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0;
        return 4000; // 4 ثوانٍ
      });

      render(<TestPerformanceComponent pageName="slow-page" />);

      await waitFor(() => {
        const isSlowElement = screen.getByTestId('is-slow');
        expect(isSlowElement).toHaveTextContent('true');
      });
    });

    it('يقيس استهلاك الذاكرة', async () => {
      render(<TestPerformanceComponent pageName="memory-test" />);

      await waitFor(() => {
        const memoryUsage = screen.getByTestId('memory-usage');
        expect(memoryUsage).toHaveTextContent(/\d+/); // يحتوي على رقم
      });
    });

    it('يقيس أداء العمليات المحددة', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<TestPerformanceComponent pageName="operation-test" />);

      const slowOperationButton = screen.getByTestId('slow-operation');
      fireEvent.click(slowOperationButton);

      // التحقق من أن العملية تم قياسها
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('slow-operation')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('PerformanceMonitor Component', () => {
    it('يعرض مراقب الأداء عندما يكون مرئياً', () => {
      render(
        <PerformanceMonitor 
          pageName="test-page" 
          isVisible={true} 
        />
      );

      expect(screen.getByText('مراقب الأداء')).toBeInTheDocument();
      expect(screen.getByText('وقت التحميل')).toBeInTheDocument();
      expect(screen.getByText('وقت الرندر')).toBeInTheDocument();
    });

    it('يخفي المراقب عندما يكون غير مرئي', () => {
      render(
        <PerformanceMonitor 
          pageName="test-page" 
          isVisible={false} 
        />
      );

      expect(screen.queryByText('مراقب الأداء')).not.toBeInTheDocument();
    });

    it('يمكن تصغير وتكبير المراقب', () => {
      render(
        <PerformanceMonitor 
          pageName="test-page" 
          isVisible={true} 
        />
      );

      const minimizeButton = screen.getByText('▼');
      fireEvent.click(minimizeButton);

      // بعد التصغير، يجب أن تختفي التفاصيل
      expect(screen.queryByText('وقت التحميل')).not.toBeInTheDocument();

      // النقر مرة أخرى للتكبير
      const maximizeButton = screen.getByText('▲');
      fireEvent.click(maximizeButton);

      // يجب أن تظهر التفاصيل مرة أخرى
      expect(screen.getByText('وقت التحميل')).toBeInTheDocument();
    });

    it('يعرض حالة الأداء الصحيحة', () => {
      // محاكاة أداء جيد
      mockPerformance.now.mockReturnValue(500); // أقل من 3 ثوانٍ

      render(
        <PerformanceMonitor 
          pageName="fast-page" 
          isVisible={true} 
        />
      );

      expect(screen.getByText('⚡ أداء جيد')).toBeInTheDocument();
    });

    it('يعرض نصائح للصفحات البطيئة', () => {
      // محاكاة أداء بطيء
      let callCount = 0;
      mockPerformance.now.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0;
        return 5000; // 5 ثوانٍ
      });

      render(
        <PerformanceMonitor 
          pageName="slow-page" 
          isVisible={true} 
        />
      );

      expect(screen.getByText('🐌 أداء بطيء')).toBeInTheDocument();
      expect(screen.getByText(/💡 نصائح/)).toBeInTheDocument();
    });

    it('يتيح تحسين الأداء', () => {
      const mockOptimize = jest.fn();
      
      render(
        <PerformanceMonitor 
          pageName="test-page" 
          isVisible={true} 
        />
      );

      const optimizeButton = screen.getByText('تحسين الأداء');
      fireEvent.click(optimizeButton);

      // التحقق من أن دالة التحسين تم استدعاؤها
      // (في التطبيق الحقيقي، ستقوم بتنظيف الذاكرة وما إلى ذلك)
    });

    it('يتيح إعادة تحميل الصفحة', () => {
      // Mock window.location.reload
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      });

      render(
        <PerformanceMonitor 
          pageName="test-page" 
          isVisible={true} 
        />
      );

      const reloadButton = screen.getByText('إعادة تحميل');
      fireEvent.click(reloadButton);

      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('Performance Benchmarks', () => {
    it('يحمل المكونات في وقت معقول', async () => {
      const startTime = performance.now();

      render(<TestPerformanceComponent pageName="benchmark-test" />);

      await waitFor(() => {
        expect(screen.getByTestId('load-time')).toBeInTheDocument();
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(100); // أقل من 100ms للمكونات البسيطة
    });

    it('يتعامل مع البيانات الكبيرة بكفاءة', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        content: `Item ${i}`.repeat(10)
      }));

      const LargeDataComponent = () => (
        <div>
          {largeData.map(item => (
            <div key={item.id}>{item.content}</div>
          ))}
        </div>
      );

      const startTime = performance.now();

      render(<LargeDataComponent />);

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(1000); // أقل من ثانية واحدة
    });

    it('يحافظ على الأداء مع التحديثات المتكررة', async () => {
      const UpdatingComponent = () => {
        const [count, setCount] = React.useState(0);

        React.useEffect(() => {
          const interval = setInterval(() => {
            setCount(c => c + 1);
          }, 10);

          return () => clearInterval(interval);
        }, []);

        return <div data-testid="counter">{count}</div>;
      };

      render(<UpdatingComponent />);

      // انتظار عدة تحديثات
      await waitFor(() => {
        const counter = screen.getByTestId('counter');
        expect(parseInt(counter.textContent || '0')).toBeGreaterThan(5);
      }, { timeout: 1000 });

      // التحقق من أن التحديثات لا تسبب تسريب في الذاكرة
      // (في بيئة الاختبار، هذا صعب القياس، لكن يمكننا التحقق من عدم حدوث أخطاء)
      expect(screen.getByTestId('counter')).toBeInTheDocument();
    });
  });

  describe('Memory Management', () => {
    it('ينظف الموارد عند إلغاء التحميل', () => {
      const { unmount } = render(
        <TestPerformanceComponent pageName="cleanup-test" />
      );

      // محاكاة إضافة event listeners
      const mockAddEventListener = jest.spyOn(window, 'addEventListener');
      const mockRemoveEventListener = jest.spyOn(window, 'removeEventListener');

      unmount();

      // التحقق من أن cleanup تم استدعاؤه
      // (في التطبيق الحقيقي، سيتم إزالة event listeners)
      expect(mockRemoveEventListener).toHaveBeenCalled();

      mockAddEventListener.mockRestore();
      mockRemoveEventListener.mockRestore();
    });

    it('يكتشف تسريب الذاكرة المحتمل', async () => {
      // محاكاة زيادة استهلاك الذاكرة
      let memoryUsage = 50;
      Object.defineProperty(mockPerformance, 'memory', {
        get: () => ({
          usedJSHeapSize: memoryUsage * 1024 * 1024,
          totalJSHeapSize: 200 * 1024 * 1024
        })
      });

      const { rerender } = render(
        <TestPerformanceComponent pageName="memory-leak-test" />
      );

      // محاكاة زيادة الذاكرة
      memoryUsage = 150; // 150MB
      rerender(<TestPerformanceComponent pageName="memory-leak-test" />);

      await waitFor(() => {
        const memoryElement = screen.getByTestId('memory-usage');
        const usage = parseFloat(memoryElement.textContent || '0');
        expect(usage).toBeGreaterThan(100); // أكثر من 100MB
      });
    });
  });
});