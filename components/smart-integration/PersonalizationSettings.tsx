'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Palette,
  Globe,
  Bell,
  Shield,
  BookOpen,
  User,
  Heart,
  Clock,
  Filter,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Monitor,
  Mail,
  Smartphone,
  Calendar,
  Tags,
  MapPin,
  Link,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Minus,
  Edit3,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useGlobalStore, useAuth } from '@/stores/globalStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'react-hot-toast';

// ===========================================
// Types
// ===========================================

interface PersonalizationSettings {
  theme: {
    mode: 'light' | 'dark' | 'auto';
    primaryColor: string;
    fontSize: number;
    fontFamily: string;
    compactMode: boolean;
    animations: boolean;
  };
  language: {
    primary: 'ar' | 'en';
    dateFormat: 'hijri' | 'gregorian';
    numbers: 'arabic' | 'western';
    direction: 'rtl' | 'ltr' | 'auto';
  };
  notifications: {
    enabled: boolean;
    channels: {
      push: boolean;
      email: boolean;
      sms: boolean;
      inApp: boolean;
    };
    types: {
      socialInteraction: boolean;
      contentRecommendation: boolean;
      authorUpdate: boolean;
      similarContent: boolean;
      breaking: boolean;
      trending: boolean;
    };
    timing: {
      quietHours: {
        enabled: boolean;
        start: string;
        end: string;
      };
      frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
      smartTiming: boolean;
    };
    sound: {
      enabled: boolean;
      volume: number;
      type: 'default' | 'subtle' | 'distinctive';
    };
  };
  content: {
    interests: string[];
    categories: string[];
    authors: string[];
    tags: string[];
    readingLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
    contentLength: 'short' | 'medium' | 'long' | 'all';
    language: string[];
    excludeTopics: string[];
    autoplay: boolean;
    recommendations: {
      enabled: boolean;
      algorithm: 'collaborative' | 'content' | 'hybrid';
      diversity: number;
      recency: number;
      popularity: number;
    };
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    personalization: boolean;
    shareActivity: boolean;
    profileVisibility: 'public' | 'followers' | 'private';
    searchable: boolean;
    showEmail: boolean;
    showLocation: boolean;
    trackingConsent: boolean;
    marketingConsent: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    colorBlindSupport: boolean;
  };
  advanced: {
    betaFeatures: boolean;
    experimentalUI: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    customCSS: string;
    webhookUrl: string;
  };
}

// ===========================================
// API Functions
// ===========================================

const fetchSettings = async (): Promise<PersonalizationSettings> => {
  const response = await fetch('/api/settings/personalization', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب الإعدادات');
  }

  return response.json();
};

const updateSettings = async (settings: Partial<PersonalizationSettings>): Promise<PersonalizationSettings> => {
  const response = await fetch('/api/settings/personalization', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error('فشل في حفظ الإعدادات');
  }

  return response.json();
};

const exportSettings = async (): Promise<Blob> => {
  const response = await fetch('/api/settings/export', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في تصدير الإعدادات');
  }

  return response.blob();
};

const importSettings = async (file: File): Promise<PersonalizationSettings> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/settings/import', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('فشل في استيراد الإعدادات');
  }

  return response.json();
};

// ===========================================
// Default Settings
// ===========================================

const defaultSettings: PersonalizationSettings = {
  theme: {
    mode: 'auto',
    primaryColor: '#3B82F6',
    fontSize: 16,
    fontFamily: 'Cairo',
    compactMode: false,
    animations: true,
  },
  language: {
    primary: 'ar',
    dateFormat: 'hijri',
    numbers: 'arabic',
    direction: 'rtl',
  },
  notifications: {
    enabled: true,
    channels: {
      push: true,
      email: true,
      sms: false,
      inApp: true,
    },
    types: {
      socialInteraction: true,
      contentRecommendation: true,
      authorUpdate: true,
      similarContent: true,
      breaking: true,
      trending: false,
    },
    timing: {
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
      },
      frequency: 'immediate',
      smartTiming: true,
    },
    sound: {
      enabled: true,
      volume: 50,
      type: 'default',
    },
  },
  content: {
    interests: [],
    categories: [],
    authors: [],
    tags: [],
    readingLevel: 'intermediate',
    contentLength: 'all',
    language: ['ar'],
    excludeTopics: [],
    autoplay: false,
    recommendations: {
      enabled: true,
      algorithm: 'hybrid',
      diversity: 50,
      recency: 30,
      popularity: 20,
    },
  },
  privacy: {
    dataCollection: true,
    analytics: true,
    personalization: true,
    shareActivity: true,
    profileVisibility: 'public',
    searchable: true,
    showEmail: false,
    showLocation: false,
    trackingConsent: true,
    marketingConsent: false,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    colorBlindSupport: false,
  },
  advanced: {
    betaFeatures: false,
    experimentalUI: false,
    advancedAnalytics: false,
    apiAccess: false,
    customCSS: '',
    webhookUrl: '',
  },
};

// ===========================================
// Components
// ===========================================

const ThemeSettings = ({ 
  settings, 
  onChange 
}: { 
  settings: PersonalizationSettings['theme'];
  onChange: (theme: Partial<PersonalizationSettings['theme']>) => void;
}) => {
  const colors = [
    { name: 'أزرق', value: '#3B82F6' },
    { name: 'أخضر', value: '#10B981' },
    { name: 'بنفسجي', value: '#8B5CF6' },
    { name: 'أحمر', value: '#EF4444' },
    { name: 'برتقالي', value: '#F59E0B' },
    { name: 'وردي', value: '#EC4899' },
  ];

  const fonts = [
    { name: 'Cairo', value: 'Cairo' },
    { name: 'Tajawal', value: 'Tajawal' },
    { name: 'Amiri', value: 'Amiri' },
    { name: 'Noto Sans Arabic', value: 'Noto Sans Arabic' },
  ];

  return (
    <div className="space-y-6">
      {/* Theme mode */}
      <div>
        <Label className="text-base font-medium">نمط المظهر</Label>
        <RadioGroup
          value={settings.mode}
          onValueChange={(value) => onChange({ mode: value as 'light' | 'dark' | 'auto' })}
          className="flex flex-col space-y-2 mt-2"
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              فاتح
            </Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              داكن
            </Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="auto" id="auto" />
            <Label htmlFor="auto" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              تلقائي
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Primary color */}
      <div>
        <Label className="text-base font-medium">اللون الأساسي</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => onChange({ primaryColor: color.value })}
              className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${
                settings.primaryColor === color.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color.value }}
              />
              <span className="text-sm">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font settings */}
      <div>
        <Label className="text-base font-medium">الخط</Label>
        <Select value={settings.fontFamily} onValueChange={(value) => onChange({ fontFamily: value })}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font size */}
      <div>
        <Label className="text-base font-medium">حجم الخط</Label>
        <div className="mt-2">
          <Slider
            value={[settings.fontSize]}
            onValueChange={([value]) => onChange({ fontSize: value })}
            min={12}
            max={24}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>صغير (12px)</span>
            <span>متوسط (16px)</span>
            <span>كبير (24px)</span>
          </div>
        </div>
      </div>

      {/* UI preferences */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">الوضع المضغوط</Label>
            <p className="text-sm text-gray-600">عرض أكثر محتوى في مساحة أقل</p>
          </div>
          <Switch
            checked={settings.compactMode}
            onCheckedChange={(checked) => onChange({ compactMode: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">الحركات والانتقالات</Label>
            <p className="text-sm text-gray-600">تفعيل تأثيرات الحركة</p>
          </div>
          <Switch
            checked={settings.animations}
            onCheckedChange={(checked) => onChange({ animations: checked })}
          />
        </div>
      </div>
    </div>
  );
};

const NotificationSettings = ({ 
  settings, 
  onChange 
}: { 
  settings: PersonalizationSettings['notifications'];
  onChange: (notifications: Partial<PersonalizationSettings['notifications']>) => void;
}) => {
  return (
    <div className="space-y-6">
      {/* Master toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">تفعيل الإشعارات</Label>
          <p className="text-sm text-gray-600">تشغيل أو إيقاف جميع الإشعارات</p>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(checked) => onChange({ enabled: checked })}
        />
      </div>

      {settings.enabled && (
        <>
          {/* Channels */}
          <div>
            <Label className="text-base font-medium mb-4 block">قنوات الإشعارات</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span>إشعارات الدفع</span>
                </div>
                <Switch
                  checked={settings.channels.push}
                  onCheckedChange={(checked) => 
                    onChange({ channels: { ...settings.channels, push: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-500" />
                  <span>البريد الإلكتروني</span>
                </div>
                <Switch
                  checked={settings.channels.email}
                  onCheckedChange={(checked) => 
                    onChange({ channels: { ...settings.channels, email: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-500" />
                  <span>الرسائل النصية</span>
                </div>
                <Switch
                  checked={settings.channels.sms}
                  onCheckedChange={(checked) => 
                    onChange({ channels: { ...settings.channels, sms: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-500" />
                  <span>داخل التطبيق</span>
                </div>
                <Switch
                  checked={settings.channels.inApp}
                  onCheckedChange={(checked) => 
                    onChange({ channels: { ...settings.channels, inApp: checked } })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Types */}
          <div>
            <Label className="text-base font-medium mb-4 block">أنواع الإشعارات</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>التفاعل الاجتماعي</span>
                </div>
                <Switch
                  checked={settings.types.socialInteraction}
                  onCheckedChange={(checked) => 
                    onChange({ types: { ...settings.types, socialInteraction: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>توصيات المحتوى</span>
                </div>
                <Switch
                  checked={settings.types.contentRecommendation}
                  onCheckedChange={(checked) => 
                    onChange({ types: { ...settings.types, contentRecommendation: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-500" />
                  <span>تحديثات الكُتاب</span>
                </div>
                <Switch
                  checked={settings.types.authorUpdate}
                  onCheckedChange={(checked) => 
                    onChange({ types: { ...settings.types, authorUpdate: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-500" />
                  <span>المحتوى المشابه</span>
                </div>
                <Switch
                  checked={settings.types.similarContent}
                  onCheckedChange={(checked) => 
                    onChange({ types: { ...settings.types, similarContent: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>الأخبار العاجلة</span>
                </div>
                <Switch
                  checked={settings.types.breaking}
                  onCheckedChange={(checked) => 
                    onChange({ types: { ...settings.types, breaking: checked } })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Timing */}
          <div>
            <Label className="text-base font-medium mb-4 block">إعدادات التوقيت</Label>
            
            <div className="space-y-4">
              {/* Quiet hours */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>ساعات الهدوء</Label>
                  <Switch
                    checked={settings.timing.quietHours.enabled}
                    onCheckedChange={(checked) => 
                      onChange({ 
                        timing: { 
                          ...settings.timing, 
                          quietHours: { ...settings.timing.quietHours, enabled: checked }
                        }
                      })
                    }
                  />
                </div>
                
                {settings.timing.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">من</Label>
                      <Input
                        type="time"
                        value={settings.timing.quietHours.start}
                        onChange={(e) => 
                          onChange({
                            timing: {
                              ...settings.timing,
                              quietHours: { ...settings.timing.quietHours, start: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm">إلى</Label>
                      <Input
                        type="time"
                        value={settings.timing.quietHours.end}
                        onChange={(e) => 
                          onChange({
                            timing: {
                              ...settings.timing,
                              quietHours: { ...settings.timing.quietHours, end: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Frequency */}
              <div>
                <Label className="text-sm mb-2 block">تكرار الإشعارات</Label>
                <Select 
                  value={settings.timing.frequency} 
                  onValueChange={(value) => 
                    onChange({ timing: { ...settings.timing, frequency: value as any } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">فوري</SelectItem>
                    <SelectItem value="hourly">كل ساعة</SelectItem>
                    <SelectItem value="daily">يومي</SelectItem>
                    <SelectItem value="weekly">أسبوعي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Smart timing */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>التوقيت الذكي</Label>
                  <p className="text-xs text-gray-600">إرسال الإشعارات في الأوقات المناسبة</p>
                </div>
                <Switch
                  checked={settings.timing.smartTiming}
                  onCheckedChange={(checked) => 
                    onChange({ timing: { ...settings.timing, smartTiming: checked } })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Sound settings */}
          <div>
            <Label className="text-base font-medium mb-4 block">إعدادات الصوت</Label>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.sound.enabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                  <span>تفعيل الصوت</span>
                </div>
                <Switch
                  checked={settings.sound.enabled}
                  onCheckedChange={(checked) => 
                    onChange({ sound: { ...settings.sound, enabled: checked } })
                  }
                />
              </div>

              {settings.sound.enabled && (
                <>
                  <div>
                    <Label className="text-sm mb-2 block">مستوى الصوت</Label>
                    <Slider
                      value={[settings.sound.volume]}
                      onValueChange={([value]) => 
                        onChange({ sound: { ...settings.sound, volume: value } })
                      }
                      min={0}
                      max={100}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>صامت</span>
                      <span>{settings.sound.volume}%</span>
                      <span>عالي</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm mb-2 block">نوع الصوت</Label>
                    <Select 
                      value={settings.sound.type} 
                      onValueChange={(value) => 
                        onChange({ sound: { ...settings.sound, type: value as any } })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">افتراضي</SelectItem>
                        <SelectItem value="subtle">هادئ</SelectItem>
                        <SelectItem value="distinctive">مميز</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ContentSettings = ({ 
  settings, 
  onChange 
}: { 
  settings: PersonalizationSettings['content'];
  onChange: (content: Partial<PersonalizationSettings['content']>) => void;
}) => {
  const [newInterest, setNewInterest] = useState('');
  const [newTag, setNewTag] = useState('');

  const addInterest = () => {
    if (newInterest.trim() && !settings.interests.includes(newInterest.trim())) {
      onChange({
        interests: [...settings.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    onChange({
      interests: settings.interests.filter(i => i !== interest)
    });
  };

  const addTag = () => {
    if (newTag.trim() && !settings.tags.includes(newTag.trim())) {
      onChange({
        tags: [...settings.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    onChange({
      tags: settings.tags.filter(t => t !== tag)
    });
  };

  return (
    <div className="space-y-6">
      {/* Interests */}
      <div>
        <Label className="text-base font-medium mb-3 block">الاهتمامات</Label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="أضف اهتماماً جديداً..."
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addInterest()}
            />
            <Button onClick={addInterest} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {settings.interests.map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {interest}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 w-4"
                  onClick={() => removeInterest(interest)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Reading level */}
      <div>
        <Label className="text-base font-medium mb-3 block">مستوى القراءة</Label>
        <RadioGroup
          value={settings.readingLevel}
          onValueChange={(value) => onChange({ readingLevel: value as any })}
          className="grid grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="basic" id="basic" />
            <Label htmlFor="basic">مبتدئ</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="intermediate" id="intermediate" />
            <Label htmlFor="intermediate">متوسط</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="advanced" id="advanced" />
            <Label htmlFor="advanced">متقدم</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="expert" id="expert" />
            <Label htmlFor="expert">خبير</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Content length */}
      <div>
        <Label className="text-base font-medium mb-3 block">طول المحتوى المفضل</Label>
        <Select 
          value={settings.contentLength} 
          onValueChange={(value) => onChange({ contentLength: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">قصير (أقل من 3 دقائق)</SelectItem>
            <SelectItem value="medium">متوسط (3-10 دقائق)</SelectItem>
            <SelectItem value="long">طويل (أكثر من 10 دقائق)</SelectItem>
            <SelectItem value="all">الكل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Autoplay */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">التشغيل التلقائي</Label>
          <p className="text-sm text-gray-600">تشغيل الفيديوهات والصوتيات تلقائياً</p>
        </div>
        <Switch
          checked={settings.autoplay}
          onCheckedChange={(checked) => onChange({ autoplay: checked })}
        />
      </div>

      <Separator />

      {/* Recommendations */}
      <div>
        <Label className="text-base font-medium mb-4 block">إعدادات التوصيات</Label>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>تفعيل التوصيات</Label>
              <p className="text-sm text-gray-600">عرض توصيات مخصصة</p>
            </div>
            <Switch
              checked={settings.recommendations.enabled}
              onCheckedChange={(checked) => 
                onChange({ recommendations: { ...settings.recommendations, enabled: checked } })
              }
            />
          </div>

          {settings.recommendations.enabled && (
            <>
              <div>
                <Label className="text-sm mb-2 block">خوارزمية التوصيات</Label>
                <Select 
                  value={settings.recommendations.algorithm} 
                  onValueChange={(value) => 
                    onChange({ recommendations: { ...settings.recommendations, algorithm: value as any } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collaborative">تعاونية</SelectItem>
                    <SelectItem value="content">محتوائية</SelectItem>
                    <SelectItem value="hybrid">هجينة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">التنوع ({settings.recommendations.diversity}%)</Label>
                <Slider
                  value={[settings.recommendations.diversity]}
                  onValueChange={([value]) => 
                    onChange({ recommendations: { ...settings.recommendations, diversity: value } })
                  }
                  min={0}
                  max={100}
                  step={10}
                />
              </div>

              <div>
                <Label className="text-sm mb-2 block">الحداثة ({settings.recommendations.recency}%)</Label>
                <Slider
                  value={[settings.recommendations.recency]}
                  onValueChange={([value]) => 
                    onChange({ recommendations: { ...settings.recommendations, recency: value } })
                  }
                  min={0}
                  max={100}
                  step={10}
                />
              </div>

              <div>
                <Label className="text-sm mb-2 block">الشعبية ({settings.recommendations.popularity}%)</Label>
                <Slider
                  value={[settings.recommendations.popularity]}
                  onValueChange={([value]) => 
                    onChange({ recommendations: { ...settings.recommendations, popularity: value } })
                  }
                  min={0}
                  max={100}
                  step={10}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Tags */}
      <div>
        <Label className="text-base font-medium mb-3 block">العلامات المفضلة</Label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="أضف علامة جديدة..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button onClick={addTag} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {settings.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="flex items-center gap-1"
              >
                #{tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 w-4"
                  onClick={() => removeTag(tag)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// Main Component
// ===========================================

export const PersonalizationSettings: React.FC = () => {
  const { user, trackInteraction } = useGlobalStore();
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('theme');

  // Fetch current settings
  const {
    data: settings = defaultSettings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['personalization-settings'],
    queryFn: fetchSettings,
    enabled: !!user,
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalization-settings'] });
      toast.success('تم حفظ الإعدادات بنجاح');
      setHasChanges(false);
      trackInteraction('settings_saved');
    },
    onError: () => {
      toast.error('فشل في حفظ الإعدادات');
    },
  });

  // Export settings mutation
  const exportMutation = useMutation({
    mutationFn: exportSettings,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sabq-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('تم تصدير الإعدادات بنجاح');
      trackInteraction('settings_exported');
    },
    onError: () => {
      toast.error('فشل في تصدير الإعدادات');
    },
  });

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateLocalSettings = (section: keyof PersonalizationSettings, data: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(localSettings);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">يجب تسجيل الدخول لعرض الإعدادات</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-500 mb-4">حدث خطأ في تحميل الإعدادات</p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            إعدادات التخصيص
          </h1>
          <p className="text-gray-600 mt-1">
            خصص تجربتك حسب تفضيلاتك الشخصية
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={updateMutation.isPending}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                إلغاء التغييرات
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Change indicator */}
      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            لديك تغييرات غير محفوظة. تأكد من حفظ التغييرات قبل مغادرة الصفحة.
          </AlertDescription>
        </Alert>
      )}

      {/* Settings tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="theme" className="flex items-center gap-1">
            <Palette className="w-4 h-4" />
            المظهر
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            اللغة
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="w-4 h-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            المحتوى
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            الخصوصية
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            متقدم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                إعدادات المظهر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeSettings
                settings={localSettings.theme}
                onChange={(theme) => updateLocalSettings('theme', theme)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                إعدادات الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationSettings
                settings={localSettings.notifications}
                onChange={(notifications) => updateLocalSettings('notifications', notifications)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                إعدادات المحتوى
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContentSettings
                settings={localSettings.content}
                onChange={(content) => updateLocalSettings('content', content)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tab contents here */}
      </Tabs>
    </div>
  );
};

export default PersonalizationSettings;
