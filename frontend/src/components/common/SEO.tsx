import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock';
  structuredData?: object;
}

export const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  price,
  currency = 'GBP',
  availability,
  structuredData,
}: SEOProps) => {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description, true);
      updateMetaTag('twitter:description', description);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    if (title) {
      updateMetaTag('og:title', title, true);
      updateMetaTag('twitter:title', title);
    }

    if (image) {
      updateMetaTag('og:image', image, true);
      updateMetaTag('twitter:image', image);
    }

    if (url) {
      updateMetaTag('og:url', url, true);
      updateMetaTag('twitter:url', url);
      
      // Update canonical link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    if (type) {
      updateMetaTag('og:type', type, true);
    }

    // Product-specific meta tags
    if (price) {
      updateMetaTag('product:price:amount', price.toString(), true);
      updateMetaTag('product:price:currency', currency, true);
    }

    if (availability) {
      updateMetaTag('product:availability', availability, true);
    }

    // Add structured data
    if (structuredData) {
      let script = document.querySelector('script[data-seo="structured-data"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-seo', 'structured-data');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      // Remove dynamic structured data on unmount
      const script = document.querySelector('script[data-seo="structured-data"]');
      if (script) {
        script.remove();
      }
    };
  }, [title, description, keywords, image, url, type, price, currency, availability, structuredData]);

  return null; // This component doesn't render anything
};
