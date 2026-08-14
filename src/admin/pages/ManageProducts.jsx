import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { Trash2, Edit, Plus, X } from 'lucide-react';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Per-size Price Matrix State
  const [customSizes, setCustomSizes] = useState(['A6', 'A5', 'A4', 'A3', 'Split']);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [showAddSizeField, setShowAddSizeField] = useState(false);

  const [sizePrices, setSizePrices] = useState({
    poster: { A6: '', A5: '', A4: '', A3: '', Split: '' },
    frame: { A6: '', A5: '', A4: '', A3: '', Split: '' },
    posterFrame: { A6: '', A5: '', A4: '', A3: '', Split: '' }
  });

  // Homepage Display Sections Flags
  const [isTrending, setIsTrending] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    setCategories(data || []);
  };

  const handlePriceChange = (format, size, value) => {
    setSizePrices(prev => ({
      ...prev,
      [format]: {
        ...prev[format],
        [size]: value
      }
    }));
  };

  const handleAddCustomSize = (e) => {
    e.preventDefault();
    const formatted = newSizeInput.trim();
    if (!formatted) return;
    if (!customSizes.includes(formatted)) {
      setCustomSizes(prev => [...prev, formatted]);
    }
    setNewSizeInput('');
    setShowAddSizeField(false);
  };

  const handleRemoveCustomSize = (sizeToRemove) => {
    if (['A4', 'A3'].includes(sizeToRemove)) {
      alert('Standard sizes A4 and A3 cannot be removed.');
      return;
    }
    setCustomSizes(prev => prev.filter(s => s !== sizeToRemove));
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setCategoryId('');
    setDescription('');
    setImageFile(null);
    setIsTrending(true);
    setIsBestSeller(false);
    setIsNewArrival(false);
    setCustomSizes(['A6', 'A5', 'A4', 'A3']);
    setSizePrices({
      poster: { A6: '', A5: '249', A4: '299', A3: '449' },
      frame: { A6: '', A5: '350', A4: '400', A3: '550' },
      posterFrame: { A6: '', A5: '599', A4: '699', A3: '999' }
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setTitle(product.title || '');
    setCategoryId(product.category_id || '');
    setDescription(product.description || '');
    setImageFile(null);
    setIsTrending(product.is_trending !== undefined ? Boolean(product.is_trending) : true);
    setIsBestSeller(product.is_best_seller !== undefined ? Boolean(product.is_best_seller) : false);
    setIsNewArrival(product.is_new_arrival !== undefined ? Boolean(product.is_new_arrival) : false);

    const bp = product.base_price ? product.base_price.toString() : '';
    const fp = product.frame_price !== undefined && product.frame_price !== null ? product.frame_price.toString() : '';
    const pfp = product.poster_frame_price ? product.poster_frame_price.toString() : (bp && fp ? (parseFloat(bp) + parseFloat(fp)).toString() : '');

    const savedMatrix = product.size_prices || product.sizePrices;

    if (savedMatrix && typeof savedMatrix === 'object') {
      const allSavedSizes = Array.from(new Set([
        'A6', 'A5', 'A4', 'A3',
        ...Object.keys(savedMatrix.poster || {}),
        ...Object.keys(savedMatrix.frame || {}),
        ...Object.keys(savedMatrix.posterFrame || {})
      ])).filter(s => s !== 'Split' && s !== 'Split Poster' && s !== 'Split Set');
      
      setCustomSizes(allSavedSizes.length > 0 ? allSavedSizes : ['A6', 'A5', 'A4', 'A3']);

      const pObj = {};
      const fObj = {};
      const pfObj = {};
      allSavedSizes.forEach(s => {
        pObj[s] = savedMatrix.poster?.[s] || (s === 'A4' ? bp : '');
        fObj[s] = savedMatrix.frame?.[s] || (s === 'A4' ? fp : '');
        pfObj[s] = savedMatrix.posterFrame?.[s] || (s === 'A4' ? pfp : '');
      });

      setSizePrices({ poster: pObj, frame: fObj, posterFrame: pfObj });
    } else {
      setCustomSizes(['A6', 'A5', 'A4', 'A3']);
      setSizePrices({
        poster: { A6: '', A5: '', A4: bp, A3: '' },
        frame: { A6: '', A5: '', A4: fp, A3: '' },
        posterFrame: { A6: '', A5: '', A4: pfp, A3: '' }
      });
    }

    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    if (!categoryId) {
      setError('Please select a category');
      setUploading(false);
      return;
    }

    const pA4 = parseFloat(sizePrices.poster.A4) || parseFloat(sizePrices.poster.A3) || parseFloat(sizePrices.poster.A5) || 0;
    const fA4 = parseFloat(sizePrices.frame.A4) || parseFloat(sizePrices.frame.A3) || 0;
    const pfA4 = parseFloat(sizePrices.posterFrame.A4) || parseFloat(sizePrices.posterFrame.A3) || 0;

    if (!pA4 && !fA4 && !pfA4) {
      setError('Please enter price details for at least one size slot.');
      setUploading(false);
      return;
    }

    try {
      let imageUrl = editingProduct ? editingProduct.image_url : null;
      if (imageFile) {
        try {
           imageUrl = await uploadImageToCloudinary(imageFile);
        } catch (uploadErr) {
           setError('Image upload failed. Ensure Cloudinary env vars are set.');
           setUploading(false);
           return;
        }
      }

      const productPayload = { 
        title, 
        base_price: pA4 || pfA4 || fA4,
        category_id: categoryId,
        description,
        image_url: imageUrl,
        available_formats: 'both',
        frame_price: fA4 || 400,
        poster_frame_price: pfA4 || (pA4 + fA4),
        size_prices: sizePrices,
        is_trending: isTrending,
        is_best_seller: isBestSeller,
        is_new_arrival: isNewArrival
      };

      if (editingProduct) {
        let { error: dbError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);

        if (dbError && dbError.message?.includes('column')) {
          const fallbackPayload = { 
            title, 
            base_price: pA4 || pfA4 || fA4,
            category_id: categoryId,
            description,
            image_url: imageUrl,
            frame_price: fA4 || 400,
            poster_frame_price: pfA4
          };
          const { error: fallbackError } = await supabase
            .from('products')
            .update(fallbackPayload)
            .eq('id', editingProduct.id);

          if (fallbackError) throw fallbackError;
        } else if (dbError) {
          throw dbError;
        }
      } else {
        let { error: dbError } = await supabase
          .from('products')
          .insert([productPayload]);

        if (dbError && dbError.message?.includes('column')) {
          const fallbackPayload = { 
            title, 
            base_price: pA4 || pfA4 || fA4,
            category_id: categoryId,
            description,
            image_url: imageUrl,
            frame_price: fA4 || 400,
            poster_frame_price: pfA4
          };
          const { error: fallbackError } = await supabase
            .from('products')
            .insert([fallbackPayload]);

          if (fallbackError) throw fallbackError;
        } else if (dbError) {
          throw dbError;
        }
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError(editingProduct ? 'Failed to update product' : 'Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert('Failed to delete product');
      } else {
        fetchProducts();
      }
    }
  };

  const formatBadgeLabel = (product) => {
    const sp = product.size_prices || product.sizePrices;
    if (sp && sp.poster && (sp.poster.A4 || sp.poster.A3 || sp.poster.A5)) {
      const mainP = sp.poster.A4 || sp.poster.A3 || sp.poster.A5;
      const mainF = sp.frame?.A4 || sp.frame?.A3 || 400;
      const mainPF = sp.posterFrame?.A4 || sp.posterFrame?.A3 || '';
      return `Poster: ₹${mainP} | Frame: ₹${mainF}${mainPF ? ` | Poster+Frame: ₹${mainPF}` : ''}`;
    }
    const bP = parseFloat(product.base_price) || 0;
    const fP = parseFloat(product.frame_price) || 0;
    const pfP = parseFloat(product.poster_frame_price) || (bP + fP);
    
    let parts = [];
    if (bP > 0) parts.push(`Poster: ₹${bP}`);
    if (fP > 0) parts.push(`Frame: ₹${fP}`);
    if (pfP > 0) parts.push(`Poster + Frame: ₹${pfP}`);

    return parts.length > 0 ? parts.join(' | ') : 'No Price Set';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Manage Products</h2>
        <button 
          onClick={handleOpenAddModal}
          className="bg-primary text-black px-4 py-2 rounded-lg font-bold shadow-yellow-glow hover:bg-primary-hover transition-colors"
        >
          + Add Product
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading products...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-medium text-gray-600">Image</th>
                <th className="p-4 font-medium text-gray-600">Title</th>
                <th className="p-4 font-medium text-gray-600">Category</th>
                <th className="p-4 font-medium text-gray-600">Price Details</th>
                <th className="p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Img</div>
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{product.title}</td>
                    <td className="p-4 text-gray-600">{product.categories?.name || 'Unknown'}</td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-md text-xs">
                        {formatBadgeLabel(product)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button onClick={() => handleOpenEditModal(product)} className="text-blue-600 hover:text-blue-800" title="Edit Product">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800" title="Delete Product">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal with Dynamic Per-Size Matrix */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                    placeholder="e.g. Solo Leveling Shadow Monarch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-semibold"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Per-Size Pricing Matrix Grid */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Per-Size Price Matrix (₹)</h4>
                    <span className="text-[11px] text-gray-500 font-medium">Enter manual prices for each size option</span>
                  </div>
                  
                  {!showAddSizeField ? (
                    <button
                      type="button"
                      onClick={() => setShowAddSizeField(true)}
                      className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <Plus size={14} /> Add Custom Size
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={newSizeInput}
                        onChange={(e) => setNewSizeInput(e.target.value)}
                        placeholder="Size name (e.g. A2, 12x18)"
                        className="border border-blue-400 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button 
                        type="button"
                        onClick={handleAddCustomSize}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-2 py-1 rounded-lg"
                      >
                        Add
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowAddSizeField(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[500px] space-y-4">
                    
                    {/* Header Row of Sizes */}
                    <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${customSizes.length}, minmax(80px, 1fr))` }}>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider self-end">Format \ Size</div>
                      {customSizes.map(sz => (
                        <div key={sz} className="flex items-center justify-between bg-gray-200/70 px-2 py-1 rounded text-center">
                          <span className="text-xs font-bold text-gray-800 truncate">{sz === 'Split' ? 'Split Set' : sz}</span>
                          {!['A4', 'A3'].includes(sz) && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveCustomSize(sz)}
                              className="text-gray-400 hover:text-red-600 text-xs ml-1"
                              title="Remove size column"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 1. POSTER ONLY PRICES */}
                    <div className="grid gap-2 items-center" style={{ gridTemplateColumns: `120px repeat(${customSizes.length}, minmax(80px, 1fr))` }}>
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">1. Poster Only</span>
                      {customSizes.map(sz => (
                        <input 
                          key={`p-${sz}`}
                          type="number"
                          min="0"
                          value={sizePrices.poster[sz] || ''}
                          onChange={(e) => handlePriceChange('poster', sz, e.target.value)}
                          placeholder="e.g. 299"
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none text-center"
                        />
                      ))}
                    </div>

                    {/* 2. FRAME ONLY PRICES */}
                    <div className="grid gap-2 items-center pt-2 border-t border-gray-200" style={{ gridTemplateColumns: `120px repeat(${customSizes.length}, minmax(80px, 1fr))` }}>
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">2. Frame Only</span>
                      {customSizes.map(sz => (
                        <input 
                          key={`f-${sz}`}
                          type="number"
                          min="0"
                          value={sizePrices.frame[sz] || ''}
                          onChange={(e) => handlePriceChange('frame', sz, e.target.value)}
                          placeholder="e.g. 400"
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none text-center"
                        />
                      ))}
                    </div>

                    {/* 3. POSTER + FRAME PRICES */}
                    <div className="grid gap-2 items-center pt-2 border-t border-gray-200" style={{ gridTemplateColumns: `120px repeat(${customSizes.length}, minmax(80px, 1fr))` }}>
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider">3. Poster + Frame</span>
                      {customSizes.map(sz => (
                        <input 
                          key={`pf-${sz}`}
                          type="number"
                          min="0"
                          value={sizePrices.posterFrame[sz] || ''}
                          onChange={(e) => handlePriceChange('posterFrame', sz, e.target.value)}
                          placeholder="e.g. 699"
                          className="w-full border border-gray-300 rounded-lg p-2 bg-white text-xs font-extrabold text-green-700 focus:ring-2 focus:ring-green-500 outline-none text-center"
                        />
                      ))}
                    </div>

                  </div>
                </div>

              </div>

              {/* Homepage Display Sections Checkboxes */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Homepage Display Sections
                </label>
                <p className="text-xs text-gray-500">Select which sections on the homepage this product should appear in:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <label className="flex items-center gap-2.5 bg-white border border-gray-200 px-3.5 py-2.5 rounded-xl cursor-pointer hover:border-black transition text-xs font-bold text-gray-800">
                    <input 
                      type="checkbox" 
                      checked={isTrending} 
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="w-4 h-4 text-primary accent-primary rounded cursor-pointer" 
                    />
                    <span>🔥 Trending Posters</span>
                  </label>

                  <label className="flex items-center gap-2.5 bg-white border border-gray-200 px-3.5 py-2.5 rounded-xl cursor-pointer hover:border-black transition text-xs font-bold text-gray-800">
                    <input 
                      type="checkbox" 
                      checked={isBestSeller} 
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="w-4 h-4 text-primary accent-primary rounded cursor-pointer" 
                    />
                    <span>⭐ Best Sellers</span>
                  </label>

                  <label className="flex items-center gap-2.5 bg-white border border-gray-200 px-3.5 py-2.5 rounded-xl cursor-pointer hover:border-black transition text-xs font-bold text-gray-800">
                    <input 
                      type="checkbox" 
                      checked={isNewArrival} 
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="w-4 h-4 text-primary accent-primary rounded cursor-pointer" 
                    />
                    <span>✨ New Arrivals</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                {editingProduct?.image_url && !imageFile && (
                  <div className="mb-2 flex items-center gap-3">
                    <img src={editingProduct.image_url} alt="Current" className="w-12 h-12 object-cover rounded-lg border" />
                    <span className="text-xs text-gray-500">Current Image (Upload new file to replace)</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="px-4 py-2 bg-primary text-black font-bold rounded-lg shadow-yellow-glow hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
