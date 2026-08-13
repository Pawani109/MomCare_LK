import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { Card, SectionTitle } from './Card';
import { useAuth } from '../context/AuthContext';
import RoleNotice from './RoleNotice';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';

const emptyForm = { hospital: '', doctor: '', date: '', time: '', type: 'Routine antenatal clinic', notes: '', reminderEnabled: true };
const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Appointments = () => {
  const { t } = useLanguage();
  const at = t.appointments;
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const load = () => api.getAppointments().then(setAppointments).catch((e) => setMessage(e.message));
  useEffect(() => { load(); }, []);

  const upcoming = useMemo(() => appointments.filter((a) => !a.completed && new Date(`${a.date}T${a.time}`) >= new Date()).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [appointments]);

  const submit = async (event) => {
    event.preventDefault(); setMessage('');
    try {
      const wasEditing = Boolean(editingId);
      if (editingId) await api.updateAppointment(editingId, form); else await api.addAppointment(form);
      setForm(emptyForm); setEditingId(null); setMessage('');
      toast.success(wasEditing ? 'Appointment updated successfully.' : 'Appointment added successfully.');
      load();
    } catch (error) { setMessage(error.message); toast.error(error.message || 'Could not save appointment.'); }
  };

  const edit = (item) => { setEditingId(item.id); setForm({ hospital: item.hospital, doctor: item.doctor, date: item.date, time: item.time, type: item.type, notes: item.notes, reminderEnabled: item.reminderEnabled }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const updateStatus = async (item) => {
    try {
      await api.updateAppointment(item.id, { completed: !item.completed });
      toast.success(item.completed ? 'Appointment reopened.' : 'Appointment marked as completed.');
      load();
    } catch (error) { toast.error(error.message || 'Could not update appointment.'); }
  };
  const remove = async (id) => {
    if (!window.confirm(at.deleteConfirm)) return;
    try { await api.deleteAppointment(id); toast.success('Appointment deleted successfully.'); load(); }
    catch (error) { toast.error(error.message || 'Could not delete appointment.'); }
  };

  return <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
    {/* <RoleNotice role={user.role}>{at.readonly}</RoleNotice> */}

    {user.role === 'mom' &&     <Card>
      <SectionTitle>{editingId ? `✏️ ${at.editTitle}` : `➕ ${at.addTitle}`}</SectionTitle>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm text-gray-600">{at.hospital}<input className="field" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} placeholder={at.hospitalPh} required /></label>
        <label className="text-sm text-gray-600">{at.doctor}<input className="field" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} placeholder={t.optional} /></label>
        <label className="text-sm text-gray-600">{t.date}<input type="date" className="field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
        <label className="text-sm text-gray-600">{t.time}<input type="time" className="field" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /></label>
        <label className="text-sm text-gray-600">{at.type}<select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>{at.routine}</option><option>{at.scan}</option><option>{at.blood}</option><option>{at.vaccination}</option><option>{at.specialist}</option><option>{at.other}</option></select></label>
        <label className="text-sm text-gray-600 sm:row-span-2">{t.notes}<textarea className="field min-h-24" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={at.notesPh} /></label>
        <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.reminderEnabled} onChange={(e) => setForm({ ...form, reminderEnabled: e.target.checked })} /> {at.reminder}</label>
        <div className="sm:col-span-2 flex gap-2"><button className="rounded-xl bg-pink-500 px-5 py-2.5 text-white font-medium hover:bg-pink-600">{editingId ? at.saveChanges : at.addAppointment}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-xl bg-gray-100 px-5 py-2.5 text-gray-600">{t.cancel}</button>}</div>
      </form>
      {message && <p className="mt-3 text-sm text-purple-600">{message}</p>}
    </Card>}

    {upcoming[0] && (
      <Card className="relative overflow-hidden !border-0 bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 text-white shadow-lg shadow-pink-200/60 !py-4">
        {/* decorative soft blobs, all pink tones */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-pink-300/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-pink-400/20 blur-2xl" />

        <div className="relative">
          <p className="text-xs font-medium text-pink-50/90">{at.next}</p>

          <div className="flex flex-wrap items-end justify-between gap-2 mt-0.5">
            <div>
              <p className="text-3xl font-extrabold tracking-tight">{upcoming[0].type}</p>
              <p className="text-pink-50/80 text-sm mt-0.5">{upcoming[0].hospital}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-pink-50/80">Date</p>
              <p className="font-semibold text-sm">{formatDate(upcoming[0].date)}</p>
              <p className="text-xs text-pink-50/80 mt-0.5">{upcoming[0].time}</p>
            </div>
          </div>

          {upcoming[0].reminderEnabled && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <span>🔔</span>
              <span>{at.reminderEnabled}</span>
            </div>
          )}
        </div>
      </Card>
    )}

    <Card><SectionTitle>📋 {at.myAppointments}</SectionTitle>{appointments.length === 0 ? <p className="text-sm text-gray-500">{at.empty}</p> : <div className="space-y-3">{appointments.map((item) => <div key={item.id} className={`rounded-xl border p-4 ${item.completed ? 'bg-gray-50 opacity-70' : 'border-pink-100'}`}><div className="flex flex-wrap justify-between gap-3"><div><div className="flex items-center gap-2"><p className="font-semibold text-gray-800">{item.type}</p>{item.reminderEnabled && <span title="Reminder enabled">🔔</span>}</div><p className="text-sm text-gray-600">{item.hospital}{item.doctor ? ` · ${item.doctor}` : ''}</p><p className="text-sm text-gray-500 mt-1">{formatDate(item.date)} at {item.time}</p>{item.notes && <p className="text-sm text-gray-500 mt-2">{item.notes}</p>}</div>{user.role === 'mom' && <div className="flex items-start gap-2"><button onClick={() => updateStatus(item)} className="small-btn">{item.completed ? 'Reopen' : 'Done'}</button><button onClick={() => edit(item)} className="small-btn">Edit</button><button onClick={() => remove(item.id)} className="small-btn text-red-500">Delete</button></div>}</div></div>)}</div>}</Card>
  </div>;
};
export default Appointments;
