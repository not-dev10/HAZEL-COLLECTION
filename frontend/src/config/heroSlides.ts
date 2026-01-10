// Hero Slides Configuration
// This file is temporary for testing phase
// TODO: Migrate to admin panel in production

import { getProductImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';

export interface HeroSlide {
  id: number;
  image: string;
  collection: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
}

// Temporary configuration - will be replaced with admin panel API call
export const heroSlidesConfig: HeroSlide[] = [
  {
    id: 1,
    image: getProductImageUrl(CLOUDINARY_IMAGES.HERO_BRIDAL, 'hero'),
    collection: 'Studio Portraits',
    subtitle: 'Hezal the Label Bridal 2025',
    cta: 'LIVE NOW',
    ctaLink: '/collection/bridals',
  },
  {
    id: 2,
    image: getProductImageUrl(CLOUDINARY_IMAGES.HERO_COLLECTION, 'hero'),
    collection: 'Winter Luxe',
    subtitle: 'Festive Collection 2025',
    cta: 'SHOP NOW',
    ctaLink: '/collection/festive',
  },
  {
    id: 3,
    image: getProductImageUrl(CLOUDINARY_IMAGES.HERO_UNSTITCHED, 'hero'),
    collection: 'Ethereal Dreams',
    subtitle: 'Unstitched Collection',
    cta: 'EXPLORE',
    ctaLink: '/collection/unstitched',
  },
];

// TODO: Replace with API call to admin panel
// export const fetchHeroSlides = async () => {
//   const response = await fetch(`${API_BASE_URL}/api/admin/hero-slides`);
//   return response.json();
// };
