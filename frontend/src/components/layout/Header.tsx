import { useState, useEffect } from 'react';
import { Heart, Search, User, Menu, X, ChevronDown, LogOut, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MiniCart } from '@/components/cart/MiniCart';
import { useWishlist } from '@/context/WishlistContext';
import { useUser } from '@/context/UserContext';
import { getProductImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';
import logo from '../../../../WhatsApp Image 2026-01-12 at 2.01.32 PM (1).jpeg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Category {
  label: string;
  href: string;
}

interface MainCategory {
  name: string;
  items: Category[];
}

const categories: MainCategory[] = [
  {
    name: 'NEW ARRIVALS',
    items: [
      { label: 'STUDIO PORTRAITS', href: '/collection/studio-portraits' },
      { label: 'FESTIVE A/W 2025', href: '/collection/festive-aw-2025' },
      { label: 'PRET A/W 2025', href: '/collection/pret-aw-2025' },
      { label: 'BASICS A/W 2025', href: '/collection/basics-aw-2025' },
      { label: 'HC BASICS SS\' 25', href: '/collection/hc-basics-ss-25' },
      { label: 'WINTER UNSTITCHED 2025', href: '/collection/winter-unstitched-2025' },
      { label: 'WEDDING UNSTITCHED 2025', href: '/collection/wedding-unstitched-2025' },
      { label: 'HANDCRAFTED', href: '/collection/handcrafted' },
      { label: 'BEBAK 2025', href: '/collection/bebak-2025' },
    ],
  },
  {
    name: 'UNSTITCHED',
    items: [
      { label: 'WINTER UNSTITCHED 2025', href: '/collection/winter-2025' },
      { label: 'WEDDING UNSTITCHED 2025', href: '/collection/wedding-2025' },
      { label: 'LAWN COLLECTION', href: '/collection/lawn' },
      { label: 'COTTON COLLECTION', href: '/collection/cotton' },
      { label: 'SILK COLLECTION', href: '/collection/silk' },
    ],
  },
  {
    name: 'READY TO WEAR',
    items: [
      { label: 'FESTIVE A/W 2025', href: '/collection/festive' },
      { label: 'PRET A/W 2025', href: '/collection/pret' },
      { label: 'BASICS A/W 2025', href: '/collection/basics' },
      { label: 'LUXURY PRET', href: '/collection/luxury-pret' },
    ],
  },
  {
    name: 'BRIDALS',
    items: [
      { label: 'BRIDAL COLLECTION', href: '/collection/bridal-collection' },
      { label: 'CUSTOM BRIDAL', href: '/collection/custom-bridal' },
    ],
  },
  {
    name: 'JEWELLERY',
    items: [
      { label: 'EARRINGS', href: '/collection/earrings' },
      { label: 'NECKLACES', href: '/collection/necklaces' },
      { label: 'BANGLES', href: '/collection/bangles' },
    ],
  },
];

const WardrobeIcon = () => (
  <ChevronDown size={16} />
);

// Search suggestions are now fetched from real product data in the Header component
// See useEffect below for product fetching logic

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wardrobeMenuOpen, setWardrobeMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<MainCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { wishlistCount } = useWishlist();
  const { isLoggedIn, logout } = useUser();
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(`${API_BASE_URL}/api/products/categories`);
        if (response.ok) {
          const data = await response.json();
          const categoryList: string[] = data.categories || [];
          
          // Transform flat categories list into grouped structure
          const grouped: MainCategory[] = [];
          
          // Group categories intelligently based on common patterns
          const groupedByType: { [key: string]: string[] } = {};
          
          categoryList.forEach(cat => {
            const lower = cat.toLowerCase();
            let groupKey = 'ALL CATEGORIES';
            
            if (lower.includes('unstitched')) {
              groupKey = 'UNSTITCHED';
            } else if (lower.includes('pret') || lower.includes('ready')) {
              groupKey = 'READY TO WEAR';
            } else if (lower.includes('bridal') || lower.includes('wedding')) {
              groupKey = 'BRIDAL';
            } else if (lower.includes('jewel') || lower.includes('earring') || lower.includes('necklace') || lower.includes('bracelet')) {
              groupKey = 'JEWELLERY';
            } else if (lower.includes('new') || lower.includes('arrival')) {
              groupKey = 'NEW ARRIVALS';
            }
            
            if (!groupedByType[groupKey]) {
              groupedByType[groupKey] = [];
            }
            groupedByType[groupKey].push(cat);
          });
          
          // Convert grouped categories to MainCategory format
          Object.entries(groupedByType).forEach(([groupName, items]) => {
            grouped.push({
              name: groupName,
              items: items.map(item => ({
                label: item.toUpperCase(),
                href: `/collection/${item.toLowerCase().replace(/\s+/g, '-')}`
              }))
            });
          });
          
          // If no categories, use defaults
          if (grouped.length === 0) {
            setDynamicCategories(categories);
          } else {
            setDynamicCategories(grouped);
          }
        } else {
          // Fallback to hardcoded categories
          setDynamicCategories(categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to hardcoded categories
        setDynamicCategories(categories);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products for search suggestions only when query changes (with debounce)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch(`${API_BASE_URL}/api/products?search=${encodeURIComponent(searchQuery)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          let productsArray = [];
          if (Array.isArray(data)) {
            productsArray = data;
          } else if (data.products && Array.isArray(data.products)) {
            productsArray = data.products;
          }
          setProducts(productsArray);
        }
      } catch (error) {
        console.error('Failed to fetch search results:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }, 300); // Debounce for 300ms

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement> | React.FormEvent) => {
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: any) => {
    const productId = product.id || product._id;
    const productSlug = (product.name || 'product').toLowerCase().replace(/\s+/g, '-');
    navigate(`/product/${productId}/${productSlug}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const suggestions = products; // Already filtered + limited from API

  return (
    <>
      {/* Main Header */}
      <header className="sticky lg:top-0 -top-1 z-50 bg-[#e5d5be] border-b border-[#e8dfd5]">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-3 h-16 lg:h-20 px-3 lg:px-6">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2 flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Brand Logo */}
            <a href="/" className="hidden lg:flex flex-col items-center gap-0 flex-shrink-0 relative -mt-1">
              <div className="flex flex-col items-center overflow-hidden scale-95">
                <img 
                  src={logo}
                  alt="Hezal the Label Logo"
                  className="h-20 w-auto object-cover object-top"
                />
              </div>
            </a>

            {/* Desktop Navigation - Wardrobe Icon */}
            <nav className="hidden lg:flex items-center">
              <div 
                className="relative group"
                onMouseEnter={() => setWardrobeMenuOpen(true)}
                onMouseLeave={() => setWardrobeMenuOpen(false)}
              >
                <button 
                  className="p-2 hover:opacity-70 transition-opacity flex items-center gap-1"
                  aria-label="The Wardrobe"
                >
                  <span className="text-lg tracking-wider uppercase text-black font-medium">THE WARDROBE</span>
                  <WardrobeIcon />
                </button>
                
                {/* Dropdown Menu with Animation */}
                <div 
                  className={`absolute top-full left-0 mt-0 bg-background border border-border shadow-xl min-w-[800px] p-8 transition-all duration-300 origin-top-left ${
                    wardrobeMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                  }`}
                >
                  <div className="grid grid-cols-3 gap-8">
                    {dynamicCategories.map((category, idx) => (
                      <div key={category.name} className={`transform transition-all duration-300 ${wardrobeMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: `${idx * 50}ms` }}>
                        <h3 className="text-xs font-semibold tracking-[0.3em] uppercase mb-4 text-foreground">
                          {category.name}
                        </h3>
                        <ul className="space-y-3">
                          {category.items.map((item) => (
                            <li key={item.label}>
                              <a
                                href={item.href}
                                className="text-xs tracking-wider text-muted-foreground hover:text-foreground transition-all duration-200 relative inline-block group/item"
                              >
                                {item.label}
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-foreground group-hover/item:w-full transition-all duration-300"></span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Center Search Bar - Mobile and Desktop */}
          <div className="flex-1 mx-2">
            <form className="relative w-full" onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-black" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                  if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm border-2 border-black rounded-none bg-white text-black placeholder-[#9a9a9a] focus:outline-none"
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {suggestions.map((product) => (
                      <button
                        key={product.id || product._id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(product);
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors text-left"
                      >
                        {(product.image || product.imageUrl || product.imageUrls?.[0]) && (
                          <div className="flex-shrink-0 w-12 h-16 bg-muted rounded overflow-hidden">
                            <img
                              src={product.image || product.imageUrl || product.imageUrls?.[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground mb-1">{product.category || 'Uncategorized'}</p>
                          <p className="text-xs text-foreground font-semibold">£{(product.price || 0).toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            <a href="/wishlist" className="flex p-1 hover:opacity-70 transition-opacity relative" aria-label="Wishlist">
              <Heart size={24} strokeWidth={1.3} className="text-black" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-[#d47a52] transform translate-x-1/2 -translate-y-1/2 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </a>
            
            {/* My Orders Icon - Desktop */}
            {isLoggedIn && (
              <a href="/orders" className="hidden sm:flex p-1 hover:opacity-70 transition-opacity" aria-label="My Orders" title="My Orders">
                <Package size={24} strokeWidth={1.3} className="text-black" />
              </a>
            )}
            
            {/* Auth Buttons - Desktop */}
            {!isLoggedIn ? (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex px-3 lg:px-4 py-2 text-xs font-medium tracking-wider uppercase text-black hover:opacity-70 transition-opacity"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="hidden sm:flex px-3 lg:px-4 py-2 text-xs font-medium tracking-wider uppercase border border-black text-black hover:bg-black hover:text-[#ead9c5] transition-all"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <a href="/account" className="hidden sm:flex p-1 hover:opacity-70 transition-opacity" aria-label="Account">
                  <User size={24} strokeWidth={1.3} className="text-black" />
                </a>
                <button 
                  onClick={handleLogout}
                  className="hidden sm:flex p-1 hover:opacity-70 transition-opacity text-[#c85a54] hover:text-[#a84640]"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={24} strokeWidth={1.3} />
                </button>
              </>
            )}
            
            <MiniCart />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="lg:hidden fixed inset-0 top-16 bg-black/50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="lg:hidden fixed top-16 left-0 h-screen w-1/2 bg-background z-40 overflow-y-auto animate-slide-down border-r border-border">
            <nav className="px-6 py-6">
              {/* Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex justify-end mb-6 p-2 -mr-2"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>

              {/* Collections Section */}
              <div className="border-b border-border pb-6">
                <h2 className="text-sm tracking-wider uppercase font-semibold mb-4">COLLECTIONS</h2>
                {categories.map((category) => (
                  <div key={category.name} className="mb-6">
                    <h3 className="text-xs tracking-wider uppercase font-medium text-muted-foreground mb-3">
                      {category.name}
                    </h3>
                    <div className="pl-4 space-y-2">
                      {category.items.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Account Section */}
              <div className="flex flex-col gap-4 py-6">
                <a 
                  href="/wishlist" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium"
                >
                  <Heart size={18} strokeWidth={1.5} />
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-none text-white bg-foreground rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </a>
                {isLoggedIn ? (
                  <>
                    <a 
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-sm font-medium"
                    >
                      <Package size={18} strokeWidth={1.5} />
                      My Orders
                    </a>
                    <a 
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-sm font-medium"
                    >
                      <User size={18} strokeWidth={1.5} />
                      Account
                    </a>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 text-sm font-medium"
                    >
                      <User size={18} strokeWidth={1.5} />
                      Sign In
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/signup');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-xs font-medium tracking-wider uppercase border border-foreground hover:bg-foreground hover:text-background transition-all"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
    </>
  );
};

export default Header;
