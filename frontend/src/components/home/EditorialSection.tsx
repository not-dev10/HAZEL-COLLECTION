import { useState, useEffect } from 'react';
import { getProductImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';
import { API_BASE_URL } from '@/lib/api';

const EditorialSection = () => {
  const [failedImageSources, setFailedImageSources] = useState<Set<number>>(new Set());
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
      const response = await fetch(`${API_BASE_URL}/api/home-page`);
      const data = await response.json();

      if (data.success && data.data?.bridalSection) {
        setBridalData(data.data.bridalSection);
      }
    } catch (error) {
      console.error('Failed to fetch bridal section data:', error);
    }
  };

  useEffect(() => {
    fetchBridalData();
  }, []);

  const handleImageError = (sourceIndex: number) => {
    console.error(`Bridal image source ${sourceIndex} failed to load`);
    setFailedImageSources(prev => new Set(prev).add(sourceIndex));
  };

  if (!bridalData.visible) {
    return null;
  }

  // Smart image URL logic with multiple fallbacks (like HeroCarousel)
  // Source 0: Admin-provided imageUrl
  // Source 1: Cloudinary BRIDAL_SECTION_IMAGE with hero variant
  // Source 2: Cloudinary BRIDAL_SECTION_IMAGE without variant as last resort
  
  const primaryImageUrl = bridalData.imageUrl && bridalData.imageUrl.trim() ? bridalData.imageUrl : null;
  const fallbackImageUrl = getProductImageUrl(CLOUDINARY_IMAGES.BRIDAL_SECTION_IMAGE, 'hero');
  const lastResortImageUrl = getProductImageUrl(CLOUDINARY_IMAGES.BRIDAL_SECTION_IMAGE);
  
  // Determine which image to display based on what hasn't failed
  const getDisplayImageUrl = (): string | null => {
    if (primaryImageUrl && !failedImageSources.has(0)) {
      return primaryImageUrl;
    }
    if (!failedImageSources.has(1)) {
      return fallbackImageUrl;
    }
    if (!failedImageSources.has(2)) {
      return lastResortImageUrl;
    }
    return null; // All sources exhausted
  };

  const imageUrl = getDisplayImageUrl();

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
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={bridalData.heading}
                  onError={() => {
                    // Try next fallback source
                    const nextSource = !failedImageSources.has(0) ? 1 : (!failedImageSources.has(1) ? 2 : 3);
                    if (nextSource <= 2) {
                      handleImageError(nextSource);
                    } else {
                      handleImageError(nextSource); // Mark all as failed
                    }
                  }}
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
