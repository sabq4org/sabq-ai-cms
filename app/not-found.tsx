'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  Home, 
  LayoutDashboard, 
  TrendingUp, 
  Sparkles,
  MessageCircle,
  ArrowRight,
  Telescope,
  Cpu,
  Zap,
  Brain,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'react-hot-toast';

export default function NotFound() {
  const router = useRouter();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [robotMood, setRobotMood] = useState<'searching' | 'thinking' | 'happy' | 'confused'>('confused');

  // رسائل عشوائية للروبوت
  const robotMessages = [
    "يبدو أنك ضيّعت الطريق! 🤔",
    "أووبس! الصفحة هربت إلى مجرة أخرى! 🌌",
    "لحظة... أعتقد أن الذكاء الاصطناعي أخذ هذه الصفحة للتدريب! 🤖",
    "404... لكن لا تقلق، أنا هنا للمساعدة! 💪",
    "هممم... دعني أبحث في قاعدة البيانات الكونية! 🔍"
  ];

  const [currentMessage, setCurrentMessage] = useState(robotMessages[0]);

  useEffect(() => {
    // تغيير رسالة الروبوت كل 5 ثواني
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * robotMessages.length);
      setCurrentMessage(robotMessages[randomIndex]);
      setRobotMood(['searching', 'thinking', 'happy', 'confused'][Math.floor(Math.random() * 4)] as any);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('اكتب شيئاً للبحث عنه!');
      return;
    }

    setIsSearching(true);
    setRobotMood('searching');
    
    // محاكاة البحث
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('جاري توجيهك للبحث...');
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleAIChat = () => {
    setShowAIChat(!showAIChat);
    if (!showAIChat) {
      setAiMessage('مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك في العثور على ما تبحث عنه؟ 🤖');
    }
  };

  const suggestRandomTopic = () => {
    const topics = [
      'أحدث التحليلات الذكية',
      'تقارير اليوم المميزة',
      'الأخبار العاجلة',
      'المقالات الأكثر قراءة',
      'التحليلات العميقة'
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    toast.success(`اقتراح ذكي: ${randomTopic}`);
    router.push('/');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
      {/* خلفية متحركة */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* الروبوت الودود */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1 }}
          className="mb-8"
        >
          <div className="relative">
            {/* جسم الروبوت */}
            <div className={`w-32 h-32 rounded-full ${
              darkMode ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'
            } shadow-2xl flex items-center justify-center relative`}>
              {/* وجه الروبوت */}
              <div className="absolute inset-4 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center">
                {/* العيون */}
                <div className="flex gap-3">
                  <motion.div
                    animate={{ 
                      scaleY: robotMood === 'thinking' ? 0.3 : 1,
                      rotate: robotMood === 'confused' ? -10 : 0
                    }}
                    className="w-3 h-3 bg-blue-600 rounded-full"
                  />
                  <motion.div
                    animate={{ 
                      scaleY: robotMood === 'thinking' ? 0.3 : 1,
                      rotate: robotMood === 'confused' ? 10 : 0
                    }}
                    className="w-3 h-3 bg-blue-600 rounded-full"
                  />
                </div>
                
                {/* الفم */}
                <motion.div
                  animate={{ 
                    scaleX: robotMood === 'happy' ? 1.2 : 1,
                    scaleY: robotMood === 'confused' ? 0.5 : 1
                  }}
                  className="absolute bottom-4 w-8 h-1 bg-blue-600 rounded-full"
                />
              </div>
              
              {/* الهوائيات */}
              <motion.div
                animate={{ rotate: robotMood === 'searching' ? [0, -20, 20, 0] : 0 }}
                transition={{ repeat: robotMood === 'searching' ? Infinity : 0, duration: 1 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2"
              >
                <div className="w-1 h-6 bg-gray-400 dark:bg-gray-600 relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </motion.div>
              
              {/* المنظار (عند البحث) */}
              {robotMood === 'searching' && (
                <motion.div
                  initial={{ scale: 0, x: -20 }}
                  animate={{ scale: 1, x: 0 }}
                  className="absolute -right-8 top-1/2 -translate-y-1/2"
                >
                  <Telescope className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* رسالة الروبوت */}
        <motion.div
          key={currentMessage}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center mb-8 px-6 py-3 rounded-full ${
            darkMode ? 'bg-gray-800/50' : 'bg-white/50'
          } backdrop-blur-sm border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {currentMessage}
          </p>
        </motion.div>

        {/* العنوان الرئيسي */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className={`text-6xl md:text-8xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            404
          </h1>
          <h2 className={`text-2xl md:text-3xl font-semibold mb-4 ${
            darkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            الصفحة هربت! 🚀
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            عفوًا! يبدو أن هذه الصفحة غير متوفرة، ربما اختبأت في مجرة بعيدة أو أعادها الذكاء الاصطناعي إلى الداتا سنتر للتدريب!
          </p>
        </motion.div>

        {/* صندوق البحث الذكي */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-2xl mb-8"
        >
          <Card className={`p-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
          } backdrop-blur-sm`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Search className="w-5 h-5" />
              هل ترغب أن أساعدك في البحث عنها؟
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              أدخل كلمة مفتاحية وسأبحث عنها باستخدام ذكائي الاصطناعي.
            </p>
            <div className="flex gap-3">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ابحث عن أي شيء..."
                className={`flex-1 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
                disabled={isSearching}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري البحث...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    ابحث معي!
                  </div>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* الخيارات السريعة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mb-8"
        >
          <Link href="/">
            <Card className={`p-6 text-center hover:scale-105 transition-all cursor-pointer ${
              darkMode 
                ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700 hover:from-blue-800/50 hover:to-blue-700/50' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200'
            }`}>
              <Home className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                الصفحة الرئيسية
              </h4>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className={`p-6 text-center hover:scale-105 transition-all cursor-pointer ${
              darkMode 
                ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700 hover:from-purple-800/50 hover:to-purple-700/50' 
                : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200'
            }`}>
              <LayoutDashboard className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                لوحة التحكم
              </h4>
            </Card>
          </Link>

          <Link href="/trending">
            <Card className={`p-6 text-center hover:scale-105 transition-all cursor-pointer ${
              darkMode 
                ? 'bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700 hover:from-orange-800/50 hover:to-orange-700/50' 
                : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200'
            }`}>
              <TrendingUp className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                الأكثر تداولاً
              </h4>
            </Card>
          </Link>

          <Card 
            onClick={suggestRandomTopic}
            className={`p-6 text-center hover:scale-105 transition-all cursor-pointer ${
              darkMode 
                ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700 hover:from-green-800/50 hover:to-green-700/50' 
                : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200'
            }`}
          >
            <Sparkles className={`w-8 h-8 mx-auto mb-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              اقتراح ذكي
            </h4>
          </Card>
        </motion.div>

        {/* زر المحادثة مع AI */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <Button
            onClick={handleAIChat}
            className={`mb-8 ${
              showAIChat 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            } text-white shadow-lg`}
          >
            <MessageCircle className="w-5 h-5 ml-2" />
            {showAIChat ? 'إغلاق المحادثة' : 'تحدث مع الذكاء الاصطناعي'}
          </Button>
        </motion.div>

        {/* نافذة المحادثة مع AI */}
        {showAIChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-full max-w-md"
          >
            <Card className={`p-6 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } shadow-2xl`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    مساعد AI
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {aiMessage}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="اكتب ما تبحث عنه..."
                  className={`flex-1 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300'
                  }`}
                />
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                  <Zap className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* الرسالة السفلية */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center mt-12"
        >
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
            حتى صفحات الخطأ في sabq.ai مدعومة بالذكاء الاصطناعي... لا تستغرب لو ظهرت لك توصية ذكية هنا! ✨
          </p>
          <code className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-500'} font-mono`}>
            (إذا كنت مطورًا وتقرأ هذا... الكود: 404-ai-fun)
          </code>
        </motion.div>

        {/* أيقونات عائمة للديكور */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 right-20 text-blue-500/20"
        >
          <Brain className="w-16 h-16" />
        </motion.div>

        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [360, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-20 text-purple-500/20"
        >
          <Compass className="w-20 h-20" />
        </motion.div>
      </div>
    </div>
  );
} 