import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import { Mail, KeyRound, ArrowRight, X, CheckCircle, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('casithelpline@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('casithelpline@gmail.com');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [directResetOption, setDirectResetOption] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      // 1. Try Backend API if server running
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPass })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            onLogin();
            return;
          }
        }
      } catch (serverErr) {
        console.warn('Backend server offline or unreachable, using database auth:', serverErr);
      }

      // 2. Direct Supabase Admin Auth Check
      try {
        const { data, error: dbError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', cleanEmail)
          .single();

        if (!dbError && data && data.password === cleanPass) {
          onLogin();
          return;
        }
      } catch (dbErr) {
        console.warn('Supabase auth fallback:', dbErr);
      }

      // 3. Fallback default credentials or locally stored reset password
      const savedPass = localStorage.getItem('admin_custom_password');
      if (
        (cleanEmail === 'casithelpline@gmail.com' || cleanEmail === 'admin@casit.com') &&
        (cleanPass === 'admin123' || cleanPass === 'admin' || (savedPass && cleanPass === savedPass))
      ) {
        onLogin();
        return;
      }

      setError('Invalid email or password. Default password is: admin123');
    } catch (err) {
      console.error(err);
      setError('Authentication failed. Default password is: admin123');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError('Please enter a valid admin email.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetSuccess('');
    setDirectResetOption(false);

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() })
      });

      const data = await res.json();
      if (data.success) {
        setResetSuccess(`Password reset link sent to ${resetEmail.trim()}! Check your inbox.`);
      } else {
        setResetError(data.message || 'Failed to send reset link.');
        setDirectResetOption(true);
      }
    } catch (err) {
      console.warn('SMTP server offline, offering direct reset option:', err);
      setResetSuccess(`Email service offline. You can reset your admin password directly:`);
      setDirectResetOption(true);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 w-full max-w-md">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="CASIT Logo" className="h-16 w-auto object-contain mb-3" />
          <h2 className="text-2xl font-black text-gray-900">Admin Panel</h2>
          <p className="text-gray-500 text-xs font-semibold mt-1">Sign in to manage your store</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3.5 rounded-xl text-xs font-semibold mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Admin Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary outline-none transition-shadow"
                placeholder="casithelpline@gmail.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => { setShowForgotModal(true); setResetError(''); setResetSuccess(''); }}
                className="text-xs font-bold text-black hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary outline-none transition-shadow"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black font-bold p-3.5 rounded-xl shadow-yellow-glow hover:bg-primary-hover transition-colors text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4 border border-gray-100">
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 text-black rounded-2xl flex items-center justify-center">
                <KeyRound size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Forgot Password?</h3>
                <p className="text-xs text-gray-500 font-medium">Send a reset password link via Nodemailer SMTP</p>
              </div>
            </div>

            {resetError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl text-center">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-bold p-3 rounded-xl text-center">
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleSendResetLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Admin Email Address
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="casithelpline@gmail.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                />
              </div>

              <button 
                type="submit"
                disabled={resetLoading}
                className="w-full py-3.5 bg-primary text-black font-bold rounded-2xl shadow-yellow-glow hover:bg-primary-hover transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {resetLoading ? 'Sending Email...' : (
                  <>
                    <span>Send Reset Link to Gmail</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {directResetOption && (
                <div className="pt-2">
                  <a
                    href={`/admin/reset-password?email=${encodeURIComponent(resetEmail)}`}
                    className="w-full py-3 bg-black text-white font-bold rounded-2xl hover:bg-neutral-800 transition text-xs flex items-center justify-center gap-2"
                  >
                    <span>Click Here to Reset Password Now &rarr;</span>
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

