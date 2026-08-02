/* eslint-disable react-refresh/only-export-components, react/prop-types */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n';

const LanguageContext = createContext(null);
const SUPPORTED = ['en', 'si', 'ta'];

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('momcare_language');
    return SUPPORTED.includes(saved) ? saved : 'en';
  });

  const setLang = (next) => {
    if (SUPPORTED.includes(next)) setLangState(next);
  };

  useEffect(() => {
    localStorage.setItem('momcare_language', lang);
    document.documentElement.lang = lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-LK' : 'en-LK';
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: translations[lang], languages: SUPPORTED }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
