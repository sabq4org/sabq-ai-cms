import { Download, FileText, Code, Settings, BarChart3, FileJson, FileCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FileDownloads = ({ files }) => {
  const getFileIcon = (type) => {
    switch (type) {
      case 'test':
        return <FileCode className="w-5 h-5 text-blue-500" />;
      case 'example':
        return <Code className="w-5 h-5 text-green-500" />;
      case 'config':
        return <Settings className="w-5 h-5 text-yellow-500" />;
      case 'result':
        return <BarChart3 className="w-5 h-5 text-purple-500" />;
      case 'log':
        return <FileText className="w-5 h-5 text-gray-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'test':
        return 'bg-blue-100 text-blue-800';
      case 'example':
        return 'bg-green-100 text-green-800';
      case 'config':
        return 'bg-yellow-100 text-yellow-800';
      case 'result':
        return 'bg-purple-100 text-purple-800';
      case 'log':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeName = (type) => {
    switch (type) {
      case 'test':
        return 'ملف اختبار';
      case 'example':
        return 'مثال';
      case 'config':
        return 'تكوين';
      case 'result':
        return 'نتيجة';
      case 'log':
        return 'سجل';
      default:
        return 'ملف';
    }
  };

  const handleDownload = (fileName) => {
    // في التطبيق الحقيقي، هذا سيكون رابط تحميل فعلي
    alert(`تحميل الملف: ${fileName}\n\nملاحظة: في النسخة التجريبية، الملفات متاحة في المجلد الأصلي للمشروع.`);
  };

  const groupedFiles = files.reduce((acc, file) => {
    if (!acc[file.type]) {
      acc[file.type] = [];
    }
    acc[file.type].push(file);
    return acc;
  }, {});

  return (
    <section className="py-12 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          الملفات والأدوات المتاحة
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(groupedFiles).map(([type, typeFiles]) => (
            <Card key={type} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getFileIcon(type)}
                  {getFileTypeName(type)}
                  <Badge className={getFileTypeColor(type)}>
                    {typeFiles.length} ملف
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {typeFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3 flex-1">
                        {getFileIcon(file.type)}
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{file.name}</div>
                          <div className="text-xs text-gray-600 leading-relaxed">
                            {file.description}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownload(file.name)}
                        className="ml-3 flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        تحميل
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <FileCode className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {files.filter(f => f.type === 'test' || f.type === 'example').length}
              </div>
              <div className="text-sm text-blue-700">ملفات الكود والأمثلة</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {files.filter(f => f.type === 'result').length}
              </div>
              <div className="text-sm text-purple-700">ملفات النتائج والتقارير</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <Settings className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-600 mb-2">
                {files.filter(f => f.type === 'config' || f.type === 'log').length}
              </div>
              <div className="text-sm text-green-700">ملفات التكوين والسجلات</div>
            </CardContent>
          </Card>
        </div>

        {/* تعليمات الاستخدام */}
        <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-800">تعليمات الاستخدام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-indigo-700 mb-2">ملفات الاختبار</h4>
                <p className="text-sm text-indigo-600 mb-3">
                  استخدم هذه الملفات لاختبار الـ API مع بياناتك الخاصة
                </p>
                <code className="text-xs bg-indigo-100 p-2 rounded block">
                  python3 spa_api_test.py
                </code>
              </div>
              
              <div>
                <h4 className="font-semibold text-indigo-700 mb-2">أمثلة التكامل</h4>
                <p className="text-sm text-indigo-600 mb-3">
                  ابدأ بالمثال البسيط ثم انتقل للدليل المتقدم
                </p>
                <code className="text-xs bg-indigo-100 p-2 rounded block">
                  python3 spa_api_simple_example.py
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FileDownloads;

