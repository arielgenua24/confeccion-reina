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
  // Smart endpoint detection:
  // 1. If VITE_IMAGEKIT_AUTH_ENDPOINT is set, use it
  // 2. If accessing via localhost, use localhost:3001
  // 3. If accessing via ngrok or other network, use same origin + /api/auth

  let authEndpoint;

  if (import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT) {
    // Use environment variable if explicitly set
    authEndpoint = import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT;
  } else if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    // On localhost, use the local API server
    authEndpoint = "http://localhost:3001/api/auth";
  } else {
    // On ngrok or other network access, use same origin
    authEndpoint = `${window.location.origin}/api/auth`;
  }

  console.log('Using auth endpoint:', authEndpoint);

  const response = await fetch(authEndpoint);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Auth endpoint error:', errorText);
    throw new Error(`Failed to get authentication parameters: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const errorText = await response.text();
    console.error('Non-JSON response received:', errorText);
    throw new Error('Auth endpoint returned non-JSON response. Check API server is running.');
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
