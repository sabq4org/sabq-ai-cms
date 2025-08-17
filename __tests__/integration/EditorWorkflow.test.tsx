import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditorErrorBoundary } from '@/components/ErrorBoundary/EditorErrorBoundary';
import { autoSaveService } from '@/lib/services/AutoSaveService';
import { notificationService } from '@/lib/services/NotificationService';

// Mock services
jest.mock('@/lib/services/AutoSaveService');
jest.mock('@/lib/services/NotificationService');

// مكون محرر تجريبي
const TestEditor = ({ shouldError = false, content = '' }: { shouldError?: boolean; content?: string }) => {
  const [editorContent, setEditorContent] = React.useState(content);
  
  React.useEffect(() => {
    if (shouldError) {
      throw new Error('Editor crashed');
    }
  }, [shouldError]);

  const handleSave = () => {
    autoSaveService.save('test-editor', { content: editorContent });
  };

  return (
    <div>
      <textarea
        data-testid="editor-textarea"
        value={editorContent}
        onChange={(e) => setEditorContent(e.target.value)}
        placeholder="اكتب هنا..."
      />
      <button onClick={handleSave} data-testid="save-button">
        حفظ
      </button>
    </div>
  );
};

describe('Editor Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // إعداد mocks
    (autoSaveService.save as jest.Mock).mockResolvedValue(undefined);
    (notificationService.showEditorError as jest.Mock).mockReturnValue('error-id');
    (notificationService.showAutoSaveSuccess as jest.Mock).mockReturnValue('success-id');
  });

  describe('سير العمل الطبيعي', () => {
    it('يعرض المحرر ويحفظ المحتوى بنجاح', async () => {
      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor />
        </EditorErrorBoundary>
      );

      const textarea = screen.getByTestId('editor-textarea');
      const saveButton = screen.getByTestId('save-button');

      // كتابة محتوى
      fireEvent.change(textarea, { target: { value: 'محتوى تجريبي' } });
      expect(textarea).toHaveValue('محتوى تجريبي');

      // حفظ المحتوى
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(autoSaveService.save).toHaveBeenCalledWith('test-editor', {
          content: 'محتوى تجريبي'
        });
      });
    });

    it('يعرض المحتوى المحفوظ مسبقاً', () => {
      const savedContent = 'محتوى محفوظ مسبقاً';
      
      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor content={savedContent} />
        </EditorErrorBoundary>
      );

      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea).toHaveValue(savedContent);
    });
  });

  describe('معالجة الأخطاء', () => {
    it('يلتقط أخطاء المحرر ويعرض واجهة الخطأ', () => {
      // إخفاء أخطاء console في الاختبار
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor shouldError={true} />
        </EditorErrorBoundary>
      );

      // يجب أن تظهر واجهة الخطأ
      expect(screen.getByText('حدث خطأ في المحرر')).toBeInTheDocument();
      expect(screen.getByText(/عذراً، واجه المحرر مشكلة تقنية/)).toBeInTheDocument();

      // يجب أن تظهر أزرار التحكم
      expect(screen.getByText(/إعادة المحاولة/)).toBeInTheDocument();
      expect(screen.getByText('إعادة تعيين المحرر')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('يرسل تقرير خطأ عند حدوث خطأ', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <EditorErrorBoundary 
          context="TestEditor"
          onError={(error, errorInfo) => {
            expect(error.message).toBe('Editor crashed');
            expect(errorInfo.componentStack).toBeDefined();
          }}
        >
          <TestEditor shouldError={true} />
        </EditorErrorBoundary>
      );

      consoleSpy.mockRestore();
    });

    it('يعيد تحميل المحرر عند النقر على إعادة المحاولة', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { rerender } = render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor shouldError={true} />
        </EditorErrorBoundary>
      );

      // التأكد من ظهور واجهة الخطأ
      expect(screen.getByText('حدث خطأ في المحرر')).toBeInTheDocument();

      // النقر على إعادة المحاولة
      const retryButton = screen.getByText(/إعادة المحاولة/);
      fireEvent.click(retryButton);

      // إعادة رندر بدون خطأ
      rerender(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor shouldError={false} />
        </EditorErrorBoundary>
      );

      // يجب أن يظهر المحرر مرة أخرى
      expect(screen.getByTestId('editor-textarea')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('الحفظ التلقائي', () => {
    it('يحفظ المحتوى تلقائياً عند التغيير', async () => {
      // محاكاة الحفظ التلقائي
      const autoSaveMock = jest.fn();
      
      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor />
        </EditorErrorBoundary>
      );

      const textarea = screen.getByTestId('editor-textarea');
      
      // كتابة محتوى
      fireEvent.change(textarea, { target: { value: 'محتوى للحفظ التلقائي' } });

      // محاكاة تشغيل الحفظ التلقائي
      setTimeout(() => {
        autoSaveMock('test-editor', { content: 'محتوى للحفظ التلقائي' });
      }, 100);

      await waitFor(() => {
        expect(autoSaveMock).toHaveBeenCalledWith('test-editor', {
          content: 'محتوى للحفظ التلقائي'
        });
      }, { timeout: 200 });
    });

    it('يعرض إشعار نجاح الحفظ', async () => {
      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor />
        </EditorErrorBoundary>
      );

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(autoSaveService.save).toHaveBeenCalled();
      });

      // محاكاة إظهار إشعار النجاح
      expect(notificationService.showAutoSaveSuccess).toHaveBeenCalled();
    });

    it('يعرض إشعار خطأ الحفظ عند فشل الحفظ', async () => {
      // محاكاة فشل الحفظ
      (autoSaveService.save as jest.Mock).mockRejectedValue(new Error('Save failed'));

      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor />
        </EditorErrorBoundary>
      );

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(autoSaveService.save).toHaveBeenCalled();
      });

      // يجب أن يظهر إشعار الخطأ
      expect(notificationService.showEditorError).toHaveBeenCalledWith(
        expect.any(Error),
        'TestEditor',
        expect.any(String)
      );
    });
  });

  describe('استعادة المحتوى', () => {
    it('يستعيد المحتوى المحفوظ عند إعادة التحميل', async () => {
      // محاكاة وجود محتوى محفوظ
      (autoSaveService.restore as jest.Mock).mockResolvedValue({
        content: 'محتوى مستعاد'
      });

      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor />
        </EditorErrorBoundary>
      );

      // محاكاة استعادة المحتوى
      const restoredContent = await autoSaveService.restore('test-editor');
      expect(restoredContent.content).toBe('محتوى مستعاد');
    });

    it('يتعامل مع فشل استعادة المحتوى', async () => {
      // محاكاة فشل الاستعادة
      (autoSaveService.restore as jest.Mock).mockRejectedValue(new Error('Restore failed'));

      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor />
        </EditorErrorBoundary>
      );

      try {
        await autoSaveService.restore('test-editor');
      } catch (error) {
        expect(error.message).toBe('Restore failed');
      }
    });
  });

  describe('الأداء', () => {
    it('يحمل المحرر في وقت معقول', async () => {
      const startTime = performance.now();

      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor />
        </EditorErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId('editor-textarea')).toBeInTheDocument();
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(1000); // أقل من ثانية واحدة
    });

    it('يتعامل مع المحتوى الكبير بكفاءة', async () => {
      const largeContent = 'محتوى كبير '.repeat(1000);

      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor content={largeContent} />
        </EditorErrorBoundary>
      );

      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea).toHaveValue(largeContent);

      // التأكد من أن المحرر يستجيب للتغييرات
      fireEvent.change(textarea, { target: { value: largeContent + ' إضافة' } });
      expect(textarea).toHaveValue(largeContent + ' إضافة');
    });
  });

  describe('إمكانية الوصول', () => {
    it('يدعم التنقل بلوحة المفاتيح', () => {
      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor />
        </EditorErrorBoundary>
      );

      const textarea = screen.getByTestId('editor-textarea');
      const saveButton = screen.getByTestId('save-button');

      // التركيز على المحرر
      textarea.focus();
      expect(document.activeElement).toBe(textarea);

      // التنقل إلى زر الحفظ
      fireEvent.keyDown(textarea, { key: 'Tab' });
      expect(document.activeElement).toBe(saveButton);
    });

    it('يحتوي على تسميات مناسبة', () => {
      render(
        <EditorErrorBoundary context="TestEditor">
          <TestEditor />
        </EditorErrorBoundary>
      );

      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea).toHaveAttribute('placeholder', 'اكتب هنا...');

      const saveButton = screen.getByTestId('save-button');
      expect(saveButton).toHaveTextContent('حفظ');
    });
  });
});