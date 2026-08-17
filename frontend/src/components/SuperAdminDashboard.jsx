import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ active, missing = false }) => {
  if (missing) return <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">Not linked</span>;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
      {active ? '● Active' : '● Inactive'}
    </span>
  );
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const formatDateTime = (value) => value ? new Date(value).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedFamily, setExpandedFamily] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setData(await api.getAdminDashboard());
    } catch (err) {
      toast.error(err.message || 'Could not load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const filteredFamilies = useMemo(() => {
    const rows = data?.families || [];
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const searchable = [row.familyCode, row.mother?.name, row.mother?.email, row.partner?.name, row.partner?.email, row.doctor?.name, row.doctor?.email]
        .filter(Boolean).join(' ').toLowerCase();
      const matchesQuery = !q || searchable.includes(q);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? row.mother?.active : !row.mother?.active);
      return matchesQuery && matchesStatus;
    });
  }, [data, query, statusFilter]);

  const setAccountStatus = async (member, active) => {
    if (!member) return;
    try {
      setUpdatingId(member.id);
      const res = await api.updateAdminUserStatus(member.id, active);
      toast.success(res.message);
      await loadDashboard();
    } catch (err) {
      toast.error(err.message || 'Could not update account status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const metrics = data?.metrics || {};
  const cards = [
    ['Families', metrics.totalFamilies ?? 0, '👨‍👩‍👧'],
    ['Mothers', `${metrics.activeMothers ?? 0}/${metrics.totalMothers ?? 0}`, '🤰'],
    ['Partners', `${metrics.activePartners ?? 0}/${metrics.partners ?? 0}`, '💞'],
    ['Doctors / Midwives', `${metrics.activeDoctors ?? 0}/${metrics.doctors ?? 0}`, '🩺'],
    ['Appointments', metrics.totalAppointments ?? 0, '📅'],
    ['Health records', metrics.totalHealthRecords ?? 0, '📋'],
    ['SOS events', metrics.totalSosEvents ?? 0, '🚨'],
    ['Forum posts', metrics.forumPosts ?? 0, '💬'],
  ];

  return (
    <div className="min-h-screen bg-[#fff8fc]">
      <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <h1 className="text-xl font-extrabold text-pink-600 sm:text-2xl">MomCare LK Super Admin</h1>
              <span className="hidden rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 sm:inline">Admin Portal</span>
            </div>
            <p className="mt-0.5 hidden text-xs text-gray-500 sm:block">Platform oversight, family account status and operational summaries</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-pink-500">Super Admin</p>
            </div>
            <button onClick={handleLogout} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-pink-50 hover:text-pink-600">Log Out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-[28px] bg-gradient-to-r from-pink-600 to-purple-500 p-6 text-white shadow-lg sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-100">Platform overview</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black sm:text-4xl">Welcome, Super Admin</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-pink-50">Review family account connections, pregnancy profile summaries, activity counts and account access without exposing private health-note content.</p>
            </div>
            <button onClick={loadDashboard} className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25">↻ Refresh data</button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value, icon]) => (
            <div key={label} className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between"><span className="text-2xl">{icon}</span><span className="text-2xl font-black text-gray-900">{value}</span></div>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 overflow-hidden rounded-[26px] border border-pink-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-pink-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Mother & Care-Team Accounts</h2>
              <p className="mt-1 text-sm text-gray-500">One row per mother, with linked partner/doctor status and pregnancy profile summary.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search mother, partner, doctor or code..." className="min-w-[280px] rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 outline-none focus:border-pink-300">
                <option value="all">All mothers</option>
                <option value="active">Active mothers</option>
                <option value="inactive">Inactive mothers</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading admin data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1450px] w-full text-left text-sm">
                <thead className="bg-pink-50/70 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Mother</th>
                    <th className="px-5 py-4">Mother status</th>
                    <th className="px-5 py-4">Pregnancy profile</th>
                    <th className="px-5 py-4">Partner</th>
                    <th className="px-5 py-4">Doctor / Midwife</th>
                    <th className="px-5 py-4">Care activity</th>
                    <th className="px-5 py-4">Family details</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFamilies.map((row) => (
                    <tr key={row.familyId} className="align-top hover:bg-pink-50/30">
                      <td className="px-5 py-5">
                        <p className="font-bold text-gray-900">{row.mother.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{row.mother.email}</p>
                        <p className="mt-2 text-[11px] text-gray-400">Joined {formatDate(row.mother.createdAt)}</p>
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge active={row.mother.active} />
                        <p className="mt-2 text-xs text-gray-400">Last login: {formatDateTime(row.mother.lastLoginAt)}</p>
                      </td>
                      <td className="px-5 py-5">
                        {row.pregnancy ? <>
                          <p className="font-bold text-pink-600">Week {row.pregnancy.currentWeek} + {row.pregnancy.currentDay}d</p>
                          <p className="mt-1 text-xs text-gray-500">Due {formatDate(row.pregnancy.dueDate)}</p>
                          <p className="mt-1 text-xs text-gray-400">LMP {formatDate(row.pregnancy.lmpDate)} · {row.pregnancy.progress}%</p>
                        </> : <span className="text-xs text-gray-400">No pregnancy profile</span>}
                      </td>
                      <td className="px-5 py-5">
                        {row.partner ? <>
                          <p className="font-semibold text-gray-800">{row.partner.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{row.partner.email}</p>
                          <div className="mt-2"><StatusBadge active={row.partner.active} /></div>
                        </> : <StatusBadge missing />}
                      </td>
                      <td className="px-5 py-5">
                        {row.doctor ? <>
                          <p className="font-semibold text-gray-800">{row.doctor.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{row.doctor.email}</p>
                          <div className="mt-2"><StatusBadge active={row.doctor.active} /></div>
                        </> : <StatusBadge missing />}
                      </td>
                      <td className="px-5 py-5 text-xs text-gray-600">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                          <span>📅 {row.counts.appointments}</span><span>⏳ {row.counts.upcomingAppointments}</span>
                          <span>🩺 {row.counts.healthRecords}</span><span>📄 {row.counts.scanReports}</span>
                          <span>☎️ {row.counts.emergencyContacts}</span><span>🚨 {row.counts.sosEvents}</span>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <p className="font-mono text-xs font-bold text-purple-600">{row.familyCode || '—'}</p>
                        <p className="mt-2 text-xs text-gray-400">Family ID #{row.familyId}</p>
                        <button onClick={() => setExpandedFamily(expandedFamily === row.familyId ? null : row.familyId)} className="mt-3 text-xs font-semibold text-pink-600 hover:text-pink-700">{expandedFamily === row.familyId ? 'Hide profile' : 'View profile'} →</button>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex min-w-[150px] flex-col gap-2">
                          <button disabled={updatingId === row.mother.id} onClick={() => setAccountStatus(row.mother, !row.mother.active)} className={`rounded-lg px-3 py-2 text-xs font-bold ${row.mother.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>{row.mother.active ? 'Deactivate mother' : 'Activate mother'}</button>
                          {row.partner && <button disabled={updatingId === row.partner.id} onClick={() => setAccountStatus(row.partner, !row.partner.active)} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100">{row.partner.active ? 'Disable partner' : 'Enable partner'}</button>}
                          {row.doctor && <button disabled={updatingId === row.doctor.id} onClick={() => setAccountStatus(row.doctor, !row.doctor.active)} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100">{row.doctor.active ? 'Disable doctor' : 'Enable doctor'}</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredFamilies.length && <tr><td colSpan="8" className="px-5 py-12 text-center text-gray-400">No matching family accounts found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {expandedFamily && (() => {
          const row = (data?.families || []).find((f) => f.familyId === expandedFamily);
          if (!row) return null;
          return (
            <section className="mt-5 rounded-[24px] border border-purple-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-widest text-purple-500">Family profile summary</p><h3 className="mt-1 text-xl font-extrabold text-gray-900">{row.mother.name} · {row.familyCode}</h3></div>
                <button onClick={() => setExpandedFamily(null)} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">Close</button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-pink-50 p-4"><p className="text-xs font-bold uppercase text-pink-500">Mother</p><p className="mt-2 font-semibold text-gray-800">{row.mother.name}</p><p className="text-xs text-gray-500">{row.mother.email}</p></div>
                <div className="rounded-2xl bg-purple-50 p-4"><p className="text-xs font-bold uppercase text-purple-500">Pregnancy</p><p className="mt-2 font-semibold text-gray-800">{row.pregnancy ? `Week ${row.pregnancy.currentWeek}` : 'Not configured'}</p><p className="text-xs text-gray-500">{row.pregnancy ? `Due ${formatDate(row.pregnancy.dueDate)}` : '—'}</p></div>
                <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase text-emerald-600">Partner</p><p className="mt-2 font-semibold text-gray-800">{row.partner?.name || 'Not linked'}</p><p className="text-xs text-gray-500">{row.partner?.email || '—'}</p></div>
                <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-bold uppercase text-blue-600">Doctor / Midwife</p><p className="mt-2 font-semibold text-gray-800">{row.doctor?.name || 'Not linked'}</p><p className="text-xs text-gray-500">{row.doctor?.email || '—'}</p></div>
              </div>
              <p className="mt-5 text-xs leading-5 text-gray-400">Privacy note: the Super Admin portal intentionally shows profile metadata and record counts only. It does not expose private mood notes, scan-file contents, clinical comments, or health-record values.</p>
            </section>
          );
        })()}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
