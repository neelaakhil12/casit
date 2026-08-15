import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { Trash2, Edit, Plus, Image as ImageIcon, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('Error fetching categories from Supabase:', error);
      } else if (data) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Fetch categories exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setImageUrlInput('');
    setImageFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setName(category.name || '');
    setImageUrlInput(category.image_url || '');
    setImageFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a category name.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      let finalImageUrl = imageUrlInput.trim() || (editingCategory ? editingCategory.image_url : null);
      
      if (imageFile) {
        try {
          finalImageUrl = await uploadImageToCloudinary(imageFile);
        } catch (uploadErr) {
          console.warn('Cloudinary upload failed, falling back to local preview URL:', uploadErr);
          finalImageUrl = URL.createObjectURL(imageFile);
        }
      }

      if (editingCategory) {
        const { error: dbError } = await supabase
          .from('categories')
          .update({ 
            name: name.trim(), 
            image_url: finalImageUrl 
          })
          .eq('id', editingCategory.id);

        if (dbError) throw dbError;
        setSuccessMsg(`Category "${name}" updated successfully!`);
      } else {
        const baseSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') || 'cat';
        const isDuplicate = categories.some(c => c.id === baseSlug);
        const catId = isDuplicate ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

        const { error: dbError } = await supabase
          .from('categories')
          .upsert([{ 
            id: catId, 
            name: name.trim(), 
            image_url: finalImageUrl 
          }]);

        if (dbError) throw dbError;
        setSuccessMsg(`Category "${name}" added successfully!`);
      }

      setTimeout(() => setSuccessMsg(''), 3000);
      setIsModalOpen(false);
      setEditingCategory(null);
      setName('');
      setImageUrlInput('');
      setImageFile(null);
      await fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err?.message || (editingCategory ? 'Failed to update category' : 'Failed to save category'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!window.confirm(`Are you sure you want to delete "${catName || 'this category'}"?`)) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        alert(`Failed to delete category: ${error.message}`);
      } else {
        setSuccessMsg(`Category deleted successfully.`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Manage Categories</h2>
          <p className="text-xs text-gray-500 font-medium">Create and organize product categories on CASIT store</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center gap-2 !py-2.5 !px-5 text-xs font-black shadow-yellow-glow"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-2xl animate-fade-in shadow-sm">
          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl animate-fade-in shadow-sm">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="animate-spin inline-block mb-2" size={24} />
            <p className="text-xs font-bold">Loading categories...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Cover</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category Slug / ID</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400 font-semibold">
                      No categories found. Click "+ Add Category" to create one.
                    </td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="p-4 pl-6">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="w-12 h-12 object-cover rounded-2xl border border-gray-200 shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 text-[9px] font-bold">
                            <ImageIcon size={16} />
                            <span>No Img</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-black text-gray-900 text-sm">{cat.name}</td>
                      <td className="p-4 font-mono text-[11px] text-gray-500">{cat.id}</td>
                      <td className="p-4 text-gray-500 font-medium">
                        {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(cat)} 
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition" 
                            title="Edit Category"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id, cat.name)} 
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition" 
                            title="Delete Category"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 animate-fade-in-up">
            <h3 className="text-xl font-black mb-6 text-gray-900">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
                  placeholder="e.g. Minimalist Posters"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">
                  Cover Photo
                </label>
                
                {/* Live Preview */}
                {(imageUrlInput || imageFile || editingCategory?.image_url) && (
                  <div className="mb-3 flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-200">
                    <img 
                      src={imageFile ? URL.createObjectURL(imageFile) : (imageUrlInput || editingCategory?.image_url)} 
                      alt="Preview" 
                      className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0" 
                    />
                    <div className="text-[11px] text-gray-500">
                      <span className="font-bold text-gray-800 block">Preview</span>
                      <span>{imageFile ? imageFile.name : 'Image URL linked'}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 hover:border-black px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 transition w-full justify-center shadow-sm">
                    <Upload size={14} />
                    <span>Upload Image File</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  <input 
                    type="text"
                    placeholder="Or paste direct image URL (e.g. /categories/...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="btn-primary !py-2.5 !px-6 text-xs font-black shadow-yellow-glow disabled:opacity-50"
                >
                  {uploading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Save Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
