'use client';

import { useState, useEffect } from 'react';
import { Mic, Loader2, Download, Clock, Radio, Settings, Play, Pause } from 'lucide-react';
import { useRef } from 'react';

interface LastPodcast {
  filename: string;
  link: string;
  createdAt: string;
  size: number;
}

export default function PodcastGenerator() {
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [lastPodcast, setLastPodcast] = useState<LastPodcast | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [voice, setVoice] = useState('EXAVITQu4vr4xnSDxMaL');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // الأصوات المتاحة
  const voices = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'صوت عربي رجالي احترافي' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'صوت عربي نسائي' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'صوت إنجليزي احترافي' }
  ];

  // جلب آخر نشرة عند تحميل الصفحة
  useEffect(() => {
    fetchLastPodcast();
  }, []);

  const fetchLastPodcast = async () => {
    try {
      const res = await fetch('/api/generate-podcast');
      const data = await res.json();
      if (data.success && data.lastPodcast) {
        setLastPodcast(data.lastPodcast);
      }
    } catch (err) {
      console.error('Error fetching last podcast:', err);
    }
  };

  const generate = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch('/api/generate-podcast', {
        method: 'POST',
        body: JSON.stringify({ 
          count, 
          language: 'arabic',
          voice 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setResult(data);
        // تحديث آخر نشرة
        fetchLastPodcast();
      } else {
        alert('حدث خطأ: ' + data.error);
      }
    } catch (err) {
      alert('حدث خطأ في الاتصال');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Radio className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">النشرة الصوتية الإخبارية</h1>
                <p className="text-gray-600 mt-1">توليد نشرة صوتية تلقائية من آخر أخبار صحيفة سبق</p>
              </div>
            </div>
          </div>

          {/* إعدادات التوليد */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الأخبار في النشرة
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="flex-1"
                  min={3}
                  max={10}
                  disabled={loading}
                />
                <span className="bg-gray-100 px-3 py-1 rounded-lg font-semibold text-lg w-12 text-center">
                  {count}
                </span>
              </div>
            </div>

            {/* الإعدادات المتقدمة */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <Settings className="w-4 h-4" />
                إعدادات متقدمة
              </button>
              
              {showAdvanced && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصوت المستخدم
                  </label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    disabled={loading}
                  >
                    {voices.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* زر التوليد */}
            <button
              onClick={generate}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-3 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري توليد النشرة الصوتية...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  توليد النشرة الصوتية
                </>
              )}
            </button>
          </div>
        </div>

        {/* نتيجة التوليد */}
        {result && result.success && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-full">
                <Mic className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">تم توليد النشرة بنجاح!</h2>
            </div>

            {/* مشغل الصوت */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <audio
                ref={audioRef}
                src={result.link}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">النشرة الصوتية</p>
                  <p className="text-xs text-gray-500">المدة التقديرية: {result.duration} دقيقة</p>
                </div>
                <a
                  href={result.link}
                  download
                  className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* نص النشرة */}
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 mb-2">
                عرض نص النشرة
              </summary>
              <div className="bg-gray-50 rounded-lg p-4 mt-2 max-h-60 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {result.text}
                </p>
              </div>
            </details>
          </div>
        )}

        {/* آخر نشرة */}
        {lastPodcast && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">آخر نشرة تم توليدها</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{lastPodcast.filename}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(lastPodcast.createdAt)} • {formatFileSize(lastPodcast.size)}
                  </p>
                </div>
                <a
                  href={lastPodcast.link}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  استماع
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
} 