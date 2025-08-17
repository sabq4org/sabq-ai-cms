import React, { useState, useEffect, useRef } from 'react';

// A silent, short MP3 file encoded in base64 to use as a fallback
const silentAudio = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gUmVjb3JkZWQgb24gMjAxMS0wNS0wMiBhdCAxMTozNDozNSBQQ00uAAAAAExhdmY2MC4zLjEwMAAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAB/8/gAAAAAAAAAAA==';

const AudioPlayer = ({ url }: { url?: string | null }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackUrl, setTrackUrl] = useState(silentAudio);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (url && typeof url === 'string') {
      setTrackUrl(url);
    } else {
      console.warn("AudioPlayer: No valid URL provided, using a silent fallback.");
      setTrackUrl(silentAudio);
    }
  }, [url]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(e => {
          console.error("Error playing audio:", e);
        });
        setIsPlaying(true);
      }
    }
  };

  return (
    <div>
      <audio
        ref={audioRef}
        src={trackUrl}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error("Audio error:", e);
          setIsPlaying(false);
        }}
      />
      <button onClick={handlePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default AudioPlayer;
