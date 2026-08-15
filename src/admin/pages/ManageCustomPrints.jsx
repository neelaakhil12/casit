import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Package,
  Tag,
  DollarSign,
  Copy,
  Save,
  Check,
  Shield,
  Upload
} from 'lucide-react';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import {
  getHubProducts,
  fetchHubProductsFromDB,
  saveHubProducts,
  deleteHubProductFromDB,
  defaultHubProducts,
  DEFAULT_FRAME_STYLES
} from '../../data/customPrints';

const BADGE_OPTIONS = ['Bestseller', 'Trending', 'New Style', 'Popular', 'Best Gift', 'Limited', 'Sale'];

const emptyProduct = () => ({
  id: `custom-${Date.now()}`,
  titleScript: 'Custom',
  titleMain: 'NEW PRINT TYPE',
  subtitle: 'Your custom print description',
  buttonText: 'Get Yours →',
  image: '',
  badge: 'New Style',
  typeLabel: 'New Print Type',
  imageCount: 1,
  allowFraming: true,
  allowFrameOnly: true,
  framePrice: 250,
  frameBadge: 'Acrylic Shield',
  frameStyles: [...DEFAULT_FRAME_STYLES],
  defaultSizes: [
    { code: 'A4', label: 'A4', dimensions: '8.3 x 11.7 in', basePrice: 199, framePrice: 250, imageCount: 1 },
    { code: 'A3', label: 'A3', dimensions: '11.7 x 16.5 in', basePrice: 299, framePrice: 350, imageCount: 1 }
  ]
});

export default function ManageCustomPrints() {
  const [products, setProducts] = useState(() => {
    try {
      return getHubProducts();
    } catch (_) {
      return defaultHubProducts;
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null); // null = add new
  const [form, setForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedSection, setExpandedSection] = useState('basic'); // 'basic' | 'sizes'
  const [previewCard, setPreviewCard] = useState(null);

  // Sync on mount with Cloud DB (so Localhost & Live Vercel match)
  useEffect(() => {
    fetchHubProductsFromDB().then(cloudItems => {
      if (cloudItems && cloudItems.length > 0) {
        setProducts(cloudItems);
      }
    });

    const onStorage = () => {
      try {
        setProducts(getHubProducts());
      } catch (_) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Persist products whenever they change
  const persist = (updated) => {
    setProducts(updated);
    saveHubProducts(updated);
    window.dispatchEvent(new StorageEvent('storage', { key: 'casit_custom_print_types' }));
  };

  const openAdd = () => {
    setForm(emptyProduct());
    setEditingIdx(null);
    setImageFile(null);
    setErrorMsg('');
    setSuccessMsg('');
    setExpandedSection('basic');
    setModalOpen(true);
  };

  const openEdit = (idx) => {
    try {
      const item = (products && products[idx]) || defaultHubProducts[0];
      const rawSizes = Array.isArray(item.defaultSizes) && item.defaultSizes.length > 0
        ? item.defaultSizes
        : (Array.isArray(item.sizes) ? item.sizes : defaultHubProducts[0].defaultSizes);
      
      const safeSizes = rawSizes.map(s => ({
        code: s.code || s.name || 'A4',
        label: s.label || s.name || 'A4',
        dimensions: s.dimensions || '',
        basePrice: Number(s.basePrice || s.price || 129),
        framePrice: Number(s.framePrice !== undefined ? s.framePrice : (item.framePrice || 250)),
        imageCount: Number(s.imageCount || item.imageCount || 1)
      }));

      setForm({
        ...item,
        titleScript: item.titleScript || 'Custom',
        titleMain: item.titleMain || 'POSTER',
        subtitle: item.subtitle || '',
        buttonText: item.buttonText || 'Get Yours →',
        badge: item.badge || 'New Style',
        typeLabel: item.typeLabel || 'Single Wall Poster',
        image: item.image || '',
        extraTag: item.extraTag || '',
        defaultSizes: safeSizes,
        imageCount: Number(item.imageCount || 1),
        allowFraming: item.allowFraming !== false,
        allowFrameOnly: item.allowFrameOnly !== false,
        framePrice: Number(item.framePrice || 250),
        frameBadge: item.frameBadge || 'Acrylic Shield',
        frameStyles: Array.isArray(item.frameStyles) && item.frameStyles.length > 0 ? [...item.frameStyles] : [...DEFAULT_FRAME_STYLES]
      });
      setEditingIdx(idx);
      setImageFile(null);
      setErrorMsg('');
      setSuccessMsg('');
      setExpandedSection('basic');
      setModalOpen(true);
    } catch (err) {
      console.error('Error in openEdit:', err);
    }
  };

  const handleDelete = async (idx) => {
    const itemToDelete = products[idx];
    if (!itemToDelete) return;
    if (!window.confirm(`Delete "${itemToDelete?.titleMain}"? This removes it from the Design Your Own page.`)) return;
    
    const updated = products.filter((_, i) => i !== idx);
    setProducts(updated);
    
    await deleteHubProductFromDB(itemToDelete.id, updated);
    window.dispatchEvent(new StorageEvent('storage', { key: 'casit_custom_print_types' }));
    setSuccessMsg(`"${itemToDelete?.titleMain || 'Print'}" deleted.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDuplicate = (idx) => {
    const copy = {
      ...JSON.parse(JSON.stringify(products[idx])),
      id: `custom-${Date.now()}`,
      titleMain: (products[idx]?.titleMain || 'PRINT') + ' (Copy)'
    };
    const updated = [...products.slice(0, idx + 1), copy, ...products.slice(idx + 1)];
    persist(updated);
    setSuccessMsg(`Duplicated "${products[idx]?.titleMain}".`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const updated = [...products];
    const temp = updated[idx - 1];
    updated[idx - 1] = updated[idx];
    updated[idx] = temp;
    persist(updated);
  };

  const moveDown = (idx) => {
    if (idx === products.length - 1) return;
    const updated = [...products];
    const temp = updated[idx + 1];
    updated[idx + 1] = updated[idx];
    updated[idx] = temp;
    persist(updated);
  };

  // Form field helpers
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setField('image', URL.createObjectURL(file));
    }
  };

  // Size row helpers
  const addSize = () => setForm(f => ({
    ...f,
    defaultSizes: [...(f?.defaultSizes || []), { code: `S${Date.now()}`, label: 'New Size', dimensions: '', basePrice: 199, framePrice: 250, imageCount: f?.imageCount || 1 }]
  }));

  const updateSize = (i, key, val) => setForm(f => {
    const s = [...(f?.defaultSizes || [])];
    s[i] = { ...s[i], [key]: key === 'basePrice' || key === 'framePrice' || key === 'imageCount' ? Number(val) : val };
    return { ...f, defaultSizes: s };
  });

  const removeSize = (i) => setForm(f => ({
    ...f,
    defaultSizes: (f?.defaultSizes || []).filter((_, idx) => idx !== i)
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form?.titleMain?.trim()) { setErrorMsg('Title is required.'); return; }
    if (!form?.defaultSizes || form.defaultSizes.length === 0) { setErrorMsg('Add at least one size option.'); return; }

    setUploading(true);
    setErrorMsg('');

    try {
      let finalImage = form.image;
      if (imageFile) {
        try {
          finalImage = await uploadImageToCloudinary(imageFile);
        } catch (e) {
          console.warn('Cloudinary upload failed, using object URL:', e);
        }
      }

      const updatedProduct = {
        ...form,
        image: finalImage,
        imageCount: Number(form.imageCount) || 1,
        allowFraming: form.allowFraming !== false,
        allowFrameOnly: form.allowFrameOnly !== false,
        framePrice: Number(form.framePrice) || 250,
        frameBadge: form.frameBadge || 'Acrylic Shield',
        frameStyles: Array.isArray(form.frameStyles) && form.frameStyles.length > 0 ? form.frameStyles : [...DEFAULT_FRAME_STYLES]
      };

      let updatedList;
      if (editingIdx !== null) {
        updatedList = products.map((p, i) => i === editingIdx ? updatedProduct : p);
      } else {
        updatedList = [...products, updatedProduct];
      }

      persist(updatedList);
      setModalOpen(false);
      setSuccessMsg(editingIdx !== null ? 'Print type updated successfully!' : 'New print type added!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-yellow-100 text-yellow-800 rounded-2xl">
              <Sparkles size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Custom Prints & Frames</h1>
              <p className="text-xs text-gray-500 font-medium">Manage items shown on the "Design Your Own Prints" page, sizes, pricing, and upload options</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="btn-primary flex items-center gap-2 !py-2.5 !px-5 text-xs font-black shadow-yellow-glow"
          >
            <Plus size={16} /> Add Print Type
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-2xl animate-fade-in shadow-sm">
          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ─── CARDS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(products) ? products : []).map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
          >
            {/* Card Header & Preview */}
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.titleMain}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                  <ImageIcon size={36} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">No Cover Image</span>
                </div>
              )}

              {/* Overlay Badge */}
              <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                {item.badge && (
                  <span className="bg-black text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-md">
                    {item.badge}
                  </span>
                )}
                {item.extraTag && (
                  <span className="bg-black/80 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow">
                    {item.extraTag}
                  </span>
                )}
              </div>

              {/* Action Buttons Top Right */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-2xl opacity-90 group-hover:opacity-100 transition">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1 text-white hover:text-primary disabled:opacity-30 transition"
                  title="Move Left/Up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === products.length - 1}
                  className="p-1 text-white hover:text-primary disabled:opacity-30 transition"
                  title="Move Right/Down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => setPreviewCard(item)}
                  className="p-1 text-white hover:text-primary transition"
                  title="Preview Customer Card"
                >
                  <Eye size={14} />
                </button>
              </div>

              {/* Script Title Banner Bottom of Image */}
              <div className="absolute bottom-3 left-3 right-3 text-white drop-shadow-md">
                <span className="font-serif italic text-xs block text-white/90">{item.titleScript || 'Custom'}</span>
                <span className="font-black text-lg tracking-tight leading-none block">{item.titleMain}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900">{item.typeLabel || 'Custom Print'}</span>
                  <span className="text-[11px] font-bold text-gray-500">
                    {item.defaultSizes?.length || 0} Size{item.defaultSizes?.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.subtitle}</p>

                {/* Sizes Pill preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(item.defaultSizes || []).map((sz, i) => (
                    <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">
                      {sz.label}: ₹{sz.basePrice}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                <button
                  onClick={() => handleDuplicate(idx)}
                  className="flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-black py-1.5 px-2.5 rounded-xl hover:bg-gray-100 transition"
                  title="Duplicate this print type"
                >
                  <Copy size={13} /> Duplicate
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(idx)}
                    className="flex items-center gap-1 text-[11px] font-black bg-black text-white py-1.5 px-3 rounded-xl hover:bg-neutral-800 transition shadow-sm"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── ADD / EDIT MODAL ─── */}
      {modalOpen && form && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 animate-fade-in-up flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-100 text-yellow-800 rounded-2xl">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {editingIdx !== null ? 'Edit Custom Print Type' : 'Add New Custom Print Type'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Changes appear live on the "Design Your Own" page</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-black transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[78vh]">
              <div className="p-8 space-y-6">

                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                    <AlertCircle size={14} /> {errorMsg}
                  </div>
                )}

                {/* ── SECTION TABS ── */}
                <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
                  {[
                    { id: 'basic', label: '1. Basic Info' },
                    { id: 'sizes', label: '2. Sizes & Base Prices' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setExpandedSection(tab.id)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold capitalize transition ${
                        expandedSection === tab.id ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ── TAB 1: BASIC INFO ── */}
                {expandedSection === 'basic' && (
                  <div className="space-y-5">
                    {/* Image Upload */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                      <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                        <ImageIcon size={15} className="text-primary" /> Card Cover Image
                      </label>
                      <div className="flex items-center gap-4">
                        {form.image ? (
                          <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-primary shrink-0 shadow-sm">
                            <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-24 h-28 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 shrink-0 bg-white">
                            <ImageIcon size={22} />
                            <span className="text-[10px] mt-1">No image</span>
                          </div>
                        )}
                        <div className="space-y-2 flex-1">
                          <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 hover:border-black px-4 py-2 rounded-xl text-xs font-bold text-gray-700 transition w-fit shadow-sm">
                            <Upload size={13} />
                            <span>Upload Cover Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageFileChange}
                            />
                          </label>
                          <input
                            type="text"
                            placeholder="Or paste image URL (e.g. /custom-prints/...)"
                            value={form.image || ''}
                            onChange={e => setField('image', e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Titles */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Script Title (top script text)</label>
                        <input
                          type="text"
                          placeholder="Custom"
                          value={form.titleScript || ''}
                          onChange={e => setField('titleScript', e.target.value)}
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black font-serif italic"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Main Title (bold uppercase)</label>
                        <input
                          type="text"
                          placeholder="POSTER"
                          value={form.titleMain || ''}
                          onChange={e => setField('titleMain', e.target.value)}
                          required
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black font-black uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Card Label (bottom)</label>
                        <input
                          type="text"
                          placeholder="Single Wall Poster"
                          value={form.typeLabel || ''}
                          onChange={e => setField('typeLabel', e.target.value)}
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Badge Label</label>
                        <select
                          value={form.badge || 'New Style'}
                          onChange={e => setField('badge', e.target.value)}
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black font-bold"
                        >
                          {BADGE_OPTIONS.map(b => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Subtitle / Description</label>
                      <input
                        type="text"
                        placeholder="Single Panel Standard & Jumbo Prints"
                        value={form.subtitle || ''}
                        onChange={e => setField('subtitle', e.target.value)}
                        className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    {/* Image Upload Buttons Count Setting */}
                    <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <label className="text-xs font-black text-amber-950 block">
                          📷 Image Upload Buttons Count (Default per unit)
                        </label>
                        <span className="text-[11px] text-amber-800 font-medium">
                          Number of image upload buttons shown to the customer (e.g. 1 for single poster, 3 for 3-piece split, 4 for 2x2 grid)
                        </span>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={form.imageCount ?? 1}
                          onChange={e => setField('imageCount', Math.max(1, Number(e.target.value)))}
                          className="w-full text-center font-black text-sm p-2 bg-white border border-amber-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-amber-950"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Button Text</label>
                        <input
                          type="text"
                          placeholder="Get Yours →"
                          value={form.buttonText || ''}
                          onChange={e => setField('buttonText', e.target.value)}
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Extra Tag (e.g. 2X2)</label>
                        <input
                          type="text"
                          placeholder="Optional extra tag"
                          value={form.extraTag || ''}
                          onChange={e => setField('extraTag', e.target.value)}
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: SIZE OPTIONS ── */}
                {expandedSection === 'sizes' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-800">
                          Size Options & Base Prices ({(form?.defaultSizes || []).length})
                        </h4>
                        <p className="text-[10px] text-gray-500">Each size has its own poster price and image upload count.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addSize}
                        className="flex items-center gap-1.5 text-xs font-bold bg-black text-white px-3 py-2 rounded-xl hover:bg-neutral-800 transition"
                      >
                        <Plus size={13} /> Add Size
                      </button>
                    </div>

                    {(form?.defaultSizes || []).length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">No sizes yet. Click "Add Size" to start.</p>
                    )}

                    <div className="space-y-3">
                      {(form?.defaultSizes || []).map((size, i) => {
                        const posterP = Number(size.basePrice) || 0;
                        const imgCount = Number(size.imageCount ?? form?.imageCount ?? 1);
                        return (
                          <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wide">Size #{i + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeSize(i)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1">Code (internal)</label>
                                <input
                                  type="text"
                                  value={size.code || ''}
                                  onChange={e => updateSize(i, 'code', e.target.value)}
                                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black"
                                  placeholder="A4"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1">Display Label</label>
                                <input
                                  type="text"
                                  value={size.label || ''}
                                  onChange={e => updateSize(i, 'label', e.target.value)}
                                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black"
                                  placeholder="A4"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-blue-700 block mb-1">Poster Price (₹)</label>
                                <input
                                  type="number"
                                  value={size.basePrice || ''}
                                  onChange={e => updateSize(i, 'basePrice', e.target.value)}
                                  className="w-full text-xs p-2 bg-blue-50 border border-blue-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-black text-blue-950"
                                  min={0}
                                  placeholder="129"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-emerald-700 block mb-1">📷 Images</label>
                                <input
                                  type="number"
                                  value={size.imageCount !== undefined ? size.imageCount : (form?.imageCount ?? 1)}
                                  onChange={e => updateSize(i, 'imageCount', Math.max(1, Number(e.target.value)))}
                                  className="w-full text-xs p-2 bg-emerald-50 border border-emerald-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 font-black text-emerald-950"
                                  min={1}
                                  max={50}
                                  title="Number of image upload buttons required for this size"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50 gap-3">
                <div className="flex gap-2">
                  {expandedSection !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => setExpandedSection('basic')}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                    >
                      ← Back
                    </button>
                  )}
                  {expandedSection === 'basic' && (
                    <button
                      type="button"
                      onClick={() => setExpandedSection('sizes')}
                      className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition"
                    >
                      Next: Sizes & Pricing →
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-primary !py-2.5 !px-7 text-xs font-black shadow-yellow-glow flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        {editingIdx !== null ? 'Save Changes' : 'Add Print Type'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PREVIEW MODAL ─── */}
      {previewCard && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewCard(null)}
        >
          <div
            className="relative max-w-xs w-full animate-fade-in-up"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewCard(null)}
              className="absolute -top-10 right-0 text-white text-xs font-bold hover:text-primary transition"
            >
              Close Preview ✕
            </button>
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
              <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                {previewCard.image ? (
                  <img src={previewCard.image} alt={previewCard.titleMain} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400"><ImageIcon size={40} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
                <div className="absolute top-6 inset-x-0 text-center z-20 space-y-1 px-4">
                  <p className="font-serif italic text-base text-white drop-shadow-md">{previewCard.titleScript}</p>
                  <h3 className="text-2xl font-black text-white tracking-tight">{previewCard.titleMain}</h3>
                  <button className="px-5 py-1.5 rounded-full bg-black/80 text-white text-xs font-bold border border-white/40 inline-flex items-center gap-1">
                    {previewCard.buttonText}
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between bg-white border-t border-gray-100">
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900">{previewCard.typeLabel}</h4>
                  <p className="text-[11px] text-gray-500">{previewCard.subtitle}</p>
                </div>
                <span className="text-[10px] bg-primary font-extrabold px-2 py-0.5 rounded-full">{previewCard.badge}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
