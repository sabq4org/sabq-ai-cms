/**
 * مدخل مكونات المحرر الذكي
 * Smart Editor Components Entry Point
 */

export { default as CollaborativeEditor } from './CollaborativeEditor';
export { default as CommentsSystem } from './CommentsSystem';

// أنواع البيانات المشتركة
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

export interface Document {
  id: string;
  title: string;
  content: any;
  html_content?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  position?: number;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// ثوابت المحرر
export const EDITOR_CONSTANTS = {
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:1234',
  TIPTAP_APP_ID: process.env.NEXT_PUBLIC_TIPTAP_APP_ID || '',
  TIPTAP_SECRET: process.env.NEXT_PUBLIC_TIPTAP_SECRET || '',
  AUTO_SAVE_INTERVAL: 30000, // 30 ثانية
  TYPING_INDICATOR_TIMEOUT: 3000, // 3 ثواني
  COLLABORATION_COLORS: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ]
};

// دوال مساعدة
export const getUserColor = (userId: string): string => {
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return EDITOR_CONSTANTS.COLLABORATION_COLORS[index % EDITOR_CONSTANTS.COLLABORATION_COLORS.length];
};

export const formatDateTime = (date: string | Date): { date: string; time: string } => {
  const d = new Date(date);
  return {
    date: d.toLocaleDateString('ar-SA'),
    time: d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
  };
};

export const getWordCount = (content: any): number => {
  if (!content) return 0;
  const textContent = JSON.stringify(content);
  const words = textContent.match(/[\u0600-\u06FF\w]+/g) || [];
  return words.length;
};

export const getReadingTime = (wordCount: number): number => {
  return Math.ceil(wordCount / 200); // متوسط 200 كلمة في الدقيقة للقراءة العربية
};
