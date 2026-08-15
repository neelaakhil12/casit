export const uploadImageToCloudinary = async (file) => {
  if (typeof file === 'string') return file;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'rzuvukbu';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    console.error('Cloudinary Image Upload Error:', errData);
    throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
};

export const uploadVideoToCloudinary = async (file) => {
  if (typeof file === 'string' && !file.startsWith('blob:')) return file;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'rzuvukbu';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  // 1. Direct Cloudinary Video Upload
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    // 2. Try auto endpoint
    const autoRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!autoRes.ok) {
      const errData = await autoRes.json().catch(() => ({}));
      console.error('Cloudinary Video Upload Error:', errData);
      throw new Error(errData.error?.message || 'Failed to upload video to Cloudinary.');
    }
    const autoData = await autoRes.json();
    return autoData.secure_url;
  }

  const data = await response.json();
  return data.secure_url;
};


