import { useEffect, useState } from 'react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Card, SectionTitle } from './Card';

const Emergency = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [sent, setSent] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  const sendSos = async () => {
    setSending(true);
    try {
      const res = await api.sendSos({ lat: 6.9271, lng: 79.8612 });
      setSent(res.event);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <Card className="text-center">
        <SectionTitle>🚨 {t.sosTitle}</SectionTitle>
        <p className="text-sm text-gray-500 mb-6">{t.sosDesc}</p>
        <button
          onClick={sendSos}
          disabled={sending}
          className="w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white text-xl font-bold shadow-lg shadow-red-200 hover:scale-105 active:scale-95 transition disabled:opacity-60"
        >
          {sending ? '...' : t.sosButton}
        </button>
        {sent && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-left">
            <p className="text-sm font-medium text-green-700">✅ {t.sosSent}</p>
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
              {sent.contactsNotified.map((c) => (
                <li key={c.phone}>{c.name} — {c.phone}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-400">📍 {sent.location.lat}, {sent.location.lng} · {new Date(sent.createdAt).toLocaleTimeString()}</p>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>📞 {t.emergencyContacts}</SectionTitle>
        <ul className="space-y-2">
          {(profile?.emergencyContacts ?? []).map((c) => (
            <li key={c.phone} className="flex justify-between items-center bg-red-50/50 border border-red-100 rounded-xl px-3 py-2 text-sm">
              <span className="text-gray-700">{c.name}</span>
              <a href={`tel:${c.phone}`} className="text-red-500 font-medium">{c.phone}</a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Emergency;
