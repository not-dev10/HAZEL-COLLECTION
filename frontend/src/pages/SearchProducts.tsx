import { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/catalog/ProductCard';
import { API_BASE_URL } from '@/lib/api';

type FilterType = 'all' | 'bridal' | 'pret' | 'unstitched' | 'ready-to-wear';

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
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        if (data.success && data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesPrice && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        default:
          return 0;
      }
    });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-2 sm:mb-4">Search Products</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Browse our complete collection of luxury fashion
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 sm:mb-8 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search for dresses, collections, styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-4 sm:py-6 text-sm sm:text-base h-11 sm:h-auto"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 max-h-[70vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
                <div className="flex items-center justify-between mb-6 lg:block">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden p-1 touch-target"
                  >
                    <ChevronDown
                      size={20}
                      className={`transform transition-transform ${
                        showFilters ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {(showFilters || !isMobile) && (
                  <div className="space-y-6 pb-4">
                    {/* Category Filter */}
                    <div>
                      <h4 className="font-medium mb-3">Category</h4>
                      <div className="space-y-2">
                        {[
                          { value: 'all' as FilterType, label: 'All Products' },
                          { value: 'bridal' as FilterType, label: 'Bridal' },
                          { value: 'pret' as FilterType, label: 'Pret' },
                          { value: 'unstitched' as FilterType, label: 'Unstitched' },
                          { value: 'ready-to-wear' as FilterType, label: 'Ready to Wear' },
                        ].map((cat) => (
                          <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="category"
                              value={cat.value}
                              checked={selectedCategory === cat.value}
                              onChange={() => {
                                setSelectedCategory(cat.value);
                                if (isMobile) {
                                  setShowFilters(false);
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{cat.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Filter */}
                    <div>
                      <h4 className="font-medium mb-3">Price Range</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-muted-foreground">Min</label>
                          <Input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) =>
                              setPriceRange([Number(e.target.value), priceRange[1]])
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Max</label>
                          <Input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) =>
                              setPriceRange([priceRange[0], Number(e.target.value)])
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        £{priceRange[0]} - £{priceRange[1]}
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <h4 className="font-medium mb-3">Sort By</h4>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full border border-border rounded px-3 py-2 text-sm"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="newest">Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setPriceRange([0, 1000]);
                        setSelectedCategory('all');
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} products found
                </p>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const productSlug = product.name.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <div
                        key={product.id}
                        onClick={() => navigate(`/product/${productSlug}`)}
                        className="cursor-pointer"
                      >
                        <ProductCard {...product} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No products found matching your search
                  </p>
                  <Button onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
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
