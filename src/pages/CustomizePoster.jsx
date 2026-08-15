import React, { useState, useContext, useRef, useEffect } from 'react';
import { getHubProducts, fetchHubProductsFromDB } from '../data/customPrints';
import { AppContext } from '../context/AppContext';
import { 
  Upload, 
  Check, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  X
} from 'lucide-react';

export default function CustomizePoster() {
  const { addToCart, navigateTo } = useContext(AppContext);
  // Per-slot file input refs (dynamically indexed)
  const fileInputRefs = useRef({});

  // Active view: null (Hub with all 6 cards) | 'single' | 'split-3' | 'split-2x2' | 'retro' | 'pocket' | 'photobooth'
  const [selectedType, setSelectedType] = useState(null);

  // Configuration States
  const [selectedSize, setSelectedSize] = useState('A4');
  const [selectedQty, setSelectedQty] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedPreviews, setUploadedPreviews] = useState([]);
  const [customFormat, setCustomFormat] = useState('poster'); // 'poster' | 'both' | 'frame'
  const [selectedFrameStyle, setSelectedFrameStyle] = useState('Classic Matte Black Frame');

  // Hub Products — loaded from cloud DB with instant local cache fallback
  const [hubProducts, setHubProducts] = useState(getHubProducts);

  // Sync with cloud DB and storage events
  useEffect(() => {
    fetchHubProductsFromDB().then(items => {
      if (items && items.length > 0) setHubProducts(items);
    });
    const onStorage = () => setHubProducts(getHubProducts());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const currentTypeObj = hubProducts.find(p => p.id === (selectedType || 'single')) || hubProducts[0];

  // Sync size default when switching type
  useEffect(() => {
    if (selectedType) {
      const typeDef = hubProducts.find(p => p.id === selectedType);
      if (typeDef) {
        setSelectedSize(typeDef.defaultSizes[0].code);
        setSelectedQty(1);
        setCustomFormat('poster');
        setUploadedFiles([]);
        setUploadedPreviews([]);
      }
    }
  }, [selectedType]);

  const sizeOptions = currentTypeObj.defaultSizes;
  const currentSizeObj = sizeOptions.find(s => s.code === selectedSize) || sizeOptions[0];

  // Dynamic framing configuration from admin panel
  const allowFraming = currentTypeObj.allowFraming !== false && (selectedType === 'single' || selectedType?.startsWith('split') || currentTypeObj.allowFraming);
  const allowFrameOnly = currentTypeObj.allowFrameOnly !== false && allowFraming;
  const frameStyles = currentTypeObj.frameStyles && currentTypeObj.frameStyles.length > 0
    ? currentTypeObj.frameStyles
    : ['Classic Matte Black Frame', 'Natural Oak Wood Frame', 'Modern White Frame', 'Dark Walnut Frame'];
  const frameBadge = currentTypeObj.frameBadge || 'Acrylic Shield';

  // Pricing: Poster Price vs Frame Price vs Both
  const sizePosterPrice = currentSizeObj.basePrice || 129;
  const sizeFramePrice = currentSizeObj.framePrice || currentTypeObj.framePrice || 250;

  const wantsPoster = customFormat === 'poster' || customFormat === 'both';
  const wantsFrame = customFormat === 'frame' || customFormat === 'both';

  let perUnitPrice = sizePosterPrice;
  if (customFormat === 'both') {
    perUnitPrice = sizePosterPrice + sizeFramePrice;
  } else if (customFormat === 'frame') {
    perUnitPrice = sizeFramePrice;
  }
  const totalPrice = perUnitPrice * selectedQty;

  // Image uploads count strictly configured in admin (e.g. 1 for single, 3 for split-3, 4 for 2x2 grid, etc.)
  const requiredImagesCount = currentSizeObj.imageCount ?? currentTypeObj.imageCount ?? (selectedType === 'split-3' ? 3 : selectedType === 'split-2x2' ? 4 : (selectedSize === '4Photo' ? 4 : (selectedType === 'photobooth' ? 3 : 1)));

  // Handle upload for a specific slot index
  const handleSlotUpload = (slotIndex, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedFiles(prev => {
      const next = [...prev];
      next[slotIndex] = file;
      return next;
    });
    setUploadedPreviews(prev => {
      const next = [...prev];
      next[slotIndex] = url;
      return next;
    });
  };

  const handleRemoveImage = (index) => {
    setUploadedFiles(prev => { const n = [...prev]; n[index] = undefined; return n; });
    setUploadedPreviews(prev => { const n = [...prev]; n[index] = undefined; return n; });
  };

  // Trigger file picker for a specific slot
  const triggerSlot = (slotIndex) => {
    if (fileInputRefs.current[slotIndex]) fileInputRefs.current[slotIndex].click();
  };

  const handleAddToCart = () => {
    const filledSlots = uploadedPreviews.filter(Boolean);
    if (wantsPoster && filledSlots.length === 0) {
      alert('Please upload at least Image 1 before adding to cart!');
      triggerSlot(0);
      return;
    }

    const typeTitle = currentTypeObj.typeLabel;
    const firstPreview = filledSlots[0] || (currentTypeObj.image || '/custom-prints/custom-poster.jpg');
    const formatName = customFormat === 'both' ? 'Poster + Frame' : (customFormat === 'frame' ? 'Custom Frame Only' : 'Poster Print Only');

    const customProduct = {
      id: `custom-${Date.now()}`,
      name: `${typeTitle} - ${formatName} (${selectedSize})`,
      category: selectedType?.startsWith('split') ? 'split-posters' : (selectedType === 'retro' ? 'polaroids' : 'customized-posters'),
      basePrice: sizePosterPrice,
      framePrice: sizeFramePrice,
      posterFramePrice: sizePosterPrice + sizeFramePrice,
      rating: 4.9,
      reviewsCount: 35000,
      image: firstPreview,
      description: `Custom Wall Art. Type: ${typeTitle}, Format: ${formatName}, Size: ${selectedSize}, Qty: ${selectedQty}, Frame: ${wantsFrame ? selectedFrameStyle : 'Unframed'}. ${filledSlots.length > 0 ? `Total ${filledSlots.length} custom photo uploads.` : ''}`,
      specs: {
        paper: selectedType === 'retro' || selectedType === 'pocket' || selectedType === 'photobooth' ? '350 GSM High-Gloss Ultra Pearl Photo Sheet' : '300 GSM Ultra-Thick Matte Photo Paper',
        printing: '12-Color Archival Pigment Inks',
        finish: wantsFrame ? `Mounted in ${selectedFrameStyle} with Acrylic Shield` : 'Anti-Glare Smooth Velvet Coating',
        packaging: wantsFrame ? 'Boxed with Corner Protectors' : 'Double-Walled Cardboard Mailer / Tube'
      }
    };

    addToCart(
      customProduct,
      selectedSize,
      wantsPoster,
      wantsFrame,
      selectedQty,
      filledSlots[0] || null,
      wantsFrame ? selectedFrameStyle : null
    );

    alert(`🎉 Successfully added ${selectedQty} × ${typeTitle} [${formatName}] (${selectedSize}) to your cart!`);
    navigateTo('cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">

      {/* VIEW 1: HUB VIEW (All 6 Custom Print Types - Matches Reference Screenshots) */}
      {!selectedType ? (
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Header Title Banner */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-wider text-black flex items-center justify-center gap-2">
              <span>DESIGN YOUR OWN</span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-[0.35em] uppercase text-gray-500">
              P R I N T S
            </p>
          </div>

          {/* 6 Interactive Category Cards with realistic photography mockups */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {hubProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedType(item.id)}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-white border border-gray-200 hover:border-black shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                {/* Photo Mockup Container */}
                <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.titleMain}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  
                  {/* Subtle top & bottom shadow gradient for readable text */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30"></div>

                  {/* Header Title & Button Overlay (Exact Match to Reference Screenshots) */}
                  <div className="absolute top-6 inset-x-0 text-center z-20 space-y-1 px-4">
                    <p className="font-serif italic text-base text-white drop-shadow-md">{item.titleScript}</p>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
                      {item.titleMain}
                    </h3>
                    <div className="pt-1">
                      <button className="px-5 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-white/40 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition shadow-xl inline-flex items-center gap-1">
                        <span>{item.buttonText}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Details */}
                <div className="p-5 flex items-center justify-between bg-white border-t border-gray-100">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">{item.typeLabel}</h4>
                    <p className="text-[11px] text-gray-500">{item.subtitle}</p>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-black group-hover:text-white flex items-center justify-center transition shrink-0">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Value Props Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50">
              <ShieldCheck size={24} className="text-black shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-gray-900">300+ GSM Ultra-Heavy Paper</h5>
                <p className="text-[11px] text-gray-500">Premium velvet matte & anti-glare finish.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50">
              <Sparkles size={24} className="text-black shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-gray-900">Archival 12-Color Giclée</h5>
                <p className="text-[11px] text-gray-500">Ultra-HD pigment ink fade-proof for 100+ years.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50">
              <Truck size={24} className="text-black shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-gray-900">Crease-Free Safe Delivery</h5>
                <p className="text-[11px] text-gray-500">Rolled in rigid tubes or packaged in solid boxes.</p>
              </div>
            </div>
          </div>

        </div>
      ) : (

        /* VIEW 2: DEDICATED CUSTOMIZER PAGE (Matching Screenshot 2 for all 6 types) */
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Back button & Type Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
            <button 
              onClick={() => setSelectedType(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black transition"
            >
              <ArrowLeft size={16} />
              <span>Back to Design Options</span>
            </button>

            {/* Quick switcher between all 6 types */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {hubProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedType(p.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition ${
                    selectedType === p.id 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.titleMain} {p.extraTag || ''}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* LEFT COLUMN: Visual Live Mockup Stage */}
            <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
              <div className="relative rounded-3xl p-6 sm:p-12 min-h-[380px] sm:min-h-[480px] bg-[#F7F7F7] border border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                
                {/* Live Canvas Preview with user's uploaded images or Default Mockup */}
                {uploadedPreviews.length > 0 ? (
                  selectedType === 'single' ? (
                    /* Single Poster */
                    <div className="relative w-[240px] sm:w-[280px] h-[340px] sm:h-[380px] bg-white shadow-2xl rounded-sm p-3 border border-gray-200 transition-all duration-300">
                      <div className="w-full h-full overflow-hidden flex items-center justify-center bg-gray-100">
                        <img src={uploadedPreviews[0]} alt="Custom Poster" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ) : selectedType === 'split-3' ? (
                    /* 3-Panel Split Triptych */
                    <div className="flex items-center gap-2 sm:gap-3 transition-all duration-300">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="relative overflow-hidden bg-white shadow-2xl rounded-sm p-1.5 border border-gray-200" style={{ width: '85px', height: '260px' }}>
                          <div className="w-full h-full overflow-hidden relative">
                            <img src={uploadedPreviews[0]} alt={`Split ${idx + 1}`} className="w-[255px] max-w-none h-full object-cover" style={{ position: 'absolute', left: `-${idx * 85}px`, top: 0 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedType === 'split-2x2' ? (
                    /* 2x2 Grid */
                    <div className="grid grid-cols-2 gap-2 transition-all duration-300">
                      {[0, 1, 2, 3].map((idx) => {
                        const col = idx % 2;
                        const row = Math.floor(idx / 2);
                        return (
                          <div key={idx} className="relative overflow-hidden bg-white shadow-2xl rounded-sm p-1.5 border border-gray-200" style={{ width: '120px', height: '150px' }}>
                            <div className="w-full h-full overflow-hidden relative">
                              <img src={uploadedPreviews[0]} alt={`Grid ${idx + 1}`} className="w-[240px] max-w-none h-[300px] object-cover" style={{ position: 'absolute', left: `-${col * 120}px`, top: `-${row * 150}px` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : selectedType === 'retro' ? (
                    /* Retro Prints Live Display */
                    <div className="grid grid-cols-2 gap-3 transition-all duration-300">
                      {uploadedPreviews.slice(0, 4).map((preview, idx) => (
                        <div key={idx} className="w-[110px] h-[140px] bg-white shadow-xl rounded-sm p-2 pb-5 border border-gray-200 flex flex-col justify-between">
                          <div className="w-full h-[95px] overflow-hidden bg-gray-100 rounded-xs">
                            <img src={preview} alt="Retro" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[8px] text-gray-400 font-mono text-center">♥ memory</span>
                        </div>
                      ))}
                    </div>
                  ) : selectedType === 'pocket' ? (
                    /* Mini Pocket Phone Case Display */
                    <div className="relative w-[150px] h-[290px] bg-slate-900/10 border-4 border-slate-300/80 rounded-[38px] shadow-2xl p-2.5 flex flex-col items-center justify-center backdrop-blur-sm">
                      <div className="w-[110px] h-[145px] bg-white shadow-xl rounded-sm p-1.5 pb-4 border border-gray-200 flex flex-col items-center justify-between mt-6">
                        <div className="w-full h-[110px] overflow-hidden bg-gray-100 rounded-xs">
                          <img src={uploadedPreviews[0]} alt="Pocket Photo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[7px] text-gray-400 font-mono">2.1 x 3.4"</span>
                      </div>
                    </div>
                  ) : (
                    /* Photobooth Strip Live Display */
                    <div className="flex items-center gap-3 transition-all duration-300">
                      <div className="w-[90px] h-[300px] bg-white shadow-2xl p-2 pb-5 rounded-xs border border-gray-300 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          {uploadedPreviews.slice(0, selectedSize === '4Photo' ? 4 : 3).map((prev, pIdx) => (
                            <div key={pIdx} className="w-full h-[70px] overflow-hidden bg-gray-100 rounded-xs">
                              <img src={prev} alt="Photobooth" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                        <span className="text-[8px] font-mono text-center text-gray-400 uppercase tracking-widest">
                          CASIT FILM
                        </span>
                      </div>
                    </div>
                  )
                ) : (
                  /* Photographic Template Preview before upload */
                  <div 
                    onClick={() => triggerSlot(0)}
                    className="relative cursor-pointer group rounded-2xl overflow-hidden shadow-xl border border-gray-200 max-w-sm w-full"
                  >
                    <img 
                      src={currentTypeObj.image} 
                      alt={currentTypeObj.titleMain}
                      className="w-full h-auto object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition p-6 text-center space-y-2">
                      <Upload size={32} />
                      <span className="text-sm font-black uppercase tracking-wider">Click to Upload Your Image</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Per-slot thumbnail strip */}
              {uploadedPreviews.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.from({ length: requiredImagesCount }).map((_, i) => (
                    uploadedPreviews[i] ? (
                      <div key={i} className="relative group w-14 h-14 rounded-xl overflow-hidden border-2 border-black shadow">
                        <img src={uploadedPreviews[i]} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveImage(i)}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded-xl"
                        >
                          <X size={14} />
                        </button>
                        <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] font-black text-white drop-shadow">IMG {i + 1}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              )}
            </div>


            {/* RIGHT COLUMN: Configuration Form (Matching Screenshot 2) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Product Title & Reviews Heading */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Customize Your {currentTypeObj.titleMain}
                </h1>
                
                {/* Rating Bar */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-extrabold text-gray-900">4.9/5</span>
                  <div className="flex items-center text-amber-400">
                    <Star size={16} fill="currentColor" />
                  </div>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500 font-semibold">35k+ Reviews</span>
                  <span className="text-amber-600 font-bold underline cursor-pointer hover:text-amber-700">
                    See their experiences
                  </span>
                </div>
              </div>

              {/* 1. Size Selection (Pills) */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                  Size
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {sizeOptions.map((sz) => {
                    const isSelected = selectedSize === sz.code;
                    return (
                      <button
                        key={sz.code}
                        onClick={() => setSelectedSize(sz.code)}
                        className={`py-2.5 px-4 rounded-2xl text-xs font-bold transition border flex items-center gap-2 ${
                          isSelected 
                            ? 'bg-black text-white border-black shadow-sm' 
                            : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span>{sz.label}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                          {sz.dimensions}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Format & Framing Option (Poster vs Poster+Frame vs Frame Only) */}
              {allowFraming && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-3xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-gray-900 uppercase tracking-wider block">
                      2. Choose Format
                    </label>
                    {frameBadge && (
                      <span className="text-[10px] bg-primary/20 text-yellow-900 font-extrabold px-2.5 py-0.5 rounded-full">
                        {frameBadge}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Format 1: Poster Print Only */}
                    <button
                      type="button"
                      onClick={() => setCustomFormat('poster')}
                      className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                        customFormat === 'poster'
                          ? 'bg-black text-white border-black shadow-md'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-black'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black">🖼️ Poster Only</span>
                          {customFormat === 'poster' && <Check size={14} className="text-primary" />}
                        </div>
                        <p className={`text-[10px] ${customFormat === 'poster' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Ultra-thick photo print
                        </p>
                      </div>
                      <span className={`text-xs font-black mt-2 block ${customFormat === 'poster' ? 'text-primary' : 'text-black'}`}>
                        ₹{sizePosterPrice}
                      </span>
                    </button>

                    {/* Format 2: Poster + Frame */}
                    <button
                      type="button"
                      onClick={() => setCustomFormat('both')}
                      className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                        customFormat === 'both'
                          ? 'bg-black text-white border-black shadow-md'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-black'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black">✨ Poster + Frame</span>
                          {customFormat === 'both' && <Check size={14} className="text-primary" />}
                        </div>
                        <p className={`text-[10px] ${customFormat === 'both' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Mounted & ready to hang
                        </p>
                      </div>
                      <span className={`text-xs font-black mt-2 block ${customFormat === 'both' ? 'text-primary' : 'text-black'}`}>
                        ₹{sizePosterPrice + sizeFramePrice}
                      </span>
                    </button>

                    {/* Format 3: Custom Frame Only */}
                    {allowFrameOnly && (
                      <button
                        type="button"
                        onClick={() => setCustomFormat('frame')}
                        className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                          customFormat === 'frame'
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-white text-gray-800 border-gray-200 hover:border-black'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black">🔲 Frame Only</span>
                            {customFormat === 'frame' && <Check size={14} className="text-primary" />}
                          </div>
                          <p className={`text-[10px] ${customFormat === 'frame' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Empty acrylic frame
                          </p>
                        </div>
                        <span className={`text-xs font-black mt-2 block ${customFormat === 'frame' ? 'text-primary' : 'text-black'}`}>
                          ₹{sizeFramePrice}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Frame Style Picker (Visible when Frame is included) */}
                  {wantsFrame && frameStyles.length > 0 && (
                    <div className="pt-3 border-t border-gray-200/80 space-y-2">
                      <label className="text-[11px] font-extrabold text-gray-700 block">
                        Select Frame Finish:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {frameStyles.map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setSelectedFrameStyle(style)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition border flex items-center justify-between ${
                              selectedFrameStyle === style
                                ? 'bg-black text-white border-black shadow-sm'
                                : 'bg-white text-gray-800 border-gray-200 hover:border-black'
                            }`}
                          >
                            <span>{style}</span>
                            {selectedFrameStyle === style && <Check size={13} className="text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Quantity Stepper */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                  {allowFraming ? '3.' : '2.'} Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-black hover:border-black hover:bg-black hover:text-white transition"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-lg font-black text-gray-900">{selectedQty}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedQty(q => q + 1)}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-black hover:border-black hover:bg-black hover:text-white transition"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-500 font-semibold">
                    {selectedQty} × ₹{perUnitPrice} = <span className="font-black text-gray-900">₹{totalPrice}</span>
                  </span>
                </div>
              </div>

              {/* 4. Pricing Banner Box */}
              <div className="p-4 rounded-2xl border border-gray-300 bg-white flex items-center justify-between shadow-sm">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">₹{perUnitPrice}</span>
                  <span className="text-xs font-semibold text-gray-500">
                    / {customFormat === 'frame' ? 'frame' : (selectedType === 'photobooth' ? 'strip' : selectedType?.startsWith('split') ? 'set' : 'poster')}
                  </span>
                </div>
                <div className="text-right text-xs font-bold text-gray-700">
                  Total ₹{totalPrice} · {selectedQty} × {customFormat === 'both' ? 'Poster + Frame' : (customFormat === 'frame' ? 'Custom Frame' : 'Poster Print')} · {selectedSize}
                </div>
              </div>

              {/* Hidden per-slot file inputs */}
              {Array.from({ length: requiredImagesCount }).map((_, i) => (
                <input
                  key={i}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={el => { fileInputRefs.current[i] = el; }}
                  onChange={e => handleSlotUpload(i, e)}
                />
              ))}

              {/* 5. Per-slot image upload buttons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <span>
                      {customFormat === 'frame' ? 'Upload Photo (Optional Preview)' : `Upload ${requiredImagesCount} Image${requiredImagesCount > 1 ? 's' : ''}`}
                    </span>
                    {wantsPoster && <span className="text-red-500">*</span>}
                  </label>
                  {customFormat === 'frame' && (
                    <span className="text-[10px] text-gray-400 font-semibold">(Empty frame ordered)</span>
                  )}
                </div>

                <div className={`grid gap-2 ${
                  requiredImagesCount === 1 ? 'grid-cols-1' :
                  requiredImagesCount === 2 ? 'grid-cols-2' :
                  requiredImagesCount <= 4 ? 'grid-cols-2' :
                  'grid-cols-3'
                }`}>
                  {Array.from({ length: requiredImagesCount }).map((_, i) => {
                    const preview = uploadedPreviews[i];
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => triggerSlot(i)}
                        className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all duration-200 overflow-hidden group ${
                          preview
                            ? 'border-black shadow-md p-0 h-24'
                            : 'border-dashed border-gray-300 bg-gray-50 hover:border-black hover:bg-gray-100 py-4 px-2 h-24'
                        }`}
                      >
                        {preview ? (
                          <>
                            <img src={preview} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition">
                              <Upload size={16} className="text-white" />
                              <span className="text-white text-[10px] font-bold mt-0.5">Change</span>
                            </div>
                            <span className="absolute top-1 left-1.5 text-[9px] font-black bg-black text-primary rounded-full px-1.5 py-0.5 shadow">
                              ✓ IMG {i + 1}
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload size={18} className="text-gray-400 group-hover:text-black transition" />
                            <span className="text-[11px] font-extrabold text-gray-600 group-hover:text-black transition">
                              Image {i + 1}
                            </span>
                            <span className="text-[9px] text-gray-400">tap to upload</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Progress indicator */}
                {wantsPoster && (
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                    <span>{uploadedPreviews.filter(Boolean).length} of {requiredImagesCount} uploaded</span>
                    {uploadedPreviews.filter(Boolean).length === requiredImagesCount && (
                      <span className="text-green-600 font-bold flex items-center gap-1">
                        ✓ All images ready!
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 5. Add to Cart Button (Matching Screenshot 2) */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 px-6 rounded-2xl bg-black text-white font-extrabold text-sm hover:bg-neutral-800 active:scale-[0.99] transition shadow-xl flex items-center justify-center gap-2"
              >
                <span>Add to cart</span>
              </button>

              {/* Specifications Footer */}
              <div className="pt-2 text-[11px] text-gray-500 space-y-1">
                <p>• Ultra-thick 300-350 GSM Velvet Matte / High-Gloss Photo Paper</p>
                <p>• 12-Color Giclée Archival Printing (Anti-glare, 100+ years anti-fade)</p>
                <p>• Safe crease-free protective packaging delivered within 3-5 business days</p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
