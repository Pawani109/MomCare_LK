import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Card, SectionTitle } from './Card';
import Assistant from './Assistant';

const babyFacts = {
  en: 'Around this week, your baby is growing fast — organs are developing and you may start to feel gentle movements. Keep up your clinic visits and stay hydrated!',
  si: 'මෙම සතියේ ඔබේ බිළිඳා වේගයෙන් වර්ධනය වේ — අවයව වර්ධනය වෙමින් පවතින අතර මෘදු චලනයන් දැනිය හැක. සායන හමුවීම් අතපසු නොකරන්න!',
  ta: 'இந்த வாரத்தில் உங்கள் குழந்தை வேகமாக வளர்கிறது — உறுப்புகள் வளர்ச்சியடைகின்றன. கிளினிக் சந்திப்புகளைத் தவறவிடாதீர்கள்!',
};

const Home = () => {
  const { lang, t } = useLanguage();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  const week = profile?.currentWeek ?? 24;
  const pillars = [
    { path: '/health', icon: '🩺', title: t.pillars.health, desc: t.pillars.healthDesc, color: 'from-pink-100 to-pink-50' },
    { path: '/emergency', icon: '🚨', title: t.pillars.emergency, desc: t.pillars.emergencyDesc, color: 'from-red-100 to-red-50' },
    { path: '/shopping', icon: '🛍️', title: t.pillars.shopping, desc: t.pillars.shoppingDesc, color: 'from-amber-100 to-amber-50' },
    { path: '/wellbeing', icon: '💜', title: t.pillars.wellbeing, desc: t.pillars.wellbeingDesc, color: 'from-purple-100 to-purple-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <Card className="bg-gradient-to-r from-pink-500 to-purple-500 !border-0 text-white">
        <p className="text-sm opacity-90">{t.welcome},</p>
        <p className="text-2xl font-bold">{profile?.name ?? 'Demo Mom'} 👋</p>
        <div className="mt-4 flex items-end gap-3">
          <span className="text-4xl font-extrabold">{t.week} {week}</span>
          <span className="opacity-80 mb-1">{t.of40}</span>
        </div>
        <div className="mt-2 h-3 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: `${(week / 40) * 100}%` }} />
        </div>
        <p className="mt-2 text-sm opacity-90">{t.dueDate}: {profile?.dueDate ?? '2026-11-20'}</p>
      </Card>

      <Card>
        <SectionTitle>👶 {t.babyThisWeek}</SectionTitle>
        <p className="text-gray-600 text-sm">{babyFacts[lang]}</p>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {pillars.map((p) => (
          <Link key={p.path} to={p.path} className={`block text-left bg-gradient-to-br ${p.color} rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition`}>
            <div className="text-3xl">{p.icon}</div>
            <div className="font-semibold text-gray-800 mt-2">{p.title}</div>
            <div className="text-sm text-gray-500 mt-1">{p.desc}</div>
          </Link>
        ))}
      </div>

      <Assistant />
    </div>
  );
};

export default Home;
