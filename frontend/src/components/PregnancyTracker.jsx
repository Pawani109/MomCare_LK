import { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, SectionTitle } from './Card';
import { useAuth } from '../context/AuthContext';
import RoleNotice from './RoleNotice';
import { useLanguage } from '../context/LanguageContext';

const PregnancyTracker = () => {
  const { t } = useLanguage();
  const ptxt = t.pregnancy;
  const { user } = useAuth();
  const [tracker, setTracker] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [lmpDate, setLmpDate] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await api.getPregnancy();
    setTracker(data);
    setSelectedWeek({ week: data.currentWeek, ...data.weekInfo });
    setLmpDate(data.lmpDate);
  };

  useEffect(() => { load().catch((error) => setMessage(error.message)); }, []);

  const saveLmp = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const data = await api.updatePregnancy({ lmpDate });
      setTracker(data);
      setSelectedWeek({ week: data.currentWeek, ...data.weekInfo });
      setMessage(ptxt.updated);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const openWeek = async (week) => {
    try { setSelectedWeek(await api.getPregnancyWeek(week)); }
    catch (error) { setMessage(error.message); }
  };

  if (!tracker) return <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">{t.loading}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <Card className="bg-gradient-to-r from-pink-500 to-purple-500 !border-0 text-white">
        <p className="text-sm opacity-90">{ptxt.journey}</p>
        <div className="flex flex-wrap items-end justify-between gap-3 mt-2">
          <div><span className="text-4xl font-extrabold">Week {tracker.currentWeek}</span><span className="ml-2 opacity-80">+ {tracker.currentDay} days</span></div>
          <div className="text-right"><p className="text-xs opacity-80">{ptxt.estimatedDue}</p><p className="font-semibold">{tracker.dueDate}</p></div>
        </div>
        <div className="mt-4 h-3 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${tracker.progress}%` }} /></div>
        <p className="mt-2 text-sm">{tracker.progress}% of the 40-week journey</p>
      </Card>

      <RoleNotice role={user.role}>{ptxt.ownerNotice}</RoleNotice>

      {user.role === 'mom' && <Card>
        <SectionTitle>📅 {ptxt.setDates}</SectionTitle>
        <form onSubmit={saveLmp} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <label className="flex-1 text-sm text-gray-600">First day of last menstrual period (LMP)
            <input type="date" value={lmpDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setLmpDate(e.target.value)} required className="mt-1 w-full rounded-xl border border-pink-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </label>
          <button disabled={saving} className="rounded-xl bg-pink-500 px-5 py-2.5 text-white font-medium hover:bg-pink-600 disabled:opacity-60">{saving ? 'Saving...' : ptxt.update}</button>
        </form>
        {message && <p className="mt-3 text-sm text-purple-600">{message}</p>}
      </Card>}

      {selectedWeek && <Card>
        <div className="flex items-center justify-between gap-3"><SectionTitle>👶 Week {selectedWeek.week}</SectionTitle><span className="text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded-full">{ptxt.size}: {selectedWeek.size}</span></div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl bg-pink-50 p-4"><p className="font-semibold text-pink-700 mb-2">{ptxt.development}</p><p className="text-gray-600">{selectedWeek.baby}</p></div>
          <div className="rounded-xl bg-purple-50 p-4"><p className="font-semibold text-purple-700 mb-2">{ptxt.motherChanges}</p><p className="text-gray-600">{selectedWeek.mother}</p></div>
          <div className="rounded-xl bg-emerald-50 p-4"><p className="font-semibold text-emerald-700 mb-2">{ptxt.clinicGuidance}</p><p className="text-gray-600">{selectedWeek.checkup}</p></div>
        </div>
      </Card>}

      <Card>
        <SectionTitle>🗓️ {ptxt.explore}</SectionTitle>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((week) => <button key={week} onClick={() => openWeek(week)} className={`aspect-square rounded-xl text-sm font-medium ${selectedWeek?.week === week ? 'bg-purple-500 text-white' : week === tracker.currentWeek ? 'bg-pink-100 text-pink-700 ring-2 ring-pink-300' : 'bg-gray-50 text-gray-600 hover:bg-purple-50'}`}>{week}</button>)}
        </div>
      </Card>

      <p className="text-xs text-center text-gray-400">{ptxt.disclaimer}</p>
    </div>
  );
};
export default PregnancyTracker;
