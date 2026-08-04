import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { 
    cart, 
    wishlist, 
    activePage, 
    navigateTo, 
    setLoginModalOpen, 
    user, 
    logoutUser,
    searchQuery,
    setSearchQuery
  } = useContext(AppContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigateTo('categories');
    setMobileMenuOpen(false);
  };

  const handleNavClick = (page) => {
    navigateTo(page);
    setMobileMenuOpen(false);
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[5.5rem] py-2">
          
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer flex items-center gap-2 group py-1" onClick={() => handleNavClick('home')}>
            <img src={logo} alt="CASIT Logo" className="h-14 sm:h-16 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide">
            {[
              { id: 'home', label: 'Home' },
              { id: 'categories', label: 'Categories' },
              { id: 'services', label: 'Our Services' },
              { id: 'about', label: 'About Us' },
              { id: 'wishlist', label: 'Wishlist' },
              { id: 'cart', label: 'Cart' }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative py-2 text-black transition-colors duration-300 hover:text-primary-hover ${
                  activePage === link.id ? 'font-bold' : ''
                }`}
              >
                {link.label}
                {activePage === link.id && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-fade-in-up"></span>
                )}
              </button>
            ))}
          </nav>

          {/* Utility Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search toggler */}
            <div className="relative">
              {showSearchBar ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 animate-fade-in-up">
                  <input
                    type="text"
                    placeholder="Search posters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-40 text-black placeholder-gray-400 pl-1"
                    autoFocus
                  />
                  <button type="submit" className="text-gray-500 hover:text-black">
                    <Search size={16} />
                  </button>
                  <button type="button" onClick={() => { setShowSearchBar(false); setSearchQuery(''); }} className="ml-1 text-gray-400 hover:text-black">
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button 
                  onClick={() => setShowSearchBar(true)}
                  className="text-black hover:text-primary-hover transition"
                  title="Search Products"
                >
                  <Search size={22} />
                </button>
              )}
            </div>

            {/* Wishlist */}
            <button 
              onClick={() => handleNavClick('wishlist')}
              className="relative text-black hover:text-primary-hover transition"
              title="Wishlist"
            >
              <Heart size={22} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button 
              onClick={() => handleNavClick('cart')}
              className="relative text-black hover:text-primary-hover transition animate-pulse-subtle"
              title="Shopping Cart"
            >
              <ShoppingBag size={22} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* User Login status */}
            {user.loggedIn ? (
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-full pl-3 pr-2 py-1">
                <span className="text-xs font-semibold text-gray-700 max-w-[80px] truncate">{user.email.split('@')[0]}</span>
                <button 
                  onClick={logoutUser}
                  className="p-1.5 bg-black text-white hover:bg-neutral-800 rounded-full transition"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold text-xs rounded-full shadow-yellow-glow hover:scale-105 transition-all duration-300"
              >
                <User size={15} />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="md:hidden flex items-center gap-4">
            {/* Cart badge on mobile */}
            <button onClick={() => handleNavClick('cart')} className="relative text-black">
              <ShoppingBag size={24} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[9px] font-extrabold w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white">
                  {totalCartItems}
                </span>
              )}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-black focus:outline-none"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-6 py-6 space-y-6 transition-all duration-300 shadow-lg">
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5">
            <input
              type="text"
              placeholder="Search posters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-black placeholder-gray-400"
            />
            <button type="submit" className="text-gray-500">
              <Search size={18} />
            </button>
          </form>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4">
            {[
              { id: 'home', label: 'Home' },
              { id: 'categories', label: 'Categories' },
              { id: 'services', label: 'Our Services' },
              { id: 'about', label: 'About Us' },
              { id: 'wishlist', label: 'Wishlist' },
              { id: 'cart', label: 'Cart' }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left text-base font-semibold py-1.5 border-b border-gray-50 ${
                  activePage === link.id ? 'text-primary font-bold border-primary' : 'text-gray-700'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Mobile Login / Session */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {user.loggedIn ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <span className="text-sm font-semibold">{user.email}</span>
                </div>
                <button 
                  onClick={logoutUser}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-xl text-xs"
                >
                  <LogOut size={12} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setLoginModalOpen(true); setMobileMenuOpen(false); }}
                className="w-full py-3 bg-primary text-black font-bold rounded-2xl flex items-center justify-center gap-2 shadow-yellow-glow"
              >
                <User size={18} />
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
