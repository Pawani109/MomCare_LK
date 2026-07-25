import { useEffect, useState } from 'react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Card, SectionTitle } from './Card';

const inputCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm w-full';

const Health = () => {
  const { t } = useLanguage();
  const [reminders, setReminders] = useState([]);
  const [records, setRecords] = useState([]);
  const [newReminder, setNewReminder] = useState({ title: '', date: '', time: '' });
  const [newRecord, setNewRecord] = useState({ date: '', weightKg: '', bpSystolic: '', bpDiastolic: '', notes: '' });

  useEffect(() => {
    api.getReminders().then(setReminders).catch(() => {});
    api.getRecords().then(setRecords).catch(() => {});
  }, []);

  const addReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.title || !newReminder.date) return;
    const r = await api.addReminder(newReminder);
    setReminders((prev) => [...prev, r]);
    setNewReminder({ title: '', date: '', time: '' });
  };

  const toggle = async (r) => {
    const updated = await api.toggleReminder(r.id, !r.done);
    setReminders((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
  };

  const addRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.date) return;
    const rec = await api.addRecord(newRecord);
    setRecords((prev) => [...prev, rec]);
    setNewRecord({ date: '', weightKg: '', bpSystolic: '', bpDiastolic: '', notes: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <Card>
        <SectionTitle>📅 {t.reminders}</SectionTitle>
        <ul className="space-y-2 mb-4">
          {reminders.map((r) => (
            <li key={r.id} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${r.done ? 'bg-green-50 border-green-200' : 'bg-pink-50/50 border-pink-100'}`}>
              <div>
                <p className={`text-sm font-medium ${r.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{r.title}</p>
                <p className="text-xs text-gray-500">{r.date} {r.time}</p>
              </div>
              <button onClick={() => toggle(r)} className={`text-xs px-3 py-1.5 rounded-lg ${r.done ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                ✓ {t.markDone}
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addReminder} className="grid sm:grid-cols-4 gap-2">
          <input className={`${inputCls} sm:col-span-2`} placeholder={t.reminderTitle} value={newReminder.title} onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })} />
          <input className={inputCls} type="date" value={newReminder.date} onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })} />
          <div className="flex gap-2">
            <input className={inputCls} type="time" value={newReminder.time} onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })} />
            <button className="bg-pink-500 text-white rounded-lg px-3 text-sm whitespace-nowrap">+ {t.addReminder}</button>
          </div>
        </form>
      </Card>

      <Card>
        <SectionTitle>📋 {t.records}</SectionTitle>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">{t.date}</th>
                <th className="py-2 pr-4">{t.weight}</th>
                <th className="py-2 pr-4">{t.bloodPressure}</th>
                <th className="py-2">{t.notes}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4">{r.date}</td>
                  <td className="py-2 pr-4">{r.weightKg}</td>
                  <td className="py-2 pr-4">{r.bpSystolic}/{r.bpDiastolic}</td>
                  <td className="py-2 text-gray-500">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={addRecord} className="grid sm:grid-cols-5 gap-2">
          <input className={inputCls} type="date" value={newRecord.date} onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} />
          <input className={inputCls} type="number" step="0.1" placeholder={t.weight} value={newRecord.weightKg} onChange={(e) => setNewRecord({ ...newRecord, weightKg: e.target.value })} />
          <div className="flex gap-1">
            <input className={inputCls} type="number" placeholder="SYS" value={newRecord.bpSystolic} onChange={(e) => setNewRecord({ ...newRecord, bpSystolic: e.target.value })} />
            <input className={inputCls} type="number" placeholder="DIA" value={newRecord.bpDiastolic} onChange={(e) => setNewRecord({ ...newRecord, bpDiastolic: e.target.value })} />
          </div>
          <input className={inputCls} placeholder={t.notes} value={newRecord.notes} onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })} />
          <button className="bg-purple-500 text-white rounded-lg px-3 py-2 text-sm">+ {t.addRecord}</button>
        </form>
      </Card>
    </div>
  );
};

export default Health;
