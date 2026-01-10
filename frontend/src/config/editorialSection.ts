// Editorial Section Configuration
// This file is temporary for testing phase
// TODO: Migrate to admin panel in production

import { getProductImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';

export interface EditorialContent {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

// Temporary configuration - will be replaced with admin panel API call
export const editorialConfig: EditorialContent = {
  title: 'Bridal Collection 2025',
  subtitle: 'The Art of Craftsmanship',
  description: `Each piece is meticulously handcrafted by our master artisans, 
    preserving centuries-old techniques while embracing contemporary 
    elegance. Our bridal collection celebrates the beauty of tradition 
    interwoven with modern sophistication.`,
  image: getProductImageUrl(CLOUDINARY_IMAGES.EDITORIAL_BRIDAL, 'detail'),
  ctaText: 'Explore Collection',
  ctaLink: '/collection/bridals',
};

// TODO: Replace with API call to admin panel
// export const fetchEditorialContent = async () => {
//   const response = await fetch(`${API_BASE_URL}/api/admin/editorial-section`);
//   return response.json();
// };
