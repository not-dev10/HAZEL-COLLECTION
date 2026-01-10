import pkg from 'cloudinary';

const { v2 } = pkg;

// Configure Cloudinary
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debug configuration
console.log('🔧 Cloudinary Config Debug:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('Cloudinary v2 type:', typeof v2);
console.log('Cloudinary v2.uploader type:', typeof v2.uploader);

// Export the v2 API
export default v2;
export { v2 as cloudinary };