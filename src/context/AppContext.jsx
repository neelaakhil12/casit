import React, { createContext, useState, useEffect } from 'react';
import { products } from '../data/products';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('casit_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('casit_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePage, setActivePage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Search & Filter globals
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('casit_user');
    return saved ? JSON.parse(saved) : { loggedIn: false, email: '' };
  });

  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('casit_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('casit_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('casit_user', JSON.stringify(user));
  }, [user]);

  // Page switcher helper
  const navigateTo = (pageName) => {
    setActivePage(pageName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // View detailed product helper
  const viewProductDetails = (productId) => {
    setSelectedProductId(productId);
    navigateTo('product-details');
  };

  // Add to Cart
  const addToCart = (product, size = 'A4', framed = false, qty = 1) => {
    // Pricing calculation based on size and frame option
    // Base price multiplier
    let finalPrice = product.basePrice;
    
    // Size multiplier & offset
    if (size === 'A6') {
      finalPrice = product.basePrice * 1.0;
    } else if (size === 'A4') {
      finalPrice = Math.round(product.basePrice * 1.5) + 100;
    } else if (size === 'A3') {
      finalPrice = Math.round(product.basePrice * 2.2) + 250;
    } else if (size === 'Split Poster') {
      finalPrice = Math.round(product.basePrice * 4.5) + 650;
    }

    // Framing cost
    if (framed) {
      finalPrice += 400; // flat frame fee
    }

    const cartItemId = `${product.id}-${size}-${framed ? 'framed' : 'unframed'}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += qty;
        return newCart;
      }
      return [...prevCart, {
        cartItemId,
        product,
        size,
        framed,
        quantity: qty,
        price: finalPrice
      }];
    });
  };

  // Remove from Cart
  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter(item => item.cartItemId !== cartItemId));
  };

  // Update Cart Quantity
  const updateCartQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prevCart) => prevCart.map(item => 
      item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
    ));
  };

  // Toggle Wishlist
  const toggleWishlist = (productId) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.includes(productId)) {
        return prevWishlist.filter(id => id !== productId);
      }
      return [...prevWishlist, productId];
    });
  };

  // Authentication Mock
  const loginUser = (email) => {
    setUser({ loggedIn: true, email });
    setLoginModalOpen(false);
  };

  const logoutUser = () => {
    setUser({ loggedIn: false, email: '' });
  };

  return (
    <AppContext.Provider value={{
      products,
      cart,
      wishlist,
      activePage,
      selectedProductId,
      searchQuery,
      selectedCategoryFilter,
      user,
      loginModalOpen,
      setSearchQuery,
      setSelectedCategoryFilter,
      setLoginModalOpen,
      navigateTo,
      viewProductDetails,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      toggleWishlist,
      loginUser,
      logoutUser
    }}>
      {children}
    </AppContext.Provider>
  );
};
