import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

export default function Wishlist() {
  const { wishlist, products, toggleWishlist, addToCart, navigateTo } = useContext(AppContext);

  // Filter products by wishlist keys
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleMoveToCart = (product) => {
    addToCart(product, 'A4', false, 1);
    toggleWishlist(product.id); // Remove from wishlist
    alert(`Moved ${product.name} to Cart!`);
  };

  const handleRemove = (productId) => {
    toggleWishlist(productId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-12">
      
      {/* Title banner */}
      <div className="border-b border-gray-100 pb-5" data-aos="fade-down">
        <h1 className="text-3xl font-extrabold text-gray-900 m-0">My Wishlist</h1>
        <p className="text-xs text-gray-400 mt-1">Keep track of your favorite poster designs.</p>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8" data-aos="fade-up">
          {wishlistedProducts.map((product) => {
            const formattedCategory = product.category
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            return (
              <div 
                key={product.id}
                className="premium-card relative flex flex-col h-full group overflow-hidden border border-gray-100 shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-4 right-4 p-2 bg-white/95 backdrop-blur-sm rounded-full text-red-500 shadow-md hover:bg-red-50 active:scale-90 transition duration-300"
                    title="Remove from Wishlist"
                  >
                    <Heart size={16} className="fill-red-500 text-red-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{formattedCategory}</span>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{product.description}</p>
                    <span className="text-sm font-extrabold text-black block pt-2">₹{product.basePrice}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-50 mt-4 grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleMoveToCart(product)}
                      className="py-2.5 px-2 bg-primary text-black rounded-xl hover:bg-primary-hover active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <ShoppingCart size={13} />
                      <span>Move to Cart</span>
                    </button>
                    <button 
                      onClick={() => handleRemove(product.id)}
                      className="py-2.5 px-2 border border-gray-200 text-gray-500 hover:border-red-500 hover:text-red-500 active:scale-95 transition-all text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-20 space-y-5" data-aos="zoom-in">
          <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto">
            <Heart size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Your Wishlist is Empty</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Explore posters, click the heart icon on any card, and save designs you love for future checkouts.
            </p>
          </div>
          <div className="pt-2">
            <button 
              onClick={() => navigateTo('categories')}
              className="btn-primary text-xs"
            >
              Explore Collection
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
