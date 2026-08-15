import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';

const Register = () => {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'mom', familyCode: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully. Welcome to MomCare LK 💗');
      navigate('/');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const inputCls = 'w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100';

  const roles = [
    { value: 'mom', label: `👩 ${t.roleMom}` },
    { value: 'partner', label: `🧑 ${t.rolePartner}` },
    { value: 'doctor', label: `🩺 ${t.roleDoctor}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-[28px] border border-pink-100 bg-white p-7 shadow-[0_24px_70px_rgba(219,39,119,0.12)] sm:p-9">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-3xl">🤰</div>
          <h1 className="mt-4 text-3xl font-extrabold text-pink-600">Create your MomCare account</h1>
          <p className="mt-2 text-sm text-gray-500">Choose your account type and start your pregnancy-care journey.</p>
        </div>

        {error && <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">{t.fullName}</label>
            <input className={inputCls} required value={form.name} onChange={set('name')} placeholder="Your full name" autoComplete="name" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">{t.email}</label>
            <input className={inputCls} type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">{t.password}</label>
              <div className="relative"><input className={`${inputCls} pr-12`} type={showPassword ? 'text' : 'password'} required minLength={6} value={form.password} onChange={set('password')} placeholder="Min. 6 characters" autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 w-12 opacity-60">{showPassword ? '🙈' : '👁️'}</button></div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Confirm Password</label>
              <input className={inputCls} type={showPassword ? 'text' : 'password'} required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" autoComplete="new-password" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">{t.accountType}</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })} className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${form.role === r.value ? 'border-pink-500 bg-pink-500 text-white shadow-sm' : 'border-pink-100 bg-pink-50/40 text-gray-600 hover:bg-pink-50'}`}>{r.label}</button>)}
            </div>
          </div>

          {form.role !== 'mom' && <div><label className="mb-1.5 block text-sm font-semibold text-gray-700">Family invitation code</label><input className={inputCls} required value={form.familyCode} onChange={set('familyCode')} placeholder="e.g. MC-1001" /><p className="mt-1.5 text-xs text-gray-400">Ask the mother for her private family code so your account links to the correct care team.</p></div>}

          <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-bold text-white shadow-md shadow-pink-100 transition hover:-translate-y-0.5 disabled:opacity-60">{loading ? 'Creating account...' : t.register}</button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">{t.haveAccount} <Link to="/login" className="font-bold text-pink-600">{t.login}</Link></p>
      </div>
    </div>
  );
};

export default Register;
