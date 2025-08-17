// components/ai/NewsCopilotChat.tsx
import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface NewsCopilotChatProps {
  articleId: string;
  articleTitle: string;
  initialPrompt?: string;
}

export const NewsCopilotChat: React.FC<NewsCopilotChatProps> = ({ articleId, articleTitle, initialPrompt }) => {
  const [messages, setMessages] = useState([
    { role: 'system', content: `أنت مساعد صحفي ذكي. أجب باحترافية عن أي سؤال حول الخبر: "${articleTitle}".` },
    ...(initialPrompt ? [{ role: 'user', content: initialPrompt }] : [])
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setLoading(true);
    try {
      // استدعاء API الذكاء الاصطناعي (OpenAI أو أي خدمة)
      const res = await fetch('/api/ai/news-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          messages: [...messages, { role: 'user', content: input }]
        })
      });
      const data = await res.json();
      setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: data.reply }]);
      setInput('');
    } catch (e) {
      setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: 'حدث خطأ أثناء الاتصال بالمساعد الذكي.' }]);
    }
    setLoading(false);
  }

  return (
    <div className="news-copilot-chat">
      <div className="chat-messages">
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <div key={i} className={`msg msg-${msg.role}`}>{msg.content}</div>
        ))}
        {loading && <div className="msg msg-assistant loading">...جاري التحليل</div>}
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="اسأل عن الخبر أو اطلب تحليلاً..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}><PaperAirplaneIcon className="icon" /></button>
      </div>
      <style jsx>{`
        .news-copilot-chat { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px #0001; padding: 1rem; max-width: 400px; }
        .chat-messages { min-height: 120px; margin-bottom: 1rem; }
        .msg { margin: 0.5rem 0; padding: 0.5rem 1rem; border-radius: 8px; }
        .msg-user { background: #f0f0f0; text-align: right; }
        .msg-assistant { background: #e7f5ff; text-align: left; }
        .loading { color: #888; font-style: italic; }
        .chat-input-row { display: flex; gap: 0.5rem; }
        input { flex: 1; padding: 0.5rem; border-radius: 8px; border: 1px solid #ddd; }
        button { background: #0070f3; color: #fff; border: none; border-radius: 8px; padding: 0.5rem 1rem; cursor: pointer; display: flex; align-items: center; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .icon { width: 20px; height: 20px; }
      `}</style>
    </div>
  );
};
