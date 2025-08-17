import Image from 'next/image';
import React from 'react';




interface AvatarProps {
  className?: string;
  children?: React.ReactNode;
}

interface AvatarFallbackProps {
  className?: string;
  children?: React.ReactNode;
}

interface AvatarImageProps {
  className?: string;
  src?: string;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ className, children }) => {
  return (
    <div className={`relative inline-block rounded-full overflow-hidden ${className || ''}`}>
      {children}
    </div>
  );
};

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, children }) => {
  return (
    <div className={`w-full h-full flex items-center justify-center font-medium ${className || ''}`}>
      {children}
    </div>
  );
};

export const AvatarImage: React.FC<AvatarImageProps> = ({ className, src, alt }) => {
  if (!src) return null;
  
  return (
    <Image
      src={src}
      alt={alt || ''}
      width={40}
      height={40}
      className={`w-full h-full object-cover ${className || ''}`}
    />
  );
}; 