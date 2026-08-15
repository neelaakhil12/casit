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
  if (typeof file === 'string') return file;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  // 1. Try Cloudinary Video Upload
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
      } else {
        // Try auto resource type
        const autoForm = new FormData();
        autoForm.append('file', file);
        autoForm.append('upload_preset', uploadPreset);
        const autoRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: autoForm,
        });
        if (autoRes.ok) {
          const autoData = await autoRes.json();
          if (autoData.secure_url) {
            return autoData.secure_url;
          }
        }
      }
    } catch (error) {
      console.warn('Cloudinary video upload failed, falling back:', error);
    }
  }

  // 2. Try Supabase Storage Upload
  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'mp4';
    const fileName = `reels/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
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
    console.warn('Supabase storage fallback notice:', supabaseErr);
  }

  // 3. Fallback: Convert to persistent Data URL (Never expires like blob: URLs do)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

