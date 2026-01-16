import cloudinary from '../config/cloudinary.js';
import axios from 'axios';

/**
 * Upload image from URL to Cloudinary
 * @param {string} imageUrl - The URL of the image to upload
 * @param {string} folder - Cloudinary folder to organize images
 * @param {string} publicId - Custom public ID for the image
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadImageFromUrl = async (imageUrl, folder = 'hezal-couture', publicId = null) => {
  try {
    // Ensure configuration is set
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    // ✅ SECURITY: Don't log API credentials
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Upload config check: Cloudinary configured');
    }

    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      originalUrl: imageUrl,
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return {
      success: false,
      error: error.message,
      originalUrl: imageUrl,
    };
  }
};

/**
 * Upload multiple images from URLs to Cloudinary
 * @param {Array} imageUrls - Array of image URLs
 * @param {string} folder - Cloudinary folder
 * @param {string} prefix - Prefix for public IDs
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleImages = async (imageUrls, folder = 'hezal-couture', prefix = '') => {
  const uploadPromises = imageUrls.map((url, index) => {
    const publicId = prefix ? `${prefix}_${index + 1}` : null;
    return uploadImageFromUrl(url, folder, publicId);
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Generate Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation options
 * @returns {string} Transformed image URL
 */
const getTransformedUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations,
  });
};

export {
  uploadImageFromUrl,
  uploadMultipleImages,
  getTransformedUrl,
  cloudinary,
};