import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Truck, 
  Heart, 
  Printer, 
  CheckCircle2, 
  ChevronRight, 
  Star, 
  Layers, 
  Image as ImageIcon,
  Users
} from 'lucide-react';

export default function About() {
  const { navigateTo } = useContext(AppContext);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-16">
      
      {/* 1. HERO BANNER */}
      <div className="relative rounded-3xl bg-neutral-950 text-white p-8 sm:p-14 overflow-hidden border border-neutral-800 shadow-2xl" data-aos="fade-down">
        <div className="absolute inset-0 opacity-25 z-0">
          <img 
            src="/hero.png" 
            alt="CASIT About Hero Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-extrabold uppercase tracking-widest">
            <Sparkles size={14} />
            <span>Our Story & Mission</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight m-0">
            Elevating Walls into <br className="hidden sm:inline" />
            <span className="text-primary">Living Masterpieces</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-medium">
            CASIT was born out of a simple passion: turning plain, empty walls into vibrant expressions of identity, culture, gaming, sports, and inspiration. We craft museum-grade prints built to last for years.
          </p>
        </div>
      </div>

      {/* 2. OUR BRAND STORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Story details */}
        <div className="lg:col-span-7 space-y-6" data-aos="fade-right">
          <span className="text-primary font-bold text-xs uppercase tracking-widest block">Craftsmanship & Obsession</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Why CASIT Posters Stand Out from Ordinary Prints
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed font-normal">
            Most posters in the market are printed on cheap 150 GSM glossy paper that creases easily, reflects annoying room light, and fades in months. At <strong className="text-black font-bold">CASIT</strong>, we redefined wall poster standards.
          </p>

          <ul className="space-y-3.5 pt-2">
            {[
              { title: "300+ GSM Heavyweight Matte Paper", desc: "Premium thick textured paper that gives zero glare under sunlight or room lights." },
              { title: "Archival Giclée Pigment Inks", desc: "Ultra-precise Japanese pigment printing that delivers deep blacks, vivid colors, and anti-fade durability." },
              { title: "Waterproof Heavy-Duty Tube Packaging", desc: "Every poster is wrapped in protective tissue and shipped in unbreakable rigid cylinders." },
              { title: "Optional Handcrafted Wooden Frames", desc: "Pre-framed ready-to-hang options available with crystal-clear shatterproof acrylic." }
            ].map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900">{point.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{point.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Visual Frame */}
        <div className="lg:col-span-5 flex justify-center" data-aos="fade-left">
          <div className="relative p-3 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl max-w-sm w-full">
            <div className="overflow-hidden rounded-2xl aspect-[4/5] bg-neutral-800">
              <img 
                src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop" 
                alt="CASIT Print Studio Quality"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 text-center">
              <span className="text-[11px] font-bold text-gray-300">100% Archival Pigment Quality Tested</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE VALUES GRID */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
          <span className="text-primary font-bold text-xs uppercase tracking-widest">Our Guiding Pillars</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">What Drives Everything We Do</h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <ImageIcon size={28} />, title: "Curated Art Collections", desc: "Thousands of posters spanning Anime, Sports, Cars, Movies, Marvel, DC, and Spiritual themes." },
            { icon: <Printer size={28} />, title: "Museum Print Standard", desc: "300+ GSM matte paper and archival pigment inks engineered to resist fading for decades." },
            { icon: <ShieldCheck size={28} />, title: "Zero-Damage Guarantee", desc: "Heavy-duty waterproof tube casing. If damaged during transit, we replace it instantly." },
            { icon: <Heart size={28} />, title: "Customer Delight", desc: "Over 50,000+ happy buyers trust CASIT to decorate their homes, studios, and gaming setups." }
          ].map((val, idx) => (
            <div 
              key={idx}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md hover:shadow-xl hover:border-primary/40 transition duration-300 space-y-3"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-black shadow-sm shrink-0">
                {val.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 pt-1">{val.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. STATS COUNTER BAR */}
      <div className="bg-neutral-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-neutral-800" data-aos="zoom-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-primary block">50,000+</span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Walls Decorated</span>
          </div>
          <div className="space-y-1 pt-6 lg:pt-0">
            <span className="text-3xl sm:text-4xl font-black text-white block">500+</span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Unique Poster Prints</span>
          </div>
          <div className="space-y-1 pt-6 lg:pt-0">
            <span className="text-3xl sm:text-4xl font-black text-primary block">4.9 ★</span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Customer Rating</span>
          </div>
          <div className="space-y-1 pt-6 lg:pt-0">
            <span className="text-3xl sm:text-4xl font-black text-white block">100%</span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Quality Guarantee</span>
          </div>
        </div>
      </div>

      {/* 5. CALL TO ACTION */}
      <div className="bg-gradient-to-r from-yellow-400 via-primary to-amber-400 rounded-3xl p-8 sm:p-12 text-center text-black space-y-5 shadow-xl" data-aos="fade-up">
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight m-0">Ready to Redefine Your Space?</h2>
        <p className="text-xs sm:text-sm font-semibold max-w-xl mx-auto opacity-90 leading-relaxed">
          Browse our handpicked collections or request custom poster prints tailored to your favorite size and framing options.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button 
            onClick={() => navigateTo('categories')}
            className="w-full sm:w-auto px-8 py-3.5 bg-black text-white font-extrabold text-xs rounded-full hover:bg-neutral-900 active:scale-95 transition shadow-lg flex items-center justify-center gap-2"
          >
            <span>Explore Catalog</span>
            <ChevronRight size={16} />
          </button>
          <button 
            onClick={() => navigateTo('services')}
            className="w-full sm:w-auto px-8 py-3.5 bg-white/90 text-black font-extrabold text-xs rounded-full hover:bg-white active:scale-95 transition shadow-md"
          >
            Our Services & Custom Prints
          </button>
        </div>
      </div>

    </div>
  );
}
