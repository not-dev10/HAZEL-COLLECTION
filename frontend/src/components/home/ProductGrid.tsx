import ProductCard from '@/components/catalog/ProductCard';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import product5 from '@/assets/product-5.jpg';
import product6 from '@/assets/product-6.jpg';
import product7 from '@/assets/product-7.jpg';
import product8 from '@/assets/product-8.jpg';

const products = [
  {
    id: 1,
    name: 'Embroidered Silk Ensemble',
    price: 485,
    image: product1,
    isNew: true,
  },
  {
    id: 2,
    name: 'Velvet Bridal Collection',
    price: 1250,
    image: product2,
  },
  {
    id: 3,
    name: 'Cotton Lawn Three Piece',
    price: 195,
    originalPrice: 285,
    image: product3,
    isSale: true,
  },
  {
    id: 4,
    name: 'Festive Formal Wear',
    price: 650,
    image: product4,
    isNew: true,
  },
  {
    id: 5,
    name: 'Summer Unstitched Fabric',
    price: 175,
    image: product5,
  },
  {
    id: 6,
    name: 'Luxury Pret Collection',
    price: 395,
    originalPrice: 525,
    image: product6,
    isSale: true,
  },
  {
    id: 7,
    name: 'Chiffon Formal Dress',
    price: 575,
    image: product7,
  },
  {
    id: 8,
    name: 'Classic Heritage Piece',
    price: 425,
    image: product8,
    isNew: true,
  },
];

const ProductGrid = () => {
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
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        <div className="text-center mt-12 md:mt-16">
          <a href="/shop" className="btn-outline">
            View All
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;