import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import heroBridal from '@/assets/hero-bridal.jpg';
import heroCollection from '@/assets/hero-collection.jpg';
import heroUnstitched from '@/assets/hero-unstitched.jpg';

interface Slide {
  id: number;
  image: string;
  collection: string;
  subtitle: string;
  cta: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: heroBridal,
    collection: 'Studio Portraits',
    subtitle: 'Hezal Couture Bridal 2025',
    cta: 'LIVE NOW',
  },
  {
    id: 2,
    image: heroCollection,
    collection: 'Winter Luxe',
    subtitle: 'Festive Collection 2025',
    cta: 'SHOP NOW',
  },
  {
    id: 3,
    image: heroUnstitched,
    collection: 'Ethereal Dreams',
    subtitle: 'Ready To Wear Collection',
    cta: 'EXPLORE',
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative h-[60vh] md:h-[80vh] lg:h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.collection}
            className="w-full h-full object-cover"
          />
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
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={32} strokeWidth={1} />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={32} strokeWidth={1} />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3">
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