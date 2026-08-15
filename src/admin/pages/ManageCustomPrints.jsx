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
  Save
} from 'lucide-react';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { getHubProducts, saveHubProducts, resetHubProducts, defaultHubProducts } from '../../data/customPrints';

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
  defaultSizes: [
    { code: 'A4', label: 'A4', dimensions: '8.3 x 11.7 in', basePrice: 199 }
  ],
  bundles: [
    { key: '1', label: '1 Print', totalUnits: 1, payFor: 1 }
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
  const [expandedSection, setExpandedSection] = useState('basic'); // 'basic' | 'sizes' | 'bundles'
  const [previewCard, setPreviewCard] = useState(null);

  // Persist products whenever they change
  const persist = (updated) => {
    setProducts(updated);
    saveHubProducts(updated);
    // Broadcast change to other tabs (storefront)
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
    setForm(JSON.parse(JSON.stringify(products[idx])));
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
    const copy = { ...JSON.parse(JSON.stringify(products[idx])), id: `custom-${Date.now()}`, titleMain: products[idx].titleMain + ' (Copy)' };
    const updated = [...products.slice(0, idx + 1), copy, ...products.slice(idx + 1)];
    persist(updated);
    setSuccessMsg(`Duplicated "${products[idx].titleMain}".`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const updated = [...products];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    persist(updated);
  };

  const handleMoveDown = (idx) => {
    if (idx === products.length - 1) return;
    const updated = [...products];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    persist(updated);
  };

  const handleReset = () => {
    if (!window.confirm('Reset all custom print types to factory defaults? All changes will be lost.')) return;
    resetHubProducts();
    setProducts(defaultHubProducts);
    setSuccessMsg('Reset to factory defaults.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Form field helpers
  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setField('image', URL.createObjectURL(file));
    }
  };

  // Size row helpers
  const addSize = () => setForm(f => ({ ...f, defaultSizes: [...f.defaultSizes, { code: `S${Date.now()}`, label: 'New Size', dimensions: '', basePrice: 299 }] }));
  const updateSize = (i, key, val) => setForm(f => { const s = [...f.defaultSizes]; s[i] = { ...s[i], [key]: val }; return { ...f, defaultSizes: s }; });
  const removeSize = (i) => setForm(f => ({ ...f, defaultSizes: f.defaultSizes.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titleMain.trim()) { setErrorMsg('Title is required.'); return; }
    if (form.defaultSizes.length === 0) { setErrorMsg('Add at least one size option.'); return; }
    if (form.bundles.length === 0) { setErrorMsg('Add at least one bundle option.'); return; }

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

      const saved = { ...form, image: finalImage };
      let updated;
      if (editingIdx !== null) {
        updated = products.map((p, i) => i === editingIdx ? saved : p);
      } else {
        updated = [...products, saved];
      }

      persist(updated);
      setSuccessMsg(editingIdx !== null ? `"${saved.titleMain}" updated!` : `"${saved.titleMain}" added!`);
      setModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Failed to save. ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/20 text-black rounded-xl">
              <Layers size={22} />
            </span>
            <h2 className="text-2xl font-black text-gray-900">Design Your Own — Print Types</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage the cards shown on the "Design Your Own" customize poster section. Changes apply live instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            <RotateCcw size={15} /> Reset to Defaults
          </button>
          <button
            onClick={openAdd}
            className="btn-primary !py-2.5 !px-6 text-xs font-extrabold shadow-yellow-glow flex items-center gap-2"
          >
            <Plus size={16} /> Add New Print Type
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((item, idx) => (
          <div
            key={item.id}
            className="group relative bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Position Badge */}
            <div className="absolute top-3 left-3 z-20 w-7 h-7 bg-black/70 text-white text-[11px] font-black rounded-full flex items-center justify-center">
              {idx + 1}
            </div>

            {/* Reorder Buttons */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
              <button
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="w-7 h-7 bg-white/90 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-primary disabled:opacity-30 transition"
                title="Move Up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => handleMoveDown(idx)}
                disabled={idx === products.length - 1}
                className="w-7 h-7 bg-white/90 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-primary disabled:opacity-30 transition"
                title="Move Down"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Product Image */}
            <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.titleMain}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={32} />
                  <span className="text-xs mt-2">No Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
              <div className="absolute top-12 inset-x-0 text-center z-10 px-4 space-y-1">
                <p className="font-serif italic text-sm text-white drop-shadow-md">{item.titleScript}</p>
                <h3 className="text-xl font-black text-white tracking-tight drop-shadow-lg">{item.titleMain}</h3>
                <span className="inline-block text-[10px] bg-primary text-black font-extrabold px-2 py-0.5 rounded-full">{item.badge}</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 space-y-2">
              <h4 className="font-extrabold text-sm text-gray-900">{item.typeLabel}</h4>
              <p className="text-[11px] text-gray-500 leading-snug">{item.subtitle}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
                  {item.defaultSizes.length} size{item.defaultSizes.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
                  {item.bundles.length} bundle{item.bundles.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] bg-primary/20 text-black px-2 py-0.5 rounded-full font-semibold">
                  from ₹{Math.min(...item.defaultSizes.map(s => s.basePrice))}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-4 pb-4 gap-2">
              <button
                onClick={() => setPreviewCard(item)}
                className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-black transition"
              >
                <Eye size={13} /> Preview
              </button>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleDuplicate(idx)}
                  className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition"
                  title="Duplicate"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => openEdit(idx)}
                  className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(idx)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card Placeholder */}
        <button
          onClick={openAdd}
          className="flex flex-col items-center justify-center min-h-[320px] border-2 border-dashed border-gray-300 rounded-3xl hover:border-black hover:bg-gray-50 transition-all duration-300 text-gray-400 hover:text-black group"
        >
          <Plus size={32} className="mb-3 group-hover:scale-110 transition" />
          <span className="text-sm font-bold">Add New Print Type</span>
          <span className="text-xs mt-1 text-gray-400">Single, Split, Retro, etc.</span>
        </button>
      </div>

      {/* ─── ADD / EDIT MODAL ─── */}
      {modalOpen && form && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl shadow-2xl my-8 overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-primary rounded-xl">
                  <Package size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {editingIdx !== null ? 'Edit Print Type' : 'Add New Print Type'}
                  </h3>
                  <p className="text-xs text-gray-500">Changes appear live on the "Design Your Own" page</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200 transition text-gray-500"
              >
                <X size={20} />
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
                  {['basic', 'sizes'].map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setExpandedSection(tab)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold capitalize transition ${
                        expandedSection === tab ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {tab === 'basic' ? '1. Basic Info' : '2. Size Options & Pricing'}
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
                            placeholder="Or paste image URL..."
                            value={form.image || ''}
                            onChange={e => setField('image', e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Title Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Script Text (Italic)</label>
                        <input
                          type="text"
                          placeholder="Custom"
                          value={form.titleScript || ''}
                          onChange={e => setField('titleScript', e.target.value)}
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Main Title *</label>
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
                        placeholder="3-Piece Panoramic Triptych Display"
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
                      <h4 className="text-xs font-extrabold text-gray-800">Size Options ({form.defaultSizes.length})</h4>
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
                      {form.defaultSizes.map((size, i) => (
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
                          <div className="grid grid-cols-2 gap-2">
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
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Base Price (₹)</label>
                              <input
                                type="number"
                                value={size.basePrice}
                                onChange={e => updateSize(i, 'basePrice', Number(e.target.value))}
                                className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black font-bold"
                                min={1}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 3: BUNDLE OFFERS ── */}
                {expandedSection === 'bundles' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-gray-800">Bundle Offers ({form.bundles.length})</h4>
                      <button
                        type="button"
                        onClick={addBundle}
                        className="flex items-center gap-1.5 text-xs font-bold bg-black text-white px-3 py-2 rounded-xl hover:bg-neutral-800 transition"
                      >
                        <Plus size={13} /> Add Bundle
                      </button>
                    </div>

                    {form.bundles.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">No bundles yet. Click "Add Bundle" to start.</p>
                    )}

                    <div className="space-y-3">
                      {form.bundles.map((bundle, i) => (
                        <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                          {/* Bundle header */}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wide">Bundle #{i + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeBundle(i)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Bundle label */}
                          {/* Bundle label + display style + preview */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Bundle Label (shown on button)</label>
                            <input
                              type="text"
                              value={bundle.label}
                              onChange={e => updateBundle(i, 'label', e.target.value)}
                              className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black"
                              placeholder="4 Posters (BUY 3 GET 1 FREE)"
                            />

                            {/* Display Style Toggle */}
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Button Style:</span>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateBundle(i, 'displayStyle', 'pill')}
                                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold border transition ${
                                    (bundle.displayStyle ?? (i < 2 ? 'pill' : 'wide')) === 'pill'
                                      ? 'bg-black text-white border-black'
                                      : 'bg-white text-gray-500 border-gray-300 hover:border-black'
                                  }`}
                                >
                                  ◉ Pill (compact)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateBundle(i, 'displayStyle', 'wide')}
                                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold border transition ${
                                    (bundle.displayStyle ?? (i < 2 ? 'pill' : 'wide')) === 'wide'
                                      ? 'bg-black text-white border-black'
                                      : 'bg-white text-gray-500 border-gray-300 hover:border-black'
                                  }`}
                                >
                                  ▬ Wide (full row)
                                </button>
                              </div>
                            </div>

                            {/* Live Button Preview */}
                            <div className="pt-1">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Preview:</span>
                              {(bundle.displayStyle ?? (i < 2 ? 'pill' : 'wide')) === 'pill' ? (
                                <span className="inline-block py-1.5 px-4 rounded-full text-[11px] font-bold bg-black text-white">
                                  {bundle.label || 'Bundle Label'}
                                </span>
                              ) : (
                                <div className="w-full py-2 px-4 rounded-full text-[11px] font-bold bg-black text-white flex items-center justify-between">
                                  <span>{bundle.label || 'Bundle Label'}</span>
                                  <span className="text-primary text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Row 1: Key / Total Units / Pay For / 📷 Images */}
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Key (internal)</label>
                              <input
                                type="text"
                                value={bundle.key}
                                onChange={e => updateBundle(i, 'key', e.target.value)}
                                className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black"
                                placeholder="4"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Total Units</label>
                              <input
                                type="number"
                                value={bundle.totalUnits}
                                onChange={e => updateBundle(i, 'totalUnits', e.target.value)}
                                className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black font-bold"
                                min={1}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Pay For (units)</label>
                              <input
                                type="number"
                                step="0.5"
                                value={bundle.payFor}
                                onChange={e => updateBundle(i, 'payFor', e.target.value)}
                                className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black font-bold"
                                min={0.5}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-amber-700 block mb-1">📷 Images</label>
                              <input
                                type="number"
                                value={bundle.imageCount ?? 1}
                                onChange={e => updateBundle(i, 'imageCount', e.target.value)}
                                className="w-full text-xs p-2 bg-amber-50 border border-amber-300 rounded-lg outline-none focus:ring-1 focus:ring-amber-400 font-black text-amber-900"
                                min={1}
                                max={50}
                                title="Number of image upload buttons shown to the customer for this bundle"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 4: PRICE MATRIX ── */}
                {expandedSection === 'matrix' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-800">Size × Bundle Price Matrix</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Set a custom price for every size + bundle combination. Leave 0 = auto-calculated.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // Auto-fill all cells from basePrice × payFor
                          const matrix = {};
                          form.defaultSizes.forEach(sz => {
                            matrix[sz.code] = {};
                            form.bundles.forEach(b => {
                              if (b.fixedTotal > 0) {
                                matrix[sz.code][b.key] = b.fixedTotal;
                              } else {
                                matrix[sz.code][b.key] = Math.round((sz.basePrice || 129) * b.payFor);
                              }
                            });
                          });
                          setField('priceMatrix', { ...(form.priceMatrix || {}), ...matrix });
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-extrabold bg-black text-white px-3 py-2 rounded-xl hover:bg-neutral-800 transition whitespace-nowrap"
                      >
                        ⚡ Auto-fill all
                      </button>
                    </div>

                    {form.defaultSizes.length === 0 || form.bundles.length === 0 ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800 font-semibold">
                        ⚠️ Add sizes (Tab 2) and bundles (Tab 3) first, then come back to set prices.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr>
                              <th className="text-left p-2 bg-gray-100 rounded-tl-xl font-extrabold text-gray-700 text-[10px] uppercase tracking-wide min-w-[110px]">
                                Bundle \ Size
                              </th>
                              {form.defaultSizes.map(sz => (
                                <th key={sz.code} className="p-2 bg-gray-100 font-extrabold text-gray-700 text-[10px] uppercase tracking-wide text-center min-w-[90px] last:rounded-tr-xl">
                                  {sz.label}<br/>
                                  <span className="font-normal text-gray-400 normal-case">{sz.dimensions}</span>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {form.bundles.map((bundle, bi) => (
                              <tr key={bundle.key} className={bi % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-2 font-bold text-gray-700 text-[10px] border-r border-gray-200">
                                  {bundle.label}
                                </td>
                                {form.defaultSizes.map(sz => {
                                  const val = form.priceMatrix?.[sz.code]?.[bundle.key];
                                  const autoVal = bundle.fixedTotal > 0
                                    ? bundle.fixedTotal
                                    : Math.round((sz.basePrice || 129) * bundle.payFor);
                                  return (
                                    <td key={sz.code} className="p-1.5 text-center">
                                      <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-green-700">₹</span>
                                        <input
                                          type="number"
                                          value={val || ''}
                                          placeholder={autoVal}
                                          onChange={e => {
                                            const n = Number(e.target.value);
                                            setField('priceMatrix', {
                                              ...(form.priceMatrix || {}),
                                              [sz.code]: {
                                                ...((form.priceMatrix || {})[sz.code] || {}),
                                                [bundle.key]: n > 0 ? n : undefined
                                              }
                                            });
                                          }}
                                          className={`w-full text-[11px] pl-5 pr-1 py-1.5 rounded-lg border outline-none focus:ring-2 focus:ring-green-400 font-black text-center ${
                                            val > 0
                                              ? 'bg-green-50 border-green-300 text-green-900'
                                              : 'bg-gray-50 border-gray-200 text-gray-500'
                                          }`}
                                          min={0}
                                        />
                                        {!val && (
                                          <span className="absolute -bottom-3.5 left-0 right-0 text-center text-[8px] text-gray-400 font-semibold">
                                            auto ₹{autoVal}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-[10px] text-gray-400 mt-6">💡 Cells with a value override the auto-calculated price. Gray = auto-calculated. Green = custom fixed price.</p>
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
                        const order = ['basic', 'sizes', 'bundles', 'matrix'];
                        const idx = order.indexOf(expandedSection);
                        setExpandedSection(order[Math.max(0, idx - 1)]);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                    >
                      ← Back
                    </button>
                  )}
                  {expandedSection !== 'matrix' && (
                    <button
                      type="button"
                      onClick={() => {
                        const order = ['basic', 'sizes', 'bundles', 'matrix'];
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
