"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AngleAudioPlayerProps {
  angleId: string;
  className?: string;
}

interface AudioResponse {
  success: boolean;
  audioUrl?: string;
  cached?: boolean;
  message?: string;
}

export default function AngleAudioPlayer({
  angleId,
  className = "",
}: AngleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // جلب الصوت من API
  const fetchAudio = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/muqtarab/audio-summary?angleId=${angleId}`
      );
      const data: AudioResponse = await response.json();

      if (data.success && data.audioUrl) {
        setAudioUrl(data.audioUrl);
        return true;
      } else {
        throw new Error(data.message || "فشل في تحميل الصوت");
      }
    } catch (err) {
      console.error("خطأ في جلب الصوت:", err);
      setError(err instanceof Error ? err.message : "خطأ في تحميل الصوت");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // تشغيل/إيقاف الصوت
  const togglePlayPause = async () => {
    if (!audioUrl) {
      const success = await fetchAudio();
      if (!success) return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        try {
          await audioRef.current.play();
        } catch (err) {
          console.error("خطأ في تشغيل الصوت:", err);
          setError("فشل في تشغيل الصوت");
        }
      }
    }
  };

  // تحديث التوقيت
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // تحديث المدة
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // تغيير الموضع
  const handleSeek = (newTime: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime[0];
      setCurrentTime(newTime[0]);
    }
  };

  // تغيير الصوت
  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    setIsMuted(volumeValue === 0);
    if (audioRef.current) {
      audioRef.current.volume = volumeValue;
    }
  };

  // كتم/إلغاء كتم الصوت
  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  };

  // تنسيق الوقت
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // تحديث حالة التشغيل
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioUrl]);

  if (error) {
    return (
      <div
        className={`flex items-center gap-2 text-red-600 text-sm ${className}`}
      >
        <VolumeX className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${className}`}
    >
      {/* زر التشغيل/الإيقاف */}
      <Button
        variant="outline"
        size="sm"
        onClick={togglePlayPause}
        disabled={isLoading}
        className="min-w-[40px]"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      {/* شريط التقدم */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-gray-500 min-w-[40px]">
          {formatTime(currentTime)}
        </span>

        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="flex-1"
          disabled={!audioUrl || duration === 0}
        />

        <span className="text-xs text-gray-500 min-w-[40px]">
          {formatTime(duration)}
        </span>
      </div>

      {/* التحكم في الصوت */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={toggleMute} className="p-1">
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>

        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
          className="w-16"
        />
      </div>

      {/* عنصر الصوت المخفي */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
    </div>
  );
}
