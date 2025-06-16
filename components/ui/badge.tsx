import React from 'react';

interface BadgeProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ 
  className, 
  children,
  variant = 'default' 
}) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';
  
  const variantClasses = {
    default: 'bg-gray-900 text-gray-50',
    secondary: 'bg-gray-100 text-gray-900',
    destructive: 'bg-red-100 text-red-700',
    outline: 'border border-gray-200 text-gray-900'
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}>
      {children}
    </div>
  );
}; 