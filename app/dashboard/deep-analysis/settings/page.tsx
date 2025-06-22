'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  AlertCircle,
  CheckCircle,
  Sparkles,
  Brain,
  Zap,
  Shield
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// البرومبت الافتراضي
const DEFAULT_PROMPT = `أنت محلل استراتيجي خبير في وكالة سبق الإخبارية، متخصص في إعداد تحليلات عميقة ودقيقة للقراء في العالم العربي.

قم بإعداد تحليل استراتيجي عميق حول الموضوع التالي: {{title}}

السياق/المقال الأصلي:
{{articleText}}

زاوية التحليل المطلوبة: {{analysisAngle}}
مستوى العمق المطلوب: {{depthLevel}}
التصنيفات: {{categories}}

يجب أن يتضمن التحليل المحاور التالية بالترتيب:

1. **المقدمة** (150-200 كلمة):
   - خلفية موجزة عن الموضوع وسياقه الحالي
   - أهمية الموضوع للقارئ السعودي والعربي
   - نظرة عامة على ما سيتناوله التحليل

2. **الوضع الراهن والسياق** (300-400 كلمة):
   - تحليل الوضع الحالي بالأرقام والحقائق
   - الاستراتيجيات والسياسات الحالية المرتبطة
   - مقارنة مع التجارب الإقليمية والدولية

3. **التحديات الرئيسية** (400-500 كلمة):
   - التحديات التقنية والتشغيلية
   - التحديات التنظيمية والقانونية
   - التحديات الاقتصادية والمالية
   - التحديات الاجتماعية والثقافية
   - التحديات البيئية (إن وجدت)

4. **الفرص المستقبلية والابتكارات** (400-500 كلمة):
   - الفرص قصيرة المدى (1-2 سنة)
   - الفرص متوسطة المدى (3-5 سنوات)
   - الفرص طويلة المدى (5+ سنوات)
   - التقنيات والابتكارات الناشئة
   - نماذج الأعمال الجديدة المحتملة

5. **الأثر المتوقع** (300-400 كلمة):
   - الأثر الاقتصادي (أرقام وتوقعات)
   - الأثر المجتمعي والثقافي
   - الأثر على سوق العمل والوظائف
   - الأثر على جودة الحياة
   - الأثر على رؤية السعودية 2030

6. **دراسات الحالة والأمثلة** (200-300 كلمة):
   - أمثلة نجاح محلية أو إقليمية
   - دروس مستفادة من تجارب دولية
   - أفضل الممارسات القابلة للتطبيق

7. **التوصيات الاستراتيجية** (400-500 كلمة):
   - توصيات للقطاع الحكومي
   - توصيات للقطاع الخاص
   - توصيات للمؤسسات التعليمية والبحثية
   - توصيات للأفراد والمجتمع
   - خارطة طريق تنفيذية مقترحة

8. **الخلاصة والنظرة المستقبلية** (150-200 كلمة):
   - ملخص النقاط الرئيسية
   - السيناريوهات المستقبلية المحتملة
   - دعوة للعمل

متطلبات الأسلوب:
- استخدم لغة عربية فصيحة وواضحة
- تجنب المصطلحات المعقدة غير الضرورية
- استخدم الأرقام والإحصائيات عند توفرها
- اربط التحليل برؤية السعودية 2030 عند الإمكان
- استخدم عناوين فرعية واضحة لكل قسم
- أضف نقاط مرقمة أو نقاط للقوائم المهمة
- اجعل التحليل قابلاً للتنفيذ وليس نظرياً فقط`;

interface AISettings {
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  enableAutoSave: boolean;
  autoGenerateKeywords: boolean;
  autoGenerateSummary: boolean;
  qualityThreshold: number;
}

export default function DeepAnalysisSettingsPage() {
  const [settings, setSettings] = useState<AISettings>({
    prompt: DEFAULT_PROMPT,
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3,
    enableAutoSave: true,
    autoGenerateKeywords: true,
    autoGenerateSummary: true,
    qualityThreshold: 0.8
  });

  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const savedSettings = localStorage.getItem('deepAnalysisSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // تحميل مفتاح API
    const savedApiKey = localStorage.getItem('openaiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setSaveStatus('saving');

    try {
      // حفظ الإعدادات في localStorage
      localStorage.setItem('deepAnalysisSettings', JSON.stringify(settings));
      
      // حفظ مفتاح API بشكل منفصل
      if (apiKey) {
        localStorage.setItem('openaiApiKey', apiKey);
      }

      // في الإنتاج، يمكن حفظ الإعدادات في قاعدة البيانات
      // await fetch('/api/ai/deep-analysis/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ settings, apiKey })
      // });

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefault = () => {
    setSettings({
      ...settings,
      prompt: DEFAULT_PROMPT
    });
  };

  const testAPIConnection = async () => {
    if (!apiKey) {
      alert('الرجاء إدخال مفتاح API أولاً');
      return;
    }

    setIsLoading(true);
    try {
      // اختبار الاتصال بـ OpenAI
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });

      if (response.ok) {
        alert('تم الاتصال بنجاح مع OpenAI API');
      } else {
        alert('فشل الاتصال. تحقق من صحة مفتاح API');
      }
    } catch (error) {
      alert('حدث خطأ أثناء اختبار الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          إعدادات التحليل العميق
        </h1>
        <p className="text-muted-foreground">
          قم بتخصيص إعدادات الذكاء الاصطناعي والبرومبت المستخدم في توليد التحليلات
        </p>
      </div>

      <Tabs defaultValue="prompt" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            البرومبت
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            إعدادات AI
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            المميزات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>برومبت التحليل العميق</CardTitle>
              <CardDescription>
                قم بتخصيص البرومبت المستخدم لتوليد التحليلات. استخدم المتغيرات التالية:
                {`{{title}}`, `{{articleText}}`, `{{analysisAngle}}`, `{{depthLevel}}`, `{{categories}}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">نص البرومبت</Label>
                <Textarea
                  id="prompt"
                  value={settings.prompt}
                  onChange={(e) => setSettings({ ...settings, prompt: e.target.value })}
                  className="min-h-[400px] font-mono text-sm"
                  dir="rtl"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleResetToDefault}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  إعادة تعيين للافتراضي
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات نموذج AI</CardTitle>
              <CardDescription>
                قم بضبط معاملات نموذج الذكاء الاصطناعي للحصول على أفضل النتائج
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="model">النموذج</Label>
                  <select
                    id="model"
                    value={settings.model}
                    onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">الحد الأقصى للرموز</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={settings.maxTokens}
                    onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                    min={100}
                    max={8000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">
                    درجة الحرارة (Temperature): {settings.temperature}
                  </Label>
                  <input
                    id="temperature"
                    type="range"
                    value={settings.temperature}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    قيمة أقل = نتائج أكثر تحديداً، قيمة أعلى = نتائج أكثر إبداعاً
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topP">Top P: {settings.topP}</Label>
                  <input
                    id="topP"
                    type="range"
                    value={settings.topP}
                    onChange={(e) => setSettings({ ...settings, topP: parseFloat(e.target.value) })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequencyPenalty">
                    عقوبة التكرار: {settings.frequencyPenalty}
                  </Label>
                  <input
                    id="frequencyPenalty"
                    type="range"
                    value={settings.frequencyPenalty}
                    onChange={(e) => setSettings({ ...settings, frequencyPenalty: parseFloat(e.target.value) })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presencePenalty">
                    عقوبة الوجود: {settings.presencePenalty}
                  </Label>
                  <input
                    id="presencePenalty"
                    type="range"
                    value={settings.presencePenalty}
                    onChange={(e) => setSettings({ ...settings, presencePenalty: parseFloat(e.target.value) })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات API</CardTitle>
              <CardDescription>
                قم بإدخال مفتاح OpenAI API الخاص بك للاتصال بخدمات الذكاء الاصطناعي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  يتم حفظ مفتاح API بشكل آمن ولن يتم مشاركته مع أي جهة خارجية
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="apiKey">مفتاح OpenAI API</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={testAPIConnection}
                    disabled={isLoading || !apiKey}
                  >
                    اختبار الاتصال
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">كيفية الحصول على مفتاح API:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>قم بزيارة <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a></li>
                  <li>قم بتسجيل الدخول أو إنشاء حساب جديد</li>
                  <li>اذهب إلى قسم API Keys</li>
                  <li>انقر على "Create new secret key"</li>
                  <li>انسخ المفتاح والصقه هنا</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المميزات الإضافية</CardTitle>
              <CardDescription>
                قم بتفعيل أو تعطيل المميزات الإضافية للتحليل العميق
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoSave">الحفظ التلقائي</Label>
                    <p className="text-sm text-muted-foreground">
                      حفظ التحليلات تلقائياً كمسودة أثناء الكتابة
                    </p>
                  </div>
                  <Switch
                    id="autoSave"
                    checked={settings.enableAutoSave}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, enableAutoSave: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoKeywords">توليد الكلمات المفتاحية تلقائياً</Label>
                    <p className="text-sm text-muted-foreground">
                      استخراج الكلمات المفتاحية من المحتوى تلقائياً
                    </p>
                  </div>
                  <Switch
                    id="autoKeywords"
                    checked={settings.autoGenerateKeywords}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, autoGenerateKeywords: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoSummary">توليد الملخص تلقائياً</Label>
                    <p className="text-sm text-muted-foreground">
                      إنشاء ملخص تلقائي للتحليل
                    </p>
                  </div>
                  <Switch
                    id="autoSummary"
                    checked={settings.autoGenerateSummary}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, autoGenerateSummary: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualityThreshold">
                    حد الجودة المطلوب: {(settings.qualityThreshold * 100).toFixed(0)}%
                  </Label>
                  <input
                    id="qualityThreshold"
                    type="range"
                    value={settings.qualityThreshold}
                    onChange={(e) => setSettings({ ...settings, qualityThreshold: parseFloat(e.target.value) })}
                    min={0.5}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    التحليلات التي تقل جودتها عن هذا الحد سيتم تحذير المستخدم
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/dashboard/deep-analysis'}
        >
          إلغاء
        </Button>
        <Button 
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>جاري الحفظ...</>
          ) : (
            <>
              <Save className="h-4 w-4" />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </div>

      {saveStatus === 'saved' && (
        <Alert className="mt-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            تم حفظ الإعدادات بنجاح
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert className="mt-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            حدث خطأ أثناء حفظ الإعدادات
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 