import { useState } from 'react';
import { getProductImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';

const CollectionBanner = () => {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const collections = [
    {
      id: 1,
      title: 'Ready To Wear',
      subtitle: 'Effortless Elegance',
      image: getProductImageUrl(CLOUDINARY_IMAGES.COLLECTION_RTW, 'hero'),
      href: '/collection/ready-to-wear',
    },
    {
      id: 2,
      title: 'Unstitched',
      subtitle: 'Create Your Own',
      image: getProductImageUrl(CLOUDINARY_IMAGES.COLLECTION_UNSTITCHED, 'hero'),
      href: '/collection/unstitched',
    },
  ];

  const handleImageError = (collectionId: number) => {
    console.error(`Collection image failed to load for collection ${collectionId}`);
    setFailedImages(prev => new Set(prev).add(collectionId));
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {collections.map((collection) => (
            <a
              key={collection.id}
              href={collection.href}
              className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-gray-300"
            >
              {!failedImages.has(collection.id) ? (
                <img
                  src={collection.image}
                  alt={collection.title}
                  onError={() => handleImageError(collection.id)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-400">
                  <span className="text-gray-600">Image not available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-primary-foreground">
                <p className="text-xs tracking-[0.2em] uppercase mb-2 opacity-80">
                  {collection.subtitle}
                </p>
                <h3 className="font-serif text-2xl md:text-3xl">{collection.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionBanner;