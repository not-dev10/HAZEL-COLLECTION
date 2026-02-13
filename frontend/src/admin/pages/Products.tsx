import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Upload, Search, Download, Filter, X, Check, AlertCircle, Loader } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TokenManager from '@/utils/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Product {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  productId?: string;
  sku?: string;
  status?: string;
  lastUpdated?: string;
  image?: string;
  images?: string[];
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched products:', data);

        // Map API response to Product interface
        const mappedProducts = (data.products || []).map((p: any) => ({
          id: p._id || p.id,
          _id: p._id,
          name: p.name,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice,
          stock: p.stock || 0,
          category: p.category,
          isActive: p.isActive !== false,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          productId: p.productId,
          image: p.image,
          images: p.images || [],
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: '', description: '', images: [] as File[] });
  const [editProduct, setEditProduct] = useState({ name: '', price: '', stock: '', category: '', description: '', editImages: [] as File[], currentImages: [] as string[], originalImageOrder: [] as string[] });
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSavingProductId('new');
      const token = TokenManager.getAccessToken();
      if (!token) {
        alert('Admin authentication required. Please log in again.');
        setSavingProductId(null);
        return;
      }
      
      // First create the product
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          category: newProduct.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      const data = await response.json();
      const productId = data.product._id || data.product.id;

      // Then upload images if any
      if (newProduct.images && newProduct.images.length > 0) {
        setUploadingImages(true);
        try {
          // Convert files to data URLs properly with Promise.all
          const imageDataPromises = newProduct.images.map((file) => {
            return new Promise<{ url: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({ url: reader.result as string });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          });

          const imageData = await Promise.all(imageDataPromises);

          const uploadResponse = await fetch(`${API_BASE_URL}/api/upload/product-images`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId,
              images: imageData
            }),
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}));
            console.warn('Warning: Failed to upload images:', errorData);
          } else {
            console.log('✅ Images uploaded successfully');
          }
        } catch (error) {
          console.warn('Warning: Image upload failed:', error);
        } finally {
          setUploadingImages(false);
        }
      }

      const newProd = {
        id: data.product._id || data.product.id,
        _id: data.product._id,
        name: data.product.name,
        description: data.product.description,
        price: data.product.price,
        stock: data.product.stock,
        category: data.product.category,
        isActive: true,
      };

      setProducts([...products, newProd]);
      setNewProduct({ name: '', price: '', stock: '', category: '', description: '', images: [] });
      setShowSuccessMsg(true);
      setTimeout(() => setShowSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product');
    } finally {
      setSavingProductId(null);
    }
  };

  const handleEditProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const currentImages = product.images || [];
      setEditProduct({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        description: product.description || '',
        editImages: [],
        currentImages: currentImages,
        originalImageOrder: [...currentImages],
      });
      setEditingId(id);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      setSavingProductId(editingId);
      const token = TokenManager.getAccessToken();
      console.log('🔐 Admin token:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
      
      if (!token) {
        alert('Admin authentication required. Please log in again.');
        setSavingProductId(null);
        return;
      }
      
      console.log('📤 Updating product:', editingId, editProduct);
      const response = await fetch(`${API_BASE_URL}/api/products/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editProduct.name,
          description: editProduct.description,
          price: parseFloat(editProduct.price),
          stock: parseInt(editProduct.stock),
          category: editProduct.category,
        }),
      });

      console.log('📥 Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Update failed:', errorData);
        throw new Error(errorData.message || 'Failed to update product');
      }

      const data = await response.json();
      
      // Upload images if any new ones were selected
      if (editProduct.editImages && editProduct.editImages.length > 0) {
        setUploadingImages(true);
        try {
          // Convert files to compressed data URLs with canvas
          const imageDataPromises = editProduct.editImages.map((file) => {
            return new Promise<{ url: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                  // Create canvas and compress image
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                  }
                  
                  // Calculate dimensions (max 1200px, maintain aspect ratio)
                  let width = img.width;
                  let height = img.height;
                  const maxDim = 1200;
                  
                  if (width > height) {
                    if (width > maxDim) {
                      height = Math.round((height * maxDim) / width);
                      width = maxDim;
                    }
                  } else {
                    if (height > maxDim) {
                      width = Math.round((width * maxDim) / height);
                      height = maxDim;
                    }
                  }
                  
                  canvas.width = width;
                  canvas.height = height;
                  ctx.drawImage(img, 0, 0, width, height);
                  
                  // Convert to compressed JPEG (quality 0.75)
                  const compressedUrl = canvas.toDataURL('image/jpeg', 0.75);
                  resolve({ url: compressedUrl });
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = reader.result as string;
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          });

          const imageData = await Promise.all(imageDataPromises);
          
          // Log compression info
          console.log(`✅ Compressed ${imageData.length} images for upload`);
          console.log('Image data being sent:', imageData.map((img, i) => ({
            index: i,
            urlLength: img.url.length,
            urlStart: img.url.substring(0, 100),
            type: typeof img.url
          })));

          const uploadResponse = await fetch(`${API_BASE_URL}/api/upload/product-images`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: editingId,
              images: imageData
            }),
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}));
            console.warn('❌ Image upload failed:', {
              status: uploadResponse.status,
              errorData,
              sentImageCount: imageData.length,
              imageDetails: imageData.map(img => ({
                urlLength: img.url.length,
                urlStart: img.url.substring(0, 100)
              }))
            });
            alert('Warning: Failed to upload some images. Product details were updated.');
          } else {
            const uploadResult = await uploadResponse.json();
            console.log('✅ Images uploaded successfully:', uploadResult);
            
            // Update the product in state with new images from the response
            if (uploadResult.data && uploadResult.data.product) {
              const updatedProductData = uploadResult.data.product;
              console.log('📸 Updated product images:', updatedProductData.images);
              
              setProducts(products.map(p =>
                p.id === editingId
                  ? {
                      ...p,
                      image: updatedProductData.image,
                      images: updatedProductData.images,
                    }
                  : p
              ));
              
              // Also update the current edit form to show the new images
              setEditProduct(prev => ({
                ...prev,
                currentImages: updatedProductData.images || []
              }));
            }
          }
        } catch (error) {
          console.error('Image upload error:', error);
          alert('Warning: Image upload failed. Product details were updated.');
        } finally {
          setUploadingImages(false);
        }
      }

      // Check if images have been reordered
      if (editProduct.currentImages.length > 0 && 
          editProduct.originalImageOrder.length > 0 &&
          JSON.stringify(editProduct.currentImages) !== JSON.stringify(editProduct.originalImageOrder)) {
        console.log('🔄 Image order has changed, sending reorder request...');
        try {
          // Create an array of indices representing the new order
          const imageOrder = editProduct.currentImages.map(imgUrl => 
            editProduct.originalImageOrder.indexOf(imgUrl)
          ).filter(idx => idx !== -1);

          const reorderResponse = await fetch(`${API_BASE_URL}/api/upload/product-images/reorder/${editingId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ imageOrder }),
          });

          if (!reorderResponse.ok) {
            const errorData = await reorderResponse.json().catch(() => ({ message: 'Unknown error' }));
            console.error('❌ Reorder failed:', errorData);
          } else {
            const reorderData = await reorderResponse.json();
            console.log('✅ Images reordered successfully:', reorderData);
            
            // Update the product with reordered images
            if (reorderData.product) {
              setProducts(products.map(p =>
                p.id === editingId
                  ? {
                      ...p,
                      images: reorderData.product.images,
                      image: reorderData.product.image,
                    }
                  : p
              ));
            }
          }
        } catch (error) {
          console.error('Reorder request failed:', error);
        }
      }

      setProducts(products.map(p =>
        p.id === editingId
          ? {
              ...p,
              name: data.product.name,
              description: data.product.description,
              price: data.product.price,
              stock: data.product.stock,
              category: data.product.category,
            }
          : p
      ));
      setEditingId(null);
      setEditDialogOpen(false);
      setShowSuccessMsg(true);
      setTimeout(() => setShowSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product');
    } finally {
      setSavingProductId(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      setSavingProductId(id);
      const token = TokenManager.getAccessToken();
      if (!token) {
        alert('Admin authentication required. Please log in again.');
        setSavingProductId(null);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter(p => p.id !== id));
      setShowSuccessMsg(true);
      setTimeout(() => setShowSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    } finally {
      setSavingProductId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('Select products to delete');
      return;
    }
    if (!window.confirm(`Delete ${selectedProducts.length} products?`)) return;

    try {
      // Delete products one by one
      for (const id of selectedProducts) {
        setSavingProductId(id);
        const token = TokenManager.getAccessToken();
        if (!token) {
          alert('Admin authentication required. Please log in again.');
          setSavingProductId(null);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to delete product ${id}`);
        }
      }

      setProducts(products.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
      setShowSuccessMsg(true);
      setTimeout(() => setShowSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Error deleting products:', err);
      alert('Failed to delete some products');
    } finally {
      setSavingProductId(null);
    }
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    if (selectedProducts.length === 0) {
      alert('Select products first');
      return;
    }

    try {
      for (const id of selectedProducts) {
        setSavingProductId(id);
        const product = products.find(p => p.id === id);
        if (!product) continue;

        const token = TokenManager.getAccessToken();
        if (!token) {
          alert('Admin authentication required. Please log in again.');
          setSavingProductId(null);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            isActive,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update product ${id}`);
        }
      }

      setProducts(products.map(p =>
        selectedProducts.includes(p.id) ? { ...p, isActive } : p
      ));
      setSelectedProducts([]);
      setShowSuccessMsg(true);
      setTimeout(() => setShowSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Error updating products:', err);
      alert('Failed to update some products');
    } finally {
      setSavingProductId(null);
    }
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').slice(1); // Skip header
        const newProducts: Product[] = [];
        
        lines.forEach((line, idx) => {
          if (!line.trim()) return;
          const [name, sku, price, stock, category] = line.split(',').map(s => s.trim());
          newProducts.push({
            id: `import-${idx}`,
            name,
            sku,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            status: 'active',
            lastUpdated: new Date().toISOString().split('T')[0],
          });
        });
        
        setProducts([...products, ...newProducts]);
        alert(`Successfully imported ${newProducts.length} products!`);
      };
      reader.readAsText(file);
    }
  };

  const handleExportCSV = () => {
    const csv = 'name,sku,price,stock,category\n' + 
      products.map(p => `${p.name},${p.sku},${p.price},${p.stock},${p.category}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Products Management</h2>
        <p className="text-gray-600 mt-1">Manage your product catalog with bulk operations.</p>
      </div>

      {/* Success Message */}
      {showSuccessMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Check size={20} className="text-green-600" />
          <p className="text-green-800 font-medium">Operation completed successfully!</p>
        </div>
      )}

      {/* Sync Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-900 font-medium">📦 Synced with Inventory</p>
          <p className="text-blue-700 text-sm">Stock levels are automatically synced between Products and Inventory. Update stock here or in the Inventory panel.</p>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Action Buttons */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus size={18} className="mr-2" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Fill in the product details and upload images.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }}>
                  <Input
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                  <Input
                    placeholder="Stock Quantity"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  />
                  <Input
                    placeholder="Category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                  
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Upload Images</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setNewProduct({ ...newProduct, images: Array.from(e.target.files || []) })}
                        className="hidden"
                        id="product-images"
                      />
                      <label htmlFor="product-images" className="cursor-pointer">
                        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                        <p className="text-sm text-gray-600">Click to upload images</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                      </label>
                    </div>
                    {newProduct.images.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">{newProduct.images.length} image(s) selected</p>
                        <p className="text-xs text-gray-500">💡 Drag to reorder images</p>
                        <div className="grid grid-cols-3 gap-2">
                          {newProduct.images.map((file, idx) => (
                            <div 
                              key={idx} 
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer!.effectAllowed = 'move';
                                e.dataTransfer!.setData('text/plain', idx.toString());
                                (e.currentTarget as HTMLElement).style.opacity = '0.5';
                              }}
                              onDragEnd={(e) => {
                                (e.currentTarget as HTMLElement).style.opacity = '1';
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer!.dropEffect = 'move';
                                (e.currentTarget as HTMLElement).classList.add('border-2', 'border-purple-500', 'rounded');
                              }}
                              onDragLeave={(e) => {
                                (e.currentTarget as HTMLElement).classList.remove('border-2', 'border-purple-500', 'rounded');
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const dragIndex = parseInt(e.dataTransfer!.getData('text/plain'));
                                if (dragIndex !== idx) {
                                  const newImages = [...newProduct.images];
                                  [newImages[dragIndex], newImages[idx]] = [newImages[idx], newImages[dragIndex]];
                                  setNewProduct({ ...newProduct, images: newImages });
                                }
                                (e.currentTarget as HTMLElement).classList.remove('border-2', 'border-purple-500', 'rounded');
                              }}
                              className="relative group cursor-move bg-gray-50 rounded border border-dashed border-gray-300"
                            >
                              <img 
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${idx}`}
                                className="w-full h-20 object-cover rounded pointer-events-none"
                              />
                              <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                                #{idx + 1}
                              </div>
                              <button
                                type="button"
                                onClick={() => setNewProduct({ ...newProduct, images: newProduct.images.filter((_, i) => i !== idx) })}
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    disabled={savingProductId === 'new' || uploadingImages}
                  >
                    {savingProductId === 'new' || uploadingImages ? <Loader size={18} className="mr-2 animate-spin" /> : <Plus size={18} className="mr-2" />}
                    {uploadingImages ? 'Uploading Images...' : 'Add Product'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Import CSV */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Upload size={18} className="mr-2" /> Import CSV
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Bulk Import Products</SheetTitle>
                  <SheetDescription>
                    Upload a CSV file to import multiple products at once.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImportCSV}
                      className="hidden"
                      id="csv-import"
                    />
                    <label htmlFor="csv-import" className="cursor-pointer block">
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-medium">Click to upload CSV</p>
                      <p className="text-xs text-gray-500">or drag and drop</p>
                    </label>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">CSV Format:</h4>
                    <pre className="text-xs whitespace-pre-wrap overflow-auto">
name,sku,price,stock,category
Summer Dress,SD-001,49.99,45,Dresses
                    </pre>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" onClick={handleExportCSV}>
              <Download size={18} className="mr-2" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">{selectedProducts.length} products selected</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange(true)}
                >
                  Mark Active
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange(false)}
                >
                  Mark Inactive
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `${filteredProducts.length} of ${products.length} products`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size={32} className="text-purple-600 animate-spin mr-3" />
              <p>Loading products...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts(filteredProducts.map(p => p.id));
                          } else {
                            setSelectedProducts([]);
                          }
                        }}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.id]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                            }
                          }}
                          className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      {product.image || (product.images && product.images[0]) ? (
                        <img 
                          key={`${product.id}-${product.images?.join(',')}`}
                          src={`${product.image || product.images![0]}?t=${Date.now()}`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded border border-gray-200"
                          onError={(e) => {
                            console.warn(`Failed to load image for ${product.name}`, e.currentTarget.src);
                            e.currentTarget.src = 'https://via.placeholder.com/50?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-semibold">£{product.price}</TableCell>
                    <TableCell>
                      <span className={product.stock < 10 ? 'text-red-600 font-semibold' : ''}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={editDialogOpen && editingId === product.id} onOpenChange={(open) => {
                          if (!open) {
                            setEditDialogOpen(false);
                            setEditingId(null);
                          } else {
                            handleEditProduct(product.id);
                            setEditDialogOpen(true);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                handleEditProduct(product.id);
                                setEditDialogOpen(true);
                              }}
                              disabled={savingProductId === product.id}
                            >
                              <Edit2 size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                            </DialogHeader>
                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                              <Input
                                placeholder="Product Name"
                                value={editProduct.name}
                                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                              />
                              <Input
                                placeholder="Description"
                                value={editProduct.description}
                                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                              />
                              <Input
                                placeholder="Price"
                                type="number"
                                step="0.01"
                                value={editProduct.price}
                                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                              />
                              <Input
                                placeholder="Stock Quantity"
                                type="number"
                                value={editProduct.stock}
                                onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                              />
                              <Input
                                placeholder="Category"
                                value={editProduct.category}
                                onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                              />

                              {/* Image Upload Section */}
                              <div className="space-y-2 border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700">Product Images</label>
                                
                                {/* Current Images Display */}
                                {editProduct.currentImages && editProduct.currentImages.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-xs text-gray-600 mb-2">Current Images ({editProduct.currentImages.length})</p>
                                    <p className="text-xs text-gray-500 mb-2">💡 Drag to reorder existing images</p>
                                    <div className="grid grid-cols-3 gap-2">
                                      {editProduct.currentImages.map((imageUrl, idx) => (
                                        <div 
                                          key={`current-${idx}`}
                                          draggable
                                          onDragStart={(e) => {
                                            e.dataTransfer!.effectAllowed = 'move';
                                            e.dataTransfer!.setData('text/plain', `current-${idx}`);
                                            (e.currentTarget as HTMLElement).style.opacity = '0.5';
                                          }}
                                          onDragEnd={(e) => {
                                            (e.currentTarget as HTMLElement).style.opacity = '1';
                                          }}
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer!.dropEffect = 'move';
                                            (e.currentTarget as HTMLElement).classList.add('border-2', 'border-blue-500');
                                          }}
                                          onDragLeave={(e) => {
                                            (e.currentTarget as HTMLElement).classList.remove('border-2', 'border-blue-500');
                                          }}
                                          onDrop={(e) => {
                                            e.preventDefault();
                                            const dragSource = e.dataTransfer!.getData('text/plain');
                                            if (dragSource.startsWith('current-')) {
                                              const dragIndex = parseInt(dragSource.split('-')[1]);
                                              if (dragIndex !== idx) {
                                                const newImages = [...editProduct.currentImages];
                                                [newImages[dragIndex], newImages[idx]] = [newImages[idx], newImages[dragIndex]];
                                                setEditProduct({ ...editProduct, currentImages: newImages });
                                              }
                                            }
                                            (e.currentTarget as HTMLElement).classList.remove('border-2', 'border-blue-500');
                                          }}
                                          className="relative group cursor-move bg-gray-50 rounded border border-gray-200"
                                        >
                                          <img 
                                            src={imageUrl}
                                            alt={`Current ${idx}`}
                                            className="w-full h-20 object-cover rounded pointer-events-none"
                                            onError={(e) => {
                                              console.error(`❌ Failed to load image ${idx}:`, imageUrl);
                                              e.currentTarget.src = 'https://via.placeholder.com/150?text=Image+Error';
                                            }}
                                            onLoad={() => {
                                              console.log(`✅ Image ${idx} loaded:`, imageUrl.substring(0, 80));
                                            }}
                                          />
                                          <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                                            #{idx + 1}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Upload New Images */}
                                <label className="block text-sm font-medium text-gray-700">Upload New Images (will replace existing)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setEditProduct({ ...editProduct, editImages: Array.from(e.target.files || []) })}
                                    className="hidden"
                                    id="edit-product-images"
                                  />
                                  <label htmlFor="edit-product-images" className="cursor-pointer">
                                    <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                                    <p className="text-sm text-gray-600">Click to upload new images</p>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                                  </label>
                                </div>
                                {editProduct.editImages.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-green-700">{editProduct.editImages.length} new image(s) selected</p>
                                    <p className="text-xs text-gray-500">💡 Drag to reorder new images</p>
                                    <div className="grid grid-cols-3 gap-2">
                                      {editProduct.editImages.map((file, idx) => (
                                        <div 
                                          key={idx} 
                                          draggable
                                          onDragStart={(e) => {
                                            e.dataTransfer!.effectAllowed = 'move';
                                            e.dataTransfer!.setData('text/plain', idx.toString());
                                            (e.currentTarget as HTMLElement).style.opacity = '0.5';
                                          }}
                                          onDragEnd={(e) => {
                                            (e.currentTarget as HTMLElement).style.opacity = '1';
                                          }}
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer!.dropEffect = 'move';
                                            (e.currentTarget as HTMLElement).classList.add('border-2', 'border-green-500');
                                          }}
                                          onDragLeave={(e) => {
                                            (e.currentTarget as HTMLElement).classList.remove('border-2', 'border-green-500');
                                          }}
                                          onDrop={(e) => {
                                            e.preventDefault();
                                            const dragIndex = parseInt(e.dataTransfer!.getData('text/plain'));
                                            if (dragIndex !== idx) {
                                              const newImages = [...editProduct.editImages];
                                              [newImages[dragIndex], newImages[idx]] = [newImages[idx], newImages[dragIndex]];
                                              setEditProduct({ ...editProduct, editImages: newImages });
                                            }
                                            (e.currentTarget as HTMLElement).classList.remove('border-2', 'border-green-500');
                                          }}
                                          className="relative group cursor-move bg-gray-50 rounded border-2 border-green-500"
                                        >
                                          <img 
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${idx}`}
                                            className="w-full h-20 object-cover rounded pointer-events-none"
                                          />
                                          <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                                            New #{idx + 1}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setEditProduct({ ...editProduct, editImages: editProduct.editImages.filter((_, i) => i !== idx) })}
                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <p className="text-xs text-amber-600">⚠️ Uploading new images will replace all existing images</p>
                              </div>

                              <Button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                                disabled={savingProductId === editingId || uploadingImages}
                              >
                                {savingProductId === editingId || uploadingImages ? <Loader size={18} className="mr-2 animate-spin" /> : <Check size={18} className="mr-2" />}
                                {uploadingImages ? 'Uploading Images...' : 'Save Changes'}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={savingProductId === product.id}
                        >
                          {savingProductId === product.id ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
