import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Phone, MapPin, Mail, X } from 'lucide-react';

export default function ProfileSetupModal() {
  const { profileModalOpen, setProfileModalOpen, user, saveUserProfile } = useContext(AppContext);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user.loggedIn) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  if (!profileModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    saveUserProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim()
    });

    setProfileModalOpen(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary p-6 text-black relative">
          <button 
            onClick={() => setProfileModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition"
          >
            <X size={20} />
          </button>
          <h3 className="text-2xl font-bold tracking-tight">Complete Your Profile</h3>
          <p className="text-xs font-medium text-black/80 mt-1">Please fill in your contact and delivery details to continue.</p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Address (Pre-filled & Readonly) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address (Auto-filled)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  value={user.email || ''}
                  disabled
                  readOnly
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Akhil Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-sm font-semibold text-gray-900"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Phone size={18} />
                </span>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-sm font-semibold text-gray-900"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Default Delivery Address & Pincode
              </label>
              <div className="relative">
                <span className="absolute top-3.5 left-3.5 text-gray-400">
                  <MapPin size={18} />
                </span>
                <textarea 
                  rows={2}
                  placeholder="Door No, Street Name, City, State, Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-sm font-semibold text-gray-900"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-primary text-black font-bold rounded-2xl shadow-yellow-glow hover:bg-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-all text-sm mt-3"
            >
              Save Profile & Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
