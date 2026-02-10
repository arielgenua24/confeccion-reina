import ImageKit from "imagekit-javascript";
import Compressor from 'compressorjs';
import authCache from './imagekitAuthCache';

// Initialize ImageKit with public key (safe to expose in frontend)
const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
});

/**
 * Compress image before upload
 * Reduces size by ~90% while maintaining quality
 */
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6, // 60% quality - good balance
      maxWidth: 1024,
      maxHeight: 1024,
      mimeType: "image/jpeg",
      success: resolve,
      error: reject,
    });
  });
};

/**
 * Upload a single file to ImageKit
 * Includes automatic retry logic for expired tokens
 */
const uploadFile = async (file, authData, isRetry = false) => {
  return new Promise((resolve, reject) => {
    imagekit.upload({
      file: file,
      fileName: file.name,
      token: authData.token,
      signature: authData.signature,
      expire: authData.expire,
      folder: "/products", // Organize images in products folder
    }, async (err, result) => {
      if (err) {
        // Check if error is related to expired/invalid token
        const isAuthError =
          err.message?.toLowerCase().includes('token') ||
          err.message?.toLowerCase().includes('signature') ||
          err.message?.toLowerCase().includes('expire') ||
          err.message?.toLowerCase().includes('auth');

        // If it's an auth error and we haven't retried yet, try again with fresh token
        if (isAuthError && !isRetry) {
          console.warn('[ImageKit Upload] Auth error detected, retrying with fresh token...');
          try {
            const freshAuth = await authCache.forceRefresh();
            const retryResult = await uploadFile(file, freshAuth, true);
            resolve(retryResult);
          } catch (retryError) {
            console.error('[ImageKit Upload] Retry failed:', retryError);
            reject(retryError);
          }
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Main function to upload images with compression
 * Accepts single image or array of images
 * Returns array of upload results with URLs
 *
 * Features:
 * - Automatic token caching to reduce API calls
 * - Transparent retry on token expiration
 * - User never needs to re-upload due to expired tokens
 */
async function uploadImages(images) {
  const imageArray = Array.isArray(images) ? images : [images];
  const validImages = imageArray.filter(img => img != null);

  if (validImages.length === 0) {
    throw new Error("No hay imágenes válidas para subir");
  }

  try {
    // Step 1: Compress all images
    console.log('[Upload] Compressing images...');
    const compressed = await Promise.all(
      validImages.map(img => compressImage(img))
    );

    // Step 2: Get authentication parameters (from cache or fetch new)
    console.log('[Upload] Getting authentication...');
    const authData = await authCache.getAuthParams();

    // Step 3: Upload all compressed images
    // Note: uploadFile has built-in retry logic for expired tokens
    console.log('[Upload] Uploading to ImageKit...');
    const results = await Promise.all(
      compressed.map(img => uploadFile(img, authData))
    );

    console.log('[Upload] Success! Uploaded', results.length, 'image(s)');
    return results;
  } catch (error) {
    console.error('[Upload] Error:', error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
}

export default uploadImages;
