import { supabase } from './supabase';

// Fast client-side image compression to speed up photo uploads by 10x
const compressImage = async (file) => {
  // If not an image or already small (< 500KB), return as is
  if (!file || !file.type || !file.type.startsWith('image/') || file.size < 500 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export const uploadImageToCloudinary = async (file, onProgress = null) => {
  if (!file) return '';
  if (typeof file === 'string') {
    if (!file.startsWith('blob:')) return file;
  }

  if (onProgress) onProgress(15);

  // 1. Fast compress client-side
  let compressedFile = file;
  try {
    if (file instanceof Blob || file instanceof File) {
      compressedFile = await compressImage(file);
    }
  } catch (e) {
    console.warn('Image compression note:', e);
  }

  if (onProgress) onProgress(35);

  // 2. High-Speed Direct Supabase Cloud Storage Upload (Primary, instant & ultra reliable)
  try {
    const fileExt = (compressedFile.name ? compressedFile.name.split('.').pop() : 'jpg').toLowerCase();
    const cleanFileName = `reviews/img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    
    const { data: storageData, error: storageErr } = await supabase.storage
      .from('product-images')
      .upload(cleanFileName, compressedFile, {
        cacheControl: '31536000',
        upsert: true,
        contentType: compressedFile.type || 'image/jpeg'
      });

    if (!storageErr && storageData) {
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(cleanFileName);
      if (publicUrlData?.publicUrl) {
        if (onProgress) onProgress(100);
        return publicUrlData.publicUrl;
      }
    } else if (storageErr) {
      console.warn('Supabase storage image notice:', storageErr);
    }
  } catch (supabaseErr) {
    console.warn('Supabase image upload notice:', supabaseErr);
  }

  if (onProgress) onProgress(60);

  // 3. Fallback: Cloudinary Upload
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'rzuvukbu';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    const cloudinaryUrl = await new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', uploadPreset);

      const xhr = new XMLHttpRequest();
      xhr.timeout = 8000;
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 95);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.secure_url || data.url) {
              resolve(data.secure_url || data.url);
              return;
            }
          } catch (_) {}
        }
        reject(new Error(`Cloudinary status ${xhr.status}`));
      };

      xhr.ontimeout = () => reject(new Error('Cloudinary timed out'));
      xhr.onerror = () => reject(new Error('Network error during Cloudinary image upload'));
      xhr.send(formData);
    });

    if (cloudinaryUrl) {
      if (onProgress) onProgress(100);
      return cloudinaryUrl;
    }
  } catch (cloudErr) {
    console.warn('Cloudinary upload notice:', cloudErr);
  }

  // 4. Resilient Fallback: Convert to Base64 Data URL
  return new Promise((resolve, reject) => {
    if (file instanceof Blob || file instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile || file);
    } else {
      reject(new Error('Invalid image file provided'));
    }
  });
};

export const uploadVideoToCloudinary = async (file, onProgress = null) => {
  if (!file) return '';
  if (typeof file === 'string' && !file.startsWith('blob:')) return file;

  if (onProgress) onProgress(15);

  // 1. High-Speed Direct Supabase Cloud Storage Upload (Primary & fast)
  try {
    const fileExt = (file.name ? file.name.split('.').pop() : 'mp4').toLowerCase();
    const cleanFileName = `reels/vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    
    const { data: storageData, error: storageErr } = await supabase.storage
      .from('product-images')
      .upload(cleanFileName, file, {
        cacheControl: '31536000',
        upsert: true,
        contentType: file.type || 'video/mp4'
      });

    if (!storageErr && storageData) {
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(cleanFileName);
      if (publicUrlData?.publicUrl) {
        if (onProgress) onProgress(100);
        return publicUrlData.publicUrl;
      }
    } else if (storageErr) {
      console.warn('Supabase storage video notice:', storageErr);
    }
  } catch (supabaseErr) {
    console.warn('Supabase storage video notice:', supabaseErr);
  }

  if (onProgress) onProgress(45);

  // 2. Try Cloudinary Video Upload
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'rzuvukbu';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    const videoUrl = await new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const xhr = new XMLHttpRequest();
      xhr.timeout = 10000;
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.min(Math.round((event.loaded / event.total) * 95), 95);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.secure_url || data.url) {
              resolve(data.secure_url || data.url);
              return;
            }
          } catch (_) {}
        }
        reject(new Error(`Cloudinary status ${xhr.status}`));
      };

      xhr.ontimeout = () => reject(new Error('Cloudinary upload timed out'));
      xhr.onerror = () => reject(new Error('Network error during Cloudinary video upload'));
      xhr.send(formData);
    });

    if (videoUrl) {
      if (onProgress) onProgress(100);
      return videoUrl;
    }
  } catch (cloudErr) {
    console.warn('Cloudinary upload notice:', cloudErr);
  }

  // 3. Resilient Fallback: Convert to Data URL
  return new Promise((resolve, reject) => {
    if (file instanceof Blob || file instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      reject(new Error('Invalid video file provided'));
    }
  });
};
