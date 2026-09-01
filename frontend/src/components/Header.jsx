import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { path: '/', label: t.nav.home, icon: '🏠' },
    { path: '/pregnancy', label: 'Tracker', icon: '🤰' },
    { path: '/appointments', label: 'Appointments', icon: '📅' },
    { path: '/care-team', label: 'Care Team', icon: '👥' },
    { path: '/health', label: t.nav.health, icon: '🩺' },
    { path: '/emergency', label: t.nav.emergency, icon: '🚨' },
    { path: '/shopping', label: t.nav.shopping, icon: '🛍️' },
    { path: '/wellbeing', label: t.nav.wellbeing, icon: '💜' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur border-b border-pink-100 z-10">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-pink-600">
            🤰{t.appName}
            {/* <span className="ml-2 text-[10px] font-medium uppercase tracking-wide bg-purple-100 text-purple-600 rounded-full px-2 py-0.5 align-middle">{t.demoBadge}</span> */}
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">{t.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {['en', 'si', 'ta'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-lg text-sm font-medium ${lang === l ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'}`}
              >
                {l === 'en' ? 'EN' : l === 'si' ? 'සිං' : 'தமி'}
              </button>
            ))}
          </div>
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-700 leading-tight">{user.name}</p>
                <p className="text-[10px] uppercase tracking-wide text-purple-500">{user.role === 'doctor' ? 'Doctor / Midwife' : user.role}</p>
              </div>
              <button onClick={handleLogout} className="text-sm px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </div>
      <nav className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${location.pathname === tab.path ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-purple-50'}`}
          >
            {tab.icon} {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
