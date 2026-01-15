import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Loader2, Plus, Trash2, Edit2 } from 'lucide-react';

import { API_BASE_URL } from '@/lib/api';

export default function ProductAttributesPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showVariantForm, setShowVariantForm] = useState(false);

  const [variantForm, setVariantForm] = useState({
    sku: '',
    size: '',
    color: '',
    price: '',
    originalPrice: '',
    stock: ''
  });

  const [imagesForm, setImagesForm] = useState({
    main: '',
    alt1: '',
    alt2: '',
    alt3: '',
    thumbnail: '',
    swatch: ''
  });

  const [sizesList, setSizesList] = useState('');
  const [colorsList, setColorsList] = useState('');
  const [seoForm, setSeoForm] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    slug: ''
  });

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showMessage('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setVariantForm({ sku: '', size: '', color: '', price: '', originalPrice: '', stock: '' });
    setShowVariantForm(false);
  };

  const handleVariantFormChange = (e) => {
    const { name, value } = e.target;
    setVariantForm(prev => ({
      ...prev,
      [name]: name.includes('price') || name === 'stock' ? parseFloat(value) || '' : value
    }));
  };

  const handleImagesFormChange = (e) => {
    const { name, value } = e.target;
    setImagesForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setSeoForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createVariant = async () => {
    if (!selectedProduct) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/api/products-attributes/${selectedProduct._id}/variants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...variantForm,
          price: parseFloat(variantForm.price),
          originalPrice: parseFloat(variantForm.originalPrice),
          stock: parseInt(variantForm.stock)
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Variant created successfully');
        setVariantForm({ sku: '', size: '', color: '', price: '', originalPrice: '', stock: '' });
        setShowVariantForm(false);
        // Refresh product details
        await fetchProductDetails(selectedProduct._id);
      } else {
        showMessage(data.message || 'Failed to create variant', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error creating variant', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateProductImages = async () => {
    if (!selectedProduct) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/api/products-attributes/${selectedProduct._id}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(imagesForm)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Product images updated successfully');
        await fetchProductDetails(selectedProduct._id);
      } else {
        showMessage(data.message || 'Failed to update images', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error updating images', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateProductSizes = async () => {
    if (!selectedProduct) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      const sizes = sizesList.split(',').map(s => s.trim()).filter(s => s);
      
      const response = await fetch(`${API_BASE_URL}/api/products-attributes/${selectedProduct._id}/sizes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sizes })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Product sizes updated successfully');
        await fetchProductDetails(selectedProduct._id);
      } else {
        showMessage(data.message || 'Failed to update sizes', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error updating sizes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateProductColors = async () => {
    if (!selectedProduct) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      const colors = colorsList.split(',').map(c => c.trim()).filter(c => c);
      
      const response = await fetch(`${API_BASE_URL}/api/products-attributes/${selectedProduct._id}/colors`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ colors })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Product colors updated successfully');
        await fetchProductDetails(selectedProduct._id);
      } else {
        showMessage(data.message || 'Failed to update colors', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error updating colors', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSEO = async () => {
    if (!selectedProduct) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/api/products-attributes/${selectedProduct._id}/seo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(seoForm)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('SEO metadata updated successfully');
        await fetchProductDetails(selectedProduct._id);
      } else {
        showMessage(data.message || 'Failed to update SEO', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error updating SEO', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteVariant = async (variantId) => {
    if (!selectedProduct) return;
    
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/api/products-attributes/${selectedProduct._id}/variants/${variantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Variant deleted successfully');
        await fetchProductDetails(selectedProduct._id);
      } else {
        showMessage(data.message || 'Failed to delete variant', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error deleting variant', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fetchProductDetails = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedProduct(data.product);
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    }
  };

  if (loading && !selectedProduct) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Attributes Manager</h1>
        <p className="text-gray-600 mt-2">Manage variants, images, sizes, colors, and SEO for products</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-gray-500 text-sm">No products found</p>
                ) : (
                  products.map(product => (
                    <button
                      key={product._id}
                      onClick={() => handleProductSelect(product)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedProduct?._id === product._id
                          ? 'bg-purple-100 border-2 border-purple-600'
                          : 'bg-gray-50 border-2 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-600">SKU: {product.sku || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Price: {product.price}</p>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Details Editor */}
        <div className="lg:col-span-2">
          {selectedProduct ? (
            <Tabs defaultValue="variants" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="attributes">Attributes</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              {/* Variants Tab */}
              <TabsContent value="variants" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Product Variants</CardTitle>
                    <Button
                      onClick={() => setShowVariantForm(!showVariantForm)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Variant
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {showVariantForm && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3 border-2 border-gray-200">
                        <input
                          type="text"
                          name="sku"
                          value={variantForm.sku}
                          onChange={handleVariantFormChange}
                          placeholder="SKU (e.g., HTL-DRESS-001)"
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                        <input
                          type="text"
                          name="size"
                          value={variantForm.size}
                          onChange={handleVariantFormChange}
                          placeholder="Size (e.g., M)"
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                        <input
                          type="text"
                          name="color"
                          value={variantForm.color}
                          onChange={handleVariantFormChange}
                          placeholder="Color (e.g., Red)"
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                        <input
                          type="number"
                          name="price"
                          value={variantForm.price}
                          onChange={handleVariantFormChange}
                          placeholder="Price"
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                        <input
                          type="number"
                          name="originalPrice"
                          value={variantForm.originalPrice}
                          onChange={handleVariantFormChange}
                          placeholder="Original Price"
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                        <input
                          type="number"
                          name="stock"
                          value={variantForm.stock}
                          onChange={handleVariantFormChange}
                          placeholder="Stock Quantity"
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                        <Button
                          onClick={createVariant}
                          disabled={saving}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Create Variant
                        </Button>
                      </div>
                    )}

                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      <div className="space-y-2">
                        {selectedProduct.variants.map(variant => (
                          <div key={variant._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                            <div>
                              <p className="font-medium text-sm">{variant.size} - {variant.color}</p>
                              <p className="text-xs text-gray-600">SKU: {variant.sku}</p>
                              <p className="text-xs text-gray-600">Price: {variant.price} | Stock: {variant.stock}</p>
                            </div>
                            <button
                              onClick={() => deleteVariant(variant._id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No variants yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.keys(imagesForm).map(imageType => (
                      <div key={imageType}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {imageType} Image URL
                        </label>
                        <Input
                          type="url"
                          name={imageType}
                          value={imagesForm[imageType]}
                          onChange={handleImagesFormChange}
                          placeholder={`https://res.cloudinary.com/dknwcmcki/image/upload/didi-fashion/products/{productId}/${imageType}.jpg`}
                          className="w-full"
                        />
                      </div>
                    ))}

                    <Button
                      onClick={updateProductImages}
                      disabled={saving}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Update Images
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attributes Tab */}
              <TabsContent value="attributes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Attributes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Sizes (comma-separated)
                      </label>
                      <Input
                        type="text"
                        value={sizesList}
                        onChange={(e) => setSizesList(e.target.value)}
                        placeholder="XS, S, M, L, XL, 2XL"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {selectedProduct.sizes?.join(', ') || 'Not set'}
                      </p>
                      <Button
                        onClick={updateProductSizes}
                        disabled={saving}
                        className="w-full bg-purple-600 hover:bg-purple-700 mt-2"
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Update Sizes
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Colors (comma-separated)
                      </label>
                      <Input
                        type="text"
                        value={colorsList}
                        onChange={(e) => setColorsList(e.target.value)}
                        placeholder="Red, Blue, Green, Black, White, Gold"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {selectedProduct.colors?.join(', ') || 'Not set'}
                      </p>
                      <Button
                        onClick={updateProductColors}
                        disabled={saving}
                        className="w-full bg-purple-600 hover:bg-purple-700 mt-2"
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Update Colors
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Title
                      </label>
                      <Input
                        type="text"
                        name="metaTitle"
                        value={seoForm.metaTitle}
                        onChange={handleSeoChange}
                        placeholder="Page title for search engines"
                        maxLength="60"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">{seoForm.metaTitle.length}/60</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        name="metaDescription"
                        value={seoForm.metaDescription}
                        onChange={handleSeoChange}
                        placeholder="Page description for search engines"
                        maxLength="160"
                        rows="3"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">{seoForm.metaDescription.length}/160</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Keywords
                      </label>
                      <Input
                        type="text"
                        name="metaKeywords"
                        value={seoForm.metaKeywords}
                        onChange={handleSeoChange}
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL Slug
                      </label>
                      <Input
                        type="text"
                        name="slug"
                        value={seoForm.slug}
                        onChange={handleSeoChange}
                        placeholder="product-name-variant"
                        className="w-full"
                      />
                    </div>

                    <Button
                      onClick={updateSEO}
                      disabled={saving}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save SEO Metadata
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500 text-center">Select a product from the left to edit its attributes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

