"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AudioWaveProps {
  isPlaying: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'green';
}

const AudioWave: React.FC<AudioWaveProps> = ({ 
  isPlaying, 
  size = 'md',
  color = 'blue' 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-4',
    md: 'w-4 h-6', 
    lg: 'w-5 h-8'
  };

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <div className="flex items-center justify-center gap-0.5">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={`${sizeClasses[size]} bg-gradient-to-t ${colorClasses[color]} rounded-full`}
          animate={isPlaying ? {
            scaleY: [0.4, 1, 0.4],
          } : {
            scaleY: 0.4
          }}
          transition={{
            duration: 1.5,
            repeat: isPlaying ? Infinity : 0,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default AudioWave;
