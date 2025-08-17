// components/ai/NewsCopilotButton.tsx
import React, { useState } from 'react';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { NewsCopilotChat } from './NewsCopilotChat';

interface NewsCopilotButtonProps {
  articleId: string;
  articleTitle: string;
}

export const NewsCopilotButton: React.FC<NewsCopilotButtonProps> = ({ articleId, articleTitle }) => {
  const [open, setOpen] = useState(false);
  if (!isFeatureEnabled('ai_news_copilot')) return null;
  return (
    <>
      <button className="news-copilot-btn" onClick={() => setOpen(!open)}>
        🤖 اسأل المساعد الذكي عن هذا الخبر
      </button>
      {open && <NewsCopilotChat articleId={articleId} articleTitle={articleTitle} />}
      <style jsx>{`
        .news-copilot-btn {
          background: linear-gradient(90deg,#0070f3,#00c6ff);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1.2rem;
          margin: 0.5rem 0;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 2px 8px #0070f322;
          transition: background 0.2s;
        }
        .news-copilot-btn:hover {
          background: linear-gradient(90deg,#005bb5,#00aaff);
        }
      `}</style>
    </>
  );
};
