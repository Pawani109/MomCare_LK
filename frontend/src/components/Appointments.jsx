import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { Card, SectionTitle } from './Card';
import { useAuth } from '../context/AuthContext';
import RoleNotice from './RoleNotice';

const emptyForm = { hospital: '', doctor: '', date: '', time: '', type: 'Routine antenatal clinic', notes: '', reminderEnabled: true };
const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Appointments = () => {
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
      if (editingId) await api.updateAppointment(editingId, form); else await api.addAppointment(form);
      setForm(emptyForm); setEditingId(null); setMessage(editingId ? 'Appointment updated.' : 'Appointment added.'); load();
    } catch (error) { setMessage(error.message); }
  };

  const edit = (item) => { setEditingId(item.id); setForm({ hospital: item.hospital, doctor: item.doctor, date: item.date, time: item.time, type: item.type, notes: item.notes, reminderEnabled: item.reminderEnabled }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const updateStatus = async (item) => { await api.updateAppointment(item.id, { completed: !item.completed }); load(); };
  const remove = async (id) => { if (!window.confirm('Delete this appointment?')) return; await api.deleteAppointment(id); load(); };

  return <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
    <RoleNotice role={user.role}>Appointments are read-only for your role. Only the mother can add, edit, complete, or delete them. You can add a care comment instead.</RoleNotice>

    {user.role === 'mom' &&     <Card>
      <SectionTitle>{editingId ? '✏️ Edit clinic appointment' : '➕ Add clinic appointment'}</SectionTitle>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm text-gray-600">Hospital / clinic<input className="field" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} placeholder="e.g. MOH Office Nugegoda" required /></label>
        <label className="text-sm text-gray-600">Doctor / midwife<input className="field" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} placeholder="Optional" /></label>
        <label className="text-sm text-gray-600">Date<input type="date" className="field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
        <label className="text-sm text-gray-600">Time<input type="time" className="field" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /></label>
        <label className="text-sm text-gray-600">Appointment type<select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Routine antenatal clinic</option><option>Ultrasound scan</option><option>Blood test</option><option>Vaccination</option><option>Specialist consultation</option><option>Other</option></select></label>
        <label className="text-sm text-gray-600 sm:row-span-2">Notes<textarea className="field min-h-24" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Clinic book, reports, questions to ask..." /></label>
        <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.reminderEnabled} onChange={(e) => setForm({ ...form, reminderEnabled: e.target.checked })} /> Enable in-app reminder</label>
        <div className="sm:col-span-2 flex gap-2"><button className="rounded-xl bg-pink-500 px-5 py-2.5 text-white font-medium hover:bg-pink-600">{editingId ? 'Save changes' : 'Add appointment'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-xl bg-gray-100 px-5 py-2.5 text-gray-600">Cancel</button>}</div>
      </form>
      {message && <p className="mt-3 text-sm text-purple-600">{message}</p>}
    </Card>}

    {upcoming[0] && <Card className="bg-gradient-to-r from-purple-500 to-pink-500 !border-0 text-white"><p className="text-sm opacity-80">Next appointment</p><div className="flex flex-wrap justify-between gap-3 mt-2"><div><p className="text-2xl font-bold">{upcoming[0].type}</p><p>{upcoming[0].hospital}</p></div><div className="text-right"><p className="font-semibold">{formatDate(upcoming[0].date)}</p><p>{upcoming[0].time}</p></div></div>{upcoming[0].reminderEnabled && <p className="mt-3 text-sm bg-white/20 rounded-xl p-2">🔔 Reminder enabled. This demo displays reminders inside the application.</p>}</Card>}

    <Card><SectionTitle>📋 My appointments</SectionTitle>{appointments.length === 0 ? <p className="text-sm text-gray-500">No appointments added yet.</p> : <div className="space-y-3">{appointments.map((item) => <div key={item.id} className={`rounded-xl border p-4 ${item.completed ? 'bg-gray-50 opacity-70' : 'border-pink-100'}`}><div className="flex flex-wrap justify-between gap-3"><div><div className="flex items-center gap-2"><p className="font-semibold text-gray-800">{item.type}</p>{item.reminderEnabled && <span title="Reminder enabled">🔔</span>}</div><p className="text-sm text-gray-600">{item.hospital}{item.doctor ? ` · ${item.doctor}` : ''}</p><p className="text-sm text-gray-500 mt-1">{formatDate(item.date)} at {item.time}</p>{item.notes && <p className="text-sm text-gray-500 mt-2">{item.notes}</p>}</div>{user.role === 'mom' && <div className="flex items-start gap-2"><button onClick={() => updateStatus(item)} className="small-btn">{item.completed ? 'Reopen' : 'Done'}</button><button onClick={() => edit(item)} className="small-btn">Edit</button><button onClick={() => remove(item.id)} className="small-btn text-red-500">Delete</button></div>}</div></div>)}</div>}</Card>
  </div>;
};
export default Appointments;
