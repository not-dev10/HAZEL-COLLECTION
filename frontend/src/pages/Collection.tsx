import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnnouncementBar from '@/components/common/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import { Button } from '@/components/ui/button';
import { AddToWishlistButton } from '@/components/ui/add-to-wishlist-button';
import { useCart } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionTitle, setCollectionTitle] = useState('Collection');

  // Fetch products from API - filtered by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Map slug to category for API filtering
        // Convert slug back to a normalized category name
        const categoryFromSlug = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
          .replace(/(\d{4})/, '$1'); // Handle years like 2025
        
        // Try the mapped category first, then the converted slug, then the slug as-is
        const categoryMap: Record<string, string> = {
          'new-arrivals': 'New Arrivals',
          'ready-to-wear': 'Ready To Wear',
          'unstitched': 'Unstitched',
          'bridals': 'Bridal',
          'jewellery': 'Jewellery',
          'studio-portraits': 'Studio Portraits',
          'festive-aw-2025': 'Festive A/W 2025',
          'pret-aw-2025': 'Pret A/W 2025',
          'basics-aw-2025': 'Basics A/W 2025',
          'hc-basics-ss-25': 'HC Basics SS 25',
          'winter-unstitched-2025': 'Winter Unstitched 2025',
          'wedding-unstitched-2025': 'Wedding Unstitched 2025',
          'lawn': 'Lawn',
          'cotton': 'Cotton',
          'silk': 'Silk',
          'festive': 'Festive',
          'pret': 'Pret',
          'basics': 'Basics',
        };
        
        // Use mapped category if available, otherwise use the slug as the API expects it
        const category = categoryMap[slug] || slug;
        
        console.log('Fetching products for category:', category, 'from slug:', slug);
        
        const response = await fetch(`${API_BASE_URL}/api/products?category=${encodeURIComponent(category)}`);
        const data = await response.json();
        
        console.log('API Response:', { success: data.success, productCount: data.products?.length || 0 });
        
        if (data.success && data.products) {
          setProducts(data.products);
          
          // Set collection title based on slug
          const titleMap: Record<string, string> = {
            'new-arrivals': 'New Arrivals',
            'ready-to-wear': 'Ready To Wear',
            'unstitched': 'Unstitched',
            'bridals': 'Bridals',
            'jewellery': 'Jewellery',
            'studio-portraits': 'Studio Portraits',
            'festive-aw-2025': 'Festive A/W 2025',
            'pret-aw-2025': 'Pret A/W 2025',
            'basics-aw-2025': 'Basics A/W 2025',
          };
          setCollectionTitle(titleMap[slug] || categoryFromSlug);
        } else {
          console.warn('No products found for category:', category);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

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

  if (loading) {
    return (
      <div className="min-h-screen">
        <AnnouncementBar />
        <Header />
        <main>
          <div className="bg-secondary/30 py-12 md:py-16">
            <div className="container mx-auto px-4">
              <h1 className="font-serif text-4xl md:text-5xl mb-4">Loading...</h1>
            </div>
          </div>
          <section className="container mx-auto px-4 py-12 md:py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse h-96 rounded" />
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <main>
        {/* Collection Header */}
        <div className="bg-secondary/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl mb-4 capitalize">{collectionTitle}</h1>
            <p className="text-muted-foreground text-lg">Browse our collection</p>
          </div>
        </div>

        {/* Products Grid */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
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
                    <span className="text-lg font-semibold">£{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm line-through text-muted-foreground">£{product.originalPrice}</span>
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found in this collection</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Collection;
