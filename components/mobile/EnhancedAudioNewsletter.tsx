"use client";

import {
  AlertCircle,
  Calendar,
  Download,
  Loader2,
  Mic,
  Pause,
  Play,
  Share2,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface AudioEpisode {
  id: string;
  title: string;
  description?: string;
  audio_url?: string;
  duration?: number;
  created_at: string;
  size?: number;
  episode_number?: number;
  topics?: string[];
}

interface EnhancedAudioNewsletterProps {
  darkMode?: boolean;
  className?: string;
}

export default function EnhancedAudioNewsletter({
  darkMode = false,
  className = "",
}: EnhancedAudioNewsletterProps) {
  const [currentEpisode, setCurrentEpisode] = useState<AudioEpisode | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchLatestEpisode();
  }, []);

  const fetchLatestEpisode = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/audio/episodes?limit=1&status=published"
      );
      const data = await response.json();

      if (data.success && data.episodes && data.episodes.length > 0) {
        setCurrentEpisode(data.episodes[0]);
        setError(null);
      } else {
        setError("no_episodes");
      }
    } catch (err) {
      console.error("Error fetching audio episode:", err);
      setError("fetch_failed");
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentEpisode?.audio_url) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    if (!currentEpisode) return;

    try {
      await navigator.share({
        title: currentEpisode.title,
        text: currentEpisode.description || "استمع للنشرة الصوتية من سبق",
        url: window.location.href,
      });
    } catch (err) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`${className} ${
          darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        } border rounded-xl p-6`}
      >
        <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span
            className={`text-sm ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            جاري تحميل النشرة الصوتية...
          </span>
        </div>
      </div>
    );
  }

  // Error/No episodes state
  if (error || !currentEpisode) {
    return (
      <div
        className={`${className} ${
          darkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
        } border rounded-xl p-6`}
      >
        {/* Header */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div>
            <h3
              className={`font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🎙️ النشرة الصوتية
            </h3>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              تأتيكم على رأس كل ساعة من سبق
            </p>
          </div>
        </div>

        {/* No episodes message */}
        <div className="text-center py-6">
          <AlertCircle
            className={`w-12 h-12 mx-auto mb-3 ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          />
          <h4
            className={`font-medium mb-2 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            جاري إعداد النشرة الصوتية
          </h4>
          <p
            className={`text-sm mb-4 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            سيتم إضافة النشرة الصوتية قريباً. في هذه الأثناء، يمكنك متابعة آخر
            الأخبار بالنص.
          </p>

          {/* Alternative actions */}
          <div className="space-y-2">
            <button
              onClick={() => (window.location.href = "/news")}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              تصفح الأخبار النصية
            </button>

            <button
              onClick={fetchLatestEpisode}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main audio player
  return (
    <div
      className={`${className} ${
        darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      } border`}
    >
      {/* Audio element */}
      {currentEpisode.audio_url && (
        <audio
          ref={audioRef}
          src={currentEpisode.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header */}
      <div
        className={`p-4 border-b ${
          darkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div
              className={`p-2 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-blue-100"
              }`}
            >
              <Mic
                className={`w-5 h-5 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <div>
              <h3
                className={`font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                النشرة الصوتية
              </h3>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Calendar
                  className={`w-3 h-3 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {new Date(currentEpisode.created_at).toLocaleDateString(
                    "ar-SA"
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={handleShare}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400"
                  : "hover:bg-gray-100 text-gray-500"
              }`}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Episode info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Mic className="w-4 h-4 text-blue-600" />
          <h4
            className={`font-bold line-clamp-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {currentEpisode.title}
          </h4>
        </div>

        {currentEpisode.description && (
          <p
            className={`text-sm mb-3 line-clamp-2 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {currentEpisode.description}
          </p>
        )}

        {/* Topics */}
        {currentEpisode.topics && currentEpisode.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {currentEpisode.topics.slice(0, 3).map((topic, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs ${
                  darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      {currentEpisode.audio_url && (
        <div
          className={`p-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* Progress bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
            <div className="flex justify-between mt-1">
              <span
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {formatTime(currentTime)}
              </span>
              <span
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlayPause}
                className={`p-3 rounded-full transition-colors ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <button
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={toggleMute}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {currentEpisode.audio_url && (
                <a
                  href={currentEpisode.audio_url}
                  download
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
