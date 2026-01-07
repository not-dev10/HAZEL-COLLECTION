import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AnnouncementBar from '@/components/common/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import { Button } from '@/components/ui/button';
import { AddToWishlistButton } from '@/components/ui/add-to-wishlist-button';
import { useCart } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
}

const Collection = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // Mock data - replace with API call
  const collectionData: Record<string, { title: string; description: string; products: Product[] }> = {
    'new-arrivals': {
      title: 'New Arrivals',
      description: 'Discover our latest collections',
      products: Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `New Arrival ${i + 1}`,
        price: 150 + i * 10,
        image: `https://via.placeholder.com/300x400?text=Product+${i + 1}`,
        category: 'new-arrivals',
      })),
    },
    'ready-to-wear': {
      title: 'Ready To Wear',
      description: 'Premium ready-to-wear collection',
      products: Array.from({ length: 12 }, (_, i) => ({
        id: i + 100,
        name: `Ready To Wear ${i + 1}`,
        price: 200 + i * 15,
        image: `https://via.placeholder.com/300x400?text=RTW+${i + 1}`,
        category: 'ready-to-wear',
      })),
    },
    unstitched: {
      title: 'Unstitched',
      description: 'Elegant unstitched fabrics',
      products: Array.from({ length: 12 }, (_, i) => ({
        id: i + 200,
        name: `Unstitched ${i + 1}`,
        price: 120 + i * 8,
        image: `https://via.placeholder.com/300x400?text=Unstitched+${i + 1}`,
        category: 'unstitched',
      })),
    },
    bridals: {
      title: 'Bridals',
      description: 'Exquisite bridal collection',
      products: Array.from({ length: 12 }, (_, i) => ({
        id: i + 300,
        name: `Bridal ${i + 1}`,
        price: 500 + i * 50,
        image: `https://via.placeholder.com/300x400?text=Bridal+${i + 1}`,
        category: 'bridals',
      })),
    },
    jewellery: {
      title: 'Jewellery',
      description: 'Stunning jewellery pieces',
      products: Array.from({ length: 12 }, (_, i) => ({
        id: i + 400,
        name: `Jewellery ${i + 1}`,
        price: 80 + i * 5,
        image: `https://via.placeholder.com/300x400?text=Jewellery+${i + 1}`,
        category: 'jewellery',
      })),
    },
  };

  const collection = collectionData[slug || 'new-arrivals'] || collectionData['new-arrivals'];

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    setSelectedProducts([...selectedProducts, product.id]);
    setTimeout(() => setSelectedProducts(selectedProducts.filter(id => id !== product.id)), 600);
  };

  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <main>
        {/* Collection Header */}
        <div className="bg-secondary/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl mb-4 capitalize">{collection.title}</h1>
            <p className="text-muted-foreground text-lg">{collection.description}</p>
          </div>
        </div>

        {/* Products Grid */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collection.products.map((product) => (
              <div key={product.id} className="group">
                <div className="relative overflow-hidden bg-secondary mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-medium text-sm md:text-base mb-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-semibold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm line-through text-muted-foreground">${product.originalPrice}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className={`flex-1 text-xs tracking-widest ${
                      selectedProducts.includes(product.id) ? 'bg-green-600 hover:bg-green-700' : ''
                    }`}
                  >
                    <ShoppingBag size={16} className="mr-2" />
                    {selectedProducts.includes(product.id) ? 'Added!' : 'Add to Cart'}
                  </Button>
                  <AddToWishlistButton
                    itemId={product.id.toString()}
                    itemName={product.name}
                    itemPrice={product.price}
                    itemImage={product.image}
                    variant="outline"
                    size="md"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Collection;
