import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Footer() {
  const { navigateTo } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-neutral-900 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-neutral-800">
          
          {/* Column 1: About */}
          <div className="space-y-4">
            <div className="cursor-pointer inline-block" onClick={() => navigateTo('home')}>
              <img src={logo} alt="CASIT Logo" className="h-14 sm:h-16 w-auto object-contain brightness-110" />
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              We specialize in selling high-quality premium wall posters that transform empty walls into beautiful, motivational, and aesthetic spaces.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 bg-neutral-900 hover:bg-primary hover:text-black rounded-full transition duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="p-2 bg-neutral-900 hover:bg-primary hover:text-black rounded-full transition duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="p-2 bg-neutral-900 hover:bg-primary hover:text-black rounded-full transition duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links & Support */}
          <div>
            <h4 className="text-base font-bold tracking-wider mb-6 uppercase text-primary">Quick Links</h4>
            <ul className="space-y-3.5 text-sm text-neutral-400">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-white transition duration-200">Home</button>
              </li>
              <li>
                <button onClick={() => navigateTo('categories')} className="hover:text-white transition duration-200">Explore Catalog</button>
              </li>
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-white transition duration-200">Our Services</button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition duration-200">About Us</button>
              </li>
              <li>
                <button onClick={() => navigateTo('wishlist')} className="hover:text-white transition duration-200">My Wishlist</button>
              </li>
              <li>
                <button onClick={() => navigateTo('cart')} className="hover:text-white transition duration-200">Shopping Cart</button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-base font-bold tracking-wider mb-6 uppercase text-primary">Contact Info</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <span>104, Art & Design District, Sector 62, Noida, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span>support@casitposters.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-base font-bold tracking-wider mb-2 uppercase text-primary font-sans">Subscribe Us</h4>
            <p className="text-neutral-400 text-sm">
              Subscribe to get notified about special offers, new collections, and flash sales.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-black font-bold rounded-full text-sm hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 shadow-yellow-glow"
              >
                Subscribe
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-primary font-semibold flex items-center gap-1.5 animate-pulse">
                <ShieldCheck size={14} /> Subscribed successfully! Thank you.
              </p>
            )}
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-xs gap-4">
          <p>© {new Date().getFullYear()} CASIT Posters. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Shipping & Return Policies</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
