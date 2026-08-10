import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { Card, SectionTitle } from './Card';
import { useAuth } from '../context/AuthContext';
import RoleNotice from './RoleNotice';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';

const inputCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white';
const empty = { type: 'weight', date: '', value: '', systolic: '', diastolic: '', pulse: '', title: '', scanType: 'Ultrasound', notes: '', file: null };

function toFormData(form) {
  const data = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) data.append(key, value);
  });
  return data;
}

const Health = () => {
  const { t } = useLanguage();
  const ht = t.health;
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [comments, setComments] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => api.getRecords().then(setRecords).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => filter === 'all' ? records : records.filter((r) => r.type === filter), [records, filter]);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const payload = toFormData(form);
      const wasEditing = Boolean(editing);
      await (editing ? api.updateRecord(editing.id, payload) : api.addRecord(payload));
      setForm(empty); setEditing(null); await load();
      toast.success(wasEditing ? 'Health record updated successfully.' : 'Health record added successfully.');
    } catch (e) { setError(e.message); toast.error(e.message || 'Could not save health record.'); } finally { setBusy(false); }
  };

  const edit = (r) => {
    setEditing(r);
    setForm({ type: r.type, date: r.date, value: r.value || '', systolic: r.systolic || '', diastolic: r.diastolic || '', pulse: r.pulse || '', title: r.title || '', scanType: r.scanType || 'Ultrasound', notes: r.notes || '', file: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (r) => {
    if (!window.confirm(ht.deleteConfirm)) return;
    try { await api.deleteRecord(r.id); await load(); toast.success('Health record deleted successfully.'); } catch (e) { setError(e.message); toast.error(e.message || 'Could not delete health record.'); }
  };

  const addComment = async (recordId) => {
    const text = (comments[recordId] || '').trim(); if (!text) return;
    try { await api.addRecordComment(recordId, text); setComments((x) => ({ ...x, [recordId]: '' })); await load(); toast.success('Comment added successfully.'); } catch (e) { setError(e.message); toast.error(e.message || 'Could not add comment.'); }
  };

  const openFile = async (record) => {
    const token = localStorage.getItem('momcare_token');
    const res = await fetch(api.getRecordFileUrl(record.id), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return setError(ht.openError);
    const blob = await res.blob(); window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{ht.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{ht.desc}</p>
      </div>

      <RoleNotice role={user.role}>{ht.readonly}</RoleNotice>
      {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}

      {user.role === 'mom' && <Card>
        <SectionTitle>{editing ? `✏️ ${ht.editTitle}` : `➕ ${ht.addTitle}`}</SectionTitle>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="text-sm text-gray-600">{ht.recordType}<select disabled={!!editing} className={`${inputCls} mt-1`} value={form.type} onChange={(e) => setForm({ ...empty, type: e.target.value })}><option value="weight">{ht.weight}</option><option value="blood_pressure">{ht.bloodPressure}</option><option value="scan_report">{ht.scanReport}</option></select></label>
            <label className="text-sm text-gray-600">{t.date}<input required max={new Date().toISOString().slice(0,10)} className={`${inputCls} mt-1`} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            {form.type === 'weight' && <label className="text-sm text-gray-600">{ht.weightKg}<input required min="25" max="250" step="0.1" className={`${inputCls} mt-1`} type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></label>}
            {form.type === 'scan_report' && <label className="text-sm text-gray-600">{ht.scanType}<select className={`${inputCls} mt-1`} value={form.scanType} onChange={(e) => setForm({ ...form, scanType: e.target.value })}><option>Ultrasound</option><option>Anomaly scan</option><option>Growth scan</option><option>Laboratory report</option><option>Other</option></select></label>}
          </div>
          {form.type === 'blood_pressure' && <div className="grid sm:grid-cols-3 gap-3"><input required min="60" max="250" className={inputCls} type="number" placeholder="Systolic (SYS)" value={form.systolic} onChange={(e) => setForm({ ...form, systolic: e.target.value })} /><input required min="35" max="150" className={inputCls} type="number" placeholder="Diastolic (DIA)" value={form.diastolic} onChange={(e) => setForm({ ...form, diastolic: e.target.value })} /><input min="30" max="220" className={inputCls} type="number" placeholder="Pulse (optional)" value={form.pulse} onChange={(e) => setForm({ ...form, pulse: e.target.value })} /></div>}
          {form.type === 'scan_report' && <div className="grid sm:grid-cols-2 gap-3"><input required className={inputCls} placeholder="Report title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><label className="text-xs text-gray-500"><input required={!editing} className={inputCls} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setForm({ ...form, file: e.target.files[0] || null })} />PDF/JPG/PNG/WEBP, maximum 8 MB {editing && '(leave empty to keep current file)'}</label></div>}
          <textarea className={inputCls} rows="2" placeholder="Notes or symptoms (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2"><button disabled={busy} className="bg-purple-600 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">{busy ? 'Saving...' : editing ? 'Save changes' : 'Add record'}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="border rounded-lg px-4 py-2 text-sm">Cancel</button>}</div>
        </form>
      </Card>}

      <Card>
        <div className="flex flex-wrap justify-between gap-3 items-center mb-4"><SectionTitle>📋 Health record history</SectionTitle><select className="border rounded-lg px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All records</option><option value="weight">{ht.weight}</option><option value="blood_pressure">{ht.bloodPressure}</option><option value="scan_report">Scan reports</option></select></div>
        <div className="space-y-4">
          {visible.length === 0 && <p className="text-center text-gray-400 py-8">No records found.</p>}
          {visible.map((r) => <article key={r.id} className="border border-gray-100 rounded-2xl p-4 bg-white">
            <div className="flex flex-wrap justify-between gap-3">
              <div><span className="text-xs uppercase tracking-wide font-semibold text-purple-600">{r.type.replace('_', ' ')}</span><h3 className="font-semibold text-gray-800 mt-1">{r.type === 'weight' ? `${r.value} kg` : r.type === 'blood_pressure' ? `${r.systolic}/${r.diastolic} mmHg${r.pulse ? ` · pulse ${r.pulse}` : ''}` : r.title}</h3><p className="text-xs text-gray-500">{r.date}{r.scanType ? ` · ${r.scanType}` : ''}</p>{r.notes && <p className="text-sm text-gray-600 mt-2">{r.notes}</p>}</div>
              <div className="flex gap-2 items-start">{r.type === 'scan_report' && <button onClick={() => openFile(r)} className="text-sm border border-purple-200 text-purple-700 rounded-lg px-3 py-2">View report</button>}{user.role === 'mom' && <><button onClick={() => edit(r)} className="text-sm border rounded-lg px-3 py-2">Edit</button><button onClick={() => remove(r)} className="text-sm border border-red-200 text-red-600 rounded-lg px-3 py-2">Delete</button></>}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100"><p className="text-xs font-semibold text-gray-500 mb-2">Comments</p>{(r.comments || []).map((c) => <div key={c.id} className="bg-gray-50 rounded-lg px-3 py-2 mb-2"><p className="text-xs font-semibold text-gray-700">{c.authorName} · {c.authorRole}</p><p className="text-sm text-gray-600">{c.text}</p></div>)}<div className="flex gap-2"><input className={inputCls} placeholder="Add a comment or observation" value={comments[r.id] || ''} onChange={(e) => setComments({ ...comments, [r.id]: e.target.value })} /><button onClick={() => addComment(r.id)} className="bg-pink-500 text-white rounded-lg px-3 text-sm">Comment</button></div></div>
          </article>)}
        </div>
      </Card>
    </div>
  );
};
export default Health;
