import { supabase } from './supabase';

export const uploadImageToCloudinary = async (file) => {
  if (typeof file === 'string') return file;

  // 1. Direct High-Speed Supabase Storage Upload (< 1 sec)
  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const fileName = `photos/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const { data: storageData, error: storageErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '31536000',
        upsert: true,
        contentType: file.type || 'image/jpeg'
      });

    if (!storageErr && storageData) {
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Supabase image storage notice:', err);
  }

  // 2. Cloudinary Upload Fallback
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
      console.warn('Cloudinary image upload failed:', error);
    }
  }

  // 3. Fallback: Base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const uploadVideoToCloudinary = async (file) => {
  if (typeof file === 'string' && !file.startsWith('blob:')) return file;

  // 1. Direct High-Speed Supabase Storage Upload (< 1.5 sec)
  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'mp4';
    const fileName = `reels/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const { data: storageData, error: storageErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '31536000',
        upsert: true,
        contentType: file.type || 'video/mp4'
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
    console.warn('Direct Supabase storage notice:', supabaseErr);
  }

  // 2. Cloudinary Video Upload Fallback
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  if (cloudName) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('resource_type', 'video');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.secure_url) {
          return data.secure_url;
        }
      }
    } catch (cloudErr) {
      console.warn('Cloudinary video upload notice:', cloudErr);
    }
  }

  // 3. Fallback: Base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

