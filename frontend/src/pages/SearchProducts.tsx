import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Filter, X, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/catalog/ProductCard';
import { API_BASE_URL } from '@/lib/api';

type FilterType = string;

const SearchProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [selectedCategory, setSelectedCategory] = useState<FilterType>('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSearchQuery(queryFromUrl);
  }, [queryFromUrl]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          timeout: 10000, // 10 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Fetched products:', data);
        
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          console.warn('Unexpected data format:', data);
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        // Normalize: trim, lowercase, and remove extra spaces
        const normalized = product.category
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' '); // Replace multiple spaces with single space
        if (normalized && normalized.length > 0) {
          uniqueCategories.add(normalized);
        }
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [products]);

  const filteredProducts = products
    .filter((product) => {
      // Ensure product has necessary fields
      if (!product || !product.name) return false;
      
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      const matchesPrice = 
        (product.price || 0) >= priceRange[0] && 
        (product.price || 0) <= priceRange[1];
      
      const matchesCategory = 
        selectedCategory === 'all' || 
        (product.category && product.category === selectedCategory);
      
      return matchesSearch && matchesPrice && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'newest':
          return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - 
                 (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-white to-[#f9f5f0]">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#ead9c5] to-[#f9f5f0] border-b border-[#e8dfd5] text-gray-900">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={24} className="text-amber-700" />
                <span className="text-amber-700 text-sm font-semibold tracking-[0.05em]">DISCOVER</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4 leading-tight tracking-tight">
                Find Your Perfect Piece
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Explore our curated collection of luxury fashion from top designers
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="container mx-auto px-4 -mt-6 relative z-10">
          <div className="bg-white rounded-xl shadow-lg p-1 border border-gray-100">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
              <Input
                type="text"
                placeholder="Search by designer, style, color..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 py-5 sm:py-6 text-base border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden w-full flex items-center justify-between bg-white rounded-lg p-4 mb-6 border border-gray-200 hover:border-purple-400 transition"
                >
                  <span className="flex items-center gap-2 font-semibold text-gray-900">
                    <Filter size={18} />
                    Filters
                  </span>
                  <ChevronDown
                    size={20}
                    className={`transform transition-transform ${
                      showFilters ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Filter Content */}
                <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
                  {/* Category Filter */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-purple-300 transition">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                      Category
                    </h4>
                    <div className="space-y-3">
                      {/* All Products Option */}
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                          selectedCategory === 'all'
                            ? 'bg-purple-50 border border-purple-300'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value="all"
                          checked={selectedCategory === 'all'}
                          onChange={() => {
                            setSelectedCategory('all');
                            if (isMobile) {
                              setShowFilters(false);
                            }
                          }}
                          className="w-4 h-4 accent-purple-600"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">All Products</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {products.length}
                        </span>
                      </label>

                      {/* Dynamic Categories from Database */}
                      {categories.length > 0 ? (
                        categories.map((cat) => {
                          const count = products.filter(p => p.category?.trim().toLowerCase() === cat).length;
                          const displayLabel = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ');
                          
                          return (
                            <label
                              key={cat}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                                selectedCategory === cat
                                  ? 'bg-purple-50 border border-purple-300'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="category"
                                value={cat}
                                checked={selectedCategory === cat}
                                onChange={() => {
                                  setSelectedCategory(cat);
                                  if (isMobile) {
                                    setShowFilters(false);
                                  }
                                }}
                                className="w-4 h-4 accent-purple-600"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">{displayLabel}</span>
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {count}
                              </span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No categories available</p>
                      )}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-purple-300 transition">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                      Price Range
                    </h4>
                    <div className="space-y-6">
                      {/* Price Display */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide">From</p>
                            <p className="text-2xl font-bold text-purple-600">£{priceRange[0]}</p>
                          </div>
                          <div className="text-gray-300 text-2xl">—</div>
                          <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide">To</p>
                            <p className="text-2xl font-bold text-pink-600">£{priceRange[1]}</p>
                          </div>
                        </div>
                      </div>

                      {/* Min Price Slider */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-3">
                          Minimum Price
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="10"
                          value={priceRange[0]}
                          onChange={(e) => {
                            const newMin = Number(e.target.value);
                            if (newMin <= priceRange[1]) {
                              setPriceRange([newMin, priceRange[1]]);
                            }
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-700 transition"
                          style={{
                            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(priceRange[0] / 5000) * 100}%, #e5e7eb ${(priceRange[0] / 5000) * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>£0</span>
                          <span>£5000</span>
                        </div>
                      </div>

                      {/* Max Price Slider */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-3">
                          Maximum Price
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="10"
                          value={priceRange[1]}
                          onChange={(e) => {
                            const newMax = Number(e.target.value);
                            if (newMax >= priceRange[0]) {
                              setPriceRange([priceRange[0], newMax]);
                            }
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600 hover:accent-pink-700 transition"
                          style={{
                            background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(priceRange[1] / 5000) * 100}%, #e5e7eb ${(priceRange[1] / 5000) * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>£0</span>
                          <span>£5000</span>
                        </div>
                      </div>

                      {/* Manual Input Fields */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Min (£)</label>
                          <Input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => {
                              const newMin = Number(e.target.value);
                              if (newMin <= priceRange[1]) {
                                setPriceRange([newMin, priceRange[1]]);
                              }
                            }}
                            className="border-gray-300 text-sm"
                            min="0"
                            max="5000"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Max (£)</label>
                          <Input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => {
                              const newMax = Number(e.target.value);
                              if (newMax >= priceRange[0]) {
                                setPriceRange([priceRange[0], newMax]);
                              }
                            }}
                            className="border-gray-300 text-sm"
                            min="0"
                            max="5000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-purple-300 transition">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                      Sort By
                    </h4>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  {(searchQuery || selectedCategory !== 'all' || sortBy !== 'relevance') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setPriceRange([0, 1000]);
                        setSelectedCategory('all');
                        setSortBy('relevance');
                      }}
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X size={16} className="mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="mb-8 flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">
                    {loading ? (
                      'Loading products...'
                    ) : (
                      <>
                        <span className="font-semibold text-gray-900">{filteredProducts.length}</span>
                        <span className="text-gray-600"> products found</span>
                        {searchQuery && <span className="text-purple-600"> for "{searchQuery}"</span>}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Products */}
              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">Loading your perfect pieces...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-12 text-center">
                  <p className="text-red-700 mb-4 font-semibold">{error}</p>
                  <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                    Try Again
                  </Button>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const productSlug = (product.name || 'product').toLowerCase().replace(/\s+/g, '-');
                    const productId = product.id || product._id;
                    
                    return (
                      <div
                        key={productId}
                        onClick={() => navigate(`/product/${productSlug}`)}
                        className="cursor-pointer group"
                      >
                        <div className="transition-all duration-300 hover:shadow-xl">
                          <ProductCard {...product} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-16 text-center border border-gray-200">
                  <div className="max-w-md mx-auto">
                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery
                        ? `We couldn't find anything matching "${searchQuery}"`
                        : 'Try adjusting your filters or search terms'}
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setPriceRange([0, 1000]);
                        setSelectedCategory('all');
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Browse All Products
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SearchProducts;
