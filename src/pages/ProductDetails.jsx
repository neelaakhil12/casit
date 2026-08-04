import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { sizes } from '../data/products';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingBag, ArrowLeft, Star, ShieldCheck, ChevronRight, Truck } from 'lucide-react';

export default function ProductDetails() {
  const { 
    selectedProductId, 
    products, 
    addToCart, 
    wishlist, 
    toggleWishlist, 
    navigateTo 
  } = useContext(AppContext);

  // Find current product
  const product = products.find(p => p.id === selectedProductId) || products[0];

  const [selectedSize, setSelectedSize] = useState('A4');
  const [framed, setFramed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center' });

  const isWishlisted = wishlist.includes(product.id);

  // Price calculations based on size & framing
  let activePrice = product.basePrice;
  if (selectedSize === 'A6') {
    activePrice = product.basePrice * 1.0;
  } else if (selectedSize === 'A4') {
    activePrice = Math.round(product.basePrice * 1.5) + 100;
  } else if (selectedSize === 'A3') {
    activePrice = Math.round(product.basePrice * 2.2) + 250;
  } else if (selectedSize === 'Split Poster') {
    activePrice = Math.round(product.basePrice * 4.5) + 650;
  }
  if (framed) {
    activePrice += 400; // flat frame charge
  }

  // Hover lens zoom coordinates calculation
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  const handleAddToCartClick = () => {
    addToCart(product, selectedSize, framed, quantity);
    alert(`Successfully added ${quantity} item(s) to Cart!`);
  };

  const handleBuyNowClick = () => {
    addToCart(product, selectedSize, framed, quantity);
    navigateTo('cart');
  };

  // Get related products (same category, excluding self)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const formattedCategory = product.category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-16">
      
      {/* Back button */}
      <button 
        onClick={() => navigateTo('categories')}
        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition"
        data-aos="fade-right"
      >
        <ArrowLeft size={16} />
        <span>Back to Catalog</span>
      </button>

      {/* Main product display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Product Image Gallery / Zoom Container */}
        <div className="lg:col-span-6 space-y-4" data-aos="fade-right">
          <div className="relative aspect-[4/5] w-full bg-gray-50 border border-gray-100 rounded-3xl overflow-hidden shadow-xl select-none">
            {/* Main Zoomable Image */}
            <img 
              src={product.image} 
              alt={product.name}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={zoomStyle}
              className="w-full h-full object-cover transition-transform duration-75 cursor-zoom-in"
            />
            {/* Custom overlay hints */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full pointer-events-none">
              Hover to Zoom Art Details
            </div>
          </div>
        </div>

        {/* Right Side: Details panel */}
        <div className="lg:col-span-6 space-y-8" data-aos="fade-left">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-black text-[10px] font-black rounded-full uppercase tracking-wider">
                {formattedCategory}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                <Star size={14} className="fill-amber-500" />
                <span>{product.rating}</span>
                <span className="text-gray-400 font-medium">({product.reviewsCount} verified reviews)</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 m-0 tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-black">₹{activePrice}</span>
              <span className="text-xs text-gray-400 font-semibold line-through">₹{Math.round(activePrice * 1.4)}</span>
              <span className="text-xs text-green-600 font-bold">(Save 30%)</span>
            </div>
          </div>

          {/* Short description */}
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            {product.description}
          </p>

          <hr className="border-gray-100" />

          {/* Size picker */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">1. Choose Size</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sizes.map((s) => (
                <button
                  key={s.code}
                  onClick={() => setSelectedSize(s.code)}
                  className={`py-3 px-2 border-2 rounded-2xl text-center transition-all ${
                    selectedSize === s.code 
                      ? 'border-primary bg-primary-light text-black font-extrabold shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-semibold'
                  }`}
                >
                  <span className="block text-xs font-bold">{s.code}</span>
                  <span className="block text-[9px] text-gray-400 font-medium mt-0.5">
                    {s.code === 'A6' ? 'Mini' : s.code === 'A4' ? 'Standard' : s.code === 'A3' ? 'Large' : 'Set of 3'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Frame Option */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">2. Frame Option</span>
            <div 
              onClick={() => setFramed(!framed)}
              className={`p-4 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition ${
                framed ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-gray-900 block">Include Premium Frame (+₹400)</span>
                <span className="text-xs text-gray-400 block font-medium">Pre-assembled with shatterproof acrylic glass and sturdy fiber borders.</span>
              </div>
              <input 
                type="checkbox" 
                checked={framed}
                onChange={() => {}}
                className="w-5 h-5 accent-primary cursor-pointer shrink-0"
              />
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">3. Quantity & Buy</span>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Quantity selector */}
              <div className="flex items-center border border-gray-200 rounded-full p-1 bg-gray-50 max-w-[120px] justify-between w-full shrink-0">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-lg hover:bg-white rounded-full transition"
                >
                  -
                </button>
                <span className="text-sm font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center font-bold text-lg hover:bg-white rounded-full transition"
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                  onClick={handleAddToCartClick}
                  className="btn-primary text-xs py-3.5"
                >
                  <ShoppingBag size={16} />
                  <span>Add To Cart</span>
                </button>
                <button 
                  onClick={handleBuyNowClick}
                  className="btn-secondary text-xs py-3.5"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Wishlist toggle */}
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 border rounded-full transition duration-300 shrink-0 ${
                  isWishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 hover:border-black text-gray-500'
                }`}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
              </button>
            </div>
          </div>

          {/* Spec details accordion */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 m-0">Product Specifications</h4>
            </div>
            <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-6 text-xs font-medium">
              <div>
                <span className="text-gray-400 block font-semibold">Print Material</span>
                <span className="text-gray-900">{product.specs.paper}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Printing Technology</span>
                <span className="text-gray-900">{product.specs.printing}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Finish Type</span>
                <span className="text-gray-900">{product.specs.finish}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Packaging Casing</span>
                <span className="text-gray-900">{product.specs.packaging}</span>
              </div>
            </div>
          </div>

          {/* Secure batch badge indicators */}
          <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[10px] font-semibold text-gray-500">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck size={18} className="text-primary" />
              <span>100% Original</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck size={18} className="text-primary" />
              <span>Safe Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck size={18} className="text-primary" />
              <span>Easy Return</span>
            </div>
          </div>

        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8" data-aos="fade-up">
          <div className="border-b border-gray-100 pb-5">
            <h2 className="text-2xl font-extrabold text-gray-900">Related Products</h2>
            <p className="text-xs text-gray-400 mt-1">Discover other poster arts in this category.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
