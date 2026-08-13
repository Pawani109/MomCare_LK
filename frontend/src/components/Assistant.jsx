import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Card, SectionTitle } from './Card';

const Assistant = () => {
  const { t } = useLanguage();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (window.location.hash !== '#momcare-assistant') return;

    const timer = window.setTimeout(() => {
      document.getElementById('momcare-assistant')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      window.setTimeout(() => inputRef.current?.focus(), 450);
    }, 180);

    return () => window.clearTimeout(timer);
  }, []);

  const ask = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question;
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await api.askAssistant(q);
      setMessages((prev) => [...prev, { role: 'ai', text: res.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, the assistant is unavailable. Is the backend running?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="momcare-assistant" className="scroll-mt-28">
      <Card className="border-pink-100 shadow-sm">
        <SectionTitle>🤖 {t.assistant}</SectionTitle>
        <p className="text-sm text-gray-500 mb-3">{t.assistantDesc}</p>
        <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`text-sm rounded-xl px-3 py-2 max-w-[85%] ${m.role === 'user' ? 'bg-pink-100 text-gray-700 ml-auto' : 'bg-purple-50 text-gray-700 border border-purple-100'}`}>
              {m.text}
            </div>
          ))}
          {loading && <div className="text-sm text-gray-400">…</div>}
        </div>
        <form onSubmit={ask} className="flex gap-2">
          <input
            id="momcare-assistant-input"
            ref={inputRef}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-pink-200"
            placeholder={t.askPlaceholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button className="bg-pink-500 text-white rounded-lg px-4 text-sm hover:bg-pink-600 transition">{t.ask}</button>
        </form>
      </Card>
    </div>
  );
};

export default Assistant;
