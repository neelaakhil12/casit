import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import { Mail, KeyRound, ArrowRight, X, CheckCircle, Lock, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('casithelpline@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('casithelpline@gmail.com');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

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
          if (data.success && data.token) {
            onLogin(data.token, data.admin);
            return;
          }
        }
      } catch (backendErr) {
        console.warn('Backend server offline, trying Supabase DB:', backendErr);
      }

      // 2. Direct Supabase Query fallback
      const { data: adminRows, error: dbError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', cleanEmail)
        .limit(1);

      if (!dbError && adminRows && adminRows.length > 0) {
        const admin = adminRows[0];
        if (admin.password === cleanPass) {
          onLogin(`admin-session-${Date.now()}`, {
            id: admin.id,
            email: admin.email,
            name: admin.name || 'Admin',
            role: admin.role || 'superadmin'
          });
          return;
        } else {
          setError('Incorrect password. Please try again or use Forgot Password.');
          return;
        }
      }

      // 3. Fallback to locally updated password or default
      const customPass = localStorage.getItem('admin_custom_password') || 'admin123';
      if (cleanEmail === 'casithelpline@gmail.com' && cleanPass === customPass) {
        onLogin('default-admin-token', {
          id: 'admin-1',
          email: 'casithelpline@gmail.com',
          name: 'CASIT Admin',
          role: 'superadmin'
        });
      } else {
        setError('Invalid admin credentials. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Authentication failed. Please check your credentials.');
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

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim(),
          origin: window.location.origin
        })
      });

      const data = await res.json();
      if (data.success) {
        setResetSuccess(`Password reset link sent to ${resetEmail.trim()}! Check your inbox.`);
      } else {
        setResetError(data.message || 'Failed to send reset link.');
      }
    } catch (err) {
      console.error('Error sending reset link:', err);
      setResetError('Unable to send reset email. Please ensure the email service is reachable.');
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
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                placeholder="casithelpline@gmail.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setResetError('');
                  setResetSuccess('');
                }}
                className="text-xs text-gray-500 hover:text-black font-bold transition underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <KeyRound size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-black font-bold rounded-2xl shadow-yellow-glow hover:bg-primary-hover transition text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400">CASIT Store Management System &copy; {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-fade-in-up">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 text-black rounded-2xl flex items-center justify-center">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Forgot Password?</h3>
                  <p className="text-xs text-gray-500 font-medium">Send a reset password link to your email</p>
                </div>
              </div>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            {resetError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-2xl flex items-start gap-2 leading-relaxed">
                <CheckCircle size={16} className="shrink-0 text-green-600 mt-0.5" />
                <span>{resetSuccess}</span>
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
