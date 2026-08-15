import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { uploadImageToCloudinary, uploadVideoToCloudinary } from '../lib/cloudinary';
import { defaultVerifiedReviews, defaultVideoReviews } from '../../components/VerifiedReviews';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Star, 
  ShieldCheck, 
  Upload, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  X, 
  Play,
  Film,
  Sparkles,
  Eye,
  Heart,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function ManageReviews({ initialTab = 'videos' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'videos' | 'photos'
  
  // Data States
  const [photoReviews, setPhotoReviews] = useState([]);
  const [videoReviews, setVideoReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [locationOrHandle, setLocationOrHandle] = useState('');
  const [caption, setCaption] = useState('');
  const [rating, setRating] = useState(5);
  const [taggedProduct, setTaggedProduct] = useState('');
  const [views, setViews] = useState('45.2K');
  const [likes, setLikes] = useState('3.8K');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Video Preview Modal in Admin
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('verified_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        // If DB table exists and is completely empty, auto-seed default items once so they have real database IDs
        if (data.length === 0 && !localStorage.getItem('casit_reviews_seeded')) {
          localStorage.setItem('casit_reviews_seeded', 'true');
          const seedPayload = [
            ...defaultVerifiedReviews.map(r => ({
              customer_name: r.customer_name,
              location: r.location,
              caption: r.caption,
              rating: r.rating,
              image_url: r.image_url,
              thumbnail: r.image_url
            })),
            ...defaultVideoReviews.map(v => ({
              customer_name: v.customer_name,
              handle: v.handle,
              caption: v.caption,
              rating: 5,
              image_url: v.thumbnail,
              thumbnail: v.thumbnail,
              video_url: v.video_url,
              views: v.views,
              likes: v.likes,
              tagged_product: v.tagged_product
            }))
          ];
          try {
            await supabase.from('verified_reviews').insert(seedPayload);
            const { data: seededData } = await supabase.from('verified_reviews').select('*').order('created_at', { ascending: false });
            if (seededData && seededData.length > 0) {
              setPhotoReviews(seededData.filter(d => !d.video_url));
              setVideoReviews(seededData.filter(d => !!d.video_url));
              return;
            }
          } catch (_) {}
        }

        const photos = data.filter(d => !d.video_url);
        const videos = data.filter(d => !!d.video_url);
        setPhotoReviews(photos);
        setVideoReviews(videos);
      } else {
        setPhotoReviews(defaultVerifiedReviews);
        setVideoReviews(defaultVideoReviews);
      }
    } catch (err) {
      console.error('Reviews fetch notice:', err);
      setPhotoReviews(defaultVerifiedReviews);
      setVideoReviews(defaultVideoReviews);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setCustomerName('');
    setLocationOrHandle(activeTab === 'videos' ? '@customer_vibes' : 'Mumbai, MH');
    setCaption('');
    setRating(5);
    setTaggedProduct('');
    setViews(`${(Math.floor(Math.random() * 80) + 20).toFixed(1)}K`);
    setLikes(`${(Math.floor(Math.random() * 9) + 2).toFixed(1)}K`);
    setVideoUrl('');
    setVideoPreviewUrl('');
    setThumbnailUrl('');
    setImageFile(null);
    setVideoFile(null);
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setCustomerName(item.customer_name || '');
    setLocationOrHandle(item.handle || item.location || '');
    setCaption(item.caption || '');
    setRating(item.rating || 5);
    setTaggedProduct(item.tagged_product || '');
    setViews(item.views || '45.0K');
    setLikes(item.likes || '3.5K');
    setVideoUrl(item.video_url || '');
    setVideoPreviewUrl(item.video_url || '');
    setThumbnailUrl(item.thumbnail || item.image_url || '');
    setImageFile(null);
    setVideoFile(null);
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setThumbnailUrl(URL.createObjectURL(file));
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      let finalThumbnailUrl = thumbnailUrl;
      let finalVideoUrl = videoUrl;

      // Upload Cover Thumbnail if file selected
      if (imageFile) {
        try {
          finalThumbnailUrl = await uploadImageToCloudinary(imageFile);
        } catch (uploadErr) {
          console.warn('Image upload fallback:', uploadErr);
        }
      }

      // Upload Video if file selected
      if (videoFile) {
        try {
          finalVideoUrl = await uploadVideoToCloudinary(videoFile);
        } catch (uploadErr) {
          console.warn('Video upload fallback:', uploadErr);
        }
      }

      const isVideo = activeTab === 'videos';

      if (isVideo && !finalVideoUrl) {
        setError('Please upload a video file or enter a valid video stream URL.');
        setUploading(false);
        return;
      }

      if (!isVideo && !finalThumbnailUrl) {
        setError('Please provide a customer wall photo.');
        setUploading(false);
        return;
      }

      const payload = {
        customer_name: customerName || (isVideo ? 'Creator Customer' : 'Verified Buyer'),
        caption: caption || (isVideo ? 'Unboxing my awesome posters from CASIT!' : 'High quality print and premium finish.'),
        rating: Number(rating) || 5,
        image_url: isVideo ? (finalVideoUrl || '') : (finalThumbnailUrl || ''),
        thumbnail: isVideo ? (finalVideoUrl || '') : (finalThumbnailUrl || ''),
        video_url: isVideo ? finalVideoUrl : null,
        handle: isVideo ? locationOrHandle : null,
        location: !isVideo ? locationOrHandle : null,
        tagged_product: isVideo ? taggedProduct : null,
        views: isVideo ? (views || '50K') : null,
        likes: isVideo ? (likes || '4.2K') : null
      };

      // Save directly to Supabase Cloud DB
      if (editingItem && typeof editingItem.id === 'number') {
        const { error: updateErr } = await supabase
          .from('verified_reviews')
          .update(payload)
          .eq('id', editingItem.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('verified_reviews')
          .insert([payload]);
        if (insertErr) throw insertErr;
      }

      setSuccessMsg(isVideo ? 'Customer Video Reel published successfully!' : 'Photo review published successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
      }, 1000);
      
      await fetchReviews();
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to save review item. Please check inputs and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, isVideo) => {
    if (window.confirm(`Are you sure you want to delete this ${isVideo ? 'customer video reel' : 'photo review'}?`)) {
      try {
        if (typeof id === 'number') {
          const { error } = await supabase.from('verified_reviews').delete().eq('id', id);
          if (error) console.warn('Supabase delete error:', error);
        }
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }

      if (isVideo) {
        setVideoReviews(prev => prev.filter(v => v.id !== id));
      } else {
        setPhotoReviews(prev => prev.filter(p => p.id !== id));
      }

      setSuccessMsg(`${isVideo ? 'Video reel' : 'Photo review'} deleted.`);
      setTimeout(() => setSuccessMsg(''), 2500);
      await fetchReviews();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/20 text-black rounded-xl">
              <Film size={22} className="text-black" />
            </span>
            <h2 className="text-2xl font-black text-gray-900">
              Customer Reels & Verified Reviews
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage, upload, and publish customer unboxing videos, reels, and wall setup photos displayed on the storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="btn-primary !py-3 !px-6 text-xs sm:text-sm font-extrabold shadow-yellow-glow flex items-center gap-2"
          >
            <Plus size={18} />
            <span>{activeTab === 'videos' ? '+ Add Customer Video Reel' : '+ Add Photo Review'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 gap-2 w-fit">
        <button
          onClick={() => setActiveTab('videos')}
          className={`py-2.5 px-6 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
        >
          <Film size={16} />
          <span>Customer Video Reels ({videoReviews.length})</span>
          <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">REELS</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`py-2.5 px-6 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'photos'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
        >
          <ImageIcon size={16} />
          <span>Photo Wall Reviews ({photoReviews.length})</span>
        </button>
      </div>

      {/* VIDEO REVIEWS GRID */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Showing active video reels currently looping on the homepage marquee</span>
            <span className="font-semibold text-gray-700">Click card or play button to preview video</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {videoReviews.map((vid) => (
              <div 
                key={vid.id}
                className="group relative bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* 9:16 Reel Thumbnail */}
                <div 
                  className="relative aspect-[9/16] bg-neutral-900 overflow-hidden cursor-pointer"
                  onClick={() => setPreviewVideo(vid)}
                >
                  <img
                    src={vid.thumbnail || vid.image_url}
                    alt={vid.customer_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-90"
                  />
                  
                  {/* Reel Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 flex flex-col justify-between p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                        <Play size={10} fill="currentColor" /> {vid.views || '45K'}
                      </span>
                      <span className="text-[10px] bg-primary text-black font-black px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>

                    {/* Play Button Icon */}
                    <div className="self-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition duration-300 shadow-xl">
                      <Play size={20} fill="currentColor" className="ml-1" />
                    </div>

                    {/* Bottom Details */}
                    <div className="text-white space-y-1">
                      <h5 className="text-xs font-black truncate flex items-center gap-1">
                        <span>{vid.customer_name}</span>
                        <ShieldCheck size={14} className="text-primary" />
                      </h5>
                      <p className="text-[10px] text-gray-300 truncate">{vid.handle || '@casit'}</p>
                      {vid.tagged_product && (
                        <span className="inline-block text-[9px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-white font-medium truncate max-w-full">
                          🛍️ {vid.tagged_product}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info & Admin Controls */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
                  <p className="text-xs text-gray-700 line-clamp-2 leading-snug font-medium">
                    "{vid.caption}"
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setPreviewVideo(vid)}
                      className="text-xs text-black font-bold hover:underline flex items-center gap-1"
                    >
                      <Play size={12} fill="currentColor" /> Preview
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(vid)}
                        className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition"
                        title="Edit Reel"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(vid.id, true)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                        title="Delete Reel"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHOTO REVIEWS GRID */}
      {activeTab === 'photos' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
          {photoReviews.map((review) => (
            <div 
              key={review.id}
              className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                <img
                  src={review.image_url}
                  alt={review.customer_name || 'Review'}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <Star size={10} className="text-primary fill-current" />
                  <span>{review.rating || 5}.0</span>
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900 truncate">
                    {review.customer_name || 'Verified Buyer'}
                  </h4>
                  {review.caption && (
                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight mt-1">
                      "{review.caption}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEditModal(review)}
                    className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
                    title="Edit Review"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id, false)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Delete Review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 animate-fade-in-up my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black transition p-1 rounded-full hover:bg-gray-100"
            >
              <X size={22} />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="p-2.5 bg-primary rounded-xl text-black">
                {activeTab === 'videos' ? <Film size={22} /> : <ImageIcon size={22} />}
              </span>
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {editingItem 
                    ? (activeTab === 'videos' ? 'Edit Customer Video Reel' : 'Edit Verified Photo Review') 
                    : (activeTab === 'videos' ? 'Add New Customer Video Reel' : 'Add Verified Photo Review')}
                </h3>
                <p className="text-xs text-gray-500">
                  {activeTab === 'videos'
                    ? 'Upload video file (.mp4) or enter video link. Adds to the customer reels section.'
                    : 'Upload wall setup picture and customer feedback.'}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* VIDEO SOURCE (If Video Tab) */}
              {activeTab === 'videos' && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                    <VideoIcon size={16} className="text-primary" />
                    <span>Customer Video File / URL *</span>
                  </label>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 block mb-1">Option 1: Upload Video File (.mp4, .webm, .mov)</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoFileChange}
                        className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-neutral-800 cursor-pointer"
                      />
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink mx-3 text-gray-400 text-[10px] font-bold uppercase">OR</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-gray-500 block mb-1">Option 2: Direct Video Link (MP4 / Web Video URL)</span>
                      <input
                        type="text"
                        placeholder="e.g. https://assets.mixkit.co/videos/preview/mixkit-....mp4"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  {(videoPreviewUrl || videoUrl) && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-gray-500 block mb-1">Video Stream Preview:</span>
                      <video 
                        src={videoPreviewUrl || videoUrl} 
                        controls 
                        className="w-full max-h-48 rounded-xl bg-black object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* COVER PHOTO (ONLY FOR PHOTO REVIEWS) */}
              {activeTab === 'photos' && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                    <ImageIcon size={16} className="text-primary" />
                    <span>Wall Setup Photo *</span>
                  </label>

                  <div className="flex items-center gap-4">
                    {thumbnailUrl ? (
                      <div className="w-20 h-28 rounded-2xl overflow-hidden border-2 border-primary shrink-0 bg-gray-100 shadow-sm">
                        <img src={thumbnailUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-28 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 shrink-0 bg-white">
                        <ImageIcon size={22} />
                        <span className="text-[9px] mt-1">Photo</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-neutral-800 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Or enter photo image URL directly..."
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CUSTOMER INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-gray-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Megha V."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-gray-700 block mb-1">
                    {activeTab === 'videos' ? 'Social Handle / Username' : 'Location / City'}
                  </label>
                  <input
                    type="text"
                    placeholder={activeTab === 'videos' ? 'e.g. @megha.vibes' : 'e.g. Mumbai, MH'}
                    value={locationOrHandle}
                    onChange={(e) => setLocationOrHandle(e.target.value)}
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* VIDEO REEL STATS & TAGGED PRODUCT */}
              {activeTab === 'videos' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Views Display</label>
                    <input
                      type="text"
                      placeholder="e.g. 52.4K"
                      value={views}
                      onChange={(e) => setViews(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Likes Display</label>
                    <input
                      type="text"
                      placeholder="e.g. 4.8K"
                      value={likes}
                      onChange={(e) => setLikes(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Tagged Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ultimate Anime 18-Poster Pack"
                      value={taggedProduct}
                      onChange={(e) => setTaggedProduct(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* CAPTION / REVIEW TEXT */}
              <div>
                <label className="text-xs font-extrabold text-gray-700 block mb-1">
                  {activeTab === 'videos' ? 'Reel Caption / Feedback Quote' : 'Customer Review Text'}
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Unboxing my 18-poster pack from CASIT! The 300 GSM paper is so thick ✨"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black leading-relaxed font-medium"
                />
              </div>

              {/* SUBMIT BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary !py-3 !px-8 text-xs font-black shadow-yellow-glow flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving & Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>{editingItem ? 'Save Changes' : 'Publish Reel'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PREVIEW VIDEO MODAL IN ADMIN */}
      {previewVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div 
            className="relative max-w-sm w-full bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-[9/16] bg-black overflow-hidden flex items-center justify-center">
              <video
                src={previewVideo.video_url}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 bg-neutral-900 text-white space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm flex items-center gap-1">
                    <span>{previewVideo.customer_name}</span>
                    <ShieldCheck size={14} className="text-primary" />
                  </h4>
                  <span className="text-[10px] text-gray-400">{previewVideo.handle || '@casit.customer'}</span>
                </div>
                <span className="text-[10px] bg-primary text-black font-extrabold px-2.5 py-1 rounded-full">
                  {previewVideo.views || '45K'} views
                </span>
              </div>
              <p className="text-xs text-gray-300 font-medium">"{previewVideo.caption}"</p>
              {previewVideo.tagged_product && (
                <div className="p-2 rounded-xl bg-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                  <ShoppingBag size={13} className="text-primary" />
                  <span>{previewVideo.tagged_product}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
