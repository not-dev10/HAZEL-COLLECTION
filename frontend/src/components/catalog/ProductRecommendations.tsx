import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

const recommendedProducts = [
  {
    id: 2,
    name: 'Complementary Bottoms',
    price: 149,
    image: 'https://images.unsplash.com/photo-1552821206-7debf432f9a0?w=500',
    isNew: false,
  },
  {
    id: 3,
    name: 'Matching Accessories Set',
    price: 89,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
    isNew: true,
  },
  {
    id: 4,
    name: 'Similar Style Dress',
    price: 199,
    image: 'https://images.unsplash.com/photo-1595777707802-78f6cf076e91?w=500',
    isSale: true,
    originalPrice: 299,
  },
  {
    id: 5,
    name: 'Coordinating Shawl',
    price: 119,
    image: 'https://images.unsplash.com/photo-1519167758993-dfa06a37fdf3?w=500',
  },
];

interface ProductRecommendationsProps {
  currentProductId?: string | number;
}

const ProductRecommendations = ({ currentProductId }: ProductRecommendationsProps) => {
  const navigate = useNavigate();

  const getProductSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif mb-2">You Might Also Like</h2>
        <p className="text-muted-foreground">
          Discover products that complement this item perfectly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendedProducts
          .filter((p) => p.id !== currentProductId)
          .map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${getProductSlug(product.name)}`)}
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
