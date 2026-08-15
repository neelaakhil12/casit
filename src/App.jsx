import React, { useContext, useEffect } from 'react';
import { AppContext, AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import Home from './pages/Home';
import Categories from './pages/Categories';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Services from './pages/Services';
import About from './pages/About';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AdminApp from './admin/AdminApp';

import Profile from './pages/Profile';
import ProfileSetupModal from './components/ProfileSetupModal';
import CustomizePoster from './pages/CustomizePoster';
import VerifiedReviews from './components/VerifiedReviews';

function MainApp() {
  const { activePage } = useContext(AppContext);

  // Initialize scroll animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: false,
      mirror: true,
      offset: 60,
    });
  }, []);

  // Sync AOS on page switch
  useEffect(() => {
    AOS.refresh();
  }, [activePage]);

  // Page View router/switcher
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home />;
      case 'categories':
        return <Categories />;
      case 'product-details':
        return <ProductDetails />;
      case 'customize':
      case 'custom-poster':
      case 'customized-posters':
        return <CustomizePoster />;
      case 'cart':
        return <Cart />;
      case 'wishlist':
        return <Wishlist />;
      case 'services':
        return <Services />;
      case 'about':
        return <About />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Verified Customer Photo Reviews (2-Row Horizontal Scrolling Marquee) */}
      <VerifiedReviews />

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <LoginModal />
      <ProfileSetupModal />
    </div>
  );
}

export default function App() {
  // Simple check for admin route to completely separate logic and avoid context overhead
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminApp />;
  }

  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
