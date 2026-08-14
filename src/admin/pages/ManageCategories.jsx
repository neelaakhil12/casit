import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { Trash2, Edit } from 'lucide-react';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setImageFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setName(category.name || '');
    setImageFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      let imageUrl = editingCategory ? editingCategory.image_url : null;
      if (imageFile) {
        try {
           imageUrl = await uploadImageToCloudinary(imageFile);
        } catch (uploadErr) {
           setError('Image upload failed. Ensure Cloudinary env vars are set.');
           setUploading(false);
           return;
        }
      }

      if (editingCategory) {
        const { error: dbError } = await supabase
          .from('categories')
          .update({ name, image_url: imageUrl })
          .eq('id', editingCategory.id);

        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('categories')
          .insert([{ name, image_url: imageUrl }]);

        if (dbError) throw dbError;
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setName('');
      setImageFile(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError(editingCategory ? 'Failed to update category' : 'Failed to save category');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        alert('Failed to delete category');
      } else {
        fetchCategories();
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Manage Categories</h2>
        <button 
          onClick={handleOpenAddModal}
          className="bg-primary text-black px-4 py-2 rounded-lg font-bold shadow-yellow-glow hover:bg-primary-hover transition-colors"
        >
          + Add Category
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading categories...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-medium text-gray-600">Image</th>
                <th className="p-4 font-medium text-gray-600">Name</th>
                <th className="p-4 font-medium text-gray-600">Created At</th>
                <th className="p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">No categories found.</td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Img</div>
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{cat.name}</td>
                    <td className="p-4 text-gray-500">{new Date(cat.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button onClick={() => handleOpenEditModal(cat)} className="text-blue-600 hover:text-blue-800" title="Edit Category">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800" title="Delete Category">
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. T-Shirts"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                {editingCategory?.image_url && !imageFile && (
                  <div className="mb-2 flex items-center gap-3">
                    <img src={editingCategory.image_url} alt="Current" className="w-12 h-12 object-cover rounded-lg border" />
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
