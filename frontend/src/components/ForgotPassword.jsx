import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const inputCls = 'w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100';

  const sendCode = async (event) => {
    event?.preventDefault();
    setLoading(true);
    try {
      const result = await api.forgotPassword(email.trim());
      setStep('otp');
      toast.success(result.message || 'Verification code sent to your email.');
    } catch (err) {
      toast.error(err.message || 'Could not start password reset.');
    } finally {
      setLoading(false);
    }
  };

  const changeDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 3) inputs.current[index + 1]?.focus();
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    const otp = code.join('');
    if (otp.length !== 4) return toast.error('Enter the complete 4-digit code.');
    setLoading(true);
    try {
      const result = await api.verifyResetCode(email.trim(), otp);
      setResetToken(result.resetToken);
      setStep('reset');
      toast.success('Code verified. Create your new password.');
    } catch (err) {
      toast.error(err.message || 'The verification code is invalid.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters.');
    if (password !== confirmPassword) return toast.error('Passwords do not match.');
    setLoading(true);
    try {
      await api.resetPassword(resetToken, password);
      toast.success('Password changed successfully. You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  const title = step === 'email' ? 'Forgot Password?' : step === 'otp' ? 'Enter OTP' : 'Create New Password';
  const subtitle = step === 'email' ? "No worries. Enter your registered email and we'll verify your account." : step === 'otp' ? 'Enter the 4-digit verification code we sent to your email.' : 'Choose a new password you can remember.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md rounded-[28px] border border-pink-100 bg-white p-7 shadow-[0_24px_70px_rgba(219,39,119,0.12)] sm:p-9">
        <button type="button" onClick={() => step === 'email' ? navigate('/login') : setStep(step === 'reset' ? 'otp' : 'email')} className="flex h-9 w-9 items-center justify-center rounded-full border border-pink-100 text-gray-500 transition hover:bg-pink-50">←</button>

        <div className="mt-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-3xl">{step === 'email' ? '🔐' : step === 'otp' ? '💌' : '🔑'}</div>
          <h1 className="mt-4 text-2xl font-extrabold text-pink-600">{title}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">{subtitle}</p>
        </div>

        {step === 'email' && (
          <form onSubmit={sendCode} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email</label>
              <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mom@momcare.lk" autoFocus />
            </div>
            <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Sending...' : 'Send Code'}</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verifyCode} className="mt-7">
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => <input key={index} ref={(el) => { inputs.current[index] = el; }} inputMode="numeric" maxLength={1} value={digit} onChange={(e) => changeDigit(index, e.target.value)} onKeyDown={(e) => { if (e.key === 'Backspace' && !digit && index > 0) inputs.current[index - 1]?.focus(); }} className="h-14 w-14 rounded-xl border border-pink-200 bg-pink-50 text-center text-xl font-black text-pink-600 outline-none focus:ring-4 focus:ring-pink-100" />)}
            </div>
            <button disabled={loading} className="mt-6 w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Verifying...' : 'Verify'}</button>
            <p className="mt-4 text-center text-xs text-gray-500">Didn't receive the code? <button type="button" onClick={sendCode} className="font-bold text-pink-600">Resend</button></p>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={resetPassword} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">New Password</label>
              <div className="relative"><input className={`${inputCls} pr-12`} type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 w-12 opacity-60">{showPassword ? '🙈' : '👁️'}</button></div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Confirm Password</label>
              <input className={inputCls} type={showPassword ? 'text' : 'password'} required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
            </div>
            <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Updating...' : 'Reset Password'}</button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">Remembered your password? <Link to="/login" className="font-semibold text-pink-600">Back to Log In</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
