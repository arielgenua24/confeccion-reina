import ImageKit from "imagekit-javascript";
import Compressor from 'compressorjs';

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
 * Get authentication parameters from backend
 * This keeps the private key secure on the server
 */
const getAuthParams = async () => {
  const authEndpoint = window.location.hostname === "localhost"
    ? "http://localhost:3001/api/auth"
    : "/api/auth";

  const response = await fetch(authEndpoint);
  if (!response.ok) {
    throw new Error('Failed to get authentication parameters');
  }
  return await response.json();
};

/**
 * Upload a single file to ImageKit
 */
const uploadFile = async (file, authData) => {
  return new Promise((resolve, reject) => {
    imagekit.upload({
      file: file,
      fileName: file.name,
      token: authData.token,
      signature: authData.signature,
      expire: authData.expire,
      folder: "/products", // Organize images in products folder
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Main function to upload images with compression
 * Accepts single image or array of images
 * Returns array of upload results with URLs
 */
async function uploadImages(images) {
  const imageArray = Array.isArray(images) ? images : [images];
  const validImages = imageArray.filter(img => img != null);

  if (validImages.length === 0) {
    throw new Error("No hay imágenes válidas para subir");
  }

  try {
    // Step 1: Compress all images
    console.log('Compressing images...');
    const compressed = await Promise.all(
      validImages.map(img => compressImage(img))
    );

    // Step 2: Get authentication parameters
    console.log('Getting authentication...');
    const authData = await getAuthParams();

    // Step 3: Upload all compressed images
    console.log('Uploading to ImageKit...');
    const results = await Promise.all(
      compressed.map(img => uploadFile(img, authData))
    );

    console.log('Upload successful:', results);
    return results;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
}

export default uploadImages;
