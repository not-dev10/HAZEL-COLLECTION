import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useState } from 'react';
import './heart-animation.css';

interface AddToWishlistButtonProps {
  itemId: string;
  itemName: string;
  itemPrice: number;
  itemImage?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const AddToWishlistButton = ({
  itemId,
  itemName,
  itemPrice,
  itemImage,
  variant = 'ghost',
  size = 'md',
  showText = false,
}: AddToWishlistButtonProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [showAnimation, setShowAnimation] = useState(false);
  const inWishlist = isInWishlist(itemId);

  const handleClick = async () => {
    try {
      if (inWishlist) {
        await removeFromWishlist(itemId);
      } else {
        setShowAnimation(true);
        await addToWishlist({
          id: itemId,
          name: itemName,
          price: itemPrice,
          image: itemImage,
        });
        // Keep animation visible for a bit after successful add
        setTimeout(() => setShowAnimation(false), 600);
      }
    } catch (error) {
      console.error('Wishlist action failed:', error);
      // Show error feedback to user
      alert('Failed to update wishlist. Please check your connection and try again.');
      setShowAnimation(false);
    }
  };

  const sizeClasses = {
    sm: 'p-2 w-9 h-9',
    md: 'p-2.5 w-10 h-10',
    lg: 'p-3 w-12 h-12',
  };

  const bgClasses = {
    default: inWishlist
      ? 'bg-rose-500 text-white'
      : 'bg-background/90 hover:bg-background',
    outline: inWishlist
      ? 'border border-rose-500 text-rose-500'
      : 'border border-input hover:bg-accent',
    ghost: inWishlist ? 'text-rose-500' : 'text-foreground',
  };

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} ${bgClasses[variant]} rounded-full transition-all duration-300 transform hover:scale-110 flex items-center justify-center gap-2 relative`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <div className="relative">
        <Heart
          size={size === 'sm' ? 16 : size === 'md' ? 18 : 22}
          strokeWidth={1.5}
          fill={inWishlist ? 'currentColor' : 'none'}
        />
        {showAnimation && (
          <div className="heart-burst absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="burst-particle"
                style={{
                  '--delay': `${i * 50}ms`,
                  '--angle': `${(i * 60) * (Math.PI / 180)}rad`,
                } as any}
              >
                <Heart size={10} fill="currentColor" strokeWidth={0} />
              </div>
            ))}
          </div>
        )}
      </div>
      {showText && <span className="text-xs">{inWishlist ? 'Saved' : 'Save'}</span>}
    </button>
  );
};
