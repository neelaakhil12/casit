import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { servicePosters, sizes } from '../data/products';
import { 
  Printer, 
  UploadCloud, 
  Frame, 
  Image as ImageIcon, 
  Gift, 
  Truck, 
  ShieldCheck, 
  Briefcase, 
  CheckCircle2,
  ShoppingCart,
  Heart,
  Eye,
  Check,
  Star,
  Sparkles,
  Plus
} from 'lucide-react';

function ServicePosterCard({ poster }) {
  const { addToCart, wishlist, toggleWishlist, viewProductDetails } = useContext(AppContext);
  const [selectedSize, setSelectedSize] = useState('A4');
  const [isFramed, setIsFramed] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const isWishlisted = wishlist.includes(poster.id);

  // Dynamic price calculation
  const getCalculatedPrice = () => {
    let price = poster.basePrice;
    if (selectedSize === 'A6') {
      price = poster.basePrice * 1.0;
    } else if (selectedSize === 'A4') {
      price = Math.round(poster.basePrice * 1.5) + 100;
    } else if (selectedSize === 'A3') {
      price = Math.round(poster.basePrice * 2.2) + 250;
    } else if (selectedSize === 'Split Poster') {
      price = Math.round(poster.basePrice * 4.5) + 650;
    }

    if (isFramed) {
      price += 400;
    }
    return price;
  };

  const originalPrice = Math.round(getCalculatedPrice() * 1.15);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(poster, selectedSize, isFramed, 1);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  return (
    <div 
      className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative p-3"
      data-aos="fade-up"
    >
      {/* Poster Image Container */}
      <div 
        className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden cursor-pointer shrink-0"
        onClick={() => viewProductDetails(poster.id)}
      >
        <img 
          src={poster.image} 
          alt={poster.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge overlay */}
        <span className="absolute top-2 left-2 z-10 bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
          15% OFF
        </span>

        {/* Wishlist Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(poster.id); }}
          className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-500 hover:text-red-500 active:scale-90 transition duration-300"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={14} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
        </button>
      </div>

      {/* Content details */}
      <div className="pt-3 flex flex-col justify-between flex-grow space-y-2.5">
        
        {/* Category tag & Size dropdown row */}
        <div className="flex items-center justify-between gap-1">
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase rounded-full tracking-wider">
            POSTER
          </span>

          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="text-[11px] font-bold bg-gray-100 border border-gray-200 rounded-lg px-1.5 py-0.5 text-gray-800 focus:outline-none focus:border-black cursor-pointer"
          >
            {sizes.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <h3 
            onClick={() => viewProductDetails(poster.id)}
            className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug hover:text-emerald-700 cursor-pointer transition duration-200"
          >
            {poster.name}
          </h3>
        </div>

        {/* VIEW DETAILS link */}
        <div>
          <button 
            onClick={() => viewProductDetails(poster.id)}
            className="text-[10px] font-extrabold tracking-wider text-emerald-700 hover:underline uppercase block text-left"
          >
            VIEW DETAILS
          </button>
        </div>

        {/* Frame Checkbox */}
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-600 font-medium select-none pt-0.5">
          <input 
            type="checkbox"
            checked={isFramed}
            onChange={(e) => setIsFramed(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-emerald-800 focus:ring-emerald-800 accent-emerald-800 cursor-pointer"
          />
          <span>Add Frame (+₹400)</span>
        </label>

        {/* Pricing & ADD button row */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-gray-900">₹{getCalculatedPrice()}</span>
            <span className="text-[11px] text-gray-400 line-through font-semibold">₹{originalPrice}</span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase flex items-center gap-1 transition-all duration-300 shadow-sm shrink-0 ${
              addedToast 
                ? 'bg-green-600 text-white scale-105' 
                : 'bg-emerald-800 text-white hover:bg-emerald-900 active:scale-95'
            }`}
          >
            {addedToast ? (
              <>
                <span>ADDED</span>
                <Check size={14} />
              </>
            ) : (
              <>
                <span>ADD</span>
                <Plus size={14} className="stroke-[3]" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function Services() {
  const { navigateTo, setSelectedCategoryFilter } = useContext(AppContext);

  const servicesList = [
    {
      icon: <Printer size={28} className="text-black" />,
      title: "Premium Poster Printing",
      desc: "Printed using advanced Giclée printers with 12-color archival pigment inks. We deliver exceptionally rich colors and fine detail resolution.",
      features: ["300+ GSM Heavyweight Paper", "Anti-Glare Matte Finish", "Fade-resistant 100+ years"]
    },
    {
      icon: <UploadCloud size={28} className="text-black" />,
      title: "Customized Posters",
      desc: "Bring your private creations to life. Simply upload high-res images from your mobile or PC, select your size parameters, and leave the printing lab work to us.",
      features: ["Easy Upload Wizard", "Resolution Quality Check", "Personalized Gift Options"],
      action: () => { setSelectedCategoryFilter('all'); navigateTo('categories'); },
      actionLabel: "Explore All Posters"
    },
    {
      icon: <Frame size={28} className="text-black" />,
      title: "Premium Framed Posters",
      desc: "Ready-to-hang art options featuring modern wooden fiber borders and lightweight, break-resistant synthetic acrylic glass protectors.",
      features: ["1-inch Sleek Fiber Frame", "Shatterproof Acrylic Cover", "Pre-installed Metal Hooks"],
      action: () => { setSelectedCategoryFilter('framed'); navigateTo('categories'); },
      actionLabel: "Browse Framed Posters"
    },
    {
      icon: <ImageIcon size={28} className="text-black" />,
      title: "Vintage Polaroid Prints",
      desc: "Recreate old-school film camera nostalgia. Ideal for making creative string grids, lights arrays, or bedroom cubicle wall mosaics.",
      features: ["Retro Borders Styling", "Classic Glossy Textures", "Bundled Sets Available"],
      action: () => { setSelectedCategoryFilter('polaroids'); navigateTo('categories'); },
      actionLabel: "Shop Polaroid Prints"
    },
    {
      icon: <Gift size={28} className="text-black" />,
      title: "Aesthetic Gift Packaging",
      desc: "Sending a poster to someone special? Select our custom gift packaging during checkout. Includes high-grade wrap and customized message cards.",
      features: ["Designer Wrapping Covers", "Personal Message Cards", "Price tags excluded"]
    },
    {
      icon: <Truck size={28} className="text-black" />,
      title: "Super-Fast & Safe Shipping",
      desc: "Posters are rolled into double-walled cylindrical cardboard tubes to avoid creases. Shipped across major metro hubs with priority tracking.",
      features: ["Crease-free Tube Packing", "Priority Courier Partners", "Live Transit Updates"]
    },
    {
      icon: <ShieldCheck size={28} className="text-black" />,
      title: "100% Secure Payments",
      desc: "Accepting all major Credit/Debit cards, UPI, Netbanking, and Wallets. Handled with absolute banking security compliance protocols.",
      features: ["SSL 256-bit Encrypted", "No Saved Card Details", "Refund/Exchange Protections"]
    },
    {
      icon: <Briefcase size={28} className="text-black" />,
      title: "Bulk & Corporate Orders",
      desc: "Setting up a new IT workspace, study room, aesthetic cafe, franchise parlor, or hotel gallery? Contact us for wholesale bulk pricing discounts.",
      features: ["Customized Brand Art", "Heavy Volume Discounts", "Dedicated Account Manager"]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-20">
      
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4" data-aos="fade-down">
        <span className="text-primary font-extrabold text-xs uppercase tracking-widest bg-black px-3 py-1 rounded-full text-white inline-block">Aesthetic Services</span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 m-0">What We Offer</h1>
        <p className="text-sm text-gray-500">Discover how CASIT helps you design premium and personalized spaces.</p>
        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-aos="fade-up">
        {servicesList.map((service, idx) => (
          <div 
            key={idx}
            className="bg-white border border-gray-100 rounded-3xl p-8 shadow-md flex flex-col justify-between hover:shadow-xl hover:border-primary/40 transition duration-300 gap-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{service.desc}</p>
              
              {/* Bullet features */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[10px] text-gray-500 font-semibold uppercase">
                {service.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-primary shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTA if applicable */}
            {service.action && (
              <div className="pt-2 border-t border-gray-50">
                <button
                  onClick={service.action}
                  className="px-4 py-2 border-2 border-black text-black text-xs font-bold rounded-full hover:bg-black hover:text-white transition duration-200"
                >
                  {service.actionLabel}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FEATURED SERVICE POSTERS COLLECTION SECTION */}
      <div className="space-y-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles size={16} />
              <span>Service Print Gallery</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900">Featured Service Posters</h2>
            <p className="text-xs text-gray-500">
              Customize your poster size, choose optional framing, and add directly to your shopping cart.
            </p>
          </div>
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 self-start md:self-auto">
            10 Exclusive Prints
          </span>
        </div>

        {/* Posters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-6">
          {servicePosters.map((poster) => (
            <ServicePosterCard key={poster.id} poster={poster} />
          ))}
        </div>
      </div>

      {/* Bottom Custom Order Banner */}
      <div className="bg-neutral-950 text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 shadow-xl relative overflow-hidden" data-aos="zoom-in">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary rounded-full filter blur-[100px] opacity-10"></div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white m-0">Need custom sized artwork?</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
          If your size requirements fall outside standard A3/A4/A6 proportions, contact our creative support lab team. We customize canvas frames to order.
        </p>
        <div className="pt-2">
          <a 
            href="mailto:support@casitposters.com"
            className="btn-primary text-xs inline-block"
          >
            Email Support Lab
          </a>
        </div>
      </div>

    </div>
  );
}
