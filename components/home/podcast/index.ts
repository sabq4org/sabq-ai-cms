// تصدير مكونات البودكاست
export { default as IntelligentPodcastBlock } from '../IntelligentPodcastBlock';
export { default as AudioWave } from '../../ui/AudioWave';

// تصدير أنواع البيانات
export interface PodcastEpisode {
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

export interface AudioPlayerProps {
  episode: PodcastEpisode;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
}

export interface MiniPlayerProps {
  isVisible: boolean;
  currentEpisode: PodcastEpisode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onClose: () => void;
  progress: number;
}
