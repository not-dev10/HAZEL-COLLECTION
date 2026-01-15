import { useState, useEffect } from 'react';
import { getProductImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';
import { API_BASE_URL } from '@/lib/api';

const EditorialSection = () => {
  const [imageError, setImageError] = useState(false);
  const [bridalData, setBridalData] = useState({
    visible: true,
    heading: 'Bridal Collection 2025',
    subheading: 'The Art of Craftsmanship',
    description: 'Each piece is meticulously handcrafted by our master artisans, preserving centuries-old techniques while embracing contemporary elegance. Our bridal collection celebrates the beauty of tradition interwoven with modern sophistication.',
    buttonText: 'Explore Collection',
    buttonLink: '/collection/bridals',
    image: 'editorial-bridal',
    imageUrl: undefined as string | undefined
  });

  const fetchBridalData = async () => {
    try {
      console.log('🎨 Fetching bridal section data...');
      const response = await fetch(`${API_BASE_URL}/api/home-page`);
      const data = await response.json();
      
      console.log('🎨 Bridal section API response:', {
        success: data.success,
        hasImageUrl: !!data.data?.bridalSection?.imageUrl,
        imageUrl: data.data?.bridalSection?.imageUrl?.substring(0, 50),
        image: data.data?.bridalSection?.image,
        heading: data.data?.bridalSection?.heading
      });

      if (data.success && data.data?.bridalSection) {
        setBridalData(data.data.bridalSection);
      }
    } catch (error) {
      console.error('Failed to fetch bridal section data:', error);
    }
  };

  useEffect(() => {
    fetchBridalData();
    
    // Set up interval to refetch every 5 seconds to catch admin updates
    const interval = setInterval(fetchBridalData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleImageError = () => {
    console.error('Editorial image failed to load');
    setImageError(true);
  };

  if (!bridalData.visible) {
    return null;
  }

  // Build image URL - prefer admin-provided URL, fallback to default
  const defaultImageUrl = getProductImageUrl(CLOUDINARY_IMAGES.BRIDAL_SECTION_IMAGE, 'hero');
  const imageUrl = bridalData.imageUrl && bridalData.imageUrl.trim() ? bridalData.imageUrl : defaultImageUrl;
  
  console.log('🎨 Editorial Section Image Debug:', {
    bridalDataImageUrl: bridalData.imageUrl?.substring(0, 50) || 'empty',
    isAdminImageEmpty: !bridalData.imageUrl || bridalData.imageUrl.trim() === '',
    defaultImageUrl: defaultImageUrl?.substring(0, 50),
    finalImageUrl: imageUrl?.substring(0, 50),
    isValid: !!imageUrl && imageUrl.startsWith('https://')
  });

  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="order-2 md:order-1 space-y-6 text-center md:text-left">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
              {bridalData.subheading}
            </p>
            <h2 className="section-title">{bridalData.heading}</h2>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto md:mx-0">
              {bridalData.description}
            </p>
            <a href={bridalData.buttonLink} className="btn-primary inline-block mt-4">
              {bridalData.buttonText}
            </a>
          </div>

          {/* Right Image */}
          <div className="order-1 md:order-2">
            <div className="aspect-[4/5] overflow-hidden bg-muted">
              {!imageError ? (
                <img
                  src={imageUrl}
                  alt={bridalData.heading}
                  onError={handleImageError}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-600">Image not available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialSection;
