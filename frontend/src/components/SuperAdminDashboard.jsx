import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ active, missing = false }) => {
  if (missing) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
        Not linked
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never';

const Metric = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <span aria-hidden="true" className="text-2xl">{icon}</span>
      <p className="text-3xl font-black tracking-tight text-pink-600">{value}</p>
    </div>
    <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
  </div>
);

const ActivityLine = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
      <span aria-hidden="true" className="text-sm">{icon}</span>
      {label}
    </span>
    <span className="font-semibold text-slate-700">{value}</span>
  </div>
);

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

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredFamilies = useMemo(() => {
    const rows = data?.families || [];
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const searchable = [
        row.familyCode,
        row.mother?.name,
        row.mother?.email,
        row.partner?.name,
        row.partner?.email,
        row.doctor?.name,
        row.doctor?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesQuery = !q || searchable.includes(q);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? row.mother?.active : !row.mother?.active);
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
    ['👨‍👩‍👧', 'Families', metrics.totalFamilies ?? 0],
    ['🤰', 'Active mothers', `${metrics.activeMothers ?? 0}/${metrics.totalMothers ?? 0}`],
    ['💞', 'Active partners', `${metrics.activePartners ?? 0}/${metrics.partners ?? 0}`],
    ['🩺', 'Doctors / Midwives', `${metrics.activeDoctors ?? 0}/${metrics.doctors ?? 0}`],
    ['📅', 'Appointments', metrics.totalAppointments ?? 0],
    ['📋', 'Health records', metrics.totalHealthRecords ?? 0],
    ['🚨', 'SOS events', metrics.totalSosEvents ?? 0],
    ['💬', 'Forum posts', metrics.forumPosts ?? 0],
  ];

  const thClass = 'px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-white/90';
  const tdClass = 'px-4 py-4 align-top border-r border-pink-50 last:border-r-0';

  return (
    <div className="min-h-screen bg-[#fdf5f9]">
      {/* Single-colour MomCare-pink header */}
      <header className="sticky top-0 z-50 bg-pink-500 text-white shadow-md shadow-pink-900/10">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">MomCare LK Super Admin</h1>
              <span className="hidden rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider sm:inline">
                Admin Portal
              </span>
            </div>
            <p className="mt-0.5 hidden text-xs text-pink-100 sm:block">
              Platform oversight, family account status and operational summaries
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-pink-100">Super Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-pink-500 p-6 text-white shadow-lg shadow-pink-200/60 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-100">Platform overview</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black sm:text-4xl">Welcome, Super Admin</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-pink-50">
                Review family account connections, pregnancy profile summaries, activity counts and account access
                without exposing private health-note content.
              </p>
            </div>
            <button
              onClick={loadDashboard}
              className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-bold text-pink-700 shadow-sm transition hover:bg-pink-50"
            >
              ↻ Refresh data
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([icon, label, value]) => (
            <Metric key={label} icon={icon} label={label} value={value} />
          ))}
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-pink-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Mother &amp; Care-Team Accounts</h2>
              <p className="mt-1 text-sm text-slate-500">
                One row per mother, with linked partner / doctor status and pregnancy profile summary.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search mother, partner, doctor or code…"
                className="min-w-[280px] rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
              >
                <option value="all">All mothers</option>
                <option value="active">Active mothers</option>
                <option value="inactive">Inactive mothers</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading admin data…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px] border-collapse text-sm">
                <thead>
                  <tr className="bg-pink-500">
                    <th className={thClass}>Mother</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Pregnancy profile</th>
                    <th className={thClass}>Partner</th>
                    <th className={thClass}>Doctor / Midwife</th>
                    <th className={thClass}>Care activity</th>
                    <th className={thClass}>Family</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFamilies.map((row, i) => (
                    <tr
                      key={row.familyId}
                      className={`border-b border-pink-100 transition hover:bg-pink-50/70 ${
                        i % 2 ? 'bg-pink-50/30' : 'bg-white'
                      }`}
                    >
                      <td className={tdClass}>
                        <p className="font-bold text-slate-900">{row.mother.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{row.mother.email}</p>
                        <p className="mt-2 text-[11px] text-slate-400">Joined {formatDate(row.mother.createdAt)}</p>
                      </td>
                      <td className={tdClass}>
                        <StatusBadge active={row.mother.active} />
                        <p className="mt-2 text-[11px] text-slate-400">
                          Last login
                          <br />
                          {formatDateTime(row.mother.lastLoginAt)}
                        </p>
                      </td>
                      <td className={tdClass}>
                        {row.pregnancy ? (
                          <>
                            <p className="font-bold text-pink-600">
                              Week {row.pregnancy.currentWeek} + {row.pregnancy.currentDay}d
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Due {formatDate(row.pregnancy.dueDate)}</p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              LMP {formatDate(row.pregnancy.lmpDate)} · {row.pregnancy.progress}%
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">No pregnancy profile</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        {row.partner ? (
                          <>
                            <p className="font-semibold text-slate-800">{row.partner.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{row.partner.email}</p>
                            <div className="mt-2">
                              <StatusBadge active={row.partner.active} />
                            </div>
                          </>
                        ) : (
                          <StatusBadge missing />
                        )}
                      </td>
                      <td className={tdClass}>
                        {row.doctor ? (
                          <>
                            <p className="font-semibold text-slate-800">{row.doctor.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{row.doctor.email}</p>
                            <div className="mt-2">
                              <StatusBadge active={row.doctor.active} />
                            </div>
                          </>
                        ) : (
                          <StatusBadge missing />
                        )}
                      </td>
                      <td className={`${tdClass} min-w-[190px]`}>
                        <div className="space-y-1.5">
                          <ActivityLine icon="📅" label="Appointments" value={row.counts.appointments} />
                          <ActivityLine icon="⏳" label="Upcoming" value={row.counts.upcomingAppointments} />
                          <ActivityLine icon="🩺" label="Health records" value={row.counts.healthRecords} />
                          <ActivityLine icon="📄" label="Scan reports" value={row.counts.scanReports} />
                          <ActivityLine icon="☎️" label="Emergency contacts" value={row.counts.emergencyContacts} />
                          <ActivityLine icon="🚨" label="SOS events" value={row.counts.sosEvents} />
                        </div>
                      </td>
                      <td className={tdClass}>
                        <span className="inline-block rounded-md bg-pink-50 px-2 py-1 font-mono text-xs font-bold text-pink-700">
                          {row.familyCode || '—'}
                        </span>
                        <p className="mt-2 text-[11px] text-slate-400">Family ID #{row.familyId}</p>
                        <button
                          onClick={() => setExpandedFamily(expandedFamily === row.familyId ? null : row.familyId)}
                          className="mt-3 text-xs font-semibold text-pink-600 hover:text-pink-700"
                        >
                          {expandedFamily === row.familyId ? 'Hide profile' : 'View profile'} →
                        </button>
                      </td>
                      <td className={tdClass}>
                        <div className="flex min-w-[150px] flex-col gap-2">
                          <button
                            disabled={updatingId === row.mother.id}
                            onClick={() => setAccountStatus(row.mother, !row.mother.active)}
                            className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${
                              row.mother.active
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {row.mother.active ? 'Deactivate mother' : 'Activate mother'}
                          </button>
                          {row.partner && (
                            <button
                              disabled={updatingId === row.partner.id}
                              onClick={() => setAccountStatus(row.partner, !row.partner.active)}
                              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                            >
                              {row.partner.active ? 'Disable partner' : 'Enable partner'}
                            </button>
                          )}
                          {row.doctor && (
                            <button
                              disabled={updatingId === row.doctor.id}
                              onClick={() => setAccountStatus(row.doctor, !row.doctor.active)}
                              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                            >
                              {row.doctor.active ? 'Disable doctor' : 'Enable doctor'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredFamilies.length && (
                    <tr>
                      <td colSpan="8" className="px-5 py-12 text-center text-slate-400">
                        No matching family accounts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {expandedFamily &&
          (() => {
            const row = (data?.families || []).find((f) => f.familyId === expandedFamily);
            if (!row) return null;
            return (
              <section className="mt-5 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-pink-500">Family profile summary</p>
                    <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                      {row.mother.name} · {row.familyCode}
                    </h3>
                  </div>
                  <button
                    onClick={() => setExpandedFamily(null)}
                    className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ['Mother', row.mother.name, row.mother.email],
                    [
                      'Pregnancy',
                      row.pregnancy ? `Week ${row.pregnancy.currentWeek}` : 'Not configured',
                      row.pregnancy ? `Due ${formatDate(row.pregnancy.dueDate)}` : '—',
                    ],
                    ['Partner', row.partner?.name || 'Not linked', row.partner?.email || '—'],
                    ['Doctor / Midwife', row.doctor?.name || 'Not linked', row.doctor?.email || '—'],
                  ].map(([label, primary, secondary]) => (
                    <div key={label} className="rounded-2xl border border-pink-100 bg-pink-50/50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-pink-500">{label}</p>
                      <p className="mt-2 font-semibold text-slate-800">{primary}</p>
                      <p className="text-xs text-slate-500">{secondary}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-5 text-slate-400">
                  Privacy note: the Super Admin portal intentionally shows profile metadata and record counts only. It
                  does not expose private mood notes, scan-file contents, clinical comments, or health-record values.
                </p>
              </section>
            );
          })()}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
