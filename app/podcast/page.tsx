"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Clock, 
  Headphones, 
  Download, 
  Share2,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import AudioWave from '@/components/ui/AudioWave';

interface PodcastEpisode {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  publishedAt: string;
  description?: string;
  playCount?: number;
  isNew?: boolean;
  category?: string;
  tags?: string[];
}

const PodcastPage: React.FC = () => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'جميع الحلقات', count: 0 },
    { id: 'economy', name: 'الاقتصاد', count: 0 },
    { id: 'technology', name: 'التكنولوجيا', count: 0 },
    { id: 'education', name: 'التعليم', count: 0 },
    { id: 'analysis', name: 'تحليلات', count: 0 }
  ];

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/podcast/episodes?limit=20');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEpisodes(data.episodes || []);
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل الحلقات:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredEpisodes = episodes.filter(episode => {
    const matchesSearch = episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         episode.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || episode.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlayEpisode = (episode: PodcastEpisode) => {
    if (currentEpisode?.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">جاري تحميل البودكاست...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* رأس الصفحة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🎙️ بودكاست الذكاء
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                تحليلات عميقة وآراء خبراء في أقل من 5 دقائق
              </p>
            </div>
          </div>

          {/* إحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {episodes.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">حلقة</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {episodes.reduce((sum, ep) => sum + (ep.playCount || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">استماع</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.floor(episodes.reduce((sum, ep) => sum + ep.duration, 0) / 60)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">دقيقة</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {episodes.filter(ep => ep.isNew).length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">جديد</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* البحث والفلاتر */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* البحث */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="ابحث في الحلقات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>

                {/* الفئات */}
                <div className="flex gap-2 flex-wrap">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="text-xs"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* قائمة الحلقات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredEpisodes.map((episode, index) => (
            <motion.div
              key={episode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={cn(
                "transition-all duration-300 hover:shadow-lg",
                currentEpisode?.id === episode.id && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* زر التشغيل */}
                    <Button
                      onClick={() => handlePlayEpisode(episode)}
                      size="lg"
                      variant={currentEpisode?.id === episode.id ? "default" : "outline"}
                      className="rounded-full w-12 h-12 flex-shrink-0"
                    >
                      {currentEpisode?.id === episode.id && isPlaying ? (
                        <AudioWave isPlaying={true} size="sm" color="blue" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </Button>

                    {/* محتوى الحلقة */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {episode.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {episode.isNew && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              جديد
                            </Badge>
                          )}
                        </div>
                      </div>

                      {episode.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {episode.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(episode.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Headphones className="w-3 h-3" />
                            {episode.playCount || 0} استماع
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(episode.publishedAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-xs">
                            <Download className="w-3 h-3 mr-1" />
                            تحميل
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs">
                            <Share2 className="w-3 h-3 mr-1" />
                            مشاركة
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredEpisodes.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              لم يتم العثور على حلقات
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              جرب تغيير كلمات البحث أو الفلاتر
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PodcastPage;
