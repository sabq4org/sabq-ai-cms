'use client';

import React, { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Upload, Image as ImageIcon, Film, FileText, Link2, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
  disabled?: boolean;
}

export default function TinyMCEEditor({
  value,
  onChange,
  height = 500,
  placeholder = "ابدأ في كتابة محتواك هنا...",
  disabled = false
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // رفع الصور
  const imageUploadHandler = (blobInfo: any, progress: any) => {
    return new Promise<string>((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', blobInfo.blob(), blobInfo.filename());
      formData.append('type', 'articles'); // نوع الصور للمقالات

      setIsUploading(true);
      
      fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        return response.json();
      })
      .then(result => {
        setIsUploading(false);
        if (result.success) {
          toast.success('تم رفع الصورة بنجاح!');
          resolve(result.url);
        } else {
          throw new Error(result.error || 'فشل في رفع الصورة');
        }
      })
      .catch(error => {
        setIsUploading(false);
        toast.error(error.message || 'فشل في رفع الصورة');
        reject(error);
      });
    });
  };

  // إعدادات TinyMCE
  const editorConfig = {
    height,
    menubar: false,
    language: 'ar',
    directionality: 'rtl' as 'rtl',
    language_url: '/tinymce/langs/ar.js',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'wordcount', 'emoticons',
      'template', 'codesample', 'autoresize', 'quickbars', 'accordion'
    ],
    toolbar1: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor',
    toolbar2: 'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table link image media',
    toolbar3: 'removeformat | fullscreen preview code | emoticons charmap | template accordion',
    
    // إعدادات الصور
    images_upload_handler: imageUploadHandler,
    images_upload_url: '/api/upload/image',
    automatic_uploads: true,
    images_reuse_filename: true,
    paste_data_images: true,
    
    // إعدادات المحتوى
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        margin: 1rem;
        direction: rtl;
      }
      .mce-content-body { direction: rtl; text-align: right; }
      img { max-width: 100%; height: auto; }
      table { border-collapse: collapse; width: 100%; }
      table td, table th { border: 1px solid #ddd; padding: 8px; }
      blockquote { 
        border-right: 4px solid #ddd; 
        margin: 1rem 0; 
        padding: 0 1rem;
        font-style: italic;
        background: #f9f9f9;
      }
      pre { 
        background: #f4f4f4; 
        padding: 1rem; 
        border-radius: 4px; 
        overflow-x: auto;
      }
      .accordion { border: 1px solid #ddd; margin: 1rem 0; }
      .accordion-header { 
        background: #f5f5f5; 
        padding: 1rem; 
        cursor: pointer; 
        font-weight: bold;
      }
      .accordion-content { padding: 1rem; }
    `,
    
    // قوالب محتوى جاهزة
    templates: [
      {
        title: 'خبر عاجل',
        description: 'قالب للأخبار العاجلة',
        content: `
          <div style="border: 2px solid #e74c3c; padding: 20px; margin: 10px 0; background: #fdf2f2;">
            <h3 style="color: #e74c3c; margin: 0 0 10px 0;">🚨 خبر عاجل</h3>
            <p><strong>العنوان الرئيسي:</strong> [ضع العنوان هنا]</p>
            <p><strong>التفاصيل:</strong> [ضع التفاصيل هنا]</p>
            <p><strong>المصدر:</strong> [ضع المصدر هنا]</p>
          </div>
        `
      },
      {
        title: 'اقتباس مميز',
        description: 'قالب للاقتباسات المميزة',
        content: `
          <blockquote style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; border: none; font-size: 18px; margin: 20px 0;">
            <p style="margin: 0; font-style: normal;">"[ضع الاقتباس هنا]"</p>
            <footer style="margin-top: 10px; font-size: 14px; opacity: 0.9;">— [اسم المصدر]</footer>
          </blockquote>
        `
      },
      {
        title: 'تحليل إحصائي',
        description: 'قالب لعرض الإحصائيات',
        content: `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-right: 4px solid #007bff;">
            <h4 style="color: #007bff; margin: 0 0 15px 0;">📊 الأرقام تتحدث</h4>
            <table style="width: 100%; border: none;">
              <tr>
                <td style="border: none; padding: 10px; font-weight: bold;">المؤشر الأول:</td>
                <td style="border: none; padding: 10px; color: #007bff;">[قيمة]</td>
              </tr>
              <tr>
                <td style="border: none; padding: 10px; font-weight: bold;">المؤشر الثاني:</td>
                <td style="border: none; padding: 10px; color: #007bff;">[قيمة]</td>
              </tr>
            </table>
          </div>
        `
      }
    ],
    
    // إعدادات الوصول السريع
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
    quickbars_insert_toolbar: 'quickimage quicktable',
    
    // إعدادات إضافية
    placeholder,
    resize: true,
    branding: false,
    elementpath: false,
    statusbar: true,
    paste_auto_cleanup_on_paste: true,
    paste_remove_styles: false,
    paste_remove_styles_if_webkit: false,
    
    // معالجة الأحداث
    setup: (editor: any) => {
      editor.on('change', () => {
        const content = editor.getContent();
        onChange(content);
      });
      
      editor.on('init', () => {
        if (disabled) {
          editor.setMode('readonly');
        }
      });
    }
  };

  return (
    <div className="tinymce-editor-wrapper">
      {isUploading && (
        <div className="absolute top-0 right-0 z-50 bg-blue-500 text-white px-3 py-1 rounded-bl-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            جاري رفع الصورة...
          </div>
        </div>
      )}
      
      <Editor
        apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc" // مفتاح مجاني للتطوير
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        init={editorConfig}
      />
      
      {/* شريط أدوات إضافية */}
      <div className="mt-4 flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <button
          type="button"
          onClick={() => {
            const content = editorRef.current?.getContent();
            console.log('Word count:', content?.split(' ').length || 0);
            toast.success(`عدد الكلمات: ${content?.split(' ').length || 0}`);
          }}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <Hash className="w-4 h-4" />
          عدد الكلمات
        </button>
        
        <button
          type="button"
          onClick={() => {
            editorRef.current?.execCommand('mcePreview');
          }}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <FileText className="w-4 h-4" />
          معاينة
        </button>
        
        <button
          type="button"
          onClick={() => {
            editorRef.current?.execCommand('mceFullScreen');
          }}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <Film className="w-4 h-4" />
          ملء الشاشة
        </button>
      </div>
    </div>
  );
}
