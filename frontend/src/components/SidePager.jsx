/* eslint-disable react/prop-types */
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// Order the "e-mark" arrows page through – mirrors the header tab order.
// `labelKey` maps into t.nav so the arrow tooltips follow the selected language.
const PAGER_ROUTES = [
  { path: '/', labelKey: 'home' },
  { path: '/pregnancy', labelKey: 'tracker' },
  { path: '/appointments', labelKey: 'appointments' },
  { path: '/care-team', labelKey: 'careTeam' },
  { path: '/health', labelKey: 'health' },
  { path: '/emergency', labelKey: 'emergency' },
  { path: '/shopping', labelKey: 'shopping' },
  { path: '/wellbeing', labelKey: 'wellbeing' },
];

const ArrowGlyph = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const EMark = ({ direction, side, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-sky-500 shadow-[0_8px_24px_rgba(2,132,199,0.28)] ring-1 ring-sky-100 backdrop-blur transition active:scale-90 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 sm:h-14 sm:w-14 ${
      side === 'left' ? 'hover:-translate-x-0.5' : 'hover:translate-x-0.5'
    }`}
  >
    <span className={`inline-flex ${direction === 'left' ? '-scale-x-100' : ''}`}>
      <ArrowGlyph className="emark-wave-right h-5 w-5 sm:h-6 sm:w-6" />
    </span>
  </button>
);

const SidePager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Match FloatingAssistantBot: hide on auth pages and for signed-out / admin users.
  if (
    !user ||
    user.role === 'super_admin' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password'
  ) {
    return null;
  }

  const currentIndex = PAGER_ROUTES.findIndex((r) => r.path === location.pathname);
  const base = currentIndex === -1 ? 0 : currentIndex;
  const len = PAGER_ROUTES.length;
  const prev = PAGER_ROUTES[(base - 1 + len) % len];
  const next = PAGER_ROUTES[(base + 1) % len];

  return (
    <>
      <div className="pointer-events-none fixed left-1 top-1/2 z-[70] -translate-y-1/2 sm:left-3">
        <EMark
          direction="left"
          side="left"
          onClick={() => navigate(prev.path)}
          label={t.nav[prev.labelKey]}
        />
      </div>
      <div className="pointer-events-none fixed right-1 top-1/2 z-[70] -translate-y-1/2 sm:right-3">
        <EMark
          direction="right"
          side="right"
          onClick={() => navigate(next.path)}
          label={t.nav[next.labelKey]}
        />
      </div>
    </>
  );
};

export default SidePager;
