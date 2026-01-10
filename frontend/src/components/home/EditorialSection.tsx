import { useState } from 'react';
import { getProductImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';

const EditorialSection = () => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error('Editorial image failed to load');
    setImageError(true);
  };

  const imageUrl = getProductImageUrl(CLOUDINARY_IMAGES.EDITORIAL_BRIDAL, 'detail');

  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="order-2 md:order-1 space-y-6 text-center md:text-left">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
              The Art of Craftsmanship
            </p>
            <h2 className="section-title">Bridal Collection 2025</h2>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto md:mx-0">
              Each piece is meticulously handcrafted by our master artisans, 
              preserving centuries-old techniques while embracing contemporary 
              elegance. Our bridal collection celebrates the beauty of tradition 
              interwoven with modern sophistication.
            </p>
            <a href="/collection/bridals" className="btn-primary inline-block mt-4">
              Explore Collection
            </a>
          </div>

          {/* Right Image */}
          <div className="order-1 md:order-2">
            <div className="aspect-[4/5] overflow-hidden bg-muted">
              {!imageError ? (
                <img
                  src={imageUrl}
                  alt="Bridal Collection featuring exquisite embroidered ensemble"
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