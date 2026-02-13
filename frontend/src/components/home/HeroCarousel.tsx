import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';
import { API_BASE_URL } from '@/lib/api';

interface Slide {
  id: number;
  image: string;
  imageUrl?: string;
  collection: string;
  subtitle: string;
  cta: string;
  order: number;
}

// Default slides - reusable fallback
const getDefaultSlides = (): Slide[] => [
  {
    id: 1,
    image: getProductImageUrl(CLOUDINARY_IMAGES.HERO_BRIDAL, 'hero'),
    imageUrl: getProductImageUrl(CLOUDINARY_IMAGES.HERO_BRIDAL, 'hero'),
    collection: 'Studio Portraits',
    subtitle: 'Hezal the Label Bridal 2025',
    cta: 'LIVE NOW',
    order: 1
  },
  {
    id: 2,
    image: getProductImageUrl(CLOUDINARY_IMAGES.HERO_FESTIVE, 'hero'),
    imageUrl: getProductImageUrl(CLOUDINARY_IMAGES.HERO_FESTIVE, 'hero'),
    collection: 'Winter Luxe',
    subtitle: 'Festive Collection 2025',
    cta: 'SHOP NOW',
    order: 2
  },
  {
    id: 3,
    image: getProductImageUrl(CLOUDINARY_IMAGES.HERO_UNSTITCHED, 'hero'),
    imageUrl: getProductImageUrl(CLOUDINARY_IMAGES.HERO_UNSTITCHED, 'hero'),
    collection: 'Ethereal Dreams',
    subtitle: 'Ready To Wear Collection',
    cta: 'EXPLORE',
    order: 3
  }
];

const HeroCarousel = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch carousel slides from API
  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/home-page`);
        const data = await response.json();

        if (data.success && data.data?.carousel?.slides) {
          const carouselSlides = data.data.carousel.slides
            .sort((a: Slide, b: Slide) => a.order - b.order);
          setSlides(carouselSlides);
        } else {
          setSlides(getDefaultSlides());
        }
      } catch (error) {
        console.error('Failed to fetch carousel data:', error);
        setSlides(getDefaultSlides());
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (slides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleImageError = (slideId: number) => {
    console.error(`Hero image failed to load for slide ${slideId}`);
    setFailedImages(prev => new Set(prev).add(slideId));
  };

  const getSlideImageUrl = (slide: Slide) => {
    // If imageUrl is available and not empty, use it
    if (slide.imageUrl) {
      return slide.imageUrl;
    }
    // Otherwise use slider fallback images from constants
    const imageKeyMap: { [key: string]: string } = {
      1: getProductImageUrl(CLOUDINARY_IMAGES.SLIDER_IMAGE_1, 'hero'),
      2: getProductImageUrl(CLOUDINARY_IMAGES.SLIDER_IMAGE_2, 'hero'),
      3: getProductImageUrl(CLOUDINARY_IMAGES.SLIDER_IMAGE_3, 'hero'),
    };
    return imageKeyMap[slide.id] || getProductImageUrl(CLOUDINARY_IMAGES.SLIDER_IMAGE_1, 'hero');
  };

  if (loading || slides.length === 0) {
    return (
      <section className="relative h-[60vh] md:h-[80vh] lg:h-screen overflow-hidden bg-gray-300 flex items-center justify-center">
        <div className="text-gray-600">Loading carousel...</div>
      </section>
    );
  }

  return (
    <section className="relative h-[60vh] md:h-[80vh] lg:h-screen overflow-hidden bg-gray-300">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {!failedImages.has(slide.id) ? (
            <img
              src={getSlideImageUrl(slide)}
              alt={slide.collection}
              onError={() => handleImageError(slide.id)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-400">
              <span className="text-gray-600">Image not available</span>
            </div>
          )}
          <div className="hero-overlay" />  
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div
              className={`text-primary-foreground space-y-4 md:space-y-6 px-4 ${
                index === currentSlide ? 'animate-slide-up' : ''
              }`}
            >
              <p className="text-xs md:text-sm tracking-[0.3em] uppercase opacity-80">
                {slide.subtitle}
              </p>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-wide">
                {slide.collection}
              </h1>
              <a
                href="/collection/new-arrivals"
                className="inline-block mt-4 md:mt-8 border border-primary-foreground text-primary-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-primary-foreground hover:text-primary transition-all duration-300"
              >
                {slide.cta}
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={32} strokeWidth={1} />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight size={32} strokeWidth={1} />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-primary-foreground w-8'
                : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
