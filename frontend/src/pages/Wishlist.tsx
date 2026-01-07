import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import AnnouncementBar from '@/components/common/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import { AddToWishlistButton } from '@/components/ui/add-to-wishlist-button';
import { AddToCartButton } from '@/components/ui/add-to-cart-button';
import { Trash2, ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-2">
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-6 p-4 bg-muted rounded-full">
                <Heart size={48} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8 text-center max-w-md">
                Add items to your wishlist to save them for later. Start shopping
                to find products you love.
              </p>
              <Link
                to="/"
                className="px-8 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-300 rounded-none uppercase text-sm tracking-wider font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Wishlist Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ShoppingBag className="text-muted-foreground" size={32} />
                        </div>
                      )}
                      {/* Overlay with Actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="px-6 py-2.5 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-300 rounded-full flex items-center gap-2 text-sm font-medium uppercase tracking-wider"
                        >
                          <ShoppingBag size={16} />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-2.5 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full transition-all duration-300 transform hover:scale-110"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-medium tracking-wide uppercase line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm font-medium">
                        ${item.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added{' '}
                        {new Date(item.addedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Wishlist Button */}
              <div className="flex justify-end pt-6 border-t border-border">
                <button
                  onClick={() => clearWishlist()}
                  className="px-6 py-2 text-destructive border border-destructive hover:bg-destructive/10 transition-colors duration-300 rounded-none uppercase text-xs tracking-wider font-medium"
                >
                  Clear Wishlist
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Wishlist;
