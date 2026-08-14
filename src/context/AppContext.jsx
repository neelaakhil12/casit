import React, { createContext, useState, useEffect } from 'react';
import { products as defaultProducts, categories as defaultCategories } from '../data/products';
import { supabase } from '../admin/lib/supabase';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState(defaultProducts);
  const [categories, setCategories] = useState(defaultCategories);
  const [loadingData, setLoadingData] = useState(true);

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
    return saved ? JSON.parse(saved) : { loggedIn: false, email: '', name: '', phone: '', address: '' };
  });

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [userOrders, setUserOrders] = useState(() => {
    const saved = localStorage.getItem('casit_orders');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(o => o.id !== 'CASIT-982415') : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('casit_orders', JSON.stringify(userOrders));
  }, [userOrders]);

  // Fetch dynamic categories and products from Supabase
  const fetchSupabaseData = async () => {
    try {
      // Fetch categories
      const { data: dbCategories } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbCategories && dbCategories.length > 0) {
        const formattedCategories = dbCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: `Explore our high-definition ${cat.name} poster prints and framed wall art collection.`,
          image: cat.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop'
        }));

        // Merge with defaults to prevent missing static items
        const mergedCategories = [...formattedCategories];
        defaultCategories.forEach(defCat => {
          if (!mergedCategories.some(c => c.name.toLowerCase() === defCat.name.toLowerCase() || c.id === defCat.id)) {
            mergedCategories.push(defCat);
          }
        });
        setCategories(mergedCategories);
      }

      // Fetch products
      const { data: dbProducts } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (dbProducts && dbProducts.length > 0) {
        const formattedProducts = dbProducts.map(p => ({
          id: p.id,
          name: p.title,
          category: p.category_id || (p.categories?.name ? p.categories.name.toLowerCase().replace(/\s+/g, '-') : 'general'),
          basePrice: parseFloat(p.base_price) || 299,
          framePrice: p.frame_price !== undefined ? parseFloat(p.frame_price) : 400,
          posterFramePrice: p.poster_frame_price ? parseFloat(p.poster_frame_price) : (parseFloat(p.base_price || 0) + parseFloat(p.frame_price || 400)),
          sizePrices: p.size_prices || p.sizePrices,
          a3ExtraPrice: p.a3_extra_price !== undefined && p.a3_extra_price !== null ? parseFloat(p.a3_extra_price) : 150,
          splitExtraPrice: p.split_extra_price !== undefined && p.split_extra_price !== null ? parseFloat(p.split_extra_price) : 450,
          trending: p.is_trending !== undefined ? Boolean(p.is_trending) : true,
          bestSeller: p.is_best_seller !== undefined ? Boolean(p.is_best_seller) : false,
          newArrival: p.is_new_arrival !== undefined ? Boolean(p.is_new_arrival) : false,
          rating: 4.9,
          reviewsCount: 38,
          image: p.image_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
          description: p.description || 'Bring high definition poster art to your room decor.',
          availableFormats: p.available_formats || 'all',
          specs: {
            paper: '300 GSM Premium Matte Paper',
            printing: '12-Color Archival Giclée',
            finish: 'Anti-glare Matte Coating',
            packaging: 'Heavy-duty Cardboard Tube'
          },
          trending: true,
          bestSeller: true,
          newArrival: true
        }));

        setProducts([...formattedProducts, ...defaultProducts]);
      }
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchSupabaseData();

    // Check if returning from Google OAuth Sign-In
    if (window.location.hash.includes('access_token=')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.email) {
              loginUser(data.email);
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          })
          .catch(err => console.error('Google userinfo fetch failed:', err));
      }
    }
  }, []);

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
  const addToCart = (product, size = 'A4', wantsPoster = true, wantsFrame = false, qty = 1, customImageUrl = null, frameStyle = 'Classic Matte Black Frame') => {
    const matrix = product.sizePrices || product.size_prices;
    const formatKey = wantsPoster && wantsFrame ? 'posterFrame' : (wantsPoster ? 'poster' : 'frame');
    const sizeKey = size === 'Split Poster' ? 'Split' : size;

    let finalPrice = 0;

    // Check if custom matrix price exists for this specific size and format
    if (matrix && matrix[formatKey] && matrix[formatKey][sizeKey] && parseFloat(matrix[formatKey][sizeKey]) > 0) {
      finalPrice = parseFloat(matrix[formatKey][sizeKey]);
    } else {
      const baseP = parseFloat(product.basePrice) || 0;
      const frameP = parseFloat(product.framePrice) || 400;

      let targetPrice = 0;
      if (wantsPoster && !wantsFrame) {
        targetPrice = baseP;
      } else if (!wantsPoster && wantsFrame) {
        targetPrice = frameP;
      } else {
        targetPrice = product.posterFramePrice ? parseFloat(product.posterFramePrice) : (baseP + frameP);
      }

      let sizeAddon = 0;
      if (size === 'A6') {
        sizeAddon = -Math.round(targetPrice * 0.3);
      } else if (size === 'A4') {
        sizeAddon = 0;
      } else if (size === 'A3') {
        sizeAddon = product.a3ExtraPrice !== undefined ? product.a3ExtraPrice : 150;
      } else if (size === 'Split Poster') {
        sizeAddon = product.splitExtraPrice !== undefined ? product.splitExtraPrice : 450;
      }

      finalPrice = Math.max(0, Math.round(targetPrice + sizeAddon));
    }
    
    const styleKey = wantsFrame ? frameStyle.replace(/\s+/g, '') : 'noframe';
    const cartItemId = `${product.id}-${size}-p${wantsPoster ? 1 : 0}-f${wantsFrame ? 1 : 0}-${styleKey}${customImageUrl ? '-custom' : ''}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.cartItemId === cartItemId && item.customImageUrl === customImageUrl);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += qty;
        return newCart;
      }
      return [...prevCart, {
        cartItemId: customImageUrl ? `${cartItemId}-${Date.now()}` : cartItemId,
        product,
        size,
        wantsPoster,
        wantsFrame,
        frameStyle: wantsFrame ? frameStyle : null,
        quantity: qty,
        price: finalPrice,
        customImageUrl
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

  const saveUserProfile = (profileData) => {
    setUser(prev => {
      const updated = { ...prev, ...profileData };
      localStorage.setItem('casit_user', JSON.stringify(updated));
      return updated;
    });
  };

  const placeOrder = (orderData) => {
    const newOrder = {
      id: `CASIT-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Paid / Processing',
      customerName: user.name || 'Valued Customer',
      customerEmail: user.email,
      customerPhone: user.phone || 'N/A',
      shippingAddress: user.address || 'Standard Delivery',
      ...orderData
    };

    setUserOrders(prev => {
      const updated = [newOrder, ...prev];
      localStorage.setItem('casit_orders', JSON.stringify(updated));
      return updated;
    });
  };

  // Authentication Handler
  const loginUser = (email) => {
    const saved = localStorage.getItem('casit_user');
    const existing = saved ? JSON.parse(saved) : {};
    
    const newUser = {
      loggedIn: true,
      email: email.trim().toLowerCase(),
      name: existing.email === email ? (existing.name || '') : (existing.name || ''),
      phone: existing.email === email ? (existing.phone || '') : (existing.phone || ''),
      address: existing.email === email ? (existing.address || '') : (existing.address || '')
    };
    
    setUser(newUser);
    localStorage.setItem('casit_user', JSON.stringify(newUser));
    setLoginModalOpen(false);

    // Prompt user to complete profile if name or phone missing
    if (!newUser.name || !newUser.phone) {
      setProfileModalOpen(true);
    }
  };

  const logoutUser = () => {
    setUser({ loggedIn: false, email: '', name: '', phone: '', address: '' });
    localStorage.removeItem('casit_user');
  };

  return (
    <AppContext.Provider value={{
      products,
      categories,
      cart,
      wishlist,
      activePage,
      selectedProductId,
      searchQuery,
      selectedCategoryFilter,
      user,
      userOrders,
      loginModalOpen,
      profileModalOpen,
      loadingData,
      setSearchQuery,
      setSelectedCategoryFilter,
      setLoginModalOpen,
      setProfileModalOpen,
      saveUserProfile,
      placeOrder,
      navigateTo,
      viewProductDetails,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      toggleWishlist,
      loginUser,
      logoutUser,
      refreshData: fetchSupabaseData
    }}>
      {children}
    </AppContext.Provider>
  );
};
