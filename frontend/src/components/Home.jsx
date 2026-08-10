import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Card, SectionTitle } from './Card';
import Assistant from './Assistant';
import { useAuth } from '../context/AuthContext';

const babyFacts = {
  en: 'Around this week, your baby is growing fast — organs are developing and you may start to feel gentle movements. Keep up your clinic visits and stay hydrated!',
  si: 'මෙම සතියේ ඔබේ බිළිඳා වේගයෙන් වර්ධනය වේ — අවයව වර්ධනය වෙමින් පවතින අතර මෘදු චලනයන් දැනිය හැක. සායන හමුවීම් අතපසු නොකරන්න!',
  ta: 'இந்த வாரத்தில் உங்கள் குழந்தை வேகமாக வளர்கிறது — உறுப்புகள் வளர்ச்சியடைகின்றன. கிளினிக் சந்திப்புகளைத் தவறவிடாதீர்கள்!',
};

const Home = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => setProfile(null));
    api.getAppointments().then(setAppointments).catch(() => setAppointments([]));
  }, []);

  const week = profile?.currentWeek ?? 24;
  const nextAppointment = appointments.filter((item) => !item.completed && new Date(`${item.date}T${item.time}`) >= new Date()).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
  const pillars = [
    { path: '/pregnancy', icon: '🤰', title: 'Pregnancy Tracker', desc: 'Follow your baby’s development week by week.', color: 'from-fuchsia-100 to-pink-50' },
    { path: '/appointments', icon: '📅', title: 'Clinic Appointments', desc: 'Plan clinic visits and keep reminders together.', color: 'from-violet-100 to-purple-50' },
    { path: '/care-team', icon: '👥', title: 'Care Team & Access', desc: 'View linked accounts, permissions, and care comments.', color: 'from-indigo-100 to-violet-50' },
    { path: '/health', icon: '🩺', title: t.pillars.health, desc: t.pillars.healthDesc, color: 'from-pink-100 to-pink-50' },
    { path: '/emergency', icon: '🚨', title: t.pillars.emergency, desc: t.pillars.emergencyDesc, color: 'from-red-100 to-red-50' },
    { path: '/shopping', icon: '🛍️', title: t.pillars.shopping, desc: t.pillars.shoppingDesc, color: 'from-amber-100 to-amber-50' },
    { path: '/wellbeing', icon: '💜', title: t.pillars.wellbeing, desc: t.pillars.wellbeingDesc, color: 'from-purple-100 to-purple-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Header card — pink only */}
      <Card className="relative overflow-hidden !border-0 bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 text-white shadow-lg shadow-pink-200/60 !py-4">
        {/* decorative soft blobs, all pink tones */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-pink-300/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-pink-400/20 blur-2xl" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-pink-50/90">
              {t.welcome} · {user.role === 'doctor' ? 'Doctor / Midwife access' : `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} access`}
            </p>
            <span className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-sm">
              🤰
            </span>
          </div>

          <p className="text-sm font-semibold mt-0.5">{profile?.name ?? 'Demo Mom'} 👋</p>

          <div className="flex flex-wrap items-end justify-between gap-2 mt-0.5">
            <div>
              <span className="text-3xl font-extrabold tracking-tight">{t.week} {week}</span>
              <span className="ml-2 text-pink-50/80 text-sm">{t.of40}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-pink-50/80">{t.dueDate}</p>
              <p className="font-semibold text-sm">{profile?.dueDate ?? '2026-11-20'}</p>
            </div>
          </div>

          <div className="mt-2 h-2 bg-pink-900/25 rounded-full overflow-hidden ring-1 ring-white/10">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(week / 40) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="border-pink-100">
        <SectionTitle>👶 {t.babyThisWeek}</SectionTitle>
        <p className="text-gray-600 text-sm leading-relaxed">{babyFacts[lang]}</p>
      </Card>

      {nextAppointment && (
        <Card className="border-pink-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold text-pink-500">Next clinic appointment</p>
              <p className="font-semibold text-gray-800 mt-1">{nextAppointment.type}</p>
              <p className="text-sm text-gray-500">{nextAppointment.hospital}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-pink-600">{new Date(`${nextAppointment.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <p className="text-sm text-gray-500">{nextAppointment.time} {nextAppointment.reminderEnabled ? '🔔' : ''}</p>
            </div>
          </div>
          <Link to="/appointments" className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-pink-600 hover:text-pink-700 hover:gap-2 transition-all">
            View appointments <span aria-hidden>→</span>
          </Link>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {pillars.map((p) => (
          <Link
            key={p.path}
            to={p.path}
            className={`block text-left bg-gradient-to-br ${p.color} rounded-2xl p-5 border border-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className="text-3xl h-11 w-11 flex items-center justify-center rounded-xl bg-white/60">{p.icon}</div>
            <div className="font-semibold text-gray-800 mt-3">{p.title}</div>
            <div className="text-sm text-gray-500 mt-1 leading-relaxed">{p.desc}</div>
          </Link>
        ))}
      </div>

      <Assistant />
    </div>
  );
};

export default Home;