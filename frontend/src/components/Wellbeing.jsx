import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, SectionTitle } from './Card';

const copy = {
  en: {
    mood: 'Private mood check-in', private: 'Only you can see your mood history.', how: 'How are you feeling today?', note: 'Optional note', save: 'Save check-in', history: 'Recent check-ins', noHistory: 'No check-ins yet.', momOnly: 'Mood check-ins are private and available only to the mother account.', forum: 'Community discussion forum', safe: 'Share support and experiences. Do not use the forum for emergencies or replace professional medical advice.', placeholder: 'Start a respectful discussion…', anonymous: 'Post anonymously', topic: 'Topic', post: 'Post', reply: 'Reply', replyPlaceholder: 'Write a helpful reply…', report: 'Report', delete: 'Delete', reported: 'Reported', empty: 'No discussions yet.', confirmDelete: 'Delete this item?', error: 'Something went wrong. Please try again.', topics: { general: 'General', symptoms: 'Symptoms', nutrition: 'Nutrition', hospitals: 'Hospitals', support: 'Support' }, roles: { mom: 'Mother', partner: 'Partner', doctor: 'Doctor/Midwife' }, moods: ['Very low','Low','Okay','Good','Great']
  },
  si: {
    mood: 'පුද්ගලික මනෝභාව සටහන', private: 'ඔබගේ මනෝභාව ඉතිහාසය දැකිය හැක්කේ ඔබට පමණි.', how: 'අද ඔබට දැනෙන්නේ කෙසේද?', note: 'අමතර සටහනක්', save: 'සටහන සුරකින්න', history: 'මෑත සටහන්', noHistory: 'තවම සටහන් නැත.', momOnly: 'මනෝභාව සටහන් පුද්ගලික වන අතර මවගේ ගිණුමට පමණක් ලබා ගත හැක.', forum: 'ප්‍රජා සාකච්ඡා මණ්ඩපය', safe: 'සහාය සහ අත්දැකීම් ගෞරවයෙන් බෙදාගන්න. හදිසි අවස්ථාවලදී හෝ වෛද්‍ය උපදෙස් වෙනුවට මෙය භාවිත නොකරන්න.', placeholder: 'ගෞරවপূর্ণ සාකච්ඡාවක් ආරම්භ කරන්න…', anonymous: 'නිර්නාමිකව පළ කරන්න', topic: 'මාතෘකාව', post: 'පළ කරන්න', reply: 'පිළිතුරු දෙන්න', replyPlaceholder: 'උපකාරී පිළිතුරක් ලියන්න…', report: 'වාර්තා කරන්න', delete: 'මකන්න', reported: 'වාර්තා කර ඇත', empty: 'තවම සාකච්ඡා නැත.', confirmDelete: 'මෙය මකා දැමිය යුතුද?', error: 'දෝෂයක් ඇති විය. නැවත උත්සාහ කරන්න.', topics: { general: 'සාමාන්‍ය', symptoms: 'ලක්ෂණ', nutrition: 'පෝෂණය', hospitals: 'රෝහල්', support: 'සහාය' }, roles: { mom: 'මව', partner: 'සහකරු', doctor: 'වෛද්‍ය/වින්නඹු' }, moods: ['ඉතා අඩු','අඩු','සාමාන්‍ය','හොඳ','ඉතා හොඳ']
  },
  ta: {
    mood: 'தனிப்பட்ட மனநிலை பதிவு', private: 'உங்கள் மனநிலை வரலாற்றை நீங்கள் மட்டுமே பார்க்க முடியும்.', how: 'இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?', note: 'விருப்ப குறிப்புரை', save: 'பதிவை சேமிக்கவும்', history: 'சமீபத்திய பதிவுகள்', noHistory: 'இதுவரை பதிவுகள் இல்லை.', momOnly: 'மனநிலை பதிவுகள் தனிப்பட்டவை; தாய் கணக்கிற்கு மட்டும் கிடைக்கும்.', forum: 'சமூக கலந்துரையாடல் மன்றம்', safe: 'ஆதரவும் அனுபவங்களையும் மரியாதையுடன் பகிரவும். அவசரநிலைக்கும் மருத்துவ ஆலோசனைக்கு மாற்றாகவும் இதைப் பயன்படுத்த வேண்டாம்.', placeholder: 'மரியாதையான கலந்துரையாடலை தொடங்குங்கள்…', anonymous: 'பெயரில்லாமல் பதிவிடு', topic: 'தலைப்பு', post: 'பதிவிடு', reply: 'பதில்', replyPlaceholder: 'பயனுள்ள பதிலை எழுதுங்கள்…', report: 'புகாரளி', delete: 'நீக்கு', reported: 'புகாரளிக்கப்பட்டது', empty: 'இன்னும் கலந்துரையாடல்கள் இல்லை.', confirmDelete: 'இதை நீக்கவா?', error: 'பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.', topics: { general: 'பொது', symptoms: 'அறிகுறிகள்', nutrition: 'ஊட்டச்சத்து', hospitals: 'மருத்துவமனைகள்', support: 'ஆதரவு' }, roles: { mom: 'தாய்', partner: 'துணைவர்', doctor: 'மருத்துவர்/மருத்துவச்சி' }, moods: ['மிகக் குறைவு','குறைவு','சரி','நன்று','மிக நன்று']
  }
};

const moodIcons = ['😢','😔','😐','🙂','😄'];

export default function Wellbeing() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const c = copy[lang] || copy.en;
  const [mood, setMood] = useState(3);
  const [moodNote, setMoodNote] = useState('');
  const [history, setHistory] = useState([]);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('general');
  const [anonymous, setAnonymous] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [error, setError] = useState('');

  const isMom = user?.role === 'mom';
  const average = useMemo(() => history.length ? (history.reduce((s, x) => s + x.mood, 0) / history.length).toFixed(1) : null, [history]);

  const loadForum = () => api.getForum().then(setPosts).catch(() => setError(c.error));
  const loadMood = () => isMom && api.getMoodHistory().then(setHistory).catch(() => setError(c.error));
  useEffect(() => { loadForum(); loadMood(); }, [isMom]);

  async function saveMood() {
    try { setError(''); const saved = await api.logMood(mood, moodNote); setHistory((h) => [saved, ...h.filter((x) => x.id !== saved.id)]); setMoodNote(''); }
    catch (e) { setError(e.message || c.error); }
  }

  async function submitPost(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try { const p = await api.addPost({ text, topic, anonymous }); setPosts((v) => [p, ...v]); setText(''); setAnonymous(false); }
    catch (e) { setError(e.message || c.error); }
  }

  async function addReply(postId) {
    const value = (replyText[postId] || '').trim(); if (!value) return;
    try { const r = await api.addForumReply(postId, value); setPosts((ps) => ps.map((p) => p.id === postId ? { ...p, replies: [...p.replies, r], replyCount: p.replyCount + 1 } : p)); setReplyText((v) => ({ ...v, [postId]: '' })); }
    catch (e) { setError(e.message || c.error); }
  }

  async function removePost(id) { if (!window.confirm(c.confirmDelete)) return; await api.deleteForumPost(id); setPosts((p) => p.filter((x) => x.id !== id)); }
  async function removeReply(postId, replyId) { if (!window.confirm(c.confirmDelete)) return; await api.deleteForumReply(postId, replyId); setPosts((ps) => ps.map((p) => p.id === postId ? { ...p, replies: p.replies.filter((r) => r.id !== replyId), replyCount: p.replyCount - 1 } : p)); }
  async function report(id) { try { await api.reportForumPost(id, 'inappropriate'); setPosts((ps) => ps.map((p) => p.id === id ? { ...p, hasReported: true } : p)); } catch (e) { setError(e.message || c.error); } }

  return <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
    {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}

    <Card>
      <SectionTitle>💜 {c.mood}</SectionTitle>
      {isMom ? <>
        <p className="text-sm text-gray-500 mb-4">🔒 {c.private}</p>
        <p className="font-medium text-gray-700 mb-3">{c.how}</p>
        <div className="grid grid-cols-5 gap-2">
          {moodIcons.map((icon, i) => <button key={icon} onClick={() => setMood(i + 1)} className={`rounded-xl p-3 border ${mood === i + 1 ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-100' : 'border-gray-200'}`}><div className="text-3xl">{icon}</div><div className="text-[11px] mt-1 text-gray-600">{c.moods[i]}</div></button>)}
        </div>
        <textarea maxLength={300} value={moodNote} onChange={(e) => setMoodNote(e.target.value)} placeholder={c.note} className="mt-4 w-full border border-gray-200 rounded-xl p-3 text-sm" rows="2" />
        <button onClick={saveMood} className="mt-2 bg-purple-500 text-white rounded-lg px-4 py-2 text-sm">{c.save}</button>
        <div className="mt-5 border-t pt-4"><div className="flex justify-between"><h3 className="font-semibold text-gray-700">{c.history}</h3>{average && <span className="text-sm text-purple-600">{average}/5</span>}</div>
          {history.length === 0 ? <p className="text-sm text-gray-400 mt-2">{c.noHistory}</p> : <div className="mt-2 space-y-2">{history.slice(0,7).map((h) => <div key={h.id} className="flex gap-3 items-start bg-gray-50 rounded-lg p-2"><span className="text-xl">{moodIcons[h.mood - 1]}</span><div><p className="text-xs text-gray-500">{new Date(h.date).toLocaleString()}</p>{h.note && <p className="text-sm text-gray-700">{h.note}</p>}</div></div>)}</div>}
        </div>
      </> : <p className="text-sm text-gray-600 bg-purple-50 rounded-xl p-4">🔒 {c.momOnly}</p>}
    </Card>

    <Card>
      <SectionTitle>💬 {c.forum}</SectionTitle>
      <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3 mb-4">{c.safe}</p>
      <form onSubmit={submitPost} className="space-y-3 mb-5">
        <textarea maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder={c.placeholder} className="w-full border border-gray-200 rounded-xl p-3 text-sm" rows="3" />
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm">{c.topic} <select value={topic} onChange={(e) => setTopic(e.target.value)} className="ml-1 border rounded-lg px-2 py-1">{Object.entries(c.topics).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />{c.anonymous}</label>
          <button className="ml-auto bg-purple-500 text-white rounded-lg px-4 py-2 text-sm">{c.post}</button>
        </div>
      </form>

      {posts.length === 0 ? <p className="text-sm text-gray-400">{c.empty}</p> : <div className="space-y-4">{posts.map((p) => <article key={p.id} className="border border-purple-100 rounded-xl p-4">
        <div className="flex justify-between gap-2"><div><span className="font-semibold text-purple-700">{p.author}</span> <span className="text-[10px] bg-purple-50 text-purple-600 rounded px-2 py-1">{c.roles[p.authorRole] || p.authorRole}</span><p className="text-xs text-gray-400 mt-1">{c.topics[p.topic] || p.topic} · {new Date(p.createdAt).toLocaleString()}</p></div><div className="flex gap-2 text-xs">{p.canDelete && <button onClick={() => removePost(p.id)} className="text-red-500">{c.delete}</button>}<button disabled={p.hasReported} onClick={() => report(p.id)} className="text-gray-500 disabled:text-amber-500">{p.hasReported ? c.reported : c.report}</button></div></div>
        <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{p.text}</p>
        <div className="mt-3 space-y-2">{p.replies.map((r) => <div key={r.id} className="bg-gray-50 rounded-lg p-3 text-sm"><div className="flex justify-between"><span className="font-medium text-gray-700">{r.author} · <span className="text-xs text-purple-500">{c.roles[r.authorRole] || r.authorRole}</span></span>{r.canDelete && <button onClick={() => removeReply(p.id, r.id)} className="text-xs text-red-500">{c.delete}</button>}</div><p className="mt-1 text-gray-600">{r.text}</p></div>)}</div>
        <div className="flex gap-2 mt-3"><input value={replyText[p.id] || ''} onChange={(e) => setReplyText((v) => ({ ...v, [p.id]: e.target.value }))} placeholder={c.replyPlaceholder} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" maxLength={600} /><button onClick={() => addReply(p.id)} className="bg-purple-100 text-purple-700 rounded-lg px-3 text-sm">{c.reply}</button></div>
      </article>)}</div>}
    </Card>
  </div>;
}
