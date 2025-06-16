import React from 'react';

interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className || ''}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={`p-6 pb-3 ${className || ''}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ className, children }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className || ''}`}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={`p-6 pt-0 ${className || ''}`}>
      {children}
    </div>
  );
}; 