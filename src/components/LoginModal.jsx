import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Mail, Lock } from 'lucide-react';
import logo from '../assets/logo.png';

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, loginUser } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  if (!loginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      loginUser(email);
    }
  };

  const handleGoogleLogin = () => {
    loginUser('google.user@gmail.com');
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
            onClick={() => setLoginModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition"
          >
            <X size={20} />
          </button>
          <img src={logo} alt="CASIT Logo" className="h-12 sm:h-14 w-auto mb-2 object-contain" />
          <h3 className="text-2xl font-bold tracking-tight">Welcome to CASIT</h3>
          <p className="text-sm font-medium mt-1">Transform your spaces with premium art.</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-primary text-black font-semibold rounded-2xl shadow-yellow-glow hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm mt-2"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 bg-white text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social Sign-in */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-3 border border-gray-200 hover:border-black rounded-2xl flex items-center justify-center gap-3 text-sm font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-500"><path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.183 15.437 1 12.24 1A11 11 0 0 0 1.24 12a11 11 0 0 0 11 11c6.05 0 10.07-4.256 10.07-10.25 0-.692-.075-1.22-.165-1.765H12.24z"/></svg>
            <span>Sign In with Google</span>
          </button>

          {/* Register / Sign-in toggle */}
          <p className="text-center text-xs text-gray-500 mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="ml-1 text-black font-bold hover:underline"
            >
              {isRegister ? 'Sign In' : 'Register Now'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
