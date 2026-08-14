import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Mail, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import logo from '../assets/logo.png';

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, loginUser } = useContext(AppContext);
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!loginModalOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      if (data.success) {
        setStep(2);
        setSuccessMsg(`OTP sent to ${email.trim()}`);
      } else {
        setError(data.message || 'Failed to send OTP email.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Make sure the auth server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });

      const data = await res.json();
      if (data.success) {
        loginUser(email.trim());
        setLoginModalOpen(false);
        // Reset state
        setStep(1);
        setOtp('');
        setEmail('');
      } else {
        setError(data.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setOtp('');
    setError('');
    handleSendOtp({ preventDefault: () => {} });
  };

  const handleClose = () => {
    setLoginModalOpen(false);
    setStep(1);
    setOtp('');
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-primary p-6 text-black relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition"
          >
            <X size={20} />
          </button>
          <img src={logo} alt="CASIT Logo" className="h-12 sm:h-14 w-auto mb-2 object-contain" />
          <h3 className="text-2xl font-bold tracking-tight">
            {step === 1 ? 'Welcome to CASIT' : 'Verify Email OTP'}
          </h3>
          <p className="text-xs font-medium text-black/80 mt-1">
            {step === 1 
              ? 'Enter your email to receive a 6-digit login code via Gmail SMTP.'
              : `We sent a code to ${email}`}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          {successMsg && step === 2 && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold p-3 rounded-xl mb-4 text-center">
              {successMsg}
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Mail size={18} />
                  </span>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. customer@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-black font-bold rounded-2xl shadow-yellow-glow hover:bg-primary-hover transition-all duration-200 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-3 bg-white text-gray-400 font-semibold">Or continue with</span>
                </div>
              </div>

              {/* Google Sign-in */}
              <button 
                type="button"
                onClick={() => {
                  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
                  if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
                    alert("Please paste your VITE_GOOGLE_CLIENT_ID in the .env file!");
                    return;
                  }
                  const redirectUri = window.location.origin;
                  const scope = 'email profile';
                  const responseType = 'token';
                  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;
                  window.location.href = authUrl;
                }}
                className="w-full py-3 border border-gray-200 hover:border-black rounded-2xl flex items-center justify-center gap-3 text-sm font-bold hover:bg-gray-50 active:scale-[0.98] transition-all duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-500"><path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.183 15.437 1 12.24 1A11 11 0 0 0 1.24 12a11 11 0 0 0 11 11c6.05 0 10.07-4.256 10.07-10.25 0-.692-.075-1.22-.165-1.765H12.24z"/></svg>
                <span>Sign In with Google</span>
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">6-Digit Verification Code</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <ShieldCheck size={18} />
                  </span>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-center text-lg font-mono font-bold tracking-widest"
                    autoFocus
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-black font-bold rounded-2xl shadow-yellow-glow hover:bg-primary-hover transition-all duration-200 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="text-gray-500 hover:text-black font-medium"
                >
                  ← Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} />
                  <span>Resend Code</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
