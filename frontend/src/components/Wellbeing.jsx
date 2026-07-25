import { useEffect, useState } from 'react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Card, SectionTitle } from './Card';

const Wellbeing = () => {
  const { t } = useLanguage();
  const [mood, setMood] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    api.getForum().then(setPosts).catch(() => {});
  }, []);

  const checkIn = (m) => {
    setMood(m);
    api.logMood(m).catch(() => {});
  };

  const submitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    const p = await api.addPost({ author: 'You', weekTag: 'Week 24', text: newPost });
    setPosts((prev) => [p, ...prev]);
    setNewPost('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <Card className="text-center">
        <SectionTitle>💜 {t.moodTitle}</SectionTitle>
        <div className="flex justify-center gap-3 text-4xl">
          {['😄', '🙂', '😐', '😔', '😢'].map((m) => (
            <button key={m} onClick={() => checkIn(m)} className={`p-2 rounded-2xl transition hover:scale-110 ${mood === m ? 'bg-purple-100 ring-2 ring-purple-400' : ''}`}>
              {m}
            </button>
          ))}
        </div>
        {mood && <p className="mt-3 text-sm text-purple-600">{t.moodThanks}</p>}
      </Card>

      <Card>
        <SectionTitle>💬 {t.forum}</SectionTitle>
        <form onSubmit={submitPost} className="flex gap-2 mb-4">
          <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1" placeholder={t.forumPlaceholder} value={newPost} onChange={(e) => setNewPost(e.target.value)} />
          <button className="bg-purple-500 text-white rounded-lg px-4 text-sm">{t.post}</button>
        </form>
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="bg-purple-50/50 border border-purple-100 rounded-xl p-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="font-medium text-purple-600">{p.author} · {p.weekTag}</span>
                <span>{p.replies} {t.replies}</span>
              </div>
              <p className="text-sm text-gray-700">{p.text}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Wellbeing;
