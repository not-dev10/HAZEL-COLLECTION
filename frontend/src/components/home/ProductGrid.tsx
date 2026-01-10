import { useEffect, useState } from 'react';
import ProductCard from '@/components/catalog/ProductCard';
import { API_BASE_URL } from '@/lib/api';

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        if (data.success && data.products) {
          // Use actual products from database, limit to 8
          setProducts(data.products.slice(0, 8));
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Discover Our Collection
            </p>
            <h2 className="section-title">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-96 rounded" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Discover Our Collection
          </p>
          <h2 className="section-title">New Arrivals</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image}
              images={product.images}
              isNew={product.isNew}
              isSale={product.isSale}
            />
          ))}
        </div>
        {products.length > 0 && (
          <div className="text-center mt-12 md:mt-16">
            <a href="/collection/new-arrivals" className="btn-outline">
              View All
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;