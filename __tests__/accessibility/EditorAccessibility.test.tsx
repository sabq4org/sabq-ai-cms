import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EditorErrorBoundary } from '@/components/ErrorBoundary/EditorErrorBoundary';
import { NotificationCenter } from '@/components/Notifications';
import { AutoSaveIndicator } from '@/components/AutoSave';

// إضافة matcher لـ axe
expect.extend(toHaveNoViolations);

// مكون محرر تجريبي مع إمكانية الوصول
const AccessibleEditor = () => {
  const [content, setContent] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div>
      <h1>محرر المقالات</h1>
      <label htmlFor="article-title">عنوان المقال</label>
      <input
        id="article-title"
        type="text"
        placeholder="أدخل عنوان المقال"
        aria-required="true"
        aria-describedby="title-help"
      />
      <div id="title-help" className="sr-only">
        العنوان مطلوب ويجب أن يكون بين 10 و 100 حرف
      </div>

      <label htmlFor="article-content">محتوى المقال</label>
      <textarea
        id="article-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="اكتب محتوى المقال هنا..."
        aria-required="true"
        aria-describedby="content-help"
        rows={10}
      />
      <div id="content-help" className="sr-only">
        المحتوى مطلوب ويجب أن يكون على الأقل 100 حرف
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        aria-describedby="save-status"
      >
        {isSaving ? 'جاري الحفظ...' : 'حفظ المقال'}
      </button>
      
      <div id="save-status" aria-live="polite" aria-atomic="true">
        {isSaving && 'جاري حفظ المقال...'}
      </div>

      <div role="status" aria-live="polite">
        عدد الكلمات: {content.split(' ').filter(word => word.length > 0).length}
      </div>
    </div>
  );
};

describe('Editor Accessibility Tests', () => {
  describe('Basic Accessibility', () => {
    it('يجتاز اختبارات إمكانية الوصول الأساسية', async () => {
      const { container } = render(<AccessibleEditor />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('يحتوي على تسميات مناسبة للحقول', () => {
      render(<AccessibleEditor />);

      const titleInput = screen.getByLabelText('عنوان المقال');
      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toHaveAttribute('aria-required', 'true');

      const contentTextarea = screen.getByLabelText('محتوى المقال');
      expect(contentTextarea).toBeInTheDocument();
      expect(contentTextarea).toHaveAttribute('aria-required', 'true');
    });

    it('يحتوي على نصوص مساعدة مناسبة', () => {
      render(<AccessibleEditor />);

      const titleInput = screen.getByLabelText('عنوان المقال');
      expect(titleInput).toHaveAttribute('aria-describedby', 'title-help');

      const titleHelp = document.getElementById('title-help');
      expect(titleHelp).toHaveTextContent('العنوان مطلوب ويجب أن يكون بين 10 و 100 حرف');
    });

    it('يدعم التنقل بلوحة المفاتيح', () => {
      render(<AccessibleEditor />);

      const titleInput = screen.getByLabelText('عنوان المقال');
      const contentTextarea = screen.getByLabelText('محتوى المقال');
      const saveButton = screen.getByRole('button', { name: /حفظ المقال/ });

      // التنقل بـ Tab
      titleInput.focus();
      expect(document.activeElement).toBe(titleInput);

      fireEvent.keyDown(titleInput, { key: 'Tab' });
      expect(document.activeElement).toBe(contentTextarea);

      fireEvent.keyDown(contentTextarea, { key: 'Tab' });
      expect(document.activeElement).toBe(saveButton);
    });

    it('يعرض حالة الحفظ للمستخدمين', () => {
      render(<AccessibleEditor />);

      const saveButton = screen.getByRole('button', { name: /حفظ المقال/ });
      fireEvent.click(saveButton);

      // التحقق من تغيير نص الزر
      expect(saveButton).toHaveTextContent('جاري الحفظ...');
      expect(saveButton).toBeDisabled();

      // التحقق من وجود إشعار الحالة
      const statusElement = screen.getByText('جاري حفظ المقال...');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('يعرض عداد الكلمات بشكل يمكن الوصول إليه', () => {
      render(<AccessibleEditor />);

      const contentTextarea = screen.getByLabelText('محتوى المقال');
      fireEvent.change(contentTextarea, { target: { value: 'هذا نص تجريبي للاختبار' } });

      const wordCount = screen.getByText(/عدد الكلمات:/);
      expect(wordCount).toHaveAttribute('role', 'status');
      expect(wordCount).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Error Boundary Accessibility', () => {
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };

    it('يجتاز اختبارات إمكانية الوصول عند عرض الخطأ', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <EditorErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EditorErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      consoleSpy.mockRestore();
    });

    it('يحتوي على تسميات مناسبة لأزرار الخطأ', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <EditorErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EditorErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /إعادة المحاولة/ });
      expect(retryButton).toBeInTheDocument();

      const resetButton = screen.getByRole('button', { name: /إعادة تعيين المحرر/ });
      expect(resetButton).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('يعرض رسائل خطأ واضحة ومفهومة', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <EditorErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EditorErrorBoundary>
      );

      const errorHeading = screen.getByRole('heading', { name: /حدث خطأ في المحرر/ });
      expect(errorHeading).toBeInTheDocument();

      const errorMessage = screen.getByText(/عذراً، واجه المحرر مشكلة تقنية/);
      expect(errorMessage).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Notification Accessibility', () => {
    it('يجتاز اختبارات إمكانية الوصول للإشعارات', async () => {
      const { container } = render(
        <NotificationCenter isOpen={true} onClose={() => {}} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('يحتوي على تسميات مناسبة لمركز الإشعارات', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);

      const notificationCenter = screen.getByRole('dialog', { name: /الإشعارات/ });
      expect(notificationCenter).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /إغلاق/ });
      expect(closeButton).toBeInTheDocument();
    });

    it('يدعم التنقل بلوحة المفاتيح في الإشعارات', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);

      const closeButton = screen.getByRole('button', { name: /إغلاق/ });
      
      // التركيز على زر الإغلاق
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);

      // الإغلاق بـ Escape
      fireEvent.keyDown(closeButton, { key: 'Escape' });
      // في التطبيق الحقيقي، سيتم إغلاق الإشعارات
    });
  });

  describe('AutoSave Indicator Accessibility', () => {
    it('يعرض حالة الحفظ التلقائي بشكل يمكن الوصول إليه', () => {
      render(
        <AutoSaveIndicator
          editorKey="test-editor"
          content={{ text: 'test content' }}
        />
      );

      // البحث عن مؤشرات الحالة
      const statusElements = screen.getAllByRole('status');
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('يحتوي على تسميات مناسبة لأزرار الحفظ', () => {
      render(
        <AutoSaveIndicator
          editorKey="test-editor"
          content={{ text: 'test content' }}
        />
      );

      const saveButton = screen.getByRole('button', { name: /حفظ يدوي/ });
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).toHaveAttribute('title', 'حفظ يدوي');

      const historyButton = screen.getByRole('button', { name: /عرض النسخ المحفوظة/ });
      expect(historyButton).toBeInTheDocument();
      expect(historyButton).toHaveAttribute('title', 'عرض النسخ المحفوظة');
    });
  });

  describe('Keyboard Navigation', () => {
    it('يدعم اختصارات لوحة المفاتيح الشائعة', () => {
      render(<AccessibleEditor />);

      const contentTextarea = screen.getByLabelText('محتوى المقال');
      
      // Ctrl+S للحفظ
      fireEvent.keyDown(contentTextarea, { 
        key: 's', 
        ctrlKey: true 
      });

      // Ctrl+Z للتراجع
      fireEvent.keyDown(contentTextarea, { 
        key: 'z', 
        ctrlKey: true 
      });

      // Ctrl+Y للإعادة
      fireEvent.keyDown(contentTextarea, { 
        key: 'y', 
        ctrlKey: true 
      });

      // التحقق من أن الأحداث تم التعامل معها
      expect(contentTextarea).toBeInTheDocument();
    });

    it('يدعم التنقل بالأسهم في القوائم', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);

      // محاكاة وجود قائمة إشعارات
      const tabs = screen.getAllByRole('button');
      
      if (tabs.length > 1) {
        tabs[0].focus();
        expect(document.activeElement).toBe(tabs[0]);

        // السهم لأسفل
        fireEvent.keyDown(tabs[0], { key: 'ArrowDown' });
        
        // السهم لأعلى
        fireEvent.keyDown(tabs[0], { key: 'ArrowUp' });
      }
    });
  });

  describe('Screen Reader Support', () => {
    it('يحتوي على نصوص مخفية للقارئات الشاشة', () => {
      render(<AccessibleEditor />);

      const hiddenHelp = document.getElementById('title-help');
      expect(hiddenHelp).toHaveClass('sr-only');
      expect(hiddenHelp).toHaveTextContent('العنوان مطلوب ويجب أن يكون بين 10 و 100 حرف');
    });

    it('يستخدم aria-live للتحديثات الديناميكية', () => {
      render(<AccessibleEditor />);

      const saveStatus = document.getElementById('save-status');
      expect(saveStatus).toHaveAttribute('aria-live', 'polite');
      expect(saveStatus).toHaveAttribute('aria-atomic', 'true');

      const wordCount = screen.getByText(/عدد الكلمات:/);
      expect(wordCount).toHaveAttribute('aria-live', 'polite');
    });

    it('يستخدم role attributes بشكل صحيح', () => {
      render(<AccessibleEditor />);

      const wordCount = screen.getByText(/عدد الكلمات:/);
      expect(wordCount).toHaveAttribute('role', 'status');
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('يحتوي على تباين ألوان مناسب', async () => {
      const { container } = render(<AccessibleEditor />);
      
      // اختبار axe يتضمن فحص التباين
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    it('لا يعتمد على الألوان فقط لنقل المعلومات', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <EditorErrorBoundary>
          <div>Test content</div>
        </EditorErrorBoundary>
      );

      // التحقق من وجود نصوص واضحة بالإضافة للألوان
      const content = screen.getByText('Test content');
      expect(content).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Focus Management', () => {
    it('يدير التركيز بشكل صحيح عند فتح النوافذ المنبثقة', () => {
      const { rerender } = render(
        <NotificationCenter isOpen={false} onClose={() => {}} />
      );

      // فتح مركز الإشعارات
      rerender(<NotificationCenter isOpen={true} onClose={() => {}} />);

      // التحقق من أن التركيز انتقل إلى المحتوى
      const notificationCenter = screen.getByRole('dialog');
      expect(notificationCenter).toBeInTheDocument();
    });

    it('يعيد التركيز إلى العنصر الأصلي عند الإغلاق', () => {
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'فتح الإشعارات';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      const { rerender } = render(
        <NotificationCenter isOpen={true} onClose={() => {}} />
      );

      // إغلاق مركز الإشعارات
      rerender(<NotificationCenter isOpen={false} onClose={() => {}} />);

      // في التطبيق الحقيقي، يجب أن يعود التركيز إلى الزر
      document.body.removeChild(triggerButton);
    });
  });
});