import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import loginImage from '../assets/image1.jpg';
import { toast } from 'react-toastify';

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully.');
      navigate('/');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-pink-300';

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 p-6">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* Left side */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50 p-8">
          <img
            src={loginImage}
            alt="MomCare"
            className="w-full max-w-md object-contain"
          />
        </div>

        {/* Right side */}
        <div className="p-8 md:p-12">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🤰</div>
            <h1 className="text-2xl font-bold text-pink-600">{t.appName}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.loginWelcome}</p>
          </div>

          {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t.email}</label>
              <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mom@momcare.lk" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t.password}</label>
              <input className={inputCls} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg py-2.5 hover:opacity-90 transition disabled:opacity-60">
              {loading ? '...' : t.login}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            {t.noAccount} <Link to="/register" className="text-pink-600 font-medium">{t.register}</Link>
          </p>

          <div className="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-gray-600">
            <p className="font-semibold text-purple-600 mb-1">{t.demoAccounts}:</p>
            <p>👩 mom@momcare.lk / mom123</p>
            <p>🧑 partner@momcare.lk / partner123</p>
            <p>🩺 doctor@momcare.lk / doctor123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
