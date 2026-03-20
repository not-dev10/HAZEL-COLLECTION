import { useState } from 'react';
import { AddToCartButton } from '@/components/ui/add-to-cart-button';
import { AddToWishlistButton } from '@/components/ui/add-to-wishlist-button';
import { VariantSelectionModal } from '@/components/catalog/VariantSelectionModal';
import { CartItem } from '@/context/CartContext';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
  category?: string;
  inStock?: boolean;
  stock?: number;
  variants?: Array<{
    id: string;
    color: string;
    colorCode: string;
    sizes: Array<{ size: string; stock: number }>;
  }>;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  images,
  isNew,
  isSale,
  originalPrice,
  category,
  inStock = true,
  stock = 0,
  variants,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const allImages = images && images.length > 0 ? images : [image];
  const displayImage = allImages[currentImageIndex] || image;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/product/${id}/${name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`Image failed to load for product: ${name}`, image);
    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23f0f0f0" width="300" height="400"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%23999" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If product has variants, show modal
    if (variants && variants.length > 0) {
      setShowVariantModal(true);
    } else {
      // No variants, add directly
      handleAddDirectly();
    }
  };

  const handleAddDirectly = () => {
    const cartItem: CartItem = {
      id: id.toString(),
      name,
      price,
      quantity: 1,
      image,
    };
    addToCart(cartItem);
  };

  const handleConfirmVariant = () => {
    if (!selectedColor || !selectedSize || !selectedVariant) {
      alert('Please select both color and size');
      return;
    }

    const cartItem: CartItem = {
      id: id.toString(),
      productId: id.toString(),
      name,
      price,
      quantity: 1,
      image,
      color: selectedColor,
      size: selectedSize,
      variantId: selectedVariant.id,
    };
    
    addToCart(cartItem);
    setShowVariantModal(false);
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedVariant(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStart || !touchEnd || allImages.length <= 1) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 80;
    const isRightSwipe = distance < -80;
    
    if (isLeftSwipe) {
      setIsTransitioning(true);
      setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsTransitioning(false), 300);
    } else if (isRightSwipe) {
      setIsTransitioning(true);
      setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const cartItem: CartItem = {
    id: id.toString(),
    name,
    price,
    quantity: 1,
    image,
  };

  return (
    <article 
      className="group flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="product-card-image relative aspect-[3/4] bg-muted mb-4 flex-shrink-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={displayImage}
          alt={name}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-105 ${
            isTransitioning ? 'opacity-75' : 'opacity-100'
          }`}
          loading="lazy"
        />
        
        {/* Image Navigation */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
        
        {/* Badges */}
        {isNew && (
          <span className="absolute top-4 left-4 bg-foreground text-background text-[10px] tracking-wider px-3 py-1 uppercase">
            New
          </span>
        )}
        {isSale && (
          <span className="absolute top-4 left-4 bg-sale text-sale-foreground text-[10px] tracking-wider px-3 py-1 uppercase">
            Sale
          </span>
        )}
        {/* Action Buttons - Desktop Overlay */}
        <div className="hidden md:absolute md:inset-0 md:bg-black/40 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300 md:flex md:items-center md:justify-center md:gap-3">
          <button
            onClick={handleAddToCartClick}
            disabled={!inStock}
            className={`px-6 py-2.5 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-300 rounded-full flex items-center gap-2 text-sm font-medium uppercase tracking-wider ${
              !inStock ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <AddToWishlistButton
            itemId={id.toString()}
            itemName={name}
            itemPrice={price}
            itemImage={image}
            variant="default"
            size="md"
          />
        </div>
      </div>
      <div className="text-center space-y-1.5 flex-grow flex flex-col justify-between">
        <div>
          {category && (
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold mb-1">
              {category}
            </p>
          )}
          <h3 className="text-xs tracking-wider uppercase font-medium line-clamp-1 h-4 hover:opacity-70 transition-opacity">
            {name}
          </h3>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm">
          {isSale && originalPrice && (
            <span className="text-muted-foreground line-through">
              £{originalPrice.toLocaleString()}
            </span>
          )}
          <span className={`font-medium ${isSale ? 'text-sale' : ''}`}>
            £{price.toLocaleString()}
          </span>
        </div>
        {/* Action Buttons - Mobile */}
        <div className="md:hidden flex items-center justify-center gap-2 pt-2">
          <div className="flex-1">
            <button
              onClick={handleAddToCartClick}
              disabled={!inStock}
              className={`w-full px-3 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-300 rounded text-xs font-medium uppercase tracking-wider ${
                !inStock ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
          <div>
            <AddToWishlistButton
              itemId={id.toString()}
              itemName={name}
              itemPrice={price}
              itemImage={image}
              variant="default"
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {showVariantModal && variants && variants.length > 0 && (
        <VariantSelectionModal
          variants={variants}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          onColorSelect={(color, variant) => {
            setSelectedColor(color);
            setSelectedVariant(variant);
            setSelectedSize(null);
          }}
          onSizeSelect={setSelectedSize}
          onConfirm={handleConfirmVariant}
          onCancel={() => setShowVariantModal(false)}
        />
      )}
    </article>
  );
};

export default ProductCard;
