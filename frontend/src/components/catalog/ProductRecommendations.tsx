import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { API_BASE_URL } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
}

interface ProductRecommendationsProps {
  currentProductId?: string | number;
}

const ProductRecommendations = ({ currentProductId }: ProductRecommendationsProps) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        if (data.success && data.products) {
          // Get first 4 products as recommendations
          setProducts(data.products.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif mb-2">You Might Also Like</h2>
          <p className="text-muted-foreground">
            Discover products that complement this item perfectly
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-96 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif mb-2">You Might Also Like</h2>
        <p className="text-muted-foreground">
          Discover products that complement this item perfectly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products
          .filter((p) => p.id !== currentProductId)
          .map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}/${getProductSlug(product.name)}`)}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <ProductCard {...product} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
