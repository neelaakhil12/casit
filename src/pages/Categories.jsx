import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { categories, sizes } from '../data/products';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, Upload, FileImage, ShieldCheck } from 'lucide-react';

export default function Categories() {
  const { 
    products, 
    searchQuery, 
    setSearchQuery, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter,
    addToCart
  } = useContext(AppContext);

  const [sortOption, setSortOption] = useState('featured');
  const [customFile, setCustomFile] = useState(null);
  const [customSize, setCustomSize] = useState('A4');
  const [customFramed, setCustomFramed] = useState(false);
  const [customUploaded, setCustomUploaded] = useState(false);

  // Filter products by selected category and search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategoryFilter === 'all' || product.category === selectedCategoryFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price-low') return a.basePrice - b.basePrice;
    if (sortOption === 'price-high') return b.basePrice - a.basePrice;
    if (sortOption === 'rating') return b.rating - a.rating;
    return 0; // Default Featured sorting
  });

  const handleCustomUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomFile(file);
      setCustomUploaded(true);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customFile) return;
    
    // Create a mock product representation
    const customProduct = {
      id: 999, // Custom unique ID
      name: `Custom Poster (${customFile.name})`,
      category: 'customized',
      basePrice: 499, // higher base price for customized orders
      rating: 5.0,
      description: `Your personalized wall poster print. Size: ${customSize}, Frame: ${customFramed ? 'Yes' : 'No'}.`,
      image: URL.createObjectURL(customFile) || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=500&auto=format&fit=crop'
    };

    addToCart(customProduct, customSize, customFramed, 1);
    
    // Reset state
    setCustomFile(null);
    setCustomUploaded(false);
    alert('Successfully added custom poster to cart!');
  };

  const currentCategoryObj = categories.find(c => c.id === selectedCategoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-12">
      
      {/* Category Banner */}
      <div className="relative rounded-3xl bg-neutral-950 text-white p-6 sm:p-12 overflow-hidden border border-neutral-800 shadow-xl" data-aos="fade-down">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" 
            alt="Category banner background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-primary font-bold text-xs uppercase tracking-widest">Aesthetic Gallery</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold m-0 text-white">
            {currentCategoryObj ? currentCategoryObj.name : 'All Collections'}
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed font-medium">
            {currentCategoryObj ? currentCategoryObj.description : 'Browse our high-definition premium poster prints across all major categories. Find the perfect design that matches your aesthetic and elevates your interior spaces.'}
          </p>
        </div>
      </div>

      {/* Control Panel: Search, Category Filters, Sort Options */}
      <div className="space-y-6" data-aos="fade-up">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-6">
          {/* Search bar */}
          <div className="relative w-full lg:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Search by poster name or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-sm transition"
            />
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <SlidersHorizontal size={18} className="text-gray-400 shrink-0" />
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Sort: Top Rated</option>
            </select>
          </div>
        </div>

        {/* Category tags filter list */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border duration-200 ${
              selectedCategoryFilter === 'all' 
                ? 'bg-black text-white border-black shadow-md' 
                : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border duration-200 ${
                selectedCategoryFilter === cat.id 
                  ? 'bg-black text-white border-black shadow-md' 
                  : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Section */}
      <div data-aos="fade-up">
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <span className="text-4xl">🖼️</span>
            <h3 className="text-lg font-bold text-gray-900">No posters found</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">We couldn't find any posters matching your search term. Try checking your spelling or explore another category.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategoryFilter('all'); }}
              className="btn-primary text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
