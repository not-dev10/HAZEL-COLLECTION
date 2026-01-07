import { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/context/CartContext';

interface AddToCartButtonProps {
  item: CartItem;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  onAddSuccess?: () => void;
}

export const AddToCartButton = ({
  item,
  variant = 'default',
  size = 'md',
  className = '',
  showIcon = true,
  onAddSuccess,
}: AddToCartButtonProps) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddToCart = () => {
    // Prevent multiple clicks
    if (isAnimating) return;

    setIsAnimating(true);
    addToCart(item);
    setIsAdded(true);

    // Reset after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
      setIsAnimating(false);
    }, 2000);

    // Call callback if provided
    onAddSuccess?.();
  };

  const baseStyles = 'relative font-medium tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  const variantStyles = {
    default: isAdded
      ? 'bg-green-600 text-white hover:bg-green-700'
      : 'bg-primary text-primary-foreground hover:bg-foreground/90',
    outline: isAdded
      ? 'border-2 border-green-600 text-green-600 bg-transparent'
      : 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5',
    ghost: isAdded
      ? 'text-green-600 hover:bg-green-50'
      : 'text-primary hover:bg-primary/10',
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAnimating}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {/* Cart icon with animation */}
      {showIcon && (
        <span
          className={`inline-block transition-all duration-300 ${
            isAdded ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <ShoppingBag size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} strokeWidth={1.5} />
        </span>
      )}

      {/* Check icon with animation */}
      {showIcon && (
        <span
          className={`absolute inline-block transition-all duration-300 ${
            isAdded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <Check size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} strokeWidth={2} />
        </span>
      )}

      {/* Button text with animation */}
      <span
        className={`transition-all duration-300 ${
          isAdded ? 'translate-y-8' : 'translate-y-0'
        }`}
      >
        {isAdded ? 'Added!' : 'Add to Cart'}
      </span>

      {/* Success text animation */}
      <span
        className={`absolute transition-all duration-300 ${
          isAdded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        {isAdded ? 'Added!' : 'Add to Cart'}
      </span>
    </button>
  );
};

export default AddToCartButton;
