import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { sizes } from '../data/products';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingBag, ArrowLeft, Star, ShieldCheck, ChevronRight, Truck, UploadCloud } from 'lucide-react';

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

  const isCustomProduct = product?.category === 'customized-posters' || product?.category === 'customized' || product?.id === 'custom-1';

  const [selectedSize, setSelectedSize] = useState('A4');
  const [productFormat, setProductFormat] = useState('poster'); // 'poster', 'frame', 'both'
  const [selectedFrameStyle, setSelectedFrameStyle] = useState('Classic Matte Black Frame');
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center' });
  const [customImageLocal, setCustomImageLocal] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const wantsPoster = productFormat === 'poster' || productFormat === 'both';
  const wantsFrame = productFormat === 'frame' || productFormat === 'both';

  const frameOptions = [
    { id: 'black', name: 'Classic Matte Black Frame', borderClass: 'border-[16px] border-slate-900 rounded-md shadow-2xl' },
    { id: 'white', name: 'Modern White Frame', borderClass: 'border-[16px] border-white ring-1 ring-gray-300 rounded-md shadow-2xl' },
    { id: 'wood', name: 'Natural Wood Grain Frame', borderClass: 'border-[16px] border-[#8B5A2B] rounded-md shadow-2xl' },
    { id: 'gold', name: 'Luxury Golden Frame', borderClass: 'border-[16px] border-[#D4AF37] rounded-md shadow-2xl' }
  ];

  // Dynamically compute size list based on admin matrix entries
  const availableSizesList = (() => {
    const matrix = product?.sizePrices || product?.size_prices;
    const baseList = [
      { code: 'A6', label: 'A6 (Mini - 4.1 x 5.8 in)' },
      { code: 'A5', label: 'A5 (Small - 5.8 x 8.3 in)' },
      { code: 'A4', label: 'A4 (Standard - 8.3 x 11.7 in)' },
      { code: 'A3', label: 'A3 (Large - 11.7 x 16.5 in)' }
    ];

    if (!matrix) return baseList;

    const customKeys = new Set();
    ['poster', 'frame', 'posterFrame'].forEach(fmt => {
      if (matrix[fmt]) {
        Object.keys(matrix[fmt]).forEach(k => {
          if (matrix[fmt][k] && parseFloat(matrix[fmt][k]) > 0 && k !== 'Split' && k !== 'Split Poster') {
            customKeys.add(k);
          }
        });
      }
    });

    if (customKeys.size === 0) return baseList;

    const result = [];
    baseList.forEach(item => {
      if (customKeys.has(item.code)) {
        result.push(item);
        customKeys.delete(item.code);
      }
    });

    customKeys.forEach(customCode => {
      result.push({ code: customCode, label: `${customCode}` });
    });

    return result.length > 0 ? result : baseList;
  })();

  const activeFrame = frameOptions.find(f => f.name === selectedFrameStyle) || frameOptions[0];

  // Price calculations based on size & framing
  const matrix = product.sizePrices || product.size_prices;
  const formatKey = productFormat === 'both' ? 'posterFrame' : productFormat;
  const sizeKey = selectedSize;

  let activePrice = 0;
  if (matrix && matrix[formatKey] && matrix[formatKey][sizeKey] && parseFloat(matrix[formatKey][sizeKey]) > 0) {
    activePrice = parseFloat(matrix[formatKey][sizeKey]);
  } else {
    const baseP = parseFloat(product.basePrice) || 0;
    const frameP = parseFloat(product.framePrice) || 400;

    let targetPrice = 0;
    if (productFormat === 'poster') {
      targetPrice = baseP;
    } else if (productFormat === 'frame') {
      targetPrice = frameP;
    } else if (productFormat === 'both') {
      targetPrice = product.posterFramePrice ? parseFloat(product.posterFramePrice) : (baseP + frameP);
    }

    let sizeAddon = 0;
    if (selectedSize === 'A6') {
      sizeAddon = -Math.round(targetPrice * 0.3);
    } else if (selectedSize === 'A4') {
      sizeAddon = 0; // Exact base price
    } else if (selectedSize === 'A3') {
      sizeAddon = product.a3ExtraPrice !== undefined ? product.a3ExtraPrice : 150;
    }

    activePrice = Math.max(0, Math.round(targetPrice + sizeAddon));
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

  const handleCustomImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const localUrl = URL.createObjectURL(file);
    setCustomImageLocal(localUrl);
    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');
      
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setCustomImageUrl(data.secure_url);
      } else {
        setCustomImageUrl(localUrl);
      }
    } catch (err) {
      setCustomImageUrl(localUrl);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddToCartClick = () => {
    if (isCustomProduct && !customImageUrl) {
      alert("Please upload your custom image before adding to cart!");
      return;
    }
    if (!wantsPoster && !wantsFrame) {
      alert("Please select at least a Poster or a Frame!");
      return;
    }
    addToCart(product, selectedSize, wantsPoster, wantsFrame, quantity, customImageUrl, selectedFrameStyle);
    alert(`Successfully added ${quantity} item(s) to Cart!`);
  };

  const handleBuyNowClick = () => {
    if (isCustomProduct && !customImageUrl) {
      alert("Please upload your custom image before buying!");
      return;
    }
    if (!wantsPoster && !wantsFrame) {
      alert("Please select at least a Poster or a Frame!");
      return;
    }
    addToCart(product, selectedSize, wantsPoster, wantsFrame, quantity, customImageUrl, selectedFrameStyle);
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
        
        {/* Left Column: Image Viewer */}
        <div className="lg:col-span-6 space-y-4" data-aos="fade-right">
          <div className="relative w-full bg-gray-50 border border-gray-100 rounded-3xl overflow-hidden shadow-xl select-none flex flex-col items-center justify-center min-h-[500px] p-6">
            
            {/* Main Zoomable Image or Placeholder */}
            {isCustomProduct && !customImageLocal && !customImageUrl ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-400">Your Poster Here</h3>
                <p className="text-xs text-gray-400 max-w-[200px] mx-auto">Upload an image on the right to see a live preview.</p>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center h-full transition-all duration-500 relative">
                <div className={`transition-all duration-500 flex items-center justify-center max-h-[520px] max-w-full p-2 bg-white
                  ${wantsFrame ? activeFrame.borderClass : 'rounded-lg shadow-2xl'}
                `}>
                  <img 
                    src={customImageUrl || customImageLocal || product.image} 
                    alt={product.name}
                    className="max-h-[460px] max-w-full w-auto h-auto object-contain rounded-sm"
                  />
                </div>
              </div>
            )}
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
            
            {/* Price section - Hidden for custom posters until image uploaded */}
            {(!isCustomProduct || customImageUrl) && (
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-black text-black">₹{activePrice}</span>
                <span className="text-xs text-gray-400 font-semibold line-through">₹{Math.round(activePrice * 1.4)}</span>
                <span className="text-xs text-green-600 font-bold">(Save 30%)</span>
              </div>
            )}
          </div>

          {/* Short description */}
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            {product.description}
          </p>

          <hr className="border-gray-100" />

          {/* Custom Image Upload Section */}
          {isCustomProduct && (
            <div className="space-y-3">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">1. Upload Your Image</span>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary bg-primary/5 rounded-2xl cursor-pointer hover:bg-primary/10 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud size={32} className="text-primary mb-2" />
                  <p className="text-sm font-semibold text-gray-800">
                    {uploadingImage ? 'Uploading...' : customImageLocal ? 'Image Uploaded! Click to change' : 'Click to upload your image'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">High resolution PNG, JPG</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleCustomImageUpload} />
              </label>
            </div>
          )}

          {(!isCustomProduct || customImageUrl) && (
            <>
              {/* Size picker (Dropdown & Quick Select) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {isCustomProduct ? '2.' : '1.'} Choose Size
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Select dimensions</span>
                </div>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full text-sm font-bold bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm"
                >
                  {availableSizesList.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Option / Format Dropdown (Posters vs Frames vs Both) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {isCustomProduct ? '3.' : '2.'} Format & Framing Option
                  </span>
                </div>
                <select
                  value={productFormat}
                  onChange={(e) => setProductFormat(e.target.value)}
                  className="w-full text-sm font-bold bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm"
                >
                  <option value="poster">Poster Print Only (Unframed)</option>
                  <option value="both">Both (Poster + Frame Assembled)</option>
                  <option value="frame">Empty Frame Only (No Poster - ₹400)</option>
                </select>
              </div>

              {/* Frame Style Selection Dropdown (Only visible when framing is selected) */}
              {wantsFrame && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Select Frame Style & Finish
                    </span>
                  </div>
                  <select
                    value={selectedFrameStyle}
                    onChange={(e) => setSelectedFrameStyle(e.target.value)}
                    className="w-full text-sm font-bold bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm"
                  >
                    {frameOptions.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="space-y-4 pt-4">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {isCustomProduct ? '4.' : '3.'} Quantity & Purchase
                </span>
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
            </>
          )}

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
