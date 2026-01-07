import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AnnouncementBar from '@/components/common/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import { AddToCartButton } from '@/components/ui/add-to-cart-button';
import { AddToWishlistButton } from '@/components/ui/add-to-wishlist-button';
import Reviews from '@/components/catalog/ProductReviews';
import { useCart } from '@/context/CartContext';
import { Share2 } from 'lucide-react';

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  details: string[];
  images: string[];
  category: string;
  inStock: boolean;
}

const productDatabase: { [key: string]: ProductDetail } = {
  'embroidered-silk-ensemble': {
    id: 1,
    name: 'Embroidered Silk Ensemble',
    price: 485,
    description: 'An exquisite silk ensemble featuring intricate embroidery work with premium silk fabric. Perfect for festive occasions and celebrations.',
    details: [
      '100% Premium Silk',
      'Hand-embroidered Details',
      'Comfortable Fit',
      'Easy Care',
      'Sustainable Production',
    ],
    images: [
      'https://via.placeholder.com/500x700?text=Embroidered+Silk+Ensemble+Main',
      'https://via.placeholder.com/500x700?text=Embroidered+Silk+Detail+1',
      'https://via.placeholder.com/500x700?text=Embroidered+Silk+Detail+2',
      'https://via.placeholder.com/500x700?text=Embroidered+Silk+Detail+3',
    ],
    category: 'ready-to-wear',
    inStock: true,
  },
  'velvet-bridal-collection': {
    id: 2,
    name: 'Velvet Bridal Collection',
    price: 1250,
    description: 'A stunning velvet bridal piece featuring luxurious soft velvet fabric with elegant detailing. Perfect for your special day.',
    details: [
      'Premium Velvet',
      'Luxury Embellishments',
      'Perfect Bridal Fit',
      'Professional Cleaning Recommended',
      'Handcrafted Quality',
    ],
    images: [
      'https://via.placeholder.com/500x700?text=Velvet+Bridal+Main',
      'https://via.placeholder.com/500x700?text=Velvet+Bridal+Detail+1',
      'https://via.placeholder.com/500x700?text=Velvet+Bridal+Detail+2',
      'https://via.placeholder.com/500x700?text=Velvet+Bridal+Detail+3',
    ],
    category: 'bridal',
    inStock: true,
  },
  'cotton-lawn-three-piece': {
    id: 3,
    name: 'Cotton Lawn Three Piece',
    price: 195,
    originalPrice: 285,
    description: 'A versatile three-piece cotton lawn suit perfect for everyday wear with a touch of elegance.',
    details: [
      '100% Cotton Lawn',
      'Three-Piece Set',
      'Breathable Fabric',
      'Easy Maintenance',
      'Summer Collection',
    ],
    images: [
      'https://via.placeholder.com/500x700?text=Cotton+Lawn+Main',
      'https://via.placeholder.com/500x700?text=Cotton+Lawn+Detail+1',
      'https://via.placeholder.com/500x700?text=Cotton+Lawn+Detail+2',
      'https://via.placeholder.com/500x700?text=Cotton+Lawn+Detail+3',
    ],
    category: 'pret',
    inStock: true,
  },
  'festive-formal-wear': {
    id: 4,
    name: 'Festive Formal Wear',
    price: 650,
    description: 'Add text here - elegant formal wear perfect for festive celebrations and special occasions.',
    details: [
      'Premium Blend Fabric',
      'Formal Design',
      'Perfect For Celebrations',
      'Comfortable Wear',
      'Professional Finish',
    ],
    images: [
      'https://via.placeholder.com/500x700?text=Festive+Formal+Main',
      'https://via.placeholder.com/500x700?text=Festive+Formal+Detail+1',
      'https://via.placeholder.com/500x700?text=Festive+Formal+Detail+2',
      'https://via.placeholder.com/500x700?text=Festive+Formal+Detail+3',
    ],
    category: 'ready-to-wear',
    inStock: true,
  },
  'summer-unstitched-fabric': {
    id: 5,
    name: 'Summer Unstitched Fabric',
    price: 175,
    description: 'Add text here - premium unstitched fabric for summer season with beautiful designs.',
    details: [
      '100% Natural Fiber',
      'Unstitched Fabric',
      'Perfect For Tailoring',
      'Breathable Material',
      'Traditional Design',
    ],
    images: [
      'https://via.placeholder.com/500x700?text=Summer+Unstitched+Main',
      'https://via.placeholder.com/500x700?text=Summer+Unstitched+Detail+1',
      'https://via.placeholder.com/500x700?text=Summer+Unstitched+Detail+2',
      'https://via.placeholder.com/500x700?text=Summer+Unstitched+Detail+3',
    ],
    category: 'unstitched',
    inStock: true,
  },
  'luxury-pret-collection': {
    id: 6,
    name: 'Luxury Pret Collection',
    price: 395,
    originalPrice: 525,
    description: 'Add text here - premium ready-to-wear luxury collection for sophisticated style.',
    details: [
      'Premium Quality Fabric',
      'Luxury Design',
      'Perfect Fit',
      'Modern Styling',
      'Exclusive Collection',
    ],
    images: [
      'https://via.placeholder.com/500x700?text=Luxury+Pret+Main',
      'https://via.placeholder.com/500x700?text=Luxury+Pret+Detail+1',
      'https://via.placeholder.com/500x700?text=Luxury+Pret+Detail+2',
      'https://via.placeholder.com/500x700?text=Luxury+Pret+Detail+3',
    ],
    category: 'pret',
    inStock: true,
  },
  'chiffon-formal-dress': {
    id: 7,
    name: 'Chiffon Formal Dress',
    price: 575,
    description: 'Add text here - elegant chiffon formal dress with beautiful draping and sophisticated design.',
    details: [
      'Premium Chiffon',
      'Formal Style',
      'Elegant Draping',
      'Comfortable Fit',
      'Professional Finish',
    ],
    images: [
      'https://via.placeholder.com/500x700?text=Chiffon+Formal+Main',
      'https://via.placeholder.com/500x700?text=Chiffon+Formal+Detail+1',
      'https://via.placeholder.com/500x700?text=Chiffon+Formal+Detail+2',
      'https://via.placeholder.com/500x700?text=Chiffon+Formal+Detail+3',
    ],
    category: 'ready-to-wear',
    inStock: true,
  },
  'classic-heritage-piece': {
    id: 8,
    name: 'Classic Heritage Piece',
    price: 425,
    description: 'Add text here - timeless classic piece celebrating traditional craftsmanship and modern elegance.',
    details: [
      'Premium Fabric',
      'Heritage Design',
      'Timeless Style',
      'Quality Crafted',
      'Versatile Wear',
    ],
    images: [
      'https://via.placeholder.com/500x700?text=Classic+Heritage+Main',
      'https://via.placeholder.com/500x700?text=Classic+Heritage+Detail+1',
      'https://via.placeholder.com/500x700?text=Classic+Heritage+Detail+2',
      'https://via.placeholder.com/500x700?text=Classic+Heritage+Detail+3',
    ],
    category: 'ready-to-wear',
    inStock: true,
  },
};

const Product = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Get product from database or use default
  const product: ProductDetail = slug && productDatabase[slug] 
    ? productDatabase[slug]
    : {
        id: 1,
        name: slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Product',
        price: 199.99,
        originalPrice: 299.99,
        description: 'Add text here - premium quality product from our exclusive collection.',
        details: [
          '100% Premium Fabric',
          'Hand-embroidered Details',
          'Comfortable Fit',
          'Easy Care',
          'Sustainable Production',
        ],
        images: [
          'https://via.placeholder.com/500x700?text=Product+Main',
          'https://via.placeholder.com/500x700?text=Product+Detail+1',
          'https://via.placeholder.com/500x700?text=Product+Detail+2',
          'https://via.placeholder.com/500x700?text=Product+Detail+3',
        ],
        category: 'ready-to-wear',
        inStock: true,
      };

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0],
    };
    addToCart(cartItem);
  };

  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <main>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative overflow-hidden bg-secondary h-80 sm:h-96 md:h-[600px] aspect-[3/4]">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`overflow-hidden border-2 h-16 sm:h-20 transition-all ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-start">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 break-words">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold">£{product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg line-through text-muted-foreground">£{product.originalPrice}</span>
                )}
                <span className="text-sale font-medium">
                  {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
                </span>
              </div>

              <p className="text-muted-foreground text-lg mb-6">{product.description}</p>

              {/* Description */}
              <div className="mb-8 pb-8 border-b">
                <h3 className="font-medium text-sm tracking-widest uppercase mb-4">Description</h3>
                <ul className="space-y-2">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start">
                      <span className="mr-3">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium uppercase">Quantity:</span>
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-secondary"
                    >
                      −
                    </button>
                    <span className="px-6 py-2 border-l border-r">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-secondary"
                    >
                      +
                    </button>
                  </div>
                </div>

                <AddToCartButton
                  item={{
                    id: product.id.toString(),
                    name: product.name,
                    price: product.price,
                    quantity,
                    image: product.images[0],
                  }}
                  variant="default"
                  size="lg"
                  className="w-full"
                  showIcon={true}
                  onAddSuccess={() => setQuantity(1)}
                />

                <div className="flex gap-4">
                  <AddToWishlistButton
                    itemId={product.id.toString()}
                    itemName={product.name}
                    itemPrice={product.price}
                    itemImage={product.images[0]}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-12"
                  />
                  <button className="flex-1 border border-primary text-primary py-3 hover:bg-primary/5 transition">
                    <Share2 size={20} className="mx-auto" />
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-destructive'}`}>
                {product.inStock ? '✓ In Stock' : 'Out of Stock'}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16 pt-12 border-t border-border">
            <Reviews productId={product.id.toString()} productName={product.name} />
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Product;
