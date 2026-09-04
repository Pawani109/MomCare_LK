import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import loginImage from '../assets/image1.jpg';
import { toast } from 'react-toastify';

const EyeIcon = ({ open }) => open ? '🙈' : '👁️';

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      if (remember) localStorage.setItem('momcare_remember_email', email.trim());
      else localStorage.removeItem('momcare_remember_email');
      toast.success('Welcome back to MomCare LK 💗');
      navigate(loggedInUser.role === 'super_admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Could not log in.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-[30px] border border-pink-100 bg-white shadow-[0_24px_70px_rgba(219,39,119,0.12)] md:grid md:grid-cols-[.9fr_1.1fr]">
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50 p-8">
          <img src={loginImage} alt="Pregnant mother illustration" className="h-full max-h-[650px] w-full object-contain" />
        </div>

        <div className="p-7 sm:p-10 md:p-12 lg:p-14">
          <div className="mx-auto max-w-md">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-3xl">🤰</div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-pink-600">{t.appName}</h1>
              <p className="mt-2 text-sm text-gray-500">Welcome back! Sign in to continue your pregnancy journey.</p>
            </div>

            {error && <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

            <form onSubmit={submit} className="mt-7 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">{t.email}</label>
                <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mom@momcare.lk" autoComplete="email" />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-gray-700">{t.password}</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-pink-600 hover:text-pink-700">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input className={`${inputCls} pr-12`} type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                  <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-base opacity-60 hover:opacity-100">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-500">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-pink-200 accent-pink-500" />
                Remember my email on this device
              </label>

              <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-bold text-white shadow-md shadow-pink-100 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Signing in...' : t.login}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-gray-300"><span className="h-px flex-1 bg-gray-100" /><span>OR</span><span className="h-px flex-1 bg-gray-100" /></div>

            <p className="text-center text-sm text-gray-500">
              {t.noAccount} <Link to="/register" className="font-bold text-pink-600 hover:text-pink-700">{t.register}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
