import React from 'react';
import CategoriesClient from './CategoriesClient';

export default function CategoriesPage() {
  console.log('🏠 CategoriesPage تم تحميله');
  
  return (
    <div className="min-h-screen bg-white">
      <CategoriesClient />
    </div>
  );
}
