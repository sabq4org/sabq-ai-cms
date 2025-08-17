import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditorErrorBoundary } from '@/components/ErrorBoundary/EditorErrorBoundary';

// مكون تجريبي يرمي خطأ
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('EditorErrorBoundary', () => {
  // إعادة تعيين console.error قبل كل اختبار
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('يعرض المحتوى بشكل طبيعي عندما لا يوجد خطأ', () => {
    render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={false} />
      </EditorErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('يعرض واجهة الخطأ عند حدوث خطأ', () => {
    render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    expect(screen.getByText('حدث خطأ في المحرر')).toBeInTheDocument();
    expect(screen.getByText(/عذراً، واجه المحرر مشكلة تقنية/)).toBeInTheDocument();
  });

  it('يعرض زر إعادة المحاولة', () => {
    render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    const retryButton = screen.getByText(/إعادة المحاولة/);
    expect(retryButton).toBeInTheDocument();
  });

  it('يعرض زر إعادة تعيين المحرر', () => {
    render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    const resetButton = screen.getByText('إعادة تعيين المحرر');
    expect(resetButton).toBeInTheDocument();
  });

  it('يستدعي onError callback عند حدوث خطأ', () => {
    const onErrorMock = jest.fn();
    
    render(
      <EditorErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('يعرض تفاصيل الخطأ في وضع التطوير', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    expect(screen.getByText('تفاصيل الخطأ (للمطورين)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('يخفي تفاصيل الخطأ في وضع الإنتاج', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    expect(screen.queryByText('تفاصيل الخطأ (للمطورين)')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('يعرض fallback مخصص عند توفيره', () => {
    const CustomFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
      <div>
        <p>Custom error: {error.message}</p>
        <button onClick={retry}>Custom retry</button>
      </div>
    );

    render(
      <EditorErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    expect(screen.getByText('Custom error: Test error')).toBeInTheDocument();
    expect(screen.getByText('Custom retry')).toBeInTheDocument();
  });

  it('يحد من عدد محاولات إعادة المحاولة', () => {
    const { rerender } = render(
      <EditorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EditorErrorBoundary>
    );

    // النقر على إعادة المحاولة عدة مرات
    for (let i = 0; i < 5; i++) {
      const retryButton = screen.queryByText(/إعادة المحاولة/);
      if (retryButton) {
        fireEvent.click(retryButton);
        rerender(
          <EditorErrorBoundary>
            <ThrowError shouldThrow={true} />
          </EditorErrorBoundary>
        );
      }
    }

    // يجب أن يختفي زر إعادة المحاولة بعد استنفاد المحاولات
    expect(screen.queryByText(/إعادة المحاولة/)).not.toBeInTheDocument();
  });
});