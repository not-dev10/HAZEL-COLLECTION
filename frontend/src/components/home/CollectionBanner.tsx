import { useState, useEffect } from 'react';
import { getProductImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';
import { API_BASE_URL } from '@/lib/api';

interface Collection {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  imageUrl?: string;
  link: string;
  order: number;
}

const CollectionBanner = () => {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [collections, setCollections] = useState<Collection[]>([]);
  const [visible, setVisible] = useState(true);

  const fetchCollectionData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/home-page`);
      const data = await response.json();

      if (data.success && data.data?.collectionBanner) {
        setVisible(data.data.collectionBanner.visible !== false);
        const collectionList = (data.data.collectionBanner.collections || [])
          .sort((a: Collection, b: Collection) => a.order - b.order);
        setCollections(collectionList);
      }
    } catch (error) {
      console.error('Failed to fetch collection data:', error);
      setCollections([]);
    }
  };

  useEffect(() => {
    fetchCollectionData();
  }, []);

  const handleImageError = (collectionId: number) => {
    console.error(`Collection image failed to load for collection ${collectionId}`);
    setFailedImages(prev => new Set(prev).add(collectionId));
  };

  const getCollectionImageUrl = (collection: Collection) => {
    // If imageUrl is available and not empty, use it
    if (collection.imageUrl) {
      return collection.imageUrl;
    }
    // Otherwise use collection banner fallback images from constants
    const imageKeyMap: { [key: string]: string } = {
      1: getProductImageUrl(CLOUDINARY_IMAGES.COLLECTION_BANNER_1, 'hero'),
      2: getProductImageUrl(CLOUDINARY_IMAGES.COLLECTION_BANNER_2, 'hero'),
    };
    return imageKeyMap[collection.id] || getProductImageUrl(CLOUDINARY_IMAGES.COLLECTION_BANNER_1, 'hero');
  };

  if (!visible || collections.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {collections.map((collection) => (
            <a
              key={collection.id}
              href={collection.link}
              className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-gray-300"
            >
              {!failedImages.has(collection.id) ? (
                <img
                  src={getCollectionImageUrl(collection)}
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
