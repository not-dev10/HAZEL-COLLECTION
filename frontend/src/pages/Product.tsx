import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnnouncementBar from '@/components/common/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import { AddToWishlistButton } from '@/components/ui/add-to-wishlist-button';
import Reviews from '@/components/catalog/ProductReviews';
import { useCart } from '@/context/CartContext';
import { Share2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  details: string[];
  image: string;
  images?: string[];
  category: string;
  inStock: boolean;
  stock: number;
}

const Product = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('📥 Fetching products... (slug:', slug, ')');
        
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        
        console.log('✅ Products fetched:', data);
        
        if (data.success && data.products) {
          console.log('📦 Total products:', data.products.length);
          
          // Find product by name slug
          const foundProduct = data.products.find(
            (p: any) => {
              const productSlug = p.name.toLowerCase().replace(/\s+/g, '-');
              console.log('Comparing:', productSlug, '===', slug);
              return productSlug === slug;
            }
          );
          
          if (foundProduct) {
            console.log('✨ Product found:', foundProduct.name);
            setProduct({
              id: foundProduct._id || foundProduct.id,
              name: foundProduct.name,
              price: foundProduct.price,
              originalPrice: foundProduct.originalPrice,
              description: foundProduct.description || '',
              details: foundProduct.details || [],
              image: foundProduct.image,
              images: foundProduct.images || [foundProduct.image],
              category: foundProduct.category,
              inStock: foundProduct.inStock !== false && foundProduct.stock > 0,
              stock: foundProduct.stock || 0,
            });
          } else {
            console.warn('❌ Product not found for slug:', slug);
            console.log('Available slugs:', data.products.map((p: any) => p.name.toLowerCase().replace(/\s+/g, '-')));
          }
        } else {
          console.error('❌ Invalid response:', data);
        }
      } catch (error) {
        console.error('❌ Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) {
      setCartMessage({ type: 'error', text: 'Product not loaded' });
      return;
    }
    
    try {
      const cartItem = {
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
      };
      
      console.log('🛒 Adding to cart:', cartItem);
      await addToCart(cartItem);
      setCartMessage({ type: 'success', text: `Added ${quantity} item(s) to cart!` });
      
      // Clear message after 3 seconds
      setTimeout(() => setCartMessage(null), 3000);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      setCartMessage({ type: 'error', text: 'Failed to add to cart' });
      setTimeout(() => setCartMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AnnouncementBar />
        <Header />
        <main>
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-200 animate-pulse h-96 md:h-[600px] rounded" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <AnnouncementBar />
        <Header />
        <main>
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-serif mb-4">Product not found</h1>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
          </div>
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
        {/* Success/Error Message */}
        {cartMessage && (
          <div className={`py-3 px-4 text-center font-medium ${
            cartMessage.type === 'success' 
              ? 'bg-green-50 text-green-800 border-b border-green-200' 
              : 'bg-red-50 text-red-800 border-b border-red-200'
          }`}>
            {cartMessage.text}
          </div>
        )}
        
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative overflow-hidden bg-secondary h-80 sm:h-96 md:h-[600px] aspect-[3/4]">
                <img
                  src={product.images?.[selectedImageIndex] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`overflow-hidden rounded aspect-[3/4] transition-all ${
                        selectedImageIndex === idx ? 'ring-2 ring-primary' : 'hover:opacity-75'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-start">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 break-words">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold">£{product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg line-through text-muted-foreground">
                    £{product.originalPrice}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

              {/* Details */}
              {product.details && product.details.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-3">Product Details</h3>
                  <ul className="space-y-2">
                    {product.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center border border-border rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-secondary"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 border-l border-r border-border">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-secondary"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium tracking-wide"
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <AddToWishlistButton
                    itemId={product.id}
                    itemName={product.name}
                    itemPrice={product.price}
                    itemImage={product.image}
                    variant="outline"
                    size="md"
                  />
                  <button className="p-3 border border-border rounded hover:bg-secondary">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="text-sm">
                {product.inStock ? (
                  <p className="text-green-600">✓ In Stock ({product.stock} available)</p>
                ) : (
                  <p className="text-red-600">Out of Stock</p>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16 border-t border-border pt-12">
            <Reviews productId={product.id} />
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Product;
