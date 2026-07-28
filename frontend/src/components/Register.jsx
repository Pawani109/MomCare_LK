import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Register = () => {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'mom', familyCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-pink-300';

  const roles = [
    { value: 'mom', label: `👩 ${t.roleMom}` },
    { value: 'partner', label: `🧑 ${t.rolePartner}` },
    { value: 'doctor', label: `🩺 ${t.roleDoctor}` },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-pink-100 p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🤰</div>
          <h1 className="text-2xl font-bold text-pink-600">{t.appName}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.registerWelcome}</p>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t.fullName}</label>
            <input className={inputCls} required value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t.email}</label>
            <input className={inputCls} type="email" required value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t.password}</label>
            <input className={inputCls} type="password" required minLength={6} value={form.password} onChange={set('password')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t.accountType}</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`text-sm rounded-lg py-2 border ${form.role === r.value ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-pink-50'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          {form.role !== 'mom' && <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Family invitation code</label>
            <input className={inputCls} required value={form.familyCode} onChange={set('familyCode')} placeholder="e.g. MC-1001" />
            <p className="text-xs text-gray-400 mt-1">Ask the mother for her private family code.</p>
          </div>}
          <button disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg py-2.5 hover:opacity-90 transition disabled:opacity-60">
            {loading ? '...' : t.register}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          {t.haveAccount} <Link to="/login" className="text-pink-600 font-medium">{t.login}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
