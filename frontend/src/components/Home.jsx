import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Card, SectionTitle } from './Card';
import Assistant from './Assistant';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/image1.jpg';

const babyFacts = {
  en: 'Around this week, your baby is growing fast — organs are developing and you may start to feel gentle movements. Keep up your clinic visits and stay hydrated!',
  si: 'මෙම සතියේ ඔබේ බිළිඳා වේගයෙන් වර්ධනය වේ — අවයව වර්ධනය වෙමින් පවතින අතර මෘදු චලනයන් දැනිය හැක. සායන හමුවීම් අතපසු නොකරන්න!',
  ta: 'இந்த வாரத்தில் உங்கள் குழந்தை வேகமாக வளர்கிறது — உறுப்புகள் வளர்ச்சியடைகின்றன. கிளினிக் சந்திப்புகளைத் தவறவிடாதீர்கள்!',
};

const homeCopy = {
  en: {
    eyebrow: 'Your pregnancy care, all in one place',
    heading: 'Welcome to MomCare LK',
    intro: 'Track your pregnancy, organise clinic visits, keep health records, reach emergency contacts and stay connected with your care team.',
    progressLabel: 'Pregnancy progress',
    quickTitle: 'Your care at a glance',
    quickDesc: 'The most important information for today, without searching through the app.',
    exploreTitle: 'What would you like to do?',
    exploreDesc: 'Choose a MomCare service to continue.',
    track: 'View pregnancy tracker',
    appointment: 'Manage appointments',
    nextVisit: 'Next clinic visit',
    noVisit: 'No upcoming appointment',
    noVisitDesc: 'Add your next clinic visit so MomCare can keep it visible here.',
    addVisit: 'Add appointment',
    babyTitle: 'Baby this week',
    support: 'Care & support',
    protected: 'Your family health information is protected by role-based access.',
    roleDoctor: 'Doctor / Midwife access',
    roleMom: 'Mom access',
    rolePartner: 'Partner access',
  },
  si: {
    eyebrow: 'ඔබේ ගර්භණී සත්කාරය එකම තැනක',
    heading: 'MomCare LK වෙත සාදරයෙන් පිළිගනිමු',
    intro: 'ගර්භණී සති නිරීක්ෂණය කරන්න, සායන හමුවීම් කළමනාකරණය කරන්න, සෞඛ්‍ය වාර්තා තබාගන්න, හදිසි සම්බන්ධතා සහ සත්කාර කණ්ඩායම සමඟ සම්බන්ධව සිටින්න.',
    progressLabel: 'ගර්භණී ප්‍රගතිය',
    quickTitle: 'අද ඔබට වැදගත් දේ',
    quickDesc: 'යෙදුම තුළ සෙවීමකින් තොරව අද අවශ්‍ය තොරතුරු ඉක්මනින් බලන්න.',
    exploreTitle: 'ඔබට දැන් කළ යුත්තේ කුමක්ද?',
    exploreDesc: 'ඉදිරියට යාමට MomCare සේවාවක් තෝරන්න.',
    track: 'ගර්භණී නිරීක්ෂකය බලන්න',
    appointment: 'හමුවීම් කළමනාකරණය',
    nextVisit: 'ඊළඟ සායන හමුවීම',
    noVisit: 'ඉදිරි හමුවීමක් නැත',
    noVisitDesc: 'ඔබේ ඊළඟ සායන හමුවීම එක් කරන්න.',
    addVisit: 'හමුවීමක් එක් කරන්න',
    babyTitle: 'මෙම සතියේ බිළිඳා',
    support: 'සත්කාර සහ සහාය',
    protected: 'ඔබේ පවුලේ සෞඛ්‍ය තොරතුරු භූමිකා පදනම් වූ ප්‍රවේශයෙන් ආරක්ෂිතයි.',
    roleDoctor: 'වෛද්‍ය / වින්නඹු ප්‍රවේශය',
    roleMom: 'මවගේ ප්‍රවේශය',
    rolePartner: 'සහකරුගේ ප්‍රවේශය',
  },
  ta: {
    eyebrow: 'உங்கள் கர்ப்ப பராமரிப்பு அனைத்தும் ஒரே இடத்தில்',
    heading: 'MomCare LK-க்கு வரவேற்கிறோம்',
    intro: 'கர்ப்ப முன்னேற்றத்தைப் பின்தொடருங்கள், கிளினிக் சந்திப்புகளை நிர்வகியுங்கள், சுகாதார பதிவுகளை வைத்திருங்கள், அவசர தொடர்புகள் மற்றும் பராமரிப்பு குழுவுடன் இணைந்திருங்கள்.',
    progressLabel: 'கர்ப்ப முன்னேற்றம்',
    quickTitle: 'இன்றைய பராமரிப்பு சுருக்கம்',
    quickDesc: 'செயலியில் தேடாமல் இன்றைக்கு முக்கியமான தகவல்களை விரைவாகப் பாருங்கள்.',
    exploreTitle: 'இப்போது என்ன செய்ய விரும்புகிறீர்கள்?',
    exploreDesc: 'தொடர MomCare சேவையைத் தேர்ந்தெடுக்கவும்.',
    track: 'கர்ப்ப கண்காணிப்பைப் பார்க்க',
    appointment: 'சந்திப்புகளை நிர்வகிக்க',
    nextVisit: 'அடுத்த கிளினிக் சந்திப்பு',
    noVisit: 'வரவிருக்கும் சந்திப்பு இல்லை',
    noVisitDesc: 'உங்கள் அடுத்த கிளினிக் சந்திப்பைச் சேர்க்கவும்.',
    addVisit: 'சந்திப்பைச் சேர்க்க',
    babyTitle: 'இந்த வாரம் குழந்தை',
    support: 'பராமரிப்பு மற்றும் ஆதரவு',
    protected: 'உங்கள் குடும்ப சுகாதார தகவல்கள் பங்கு அடிப்படையிலான அணுகலால் பாதுகாக்கப்படுகின்றன.',
    roleDoctor: 'மருத்துவர் / மருத்துவச்சி அணுகல்',
    roleMom: 'அம்மா அணுகல்',
    rolePartner: 'துணைவர் அணுகல்',
  },
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

  const copy = homeCopy[lang] || homeCopy.en;
  const week = profile?.currentWeek ?? 24;
  const progress = Math.min(100, Math.max(0, (week / 40) * 100));
  const nextAppointment = appointments
    .filter((item) => !item.completed && new Date(`${item.date}T${item.time}`) >= new Date())
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];

  const accessLabel = user.role === 'doctor'
    ? copy.roleDoctor
    : user.role === 'partner'
      ? copy.rolePartner
      : copy.roleMom;

  const pillars = [
    { path: '/pregnancy', icon: '🤰', title: 'Pregnancy Tracker', desc: 'Follow your baby’s development week by week.' },
    { path: '/appointments', icon: '📅', title: 'Clinic Appointments', desc: 'Plan clinic visits and keep reminders together.' },
    { path: '/health', icon: '🩺', title: t.pillars.health, desc: t.pillars.healthDesc },
    { path: '/care-team', icon: '👥', title: 'Care Team & Access', desc: 'See linked family and care-team access.' },
    { path: '/emergency', icon: '🚨', title: t.pillars.emergency, desc: t.pillars.emergencyDesc },
    { path: '/shopping', icon: '📍', title: t.pillars.shopping, desc: t.pillars.shoppingDesc },
    { path: '/wellbeing', icon: '💗', title: t.pillars.wellbeing, desc: t.pillars.wellbeingDesc },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-7">
      {/* Clear first-impression hero */}
      <section className="relative isolate overflow-hidden rounded-[30px] border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-pink-100 shadow-sm">
        <div className="grid min-h-[360px] lg:grid-cols-[1.25fr_.75fr]">
          <div className="relative z-10 flex flex-col justify-center p-7 sm:p-9 lg:p-12">
            <span className="w-fit rounded-full bg-pink-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-pink-700">
              {copy.eyebrow}
            </span>

            <h1 className="mt-5 max-w-2xl text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {copy.heading}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
              {copy.intro}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/pregnancy" className="rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700">
                {copy.track} →
              </Link>
              <Link to="/appointments" className="rounded-xl border border-pink-200 bg-white px-5 py-3 text-sm font-semibold text-pink-700 transition hover:bg-pink-50">
                {copy.appointment}
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="rounded-full border border-pink-100 bg-white/80 px-3 py-1.5">🔐 {accessLabel}</span>
              <span>{copy.protected}</span>
            </div>
          </div>

          <div className="relative hidden min-h-[360px] lg:block">
            <div className="absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-white to-transparent" />
            <img src={heroImage} alt="Pregnancy care" className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-pink-300/10" />
          </div>
        </div>
      </section>

      {/* Personal pregnancy status */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 !p-6 border-pink-100 bg-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pink-500">{t.welcome}</p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">{profile?.name ?? 'Demo Mom'} 👋</h2>
              <p className="mt-1 text-sm text-gray-500">{accessLabel}</p>
            </div>
            <div className="rounded-2xl bg-pink-50 px-4 py-3 text-right">
              <p className="text-xs text-gray-500">{t.dueDate}</p>
              <p className="mt-0.5 font-bold text-pink-700">{profile?.dueDate ?? '2026-11-20'}</p>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">{copy.progressLabel}</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-4xl font-black text-pink-600">{t.week} {week}</span>
                <span className="mb-1 text-sm text-gray-500">{t.of40}</span>
              </div>
            </div>
            <span className="text-sm font-bold text-pink-600">{Math.round(progress)}%</span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-pink-100">
            <div className="h-full rounded-full bg-pink-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </Card>

        <Card className="!p-6 border-pink-100 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pink-100">{copy.babyTitle}</p>
          <div className="mt-4 text-4xl">👶</div>
          <p className="mt-4 text-sm leading-6 text-pink-50">{babyFacts[lang]}</p>
          <Link to="/pregnancy" className="mt-5 inline-flex text-sm font-semibold text-white underline decoration-pink-200 underline-offset-4">
            {copy.track} →
          </Link>
        </Card>
      </section>

      {/* Today's useful information */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{copy.quickTitle}</h2>
          <p className="mt-1 text-sm text-gray-500">{copy.quickDesc}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {nextAppointment ? (
            <Card className="!p-6 border-pink-100">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-2xl">📅</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pink-500">{copy.nextVisit}</p>
                  <h3 className="mt-1 font-bold text-gray-900">{nextAppointment.type}</h3>
                  <p className="mt-1 text-sm text-gray-500">{nextAppointment.hospital}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-pink-50 px-3 py-2 font-semibold text-pink-700">
                      {new Date(`${nextAppointment.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="rounded-lg bg-gray-50 px-3 py-2 font-semibold text-gray-600">
                      {nextAppointment.time} {nextAppointment.reminderEnabled ? '🔔' : ''}
                    </span>
                  </div>
                  <Link to="/appointments" className="mt-4 inline-flex text-sm font-semibold text-pink-600 hover:text-pink-700">{copy.appointment} →</Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="!p-6 border-pink-100">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-2xl">📅</div>
                <div>
                  <h3 className="font-bold text-gray-900">{copy.noVisit}</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-500">{copy.noVisitDesc}</p>
                  <Link to="/appointments" className="mt-4 inline-flex rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700">{copy.addVisit}</Link>
                </div>
              </div>
            </Card>
          )}

          <Card className="!p-6 border-pink-100">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-2xl">💗</div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pink-500">{copy.support}</p>
                <h3 className="mt-1 font-bold text-gray-900">MomCare is more than a pregnancy calendar</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Health records, SOS support, nearby care, wellbeing check-ins and your care team are available from one dashboard.
                </p>
                <Link to="/wellbeing" className="mt-4 inline-flex text-sm font-semibold text-pink-600 hover:text-pink-700">Explore wellbeing →</Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Feature directory */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{copy.exploreTitle}</h2>
          <p className="mt-1 text-sm text-gray-500">{copy.exploreDesc}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <Link
              key={p.path}
              to={p.path}
              className="group rounded-2xl border border-pink-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-pink-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-2xl transition group-hover:bg-pink-100">{p.icon}</div>
              <h3 className="mt-4 font-bold text-gray-900">{p.title}</h3>
              <p className="mt-1 min-h-[40px] text-sm leading-5 text-gray-500">{p.desc}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-pink-600">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>💬 MomCare Assistant</SectionTitle>
        <Assistant />
      </section>
    </div>
  );
};

export default Home;
