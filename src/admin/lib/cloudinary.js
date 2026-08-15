import { supabase } from './supabase';

export const uploadImageToCloudinary = async (file) => {
  if (typeof file === 'string') return file;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  if (cloudName) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.secure_url) {
          return data.secure_url;
        }
      }
    } catch (error) {
      console.warn('Cloudinary image upload failed, falling back:', error);
    }
  }

  // Fallback: Convert image file to persistent base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const uploadVideoToCloudinary = async (file) => {
  if (typeof file === 'string' && !file.startsWith('blob:')) return file;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  // Helper with fast timeout
  const fetchWithTimeout = (url, options, timeoutMs = 6000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout')), timeoutMs))
    ]);
  };

  // 1. Fast Attempt: Supabase Storage
  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'mp4';
    const fileName = `reels/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const { data: storageData, error: storageErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (!storageErr && storageData) {
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (supabaseErr) {
    console.warn('Fast Supabase storage notice:', supabaseErr);
  }

  // 2. Fast Attempt: Cloudinary Video Upload
  if (cloudName) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('resource_type', 'video');

      const response = await fetchWithTimeout(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
        method: 'POST',
        body: formData,
      }, 5000);

      if (response.ok) {
        const data = await response.json();
        if (data.secure_url) {
          return data.secure_url;
        }
      }
    } catch (cloudErr) {
      console.warn('Cloudinary upload notice:', cloudErr);
    }
  }

  // 3. Instant Fallback: Convert to persistent Data URL (instant, 0 network wait)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

