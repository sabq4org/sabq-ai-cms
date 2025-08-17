'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface UserNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  darkMode: boolean;
}

export default function UserNameModal({ isOpen, onClose, onSave, darkMode }: UserNameModalProps) {
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!userName.trim()) {
      setError('الرجاء إدخال اسمك');
      return;
    }
    
    if (userName.trim().length < 2) {
      setError('الاسم يجب أن يكون أكثر من حرفين');
      return;
    }
    
    onSave(userName.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            مرحباً بك في منتدى سبق! 👋
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          الرجاء إدخال اسمك ليظهر مع مشاركاتك في المنتدى
        </p>
        
        <div className="mb-4">
          <input
            type="text"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
            placeholder="أدخل اسمك هنا..."
            className={`w-full p-3 rounded-lg border ${
              error 
                ? 'border-red-500' 
                : darkMode 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            حفظ الاسم
          </button>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
} 