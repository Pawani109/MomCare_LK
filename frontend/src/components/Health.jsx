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


const DAY_MS = 24 * 60 * 60 * 1000;

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function groupTrendRecords(records, type, range) {
  const source = records
    .filter((record) => record.type === type && record.date)
    .map((record) => ({ ...record, _date: new Date(`${record.date}T00:00:00`) }))
    .filter((record) => !Number.isNaN(record._date.getTime()))
    .sort((a, b) => a._date - b._date);

  if (!source.length) return [];

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  let cutoff;
  if (range === 'day') cutoff = new Date(now.getTime() - 13 * DAY_MS);
  if (range === 'week') cutoff = new Date(now.getTime() - 11 * 7 * DAY_MS);
  if (range === 'month') {
    cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  }

  const filtered = source.filter((record) => !cutoff || record._date >= cutoff);
  const buckets = new Map();

  filtered.forEach((record) => {
    let key;
    let label;

    if (range === 'day') {
      key = record.date;
      label = record._date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (range === 'week') {
      const start = startOfWeek(record._date);
      key = start.toISOString().slice(0, 10);
      label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      key = `${record._date.getFullYear()}-${String(record._date.getMonth() + 1).padStart(2, '0')}`;
      label = record._date.toLocaleDateString('en-US', { month: 'short' });
    }

    if (!buckets.has(key)) buckets.set(key, { key, label, records: [] });
    buckets.get(key).records.push(record);
  });

  return [...buckets.values()].map((bucket) => {
    const avg = (values) => values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null;

    if (type === 'weight') {
      const values = bucket.records.map((r) => Number(r.value)).filter(Number.isFinite);
      return { ...bucket, weight: avg(values) };
    }

    const systolic = bucket.records.map((r) => Number(r.systolic)).filter(Number.isFinite);
    const diastolic = bucket.records.map((r) => Number(r.diastolic)).filter(Number.isFinite);
    return { ...bucket, systolic: avg(systolic), diastolic: avg(diastolic) };
  });
}

function TrendChart({ title, subtitle, records, type }) {
  const [range, setRange] = useState('week');
  const points = useMemo(() => groupTrendRecords(records, type, range), [records, type, range]);
  const series = type === 'weight'
    ? [{ key: 'weight', label: 'Weight', stroke: '#ec4899', unit: 'kg' }]
    : [
        { key: 'systolic', label: 'Systolic', stroke: '#ec4899', unit: 'mmHg' },
        { key: 'diastolic', label: 'Diastolic', stroke: '#8b5cf6', unit: 'mmHg' },
      ];

  const allValues = points.flatMap((point) =>
    series.map((item) => point[item.key]).filter((value) => Number.isFinite(value))
  );

  const width = 720;
  const height = 260;
  const pad = { left: 48, right: 22, top: 24, bottom: 48 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const rawMin = allValues.length ? Math.min(...allValues) : 0;
  const rawMax = allValues.length ? Math.max(...allValues) : 100;
  const spread = Math.max(rawMax - rawMin, type === 'weight' ? 4 : 20);
  const minY = Math.max(0, Math.floor(rawMin - spread * 0.2));
  const maxY = Math.ceil(rawMax + spread * 0.2);
  const y = (value) => pad.top + (maxY - value) / Math.max(1, maxY - minY) * plotH;
  const x = (index) => points.length <= 1
    ? pad.left + plotW / 2
    : pad.left + (index / (points.length - 1)) * plotW;

  const gridValues = Array.from({ length: 5 }, (_, i) => minY + ((maxY - minY) * i / 4));

  const pathFor = (key) => {
    const valid = points
      .map((point, index) => ({ value: point[key], index }))
      .filter(({ value }) => Number.isFinite(value));
    return valid.map(({ value, index }, i) => `${i === 0 ? 'M' : 'L'} ${x(index)} ${y(value)}`).join(' ');
  };

  const rangeLabel = range === 'day' ? 'Daily' : range === 'week' ? 'Weekly' : 'Monthly';

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {[
            ['day', 'Day'],
            ['week', 'Week'],
            ['month', 'Month'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                range === value
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-pink-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-2">
        {series.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.stroke }} />
            {item.label}
          </span>
        ))}
        <span className="ml-auto text-xs font-medium text-pink-500">{rangeLabel} view</span>
      </div>

      {points.length === 0 || allValues.length === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center rounded-2xl bg-pink-50/50 border border-dashed border-pink-200 text-center px-4">
          <div className="text-3xl mb-2">{type === 'weight' ? '⚖️' : '💗'}</div>
          <p className="text-sm font-medium text-gray-600">No {type === 'weight' ? 'weight' : 'blood pressure'} data for this period.</p>
          <p className="text-xs text-gray-400 mt-1">Add a health record and the graph will update automatically.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[580px] h-auto" role="img" aria-label={`${title} ${rangeLabel.toLowerCase()} trend`}>
            {gridValues.map((value) => {
              const yy = y(value);
              return (
                <g key={value}>
                  <line x1={pad.left} x2={width - pad.right} y1={yy} y2={yy} stroke="#f3f4f6" strokeWidth="1" />
                  <text x={pad.left - 10} y={yy + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                    {Math.round(value)}
                  </text>
                </g>
              );
            })}

            {series.map((item) => (
              <g key={item.key}>
                <path d={pathFor(item.key)} fill="none" stroke={item.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((point, index) => Number.isFinite(point[item.key]) && (
                  <g key={`${item.key}-${point.key}`}>
                    <circle cx={x(index)} cy={y(point[item.key])} r="4.5" fill="white" stroke={item.stroke} strokeWidth="2.5" />
                    <title>{`${point.label}: ${point[item.key].toFixed(type === 'weight' ? 1 : 0)} ${item.unit}`}</title>
                  </g>
                ))}
              </g>
            ))}

            {points.map((point, index) => (
              <text
                key={`label-${point.key}`}
                x={x(index)}
                y={height - 18}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {point.label}
              </text>
            ))}
          </svg>
        </div>
      )}

      {points.length > 0 && (
        <div className="mt-2 rounded-xl bg-pink-50 px-3 py-2 text-xs text-gray-500">
          Showing {points.length} {range === 'day' ? 'day' : range === 'week' ? 'week' : 'month'}{points.length === 1 ? '' : 's'} with recorded data. Weekly and monthly values are averages when multiple readings exist.
        </div>
      )}
    </Card>
  );
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

      {/* <RoleNotice role={user.role}>{ht.readonly}</RoleNotice> */}
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

      <div className="grid gap-5 lg:grid-cols-2">
        <TrendChart
          title="Weight trend"
          subtitle="Track maternal weight changes over time"
          records={records}
          type="weight"
        />
        <TrendChart
          title="Blood pressure trend"
          subtitle="Compare systolic and diastolic readings"
          records={records}
          type="blood_pressure"
        />
      </div>

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
