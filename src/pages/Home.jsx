import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { ShieldCheck, Truck, RotateCcw, Heart, ChevronRight, Award, UploadCloud, Sparkles, Upload, Layers } from 'lucide-react';

export default function Home() {
  const { products, categories, navigateTo, setSelectedCategoryFilter } = useContext(AppContext);

  // Filter products by admin checkboxes
  const trendingFiltered = products.filter(p => p.trending || p.is_trending);
  const trendingPosters = (trendingFiltered.length > 0 ? trendingFiltered : products).slice(0, 4);

  const bestSellersFiltered = products.filter(p => p.bestSeller || p.is_best_seller);
  const bestSellers = (bestSellersFiltered.length > 0 ? bestSellersFiltered : products).slice(0, 4);

  const newArrivalsFiltered = products.filter(p => p.newArrival || p.is_new_arrival);
  const newArrivals = (newArrivalsFiltered.length > 0 ? newArrivalsFiltered : products).slice(0, 4);
  const framedPosters = products.filter(p => p.category === 'framed' || p.id === 12);
  const wallSetups = products.filter(p => p.category === 'wall-setups');

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryFilter(categoryId);
    navigateTo('categories');
  };

  return (
    <div className="space-y-10 sm:space-y-24 pb-0">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden cursor-pointer" onClick={() => navigateTo('categories')}>
        <div className="w-full">
          <img 
            src="/hero.png" 
            alt="CASIT Hero Banner"
            className="w-full h-auto block"
          />
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6 sm:mb-16" data-aos="fade-up">
          <span className="text-primary font-extrabold text-xs uppercase tracking-widest">Handpicked Collections</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Featured Categories</h2>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-rows-2 grid-flow-col auto-cols-[100px] sm:auto-cols-auto sm:grid-rows-1 sm:grid-flow-row sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none snap-x">
          {categories.map((cat, idx) => (
            <div 
              key={cat.id} 
              onClick={() => handleCategoryClick(cat.id)}
              className="premium-card p-2 sm:p-6 flex flex-col items-center text-center cursor-pointer group hover:border-primary active:scale-95 transition-all duration-300 snap-start shrink-0"
              data-aos="fade-up"
              data-aos-delay={idx * 50}
            >
              <div className="w-18 h-18 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden mb-1.5 sm:mb-5 shadow-md border-2 border-gray-100 group-hover:border-primary group-hover:shadow-xl transition-all duration-300 bg-gray-50 flex items-center justify-center shrink-0">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500 rounded-full" />
                ) : (
                  <span className="text-black font-black text-lg sm:text-2xl">{cat.name.charAt(0)}</span>
                )}
              </div>
              <h3 className="text-[11px] sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-primary-hover transition duration-200">{cat.name}</h3>
              <p className="hidden sm:block text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TRENDING POSTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 pb-3 sm:pb-5 mb-5 sm:mb-10 gap-3" data-aos="fade-up">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Trending Posters</h2>
            <p className="text-xs text-gray-400 mt-1">Check out what everyone is buying right now.</p>
          </div>
          <button 
            onClick={() => { setSelectedCategoryFilter('all'); navigateTo('categories'); }}
            className="flex items-center gap-1.5 text-xs font-bold hover:text-primary-hover transition"
          >
            <span>View All Products</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {trendingPosters.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 pb-3 sm:pb-5 mb-5 sm:mb-10 gap-3" data-aos="fade-up">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Best Sellers</h2>
            <p className="text-xs text-gray-400 mt-1">Our top-rated designs, voted by the community.</p>
          </div>
          <button 
            onClick={() => { setSelectedCategoryFilter('all'); navigateTo('categories'); }}
            className="flex items-center gap-1.5 text-xs font-bold hover:text-primary-hover transition"
          >
            <span>View All</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 pb-3 sm:pb-5 mb-5 sm:mb-10 gap-3" data-aos="fade-up">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">New Arrivals</h2>
            <p className="text-xs text-gray-400 mt-1">Fresh poster designs added weekly to our catalog.</p>
          </div>
          <button 
            onClick={() => { setSelectedCategoryFilter('all'); navigateTo('categories'); }}
            className="flex items-center gap-1.5 text-xs font-bold hover:text-primary-hover transition"
          >
            <span>Explore All</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. CUSTOM POSTER STUDIO INTERACTIVE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-aos="fade-up">
        <div className="relative rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-black text-white p-8 sm:p-14 overflow-hidden border border-neutral-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Personalized Wall Decor</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Design Your Own Custom Wall Poster
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Upload your favorite photos, digital artwork, or anime wallpaper. Choose real wooden fiber frames, live wall mockups, split triptych layouts, and 300+ GSM archival matte printing.
            </p>
            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4">
              <button 
                onClick={() => navigateTo('customize')}
                className="btn-primary !py-3.5 !px-8 text-xs font-black flex items-center gap-2 shadow-yellow-glow"
              >
                <Upload size={16} />
                <span>Launch Custom Studio</span>
              </button>
              <button 
                onClick={() => { setSelectedCategoryFilter('split-posters'); navigateTo('categories'); }}
                className="px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-full transition"
              >
                Explore Split Posters
              </button>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-md cursor-pointer group" onClick={() => navigateTo('customize')}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 group-hover:scale-105 transition duration-500">
              <img 
                src="/categories/split-posters.png" 
                alt="Custom Wall Mockup"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Sparkles size={14} /> Try Live Wall Preview & Size Scaling →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BEST WALL SETUP PACKS */}
      {wallSetups.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 pb-3 sm:pb-5 mb-5 sm:mb-10 gap-3" data-aos="fade-up">
            <div>
              <div className="inline-flex items-center gap-1.5 text-primary-hover font-black text-xs uppercase tracking-wider mb-1">
                <Layers size={14} />
                <span>Instant Room Makeover</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Best Wall Setup Packs</h2>
              <p className="text-xs text-gray-400 mt-1">Curated multi-poster collage bundles for gamers, creators, and aesthetic room setups.</p>
            </div>
            <button 
              onClick={() => { setSelectedCategoryFilter('wall-setups'); navigateTo('categories'); }}
              className="flex items-center gap-1.5 text-xs font-bold hover:text-primary-hover transition"
            >
              <span>View All Packs</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {wallSetups.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 8. WHY CHOOSE CASIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6 sm:mb-16" data-aos="fade-up">
          <span className="text-primary font-extrabold text-xs uppercase tracking-widest">Our Quality Standards</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Why Choose CASIT</h2>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { icon: <Award size={32} />, title: "Premium Print Quality", desc: "Museum-grade 300+ GSM matte paper using archival pigment inks." },
            { icon: <ShieldCheck size={32} />, title: "Secure Checkout & Payment", desc: "Fully secure payment gateways. Easy returns and refunds." },
            { icon: <Truck size={32} />, title: "Fast & Protected Delivery", desc: "Heavy-duty waterproof tube casing packaging delivered within 3-5 days." },
            { icon: <RotateCcw size={32} />, title: "Easy 7-Days Exchange", desc: "Not satisfied with the quality or design? Get an immediate exchange." }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="premium-card p-8 flex flex-col items-center space-y-4 hover:border-primary/50 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-black shadow-md shrink-0">
                {item.icon}
              </div>
              <h4 className="text-base font-bold text-gray-900 pt-2">{item.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS */}
      <section className="bg-neutral-950 py-12 sm:py-20 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-16" data-aos="fade-up">
            <span className="text-primary font-extrabold text-xs uppercase tracking-widest">Happy Customers</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white m-0">What Our Buyers Say</h2>
            <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Aarav Mehta", role: "Software Engineer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop", text: "The Solo Leveling poster is absolutely gorgeous. The colors are so deep and the paper feels super high quality. Perfectly fits my gaming setup!", rating: 5 },
              { name: "Neha Sharma", role: "UI Designer", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop", text: "Ordered two framed motivational quotes posters for my studio. The framing is premium wood and looks very clean. Highly recommend CASIT!", rating: 5 },
              { name: "Rahul Verma", role: "Auto Enthusiast", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop", text: "Bought the Porsche 911 GT3 RS poster. Insane detailing and finish. Perfect packaging in a solid tube, no creases at all. Super fast delivery.", rating: 5 }
            ].map((review, idx) => (
              <div 
                key={idx} 
                className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6 hover:border-primary/45 transition duration-300"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="flex items-center gap-4">
                  <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover border border-neutral-700" />
                  <div>
                    <h5 className="text-sm font-bold text-white">{review.name}</h5>
                    <span className="text-[10px] text-gray-500 font-semibold">{review.role}</span>
                  </div>
                </div>
                
                {/* Rating stars */}
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
