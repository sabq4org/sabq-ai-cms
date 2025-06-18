'use client';

import { useState } from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';
import Header from '@/components/Header';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Paperclip,
  AlertCircle,
  CheckCircle,
  Loader2,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  FileVideo,
  Lightbulb,
  Flag,
  MessageCircle,
  Heart,
  HelpCircle
} from 'lucide-react';

// أنواع الرسائل
const messageTypes = [
  { value: 'suggestion', label: 'اقتراح', icon: Lightbulb, color: 'blue' },
  { value: 'complaint', label: 'بلاغ', icon: Flag, color: 'red' },
  { value: 'inquiry', label: 'استفسار', icon: HelpCircle, color: 'purple' },
  { value: 'feedback', label: 'ملاحظة', icon: MessageCircle, color: 'yellow' },
  { value: 'appreciation', label: 'شكر وتقدير', icon: Heart, color: 'pink' },
  { value: 'other', label: 'أخرى', icon: MessageSquare, color: 'gray' }
];

// أنواع الملفات المسموح بها
const allowedFileTypes = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf'],
  video: ['video/mp4', 'video/webm', 'video/ogg']
};

const maxFileSize = 10 * 1024 * 1024; // 10MB

export default function ContactPage() {
  const { darkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    message: '',
    email: '',
    attachment: null as File | null
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // التحقق من صحة البريد الإلكتروني
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // التحقق من الملف
  const validateFile = (file: File) => {
    const allAllowedTypes = [
      ...allowedFileTypes.image,
      ...allowedFileTypes.document,
      ...allowedFileTypes.video
    ];

    if (!allAllowedTypes.includes(file.type)) {
      return 'نوع الملف غير مسموح. يُسمح فقط بالصور، PDF، والفيديوهات القصيرة';
    }

    if (file.size > maxFileSize) {
      return 'حجم الملف كبير جداً. الحد الأقصى 10MB';
    }

    return null;
  };

  // معالج رفع الملف
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setErrors({ ...errors, attachment: error });
        return;
      }
      setFormData({ ...formData, attachment: file });
      setErrors({ ...errors, attachment: null });
    }
  };

  // إزالة الملف
  const removeFile = () => {
    setFormData({ ...formData, attachment: null });
    setErrors({ ...errors, attachment: null });
  };

  // الحصول على أيقونة الملف
  const getFileIcon = (file: File) => {
    if (allowedFileTypes.image.includes(file.type)) return ImageIcon;
    if (allowedFileTypes.document.includes(file.type)) return FileText;
    if (allowedFileTypes.video.includes(file.type)) return FileVideo;
    return FileText;
  };

  // التحقق من صحة النموذج
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.type) {
      newErrors.type = 'يرجى اختيار نوع الرسالة';
    }

    if (!formData.subject || formData.subject.length < 5) {
      newErrors.subject = 'يرجى كتابة عنوان واضح (5 أحرف على الأقل)';
    }

    if (formData.subject.length > 100) {
      newErrors.subject = 'العنوان طويل جداً (100 حرف كحد أقصى)';
    }

    if (!formData.message || formData.message.length < 20) {
      newErrors.message = 'يرجى كتابة رسالة واضحة (20 حرف على الأقل)';
    }

    if (!formData.email) {
      newErrors.email = 'يرجى إدخال البريد الإلكتروني';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // رفع الملف إذا وجد
      let fileUrl = null;
      if (formData.attachment) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.attachment);
        
        // محاكاة تقدم الرفع
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrl = uploadData.url;
        }
      }

      // إرسال الرسالة
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: formData.type,
          subject: formData.subject,
          message: formData.message,
          email: formData.email,
          file_url: fileUrl,
          status: 'new',
          created_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          type: '',
          subject: '',
          message: '',
          email: '',
          attachment: null
        });
        setUploadProgress(0);
        
        // إخفاء رسالة النجاح بعد 5 ثواني
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        throw new Error('فشل إرسال الرسالة');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Header />

      {/* Hero Section */}
      <section className={`relative py-20 overflow-hidden ${
        darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-purple-50'
      }`}>
        <div className="absolute inset-0">
          <div className={`absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl ${
            darkMode ? 'bg-blue-900/20' : 'bg-blue-200/50'
          }`}></div>
          <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl ${
            darkMode ? 'bg-purple-900/20' : 'bg-purple-200/50'
          }`}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-3xl mb-6 shadow-2xl">
              <Mail className="w-10 h-10" />
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              تواصل معنا
            </h1>
            <p className={`text-xl max-w-2xl mx-auto ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              نسعد بسماع آرائكم واقتراحاتكم وملاحظاتكم. رسالتك تهمنا وستصل إلى الفريق المختص
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className={`rounded-3xl shadow-xl overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Success Message */}
          {success && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 text-white rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 dark:text-green-300 mb-1">
                    تم إرسال رسالتك بنجاح!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    شكراً لتواصلك معنا. سنقوم بمراجعة رسالتك والرد عليك في أقرب وقت ممكن.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* نوع الرسالة */}
            <div>
              <label className={`block text-sm font-bold mb-3 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                نوع الرسالة <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {messageTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                          : darkMode
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${
                        isSelected 
                          ? `text-${type.color}-600`
                          : darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`text-xs font-medium ${
                        isSelected
                          ? `text-${type.color}-700 dark:text-${type.color}-400`
                          : darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.type && (
                <p className="text-red-500 text-sm mt-2">{errors.type}</p>
              )}
            </div>

            {/* عنوان الرسالة */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                عنوان الرسالة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                maxLength={100}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.subject
                    ? 'border-red-500'
                    : darkMode
                      ? 'border-gray-700 bg-gray-900 text-white focus:border-blue-500'
                      : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
                }`}
                placeholder="اكتب عنواناً واضحاً لرسالتك..."
              />
              <div className="flex items-center justify-between mt-1">
                {errors.subject && (
                  <p className="text-red-500 text-sm">{errors.subject}</p>
                )}
                <span className={`text-xs ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {formData.subject.length}/100
                </span>
              </div>
            </div>

            {/* نص الرسالة */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                نص الرسالة <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 resize-none ${
                  errors.message
                    ? 'border-red-500'
                    : darkMode
                      ? 'border-gray-700 bg-gray-900 text-white focus:border-blue-500'
                      : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
                }`}
                placeholder="اكتب تفاصيل رسالتك هنا..."
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.email
                    ? 'border-red-500'
                    : darkMode
                      ? 'border-gray-700 bg-gray-900 text-white focus:border-blue-500'
                      : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
                }`}
                placeholder="example@email.com"
                dir="ltr"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              <p className={`text-xs mt-1 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                سنستخدم بريدك الإلكتروني للرد على رسالتك فقط
              </p>
            </div>

            {/* المرفقات */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                المرفقات <span className="text-gray-500">(اختياري)</span>
              </label>
              
              {!formData.attachment ? (
                <label className={`flex items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                  darkMode
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept={[...allowedFileTypes.image, ...allowedFileTypes.document, ...allowedFileTypes.video].join(',')}
                    className="hidden"
                  />
                  <Upload className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div className="text-center">
                    <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      اضغط لرفع ملف
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      صور، PDF، أو فيديو (حتى 10MB)
                    </p>
                  </div>
                </label>
              ) : (
                <div className={`p-4 rounded-xl border-2 ${
                  darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const FileIcon = getFileIcon(formData.attachment);
                        return <FileIcon className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
                      })()}
                      <div>
                        <p className={`font-medium text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formData.attachment.name}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {(formData.attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                      }`}
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  {loading && uploadProgress > 0 && (
                    <div className="mt-3">
                      <div className={`h-2 rounded-full overflow-hidden ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-200'
                      }`}>
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className={`text-xs mt-1 text-center ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        جاري الرفع... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {errors.attachment && (
                <p className="text-red-500 text-sm mt-2">{errors.attachment}</p>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 dark:text-red-400 text-sm">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  loading
                    ? 'bg-gray-400'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري الإرسال...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>إرسال الرسالة</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            نحترم خصوصيتك ولن نشارك معلوماتك مع أي طرف ثالث
          </p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            يمكنك أيضاً التواصل معنا عبر البريد الإلكتروني: info@sabq.ai
          </p>
        </div>
      </section>
    </div>
  );
} 