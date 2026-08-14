import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Mail, Phone, MapPin, Package, Download, CheckCircle, ShoppingBag, LogOut, ShieldCheck } from 'lucide-react';
import { generateInvoice } from '../utils/generateInvoice';

export default function Profile() {
  const { user, saveUserProfile, userOrders, navigateTo, setLoginModalOpen, logoutUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'profile'

  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user.loggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <User size={32} />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">Sign in to View Your Account</h2>
        <p className="text-xs text-gray-500">Access your saved profile details, order history, and downloadable tax invoices.</p>
        <button 
          onClick={() => setLoginModalOpen(true)}
          className="btn-primary text-xs px-8 py-3"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    saveUserProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* 2-Column Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: USER PROFILE SIDEBAR */}
        <div className="lg:col-span-4 space-y-6" data-aos="fade-right">
          
          {/* User Profile Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary text-black rounded-2xl flex items-center justify-center font-black text-2xl shadow-yellow-glow shrink-0">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black text-gray-900 truncate">
                  {user.name || user.email.split('@')[0]}
                </h2>
                <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                  {user.email}
                </p>
                {user.phone && (
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">
                    {user.phone}
                  </p>
                )}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Vertical Sidebar Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'orders'
                    ? 'bg-primary text-black shadow-yellow-glow'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package size={16} />
                  <span>Order History</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'orders' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {userOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-primary text-black shadow-yellow-glow'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User size={16} />
                  <span>Personal Details</span>
                </div>
              </button>

              <button
                onClick={logoutUser}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all mt-4"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>

          {/* Customer Helpline Card */}
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <ShieldCheck size={16} className="text-green-600" />
              <span>Need Assistance?</span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Have questions about your order or customized prints? Contact our support lab at <strong className="text-black">casithelpline@gmail.com</strong>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT AREA */}
        <div className="lg:col-span-8" data-aos="fade-left">
          
          {/* TAB 1: ORDER HISTORY & INVOICES */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Your Order History</h2>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">All orders placed under {user.email}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 rounded-full text-gray-700">
                  {userOrders.length} Total Order(s)
                </span>
              </div>

              {userOrders.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">No Orders Found Yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">Explore our premium wall posters and place your first order to get printable PDF invoices.</p>
                  <button onClick={() => navigateTo('categories')} className="btn-primary text-xs">
                    Browse Posters
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {userOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-6"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-sm text-gray-900">Order #{order.id}</span>
                            <span className="px-2.5 py-1 bg-green-50 text-green-700 font-bold rounded-full text-[10px] uppercase flex items-center gap-1">
                              <CheckCircle size={12} />
                              {order.status || 'Paid / Completed'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-medium">Placed on {order.date || 'Today'}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Amount</span>
                            <span className="text-lg font-black text-black">₹{order.totalAmount}</span>
                          </div>

                          {/* PDF Invoice Download Button */}
                          <button 
                            onClick={() => generateInvoice(order, user)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-2xl text-xs font-bold shadow-sm transition-all"
                          >
                            <Download size={14} />
                            <span>Download Invoice</span>
                          </button>
                        </div>
                      </div>

                      {/* Item List */}
                      <div className="space-y-3">
                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ordered Items ({order.items?.length || 0})</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                              <img 
                                src={item.image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300'} 
                                alt={item.name} 
                                className="w-14 h-16 object-cover rounded-xl border bg-white"
                              />
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                <p className="text-[11px] text-gray-500 font-medium">
                                  Size: <strong>{item.size}</strong> • Qty: <strong>{item.quantity}</strong>
                                </p>
                                <p className="text-xs font-black text-black">₹{item.price * item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERSONAL DETAILS */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-black text-gray-900">Personal Details</h2>
                <p className="text-xs text-gray-400 mt-1">Manage your profile details and default shipping address.</p>
              </div>

              {savedSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-bold p-3.5 rounded-2xl text-center">
                  ✓ Profile details updated successfully!
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* Email Address (Readonly) */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Email Address (Auto-filled)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <Mail size={18} />
                    </span>
                    <input 
                      type="email" 
                      value={user.email}
                      disabled
                      readOnly
                      className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Full Name
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

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Phone Number
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

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Default Delivery Address & Pincode
                  </label>
                  <div className="relative">
                    <span className="absolute top-3.5 left-3.5 text-gray-400">
                      <MapPin size={18} />
                    </span>
                    <textarea 
                      rows={3}
                      placeholder="Door No, Street Name, City, State, Pincode"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-sm font-semibold text-gray-900"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-primary text-black font-bold rounded-2xl shadow-yellow-glow hover:bg-primary-hover transition text-sm mt-2"
                >
                  Update Profile Details
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
