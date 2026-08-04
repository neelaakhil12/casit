import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Heart, Eye, Star, Plus, Check } from 'lucide-react';
import { sizes } from '../data/products';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart, viewProductDetails } = useContext(AppContext);
  const [selectedSize, setSelectedSize] = useState('A4');
  const [addedToast, setAddedToast] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Dynamic price calculation based on selected size
  const getCalculatedPrice = () => {
    let price = product.basePrice;
    if (selectedSize === 'A6') {
      price = product.basePrice * 1.0;
    } else if (selectedSize === 'A4') {
      price = Math.round(product.basePrice * 1.5) + 100;
    } else if (selectedSize === 'A3') {
      price = Math.round(product.basePrice * 2.2) + 250;
    } else if (selectedSize === 'Split Poster') {
      price = Math.round(product.basePrice * 4.5) + 650;
    }
    return price;
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, selectedSize, false, 1);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  const formattedCategory = product.category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div 
      className="premium-card relative flex flex-col h-full group overflow-hidden cursor-pointer rounded-3xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300"
      onClick={() => viewProductDetails(product.id)}
      data-aos="fade-up"
    >
      {/* Image container with compact mobile height */}
      <div className="relative aspect-[4/3] max-h-44 sm:max-h-56 w-full bg-gray-50 overflow-hidden shrink-0">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />
        
        {/* Wishlist floating button */}
        <button 
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-10 p-2 sm:p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-md text-gray-500 hover:text-red-500 active:scale-90 transition duration-300"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={15} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
        </button>

        {/* Quick View overlay button */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); viewProductDetails(product.id); }}
            className="p-2.5 sm:p-3 bg-white text-black font-semibold rounded-full hover:bg-primary active:scale-95 transition-all duration-300 shadow-lg flex items-center gap-1.5 text-xs"
            title="Quick View"
          >
            <Eye size={15} />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-5 flex flex-col justify-between flex-grow">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <span className="truncate">{formattedCategory}</span>
            <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
              <Star size={11} className="fill-amber-500" />
              <span className="font-semibold text-gray-600">{product.rating}</span>
            </div>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-primary-hover transition duration-200">
            {product.name}
          </h4>
          <p className="text-[11px] text-gray-400 line-clamp-1 leading-tight">
            {product.description}
          </p>
        </div>

        {/* Size Selection Dropdown */}
        <div className="pt-2 border-t border-gray-100 mt-2 space-y-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Size</label>
          </div>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 text-gray-800 focus:outline-none focus:border-black cursor-pointer"
          >
            {sizes.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2 gap-2">
          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase block">Price</span>
            <span className="text-base sm:text-lg font-black text-black">₹{getCalculatedPrice()}</span>
          </div>

          <button 
            onClick={handleAddToCart}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all duration-300 shadow-sm shrink-0 ${
              addedToast 
                ? 'bg-green-600 text-white scale-105' 
                : 'bg-primary text-black hover:bg-primary-hover active:scale-90'
            }`}
            title="Add to Cart"
          >
            {addedToast ? (
              <>
                <Check size={18} />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <Plus size={18} className="stroke-[3]" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
