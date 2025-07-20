'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Volume2, Headphones, Clock, Calendar, ChevronRight, Mic } from 'lucide-react';
import Link from 'next/link';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface Episode {
  id: string;
  episode_number?: number;
  title: string;
  audio_url?: string;
  duration?: number;
  published_at?: string;
  views: number;
}

interface Program {
  id: string;
  name: string;
  short_description?: string;
  logo_url?: string;
  slug: string;
  episodes?: Episode[];
}

export default function AudioProgramsWidget({ position = 'header' }: { position?: string }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProgram, setActiveProgram] = useState<string | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const darkMode = useDarkModeContext();

  useEffect(() => {
    fetchPrograms();
  }, [position]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`/api/audio/programs?status=active&position=${position}`);
      const data = await response.json();
      
      if (data.success) {
        setPrograms(data.programs);
        if (data.programs.length > 0) {
          setActiveProgram(data.programs[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (episodeId: string, audioUrl: string) => {
    if (playingEpisode === episodeId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingEpisode(episodeId);
        setIsPlaying(true);
      }
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'غير محدد';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'اليوم';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'اليوم';
    if (hours < 24) return 'اليوم';
    if (hours < 48) return 'أمس';
    
    // تنسيق التاريخ بالعربية
    const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const dayName = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${dayName} ${day} ${month}`;
  };

  if (loading || programs.length === 0) {
    return null;
  }

  const activeP = programs.find(p => p.id === activeProgram);

  // عرض في الهيدر
  if (position === 'header') {
    return (
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Headphones className="w-5 h-5" />
              <span className="text-sm font-medium">البرامج الصوتية</span>
              
              {/* قائمة البرامج */}
              <div className="flex items-center gap-2">
                {programs.map((program) => (
                  <button
                    key={program.id}
                    onClick={() => setActiveProgram(program.id)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      activeProgram === program.id
                        ? 'bg-white/20 text-white'
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    {program.name}
                  </button>
                ))}
              </div>
            </div>

            {/* آخر حلقة */}
            {activeP && activeP.episodes?.[0] && (
              <div className="flex items-center gap-3">
                <span className="text-xs opacity-80">آخر حلقة:</span>
                <span className="text-sm font-medium">{activeP.episodes?.[0]?.title}</span>
                
                {activeP.episodes?.[0]?.audio_url && (
                  <button
                    onClick={() => togglePlay(activeP.episodes![0].id, activeP.episodes![0].audio_url!)}
                    className="bg-white/20 hover:bg-white/30 p-1 rounded-full transition-colors"
                  >
                    {playingEpisode === activeP.episodes![0].id && isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                )}
                
                <Link
                  href={`/programs/${activeP.slug}`}
                  className="text-xs underline hover:no-underline"
                >
                  المزيد
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* مشغل الصوت المخفي */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    );
  }

  // عرض ككارد في الصفحة الرئيسية
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 rounded-lg shadow-sm overflow-hidden border border-blue-200 dark:border-blue-800/30">
      {/* الهيدر */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">🎙️ النشرة الصوتية</h3>
              <p className="text-white/80 text-sm">تأتيكم على رأس كل ساعة من سبق</p>
            </div>
          </div>
        </div>
        
        {/* تاريخ النشرة الحالية */}
        {activeP && activeP.episodes?.[0] && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <small className="text-white/70 text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              نشرة يوم {formatDate(activeP.episodes[0].published_at)}
            </small>
          </div>
        )}
      </div>

      {/* قائمة البرامج */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto scrollbar-hide">
          {programs.map((program) => (
            <button
              key={program.id}
              onClick={() => setActiveProgram(program.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeProgram === program.id
                  ? 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {program.logo_url && (
                  <img
                    src={program.logo_url}
                    alt={program.name}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                {program.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* محتوى البرنامج النشط */}
      {activeP && (
        <div className="p-6">
          {/* وصف البرنامج */}
          {activeP.short_description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {activeP.short_description}
            </p>
          )}

          {/* قائمة الحلقات */}
          <div className="space-y-3">
            {activeP.episodes?.slice(0, 3).map((episode) => (
              <div
                key={episode.id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        الحلقة {episode.episode_number}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(episode.published_at)}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                      {episode.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(episode.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        {episode.views.toLocaleString()} استماع
                      </span>
                    </div>
                  </div>
                  
                  {episode.audio_url && (
                    <div className="flex items-center gap-2 mr-4">
                      <button
                        onClick={() => togglePlay(episode.id, episode.audio_url!)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                      >
                        {playingEpisode === episode.id && isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                      <a
                        href={episode.audio_url}
                        download
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* رابط المزيد */}
          {activeP.episodes && activeP.episodes.length > 3 && (
            <Link
              href={`/programs/${activeP.slug}`}
              className="mt-4 inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              عرض جميع الحلقات ({activeP.episodes.length})
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* مشغل الصوت المخفي */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
} 