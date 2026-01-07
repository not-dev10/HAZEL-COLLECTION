import { useState } from 'react';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = total;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingBag size={64} className="text-muted-foreground mb-4" />
              <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added anything yet
              </p>
              <Button
                onClick={() => navigate('/')}
                className="px-8"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-6 sm:mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-muted/50 border-b border-border">
                  <div className="col-span-5 text-sm font-medium">Product</div>
                  <div className="col-span-2 text-sm font-medium text-center">Qty</div>
                  <div className="col-span-2 text-sm font-medium text-center">Price</div>
                  <div className="col-span-2 text-sm font-medium text-center">Total</div>
                  <div className="col-span-1 text-sm font-medium text-center">Action</div>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 p-6 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    {/* Product Info */}
                    <div className="col-span-12 md:col-span-5 flex gap-4">
                      {item.image && (
                        <div className="w-20 h-24 bg-muted rounded flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {item.name}
                        </h3>
                        {item.size && (
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size}
                          </p>
                        )}
                        {item.color && (
                          <p className="text-sm text-muted-foreground">
                            Color: {item.color}
                          </p>
                        )}
                        <p className="font-semibold text-sm mt-2 md:hidden">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-6 md:col-span-2 flex items-center md:justify-center">
                      <div className="flex items-center gap-2 border border-border rounded w-fit">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 hover:bg-muted text-sm"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 hover:bg-muted text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-6 md:col-span-2 flex items-center md:justify-center">
                      <span className="text-sm md:text-base font-medium">
                        £{item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Total */}
                    <div className="col-span-6 md:col-span-2 flex items-center md:justify-center">
                      <span className="text-sm md:text-base font-semibold">
                        £{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-6 md:col-span-1 flex items-center md:justify-center">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Button */}
              <div className="mt-6 flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                  className="flex-1 text-destructive hover:bg-destructive/10"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-serif mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">£{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `£${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">£{tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-border pt-4 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>£{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {subtotal < 100 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6 text-sm text-blue-800">
                    Free shipping on orders over £100!
                  </div>
                )}

                <Button
                  onClick={() => {
                    setIsProcessing(true);
                    // Navigate to checkout
                    navigate('/checkout');
                  }}
                  disabled={isProcessing}
                  className="w-full mb-3"
                  size="lg"
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                  size="lg"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cart;
