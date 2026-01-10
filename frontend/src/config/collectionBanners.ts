// Collection Banners Configuration
// This file is temporary for testing phase
// TODO: Migrate to admin panel in production

import { getProductImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';

export interface CollectionBanner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  href: string;
}

// Temporary configuration - will be replaced with admin panel API call
export const collectionBannersConfig: CollectionBanner[] = [
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

// TODO: Replace with API call to admin panel
// export const fetchCollectionBanners = async () => {
//   const response = await fetch(`${API_BASE_URL}/api/admin/collection-banners`);
//   return response.json();
// };
