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
  RotateCcw,
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
  Shield
} from 'lucide-react';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import {
  getHubProducts,
  saveHubProducts,
  resetHubProducts,
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
  allowFraming: true,
  framePrice: 250,
  frameBadge: 'Acrylic Shield',
  frameStyles: [...DEFAULT_FRAME_STYLES],
  defaultSizes: [
    { code: 'A4', label: 'A4', dimensions: '8.3 x 11.7 in', basePrice: 199 },
    { code: 'A3', label: 'A3', dimensions: '11.7 x 16.5 in', basePrice: 299 }
  ]
});

export default function ManageCustomPrints() {
  const [products, setProducts] = useState(getHubProducts());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null); // null = add new
  const [form, setForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedSection, setExpandedSection] = useState('basic'); // 'basic' | 'sizes' | 'framing'
  const [previewCard, setPreviewCard] = useState(null);
  const [newFrameStyleInput, setNewFrameStyleInput] = useState('');

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
    const item = products[idx];
    setForm({
      ...item,
      allowFraming: item.allowFraming ?? true,
      framePrice: item.framePrice ?? 250,
      frameBadge: item.frameBadge ?? 'Acrylic Shield',
      frameStyles: item.frameStyles ? [...item.frameStyles] : [...DEFAULT_FRAME_STYLES]
    });
    setEditingIdx(idx);
    setImageFile(null);
    setErrorMsg('');
    setSuccessMsg('');
    setExpandedSection('basic');
    setModalOpen(true);
  };

  const handleDelete = (idx) => {
    if (!window.confirm(`Delete "${products[idx].titleMain}"? This removes it from the Design Your Own page.`)) return;
    const updated = products.filter((_, i) => i !== idx);
    persist(updated);
    setSuccessMsg(`"${products[idx].titleMain}" deleted.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDuplicate = (idx) => {
    const copy = {
      ...JSON.parse(JSON.stringify(products[idx])),
      id: `custom-${Date.now()}`,
      titleMain: products[idx].titleMain + ' (Copy)'
    };
    const updated = [...products.slice(0, idx + 1), copy, ...products.slice(idx + 1)];
    persist(updated);
    setSuccessMsg(`Duplicated "${products[idx].titleMain}".`);
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

  const handleReset = () => {
    if (!window.confirm('Reset all custom print types to original defaults? Any custom types will be replaced.')) return;
    resetHubProducts();
    setProducts(defaultHubProducts);
    window.dispatchEvent(new StorageEvent('storage', { key: 'casit_custom_print_types' }));
    setSuccessMsg('Reset to default custom print types.');
    setTimeout(() => setSuccessMsg(''), 3000);
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
    defaultSizes: [...f.defaultSizes, { code: `S${Date.now()}`, label: 'New Size', dimensions: '', basePrice: 199, framePrice: 250 }]
  }));
  const updateSize = (i, key, val) => setForm(f => {
    const s = [...f.defaultSizes];
    s[i] = { ...s[i], [key]: key === 'basePrice' || key === 'framePrice' ? Number(val) : val };
    return { ...f, defaultSizes: s };
  });
  const removeSize = (i) => setForm(f => ({
    ...f,
    defaultSizes: f.defaultSizes.filter((_, idx) => idx !== i)
  }));

  // Framing style helpers
  const toggleFrameStyle = (styleName) => {
    setForm(f => {
      const current = f.frameStyles || [];
      const exists = current.includes(styleName);
      const updated = exists ? current.filter(s => s !== styleName) : [...current, styleName];
      return { ...f, frameStyles: updated };
    });
  };

  const addCustomFrameStyle = () => {
    if (!newFrameStyleInput.trim()) return;
    const styleName = newFrameStyleInput.trim();
    setForm(f => {
      const current = f.frameStyles || [];
      if (current.includes(styleName)) return f;
      return { ...f, frameStyles: [...current, styleName] };
    });
    setNewFrameStyleInput('');
  };

  const removeFrameStyle = (styleName) => {
    setForm(f => ({
      ...f,
      frameStyles: (f.frameStyles || []).filter(s => s !== styleName)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titleMain.trim()) { setErrorMsg('Title is required.'); return; }
    if (form.defaultSizes.length === 0) { setErrorMsg('Add at least one size option.'); return; }

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
        allowFraming: !!form.allowFraming,
        framePrice: Number(form.framePrice) || 0,
        frameBadge: form.frameBadge || '',
        frameStyles: form.frameStyles || []
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
              <p className="text-xs text-gray-500 font-medium">Manage items shown on the "Design Your Own Prints" page, sizes, pricing, and framing options</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition shadow-sm"
            title="Reset to initial 6 presets"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
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
        {products.map((item, idx) => (
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
                <span className="bg-primary text-black font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  {item.badge || 'Featured'}
                </span>
                {item.extraTag && (
                  <span className="bg-black/80 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow">
                    {item.extraTag}
                  </span>
                )}
                {item.allowFraming && (
                  <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <Shield size={10} /> +Frame ₹{item.framePrice || 250}
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
                  <span className="text-xs font-black text-gray-900">{item.typeLabel}</span>
                  <span className="text-[11px] font-bold text-gray-500">
                    {item.defaultSizes?.length || 0} Size{item.defaultSizes?.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.subtitle}</p>

                {/* Sizes Pill preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.defaultSizes?.map((sz, i) => (
                    <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">
                      {sz.label}: Poster ₹{sz.basePrice}{item.allowFraming ? ` | Frame ₹${sz.framePrice ?? item.framePrice ?? 250}` : ''}
                    </span>
                  ))}
                </div>

                {/* Framing status pill */}
                <div className="pt-1 text-[11px]">
                  {item.allowFraming ? (
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                      ✓ Framing Available (+₹{item.framePrice || 250}) · {item.frameStyles?.length || 0} Styles
                    </span>
                  ) : (
                    <span className="text-gray-400 font-semibold">Unframed print only</span>
                  )}
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
                    { id: 'sizes', label: '2. Sizes & Base Prices' },
                    { id: 'framing', label: '3. Framing Options 🖼️' }
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
                            <span className="text-[9px] mt-1">Cover</span>
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-neutral-800 cursor-pointer"
                          />
                          <input
                            type="text"
                            placeholder="Or paste image URL (e.g. /custom-prints/custom-poster.jpg)..."
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
                        <h4 className="text-xs font-extrabold text-gray-800">Size Options & Base Prices ({form.defaultSizes.length})</h4>
                        <p className="text-[10px] text-gray-500">Each size has its own base price. Total price = Size Base Price × Quantity.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addSize}
                        className="flex items-center gap-1.5 text-xs font-bold bg-black text-white px-3 py-2 rounded-xl hover:bg-neutral-800 transition"
                      >
                        <Plus size={13} /> Add Size
                      </button>
                    </div>

                    {form.defaultSizes.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">No sizes yet. Click "Add Size" to start.</p>
                    )}

                    <div className="space-y-3">
                      {form.defaultSizes.map((size, i) => {
                        const posterP = Number(size.basePrice) || 0;
                        const frameP = Number(size.framePrice ?? form.framePrice ?? 0);
                        const bothP = posterP + frameP;
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1">Code (internal)</label>
                                <input
                                  type="text"
                                  value={size.code}
                                  onChange={e => updateSize(i, 'code', e.target.value)}
                                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black"
                                  placeholder="A4"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1">Display Label</label>
                                <input
                                  type="text"
                                  value={size.label}
                                  onChange={e => updateSize(i, 'label', e.target.value)}
                                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black"
                                  placeholder="A4"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1">Dimensions</label>
                                <input
                                  type="text"
                                  value={size.dimensions}
                                  onChange={e => updateSize(i, 'dimensions', e.target.value)}
                                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black"
                                  placeholder="8.3 x 11.7 in"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-blue-700 block mb-1">🖼️ Poster Price (₹)</label>
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
                                <label className="text-[10px] font-bold text-amber-700 block mb-1">🔲 Frame Price (₹)</label>
                                <input
                                  type="number"
                                  value={size.framePrice !== undefined ? size.framePrice : (form.framePrice || '')}
                                  onChange={e => updateSize(i, 'framePrice', e.target.value)}
                                  className="w-full text-xs p-2 bg-amber-50 border border-amber-300 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 font-black text-amber-950"
                                  min={0}
                                  placeholder="250"
                                />
                              </div>
                            </div>

                            {/* Live Pricing Breakdown Bar */}
                            <div className="p-2 bg-white rounded-xl border border-gray-200 flex flex-wrap items-center justify-between text-[11px] gap-2">
                              <span className="font-bold text-blue-800">
                                🖼️ Poster Only: <strong className="font-black">₹{posterP}</strong>
                              </span>
                              <span className="font-bold text-amber-800">
                                🔲 Frame Only: <strong className="font-black">₹{frameP}</strong>
                              </span>
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                ✨ Poster + Frame: <strong className="font-black">₹{bothP}</strong>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── TAB 3: FRAMING OPTIONS ── */}
                {expandedSection === 'framing' && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-800">Framing Configuration</h4>
                      <p className="text-[10px] text-gray-500">Configure whether framing is offered for this custom print type and set frame pricing & styles.</p>
                    </div>

                    {/* Enable / Disable Framing Toggle */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-gray-900 block">Offer Framing Option</span>
                        <span className="text-[11px] text-gray-500">
                          {form.allowFraming
                            ? 'Customers will see the framing checkbox and style selector on the storefront'
                            : 'Framing is disabled for this print type (unframed only)'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setField('allowFraming', !form.allowFraming)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
                          form.allowFraming ? 'bg-emerald-600 justify-end' : 'bg-gray-300 justify-start'
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition" />
                      </button>
                    </div>

                    {form.allowFraming && (
                      <div className="space-y-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                        {/* Frame Pricing & Badge */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              Frame Add-on Price (₹ / item)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">₹</span>
                              <input
                                type="number"
                                min={0}
                                value={form.framePrice || ''}
                                onChange={e => setField('framePrice', Number(e.target.value))}
                                className="w-full text-xs pl-7 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black font-black text-gray-900"
                                placeholder="250"
                              />
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 block">Added to base price when customer selects framing</span>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                              Frame Badge / Tag
                            </label>
                            <input
                              type="text"
                              value={form.frameBadge || ''}
                              onChange={e => setField('frameBadge', e.target.value)}
                              className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black"
                              placeholder="e.g. Acrylic Shield, 3 Frames Set"
                            />
                            <span className="text-[10px] text-gray-500 mt-1 block">Shown as a highlight badge next to framing checkbox</span>
                          </div>
                        </div>

                        {/* Supported Frame Styles */}
                        <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                          <label className="text-xs font-extrabold text-gray-800 block">
                            Supported Frame Styles & Finishes
                          </label>
                          <p className="text-[10px] text-gray-500">Select which frame styles customers can choose from:</p>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {DEFAULT_FRAME_STYLES.map(styleName => {
                              const isChecked = (form.frameStyles || []).includes(styleName);
                              return (
                                <button
                                  key={styleName}
                                  type="button"
                                  onClick={() => toggleFrameStyle(styleName)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                                    isChecked
                                      ? 'bg-black text-white border-black shadow-sm'
                                      : 'bg-white text-gray-600 border-gray-300 hover:border-black'
                                  }`}
                                >
                                  {isChecked && <Check size={12} className="text-primary" />}
                                  <span>{styleName}</span>
                                </button>
                              );
                            })}

                            {/* Additional custom styles */}
                            {(form.frameStyles || []).filter(s => !DEFAULT_FRAME_STYLES.includes(s)).map(customStyle => (
                              <span
                                key={customStyle}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-black text-white border border-black shadow-sm flex items-center gap-1.5"
                              >
                                <Check size={12} className="text-primary" />
                                <span>{customStyle}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFrameStyle(customStyle)}
                                  className="ml-1 text-gray-400 hover:text-white"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>

                          {/* Add Custom Style Input */}
                          <div className="flex gap-2 pt-2">
                            <input
                              type="text"
                              value={newFrameStyleInput}
                              onChange={e => setNewFrameStyleInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomFrameStyle(); } }}
                              placeholder="Add another frame style (e.g. Gold Vintage Frame)..."
                              className="flex-1 text-xs p-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-black"
                            />
                            <button
                              type="button"
                              onClick={addCustomFrameStyle}
                              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition"
                            >
                              Add Style
                            </button>
                          </div>
                        </div>

                        {/* Customer View Live Preview */}
                        <div className="pt-3 border-t border-emerald-200/60 space-y-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Storefront Customer Preview:
                          </span>
                          <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <input type="checkbox" checked={true} readOnly className="w-4 h-4 rounded accent-black" />
                                <span className="text-xs font-extrabold text-gray-900">
                                  Add Frame (+₹{form.framePrice || 250} / item)
                                </span>
                              </div>
                              {form.frameBadge && (
                                <span className="text-[10px] bg-primary/20 text-yellow-900 font-extrabold px-2.5 py-0.5 rounded-full">
                                  {form.frameBadge}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(form.frameStyles && form.frameStyles.length > 0 ? form.frameStyles : DEFAULT_FRAME_STYLES).map((s, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                    idx === 0 ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}
                                >
                                  {s} {idx === 0 && '✓'}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50 gap-3">
                <div className="flex gap-2">
                  {expandedSection !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        const order = ['basic', 'sizes', 'framing'];
                        const idx = order.indexOf(expandedSection);
                        setExpandedSection(order[Math.max(0, idx - 1)]);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                    >
                      ← Back
                    </button>
                  )}
                  {expandedSection !== 'framing' && (
                    <button
                      type="button"
                      onClick={() => {
                        const order = ['basic', 'sizes', 'framing'];
                        const idx = order.indexOf(expandedSection);
                        setExpandedSection(order[Math.min(order.length - 1, idx + 1)]);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition"
                    >
                      Next →
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
