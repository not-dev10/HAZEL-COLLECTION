import { useState, useRef, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export const MiniCart = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const { items, cartCount, total, removeFromCart, updateQuantity } = useCart();

  // Close minicart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={cartRef}>
      {/* Cart Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 hover:opacity-70 transition-opacity"
        aria-label="Shopping cart"
      >
        <ShoppingBag size={24} strokeWidth={1.3} />
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center rounded-full">
            {cartCount}
          </span>
        )}
      </button>

      {/* Mini Cart Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-serif text-lg tracking-wide">Your Cart</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Items */}
          {items.length > 0 ? (
            <>
              <div className="max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    {item.image && (
                      <div className="w-16 h-20 bg-muted rounded flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.size && (
                        <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                      )}
                      {item.color && (
                        <p className="text-xs text-muted-foreground">Color: {item.color}</p>
                      )}
                      <p className="font-semibold text-sm mt-2">
                        £{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1 border border-border rounded">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-muted"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-muted"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm">Subtotal</span>
                  <span className="font-semibold">£{total.toFixed(2)}</span>
                </div>
                <Button 
                  onClick={() => {
                    navigate('/cart');
                    setIsOpen(false);
                  }}
                  className="w-full mb-2 bg-primary text-primary-foreground hover:bg-foreground/90"
                >
                  View Cart
                </Button>
                <Button 
                  onClick={() => {
                    navigate('/checkout');
                    setIsOpen(false);
                  }}
                  variant="outline"
                  className="w-full mb-2"
                >
                  Checkout
                </Button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 text-sm border border-border rounded hover:bg-muted transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <ShoppingBag size={40} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
