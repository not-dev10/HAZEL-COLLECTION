import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Upload, Search, Download, X, Check, AlertCircle, Loader, TrendingDown, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TokenManager from '@/utils/tokenManager';
import { ColorSizeManager } from '../components/ColorSizeManager';

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
  variants?: Array<{
    id: string;
    color: string;
    colorCode: string;
    sizes: Array<{ size: string; stock: number }>;
  }>;
}

interface InventoryItem {
  id: string;
  _id?: string;
  productName: string;
  name?: string;
  category: string;
  currentStock: number;
  stock?: number;
  reorderLevel?: number;
  maxStock?: number;
  warehouseLocation?: string;
  lastRestocked?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  price?: number;
  description?: string;
  image?: string;
  images?: string[];
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all-products'); // Tab state

  // Inventory-specific state
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [inventoryEditingId, setInventoryEditingId] = useState<string | null>(null);
  const [inventoryEditDialog, setInventoryEditDialog] = useState(false);
  const [inventoryEditItem, setInventoryEditItem] = useState({ currentStock: 0, reorderLevel: 20, maxStock: 100, editImages: [] as File[], currentImages: [] as string[], originalImageOrder: [] as string[], uploadingImages: false });

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
          variants: p.variants || [],
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
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: '', description: '', images: [] as File[], variants: [] as any[], sizeReferenceImage: null as File | null });
  const [editProduct, setEditProduct] = useState({ name: '', price: '', stock: '', category: '', description: '', editImages: [] as File[], currentImages: [] as string[], originalImageOrder: [] as string[], variants: [] as any[], sizeReferenceImage: null as string | null, editSizeReferenceImage: null as File | null });
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Convert products to inventory items for stock management tab
  const inventoryItems: InventoryItem[] = products.map((p: any) => {
    const stock = p.stock || 0;
    let status: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
    const reorderLevel = 20; // Default reorder level
    const maxStock = stock * 2; // Default max stock

    if (stock === 0) status = 'out-of-stock';
    else if (stock < reorderLevel) status = 'low-stock';

    return {
      id: p.productId || p._id || p.id,
      _id: p._id,
      productId: p.productId,
      productName: p.name,
      name: p.name,
      category: p.category || 'General',
      currentStock: stock,
      stock: stock,
      reorderLevel,
      maxStock,
      warehouseLocation: 'TBD',
      lastRestocked: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status,
      price: p.price,
      description: p.description,
      image: p.image,
      images: p.images,
    };
  });

  const filteredInventory = inventoryItems.filter(item =>
    (item.productName.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(inventorySearchTerm.toLowerCase()))) &&
    (!filterStatus || item.status === filterStatus)
  );

  const inventoryStats = {
    totalItems: inventoryItems.reduce((sum, item) => sum + item.currentStock, 0),
    lowStock: inventoryItems.filter(item => item.status === 'low-stock').length,
    outOfStock: inventoryItems.filter(item => item.status === 'out-of-stock').length,
    totalProducts: inventoryItems.length,
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.stock) {
      alert('Please fill all required fields: Name, Price, Category, Stock');
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
          variants: newProduct.variants,
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

      // Upload size reference image if provided
      if (newProduct.sizeReferenceImage) {
        try {
          console.log('📤 Uploading size reference image...');
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const sizeRefResponse = await fetch(`${API_BASE_URL}/api/upload/size-reference-image/${productId}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  image: reader.result as string
                }),
              });

              if (!sizeRefResponse.ok) {
                const errorData = await sizeRefResponse.json().catch(() => ({}));
                console.warn('⚠️ Size reference image upload failed:', errorData);
              } else {
                const sizeRefData = await sizeRefResponse.json();
                console.log('✅ Size reference image uploaded successfully:', sizeRefData);
              }
            } catch (error) {
              console.error('Size reference upload error:', error);
            }
          };
          reader.readAsDataURL(newProduct.sizeReferenceImage);
        } catch (error) {
          console.error('Error preparing size reference image:', error);
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
        variants: data.product.variants || [],
      };

      setProducts([...products, newProd]);
      setNewProduct({ name: '', price: '', stock: '', category: '', description: '', images: [], variants: [], sizeReferenceImage: null });
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
        variants: product.variants || [],
        sizeReferenceImage: null,
        editSizeReferenceImage: null,
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
          variants: editProduct.variants,
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

      // Upload size reference image if a new one was selected
      if (editProduct.editSizeReferenceImage) {
        try {
          console.log('📤 Uploading size reference image...');
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const sizeRefResponse = await fetch(`${API_BASE_URL}/api/upload/size-reference-image/${editingId}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  image: reader.result as string
                }),
              });

              if (!sizeRefResponse.ok) {
                const errorData = await sizeRefResponse.json().catch(() => ({}));
                console.warn('⚠️ Size reference image upload failed:', errorData);
              } else {
                const sizeRefData = await sizeRefResponse.json();
                console.log('✅ Size reference image uploaded successfully:', sizeRefData);
              }
            } catch (error) {
              console.error('Size reference upload error:', error);
            }
          };
          reader.readAsDataURL(editProduct.editSizeReferenceImage);
        } catch (error) {
          console.error('Error preparing size reference image:', error);
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
              variants: data.product.variants || [],
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

  // Inventory-specific handlers
  const handleInventoryUpdateStock = async (id: string, newStock: number) => {
    try {
      setSavingProductId(id);
      const item = inventoryItems.find(i => i.id === id);
      if (!item) return;

      console.log('🔄 Updating stock for product:', item.productId || id);
      console.log('📊 New stock value:', newStock);

      const productIdToUse = item.productId || id;
      
      const response = await fetch(`${API_BASE_URL}/api/products-attributes/${productIdToUse}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TokenManager.getAccessToken()}`,
        },
        body: JSON.stringify({
          quantity: newStock,
        }),
      });

      console.log('📨 Stock update response status:', response.status);
      const data = await response.json();
      console.log('📦 Stock update response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update stock');
      }

      // Update products state with new stock
      setProducts(products.map(p =>
        (p.id === id || p.productId === id) ? { ...p, stock: newStock } : p
      ));
      console.log('✅ Stock updated successfully');
    } catch (err) {
      console.error('❌ Error updating stock:', err);
      alert('Failed to update stock: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSavingProductId(null);
    }
  };

  const handleInventoryEditItem = (item: InventoryItem) => {
    const currentImages = item.images || (item.image ? [item.image] : []);
    setInventoryEditItem({
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel || 20,
      maxStock: item.maxStock || 100,
      editImages: [],
      currentImages: currentImages,
      originalImageOrder: [...currentImages],
      uploadingImages: false,
    });
    setInventoryEditingId(item.id);
    setInventoryEditDialog(true);
  };

  const handleInventorySaveEdit = async () => {
    if (!inventoryEditingId) return;

    try {
      setSavingProductId(inventoryEditingId);
      const token = TokenManager.getAccessToken();
      if (!token) {
        alert('Admin authentication required. Please log in again.');
        setSavingProductId(null);
        return;
      }

      const item = inventoryItems.find(i => i.id === inventoryEditingId);
      if (!item) return;

      // Update stock via API
      await fetch(`${API_BASE_URL}/api/products-attributes/${inventoryEditingId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: inventoryEditItem.currentStock,
        }),
      });

      // Upload images if any new ones were selected
      if (inventoryEditItem.editImages && inventoryEditItem.editImages.length > 0) {
        setInventoryEditItem(prev => ({ ...prev, uploadingImages: true }));
        try {
          const imageDataPromises = inventoryEditItem.editImages.map((file) => {
            return new Promise<{ url: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                  }

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

          const uploadResponse = await fetch(`${API_BASE_URL}/api/upload/product-images`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: inventoryEditingId,
              images: imageData,
            }),
          });

          if (!uploadResponse.ok) {
            console.warn('Image upload failed but inventory updated');
          } else {
            const uploadResult = await uploadResponse.json();
            if (uploadResult.data && uploadResult.data.product) {
              const updatedProductData = uploadResult.data.product;
              
              setProducts(products.map(p =>
                (p.id === inventoryEditingId || p.productId === inventoryEditingId)
                  ? {
                      ...p,
                      image: updatedProductData.image,
                      images: updatedProductData.images,
                      stock: inventoryEditItem.currentStock,
                    }
                  : p
              ));
            }
          }
        } catch (error) {
          console.error('Image upload error:', error);
        } finally {
          setInventoryEditItem(prev => ({ ...prev, uploadingImages: false }));
        }
      }

      // Check if images have been reordered
      if (inventoryEditItem.currentImages.length > 0 && 
          inventoryEditItem.originalImageOrder.length > 0 &&
          JSON.stringify(inventoryEditItem.currentImages) !== JSON.stringify(inventoryEditItem.originalImageOrder)) {
        console.log('🔄 Image order has changed, sending reorder request...');
        try {
          const imageOrder = inventoryEditItem.currentImages.map(imgUrl => 
            inventoryEditItem.originalImageOrder.indexOf(imgUrl)
          ).filter(idx => idx !== -1);

          const reorderResponse = await fetch(`${API_BASE_URL}/api/upload/product-images/reorder/${inventoryEditingId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ imageOrder }),
          });

          if (!reorderResponse.ok) {
            console.error('❌ Reorder failed');
          } else {
            const reorderData = await reorderResponse.json();
            console.log('✅ Images reordered successfully');
            
            if (reorderData.product) {
              setProducts(products.map(p =>
                (p.id === inventoryEditingId || p.productId === inventoryEditingId)
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
      } else {
        setProducts(products.map(p =>
          (p.id === inventoryEditingId || p.productId === inventoryEditingId)
            ? {
                ...p,
                stock: inventoryEditItem.currentStock,
              }
            : p
        ));
      }

      setInventoryEditingId(null);
      setInventoryEditDialog(false);
    } catch (err) {
      console.error('Error updating inventory:', err);
      alert('Failed to update inventory');
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
        <h2 className="text-3xl font-bold text-gray-900">Products & Inventory</h2>
        <p className="text-gray-600 mt-1">Manage your product catalog and stock levels.</p>
      </div>

      {/* Success Message */}
      {showSuccessMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Check size={20} className="text-green-600" />
          <p className="text-green-800 font-medium">Operation completed successfully!</p>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-products">All Products</TabsTrigger>
          <TabsTrigger value="stock-management">Stock Management</TabsTrigger>
        </TabsList>

        {/* TAB 1: ALL PRODUCTS */}
        <TabsContent value="all-products" className="space-y-6 mt-6">

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
                  
                  {/* Category Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <Input
                      placeholder="e.g., Dresses, Tops, Bottoms, Accessories"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value.trim() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Stock Quantity */}
                  <Input
                    placeholder="Stock Quantity"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  />
                  
                  {/* Info Box */}
                  {newProduct.variants.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-blue-900">
                        <strong>ℹ️ Stock Management:</strong> Stock is managed through the variant manager below. Overall stock is calculated as the sum of all variant sizes.
                      </p>
                    </div>
                  )}
                  
                  {/* Color & Size Manager */}
                  <ColorSizeManager
                    variants={newProduct.variants}
                    onVariantsChange={(variants) => setNewProduct({ ...newProduct, variants })}
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
                  
                  {/* Size Reference Image */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Size Reference Image</label>
                    <p className="text-xs text-gray-500">Upload a size chart/reference image (no cropping, original size)</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewProduct({ ...newProduct, sizeReferenceImage: e.target.files?.[0] || null })}
                        className="hidden"
                        id="size-reference-image"
                      />
                      <label htmlFor="size-reference-image" className="cursor-pointer">
                        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                        <p className="text-sm text-gray-600">Click to upload size reference</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </label>
                    </div>
                    {newProduct.sizeReferenceImage && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Selected: {newProduct.sizeReferenceImage.name}</p>
                        <img 
                          src={URL.createObjectURL(newProduct.sizeReferenceImage)}
                          alt="Size Reference Preview"
                          className="w-full max-h-48 object-contain rounded border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setNewProduct({ ...newProduct, sizeReferenceImage: null })}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
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
                    <TableHead>Variants</TableHead>
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
                    <TableCell>
                      {product.variants && product.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.variants.map((v, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <div
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: v.colorCode }}
                                title={v.color}
                              />
                              <span className="text-xs text-gray-600">{v.color}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No variants</span>
                      )}
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
                              
                              {/* Stock Quantity - Only for products without variants */}
                              {editProduct.variants.length === 0 && (
                                <Input
                                  placeholder="Stock Quantity"
                                  type="number"
                                  value={editProduct.stock}
                                  onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                                />
                              )}
                              
                              {/* Category Input */}
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <Input
                                  placeholder="e.g., Dresses, Tops, Bottoms, Accessories"
                                  value={editProduct.category}
                                  onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value.trim() })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                              </div>

                              {/* Info Box */}
                              {editProduct.variants.length > 0 && (
                                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                  <p className="text-xs text-blue-900">
                                    <strong>ℹ️ Stock Management:</strong> Stock is managed through the variant manager below. Overall stock is calculated as the sum of all variant sizes.
                                  </p>
                                </div>
                              )}

                              {/* Color & Size Manager */}
                              <ColorSizeManager
                                variants={editProduct.variants}
                                onVariantsChange={(variants) => setEditProduct({ ...editProduct, variants })}
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

                              {/* Size Reference Image */}
                              <div className="space-y-2 border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700">Size Reference Image</label>
                                <p className="text-xs text-gray-500">Upload a size chart/reference image (no cropping, original size)</p>
                                
                                {/* Current Size Reference */}
                                {editProduct.sizeReferenceImage && (
                                  <div className="mb-4">
                                    <p className="text-xs text-gray-600 mb-2">Current Size Reference</p>
                                    <img 
                                      src={editProduct.sizeReferenceImage}
                                      alt="Current Size Reference"
                                      className="w-full max-h-48 object-contain rounded border border-gray-200"
                                      onError={(e) => {
                                        console.error('Failed to load size reference image');
                                        e.currentTarget.src = 'https://via.placeholder.com/200?text=Image+Error';
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setEditProduct({ ...editProduct, sizeReferenceImage: null })}
                                      className="text-red-600 hover:text-red-700 text-sm mt-2"
                                    >
                                      Remove Current
                                    </button>
                                  </div>
                                )}
                                
                                {/* Upload New Size Reference */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditProduct({ ...editProduct, editSizeReferenceImage: e.target.files?.[0] || null })}
                                    className="hidden"
                                    id="edit-size-reference-image"
                                  />
                                  <label htmlFor="edit-size-reference-image" className="cursor-pointer">
                                    <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                                    <p className="text-sm text-gray-600">Click to upload new size reference</p>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                  </label>
                                </div>
                                {editProduct.editSizeReferenceImage && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-green-700">New: {editProduct.editSizeReferenceImage.name}</p>
                                    <img 
                                      src={URL.createObjectURL(editProduct.editSizeReferenceImage)}
                                      alt="New Size Reference Preview"
                                      className="w-full max-h-48 object-contain rounded border border-green-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setEditProduct({ ...editProduct, editSizeReferenceImage: null })}
                                      className="text-red-600 hover:text-red-700 text-sm"
                                    >
                                      Remove New
                                    </button>
                                  </div>
                                )}
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
        </TabsContent>

        {/* TAB 2: STOCK MANAGEMENT */}
        <TabsContent value="stock-management" className="space-y-6 mt-6">
          {/* Inventory Header */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Inventory Management</h3>
            <p className="text-gray-600 mt-1">Track and manage stock levels across all products.</p>
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600">Total Units</p>
                  <div className="text-3xl font-bold mt-2">{inventoryStats.totalItems}</div>
                  <p className="text-xs text-gray-500 mt-1">Across all products</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <div className="text-3xl font-bold mt-2">{inventoryStats.totalProducts}</div>
                  <p className="text-xs text-gray-500 mt-1">In inventory</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <div className="text-3xl font-bold text-yellow-600 mt-2">{inventoryStats.lowStock}</div>
                  <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <div className="text-3xl font-bold text-red-600 mt-2">{inventoryStats.outOfStock}</div>
                  <p className="text-xs text-gray-500 mt-1">Needs restocking</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Search & Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <Input
                    placeholder="Search by product name or category..."
                    value={inventorySearchTerm}
                    onChange={(e) => setInventorySearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Tabs value={filterStatus || 'all'} onValueChange={(val) => setFilterStatus(val === 'all' ? null : val)} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="in-stock">In Stock</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
              <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
            </TabsList>

            <TabsContent value={filterStatus || 'all'}>
              <Card className="mt-4">
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader size={32} className="text-purple-600 animate-spin mr-3" />
                      <p>Loading inventory...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Current Stock</TableHead>
                            <TableHead>Reorder Level</TableHead>
                            <TableHead>Max Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredInventory.map(item => (
                            <TableRow key={item.id}>
                              <TableCell>
                                {item.image || (item.images && item.images[0]) ? (
                                  <img 
                                    key={`${item.id}-${item.images?.join(',')}`}
                                    src={`${item.image || item.images![0]}?t=${Date.now()}`}
                                    alt={item.productName}
                                    className="w-12 h-12 object-cover rounded border border-gray-200"
                                    onError={(e) => {
                                      console.warn(`Failed to load image for ${item.productName}`);
                                      e.currentTarget.src = 'https://via.placeholder.com/50?text=No+Image';
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                                    No Image
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{item.productName}</TableCell>
                              <TableCell className="text-gray-600">{item.category}</TableCell>
                              <TableCell>
                                <span className={`font-semibold ${
                                  item.currentStock === 0 ? 'text-red-600' :
                                  item.currentStock < (item.reorderLevel || 20) ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {item.currentStock}
                              </span>
                              </TableCell>
                              <TableCell className="text-gray-600">{item.reorderLevel || 20}</TableCell>
                              <TableCell className="text-gray-600">{item.maxStock}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  item.status === 'in-stock' ? 'default' :
                                  item.status === 'low-stock' ? 'secondary' :
                                  'destructive'
                                }>
                                  {item.status === 'low-stock' && <AlertCircle size={14} className="mr-1" />}
                                  {item.status === 'out-of-stock' && <TrendingDown size={14} className="mr-1" />}
                                  {item.status === 'in-stock' && <Package size={14} className="mr-1" />}
                                  {item.status.replace('-', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{item.lastRestocked}</TableCell>
                              <TableCell>
                                <Dialog open={inventoryEditDialog && inventoryEditingId === item.id} onOpenChange={setInventoryEditDialog}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleInventoryEditItem(item)}
                                      disabled={savingProductId === item.id}
                                    >
                                      <Edit2 size={16} />
                                    </Button>
                                  </DialogTrigger>
                                  {inventoryEditingId === item.id && (
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Edit Inventory</DialogTitle>
                                        <DialogDescription>
                                          {item.productName} ({item.category})
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium mb-2">Current Stock</label>
                                          <Input
                                            type="number"
                                            value={inventoryEditItem.currentStock}
                                            onChange={(e) => setInventoryEditItem({ ...inventoryEditItem, currentStock: parseInt(e.target.value) || 0 })}
                                            disabled={savingProductId === item.id || inventoryEditItem.uploadingImages}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-2">Reorder Level</label>
                                          <Input
                                            type="number"
                                            value={inventoryEditItem.reorderLevel}
                                            onChange={(e) => setInventoryEditItem({ ...inventoryEditItem, reorderLevel: parseInt(e.target.value) || 0 })}
                                            disabled={savingProductId === item.id || inventoryEditItem.uploadingImages}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-2">Max Stock</label>
                                          <Input
                                            type="number"
                                            value={inventoryEditItem.maxStock}
                                            onChange={(e) => setInventoryEditItem({ ...inventoryEditItem, maxStock: parseInt(e.target.value) || 0 })}
                                            disabled={savingProductId === item.id || inventoryEditItem.uploadingImages}
                                          />
                                        </div>

                                        {/* Current Images Display */}
                                        {inventoryEditItem.currentImages && inventoryEditItem.currentImages.length > 0 && (
                                          <div className="mb-4 border-t pt-4">
                                            <p className="text-xs text-gray-600 mb-2">Current Images ({inventoryEditItem.currentImages.length})</p>
                                            <p className="text-xs text-gray-500 mb-2">💡 Drag to reorder existing images</p>
                                            <div className="grid grid-cols-3 gap-2">
                                              {inventoryEditItem.currentImages.map((imageUrl, idx) => (
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
                                                        const newImages = [...inventoryEditItem.currentImages];
                                                        [newImages[dragIndex], newImages[idx]] = [newImages[idx], newImages[dragIndex]];
                                                        setInventoryEditItem({ ...inventoryEditItem, currentImages: newImages });
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
                                                      console.warn(`Failed to load image ${idx}:`, imageUrl);
                                                      e.currentTarget.src = 'https://via.placeholder.com/150?text=Image+Error';
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
                                        <div className="space-y-2 border-t pt-4">
                                          <label className="block text-sm font-medium text-gray-700">Upload New Images (will replace existing)</label>
                                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition">
                                            <input
                                              type="file"
                                              multiple
                                              accept="image/*"
                                              onChange={(e) => setInventoryEditItem({ ...inventoryEditItem, editImages: Array.from(e.target.files || []) })}
                                              className="hidden"
                                              id={`inventory-edit-images-${item.id}`}
                                              disabled={inventoryEditItem.uploadingImages || savingProductId === item.id}
                                            />
                                            <label htmlFor={`inventory-edit-images-${item.id}`} className="cursor-pointer">
                                              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                                              <p className="text-sm text-gray-600">Click to upload new images</p>
                                              <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                                            </label>
                                          </div>
                                          {inventoryEditItem.editImages.length > 0 && (
                                            <div className="space-y-2">
                                              <p className="text-sm font-medium text-green-700">{inventoryEditItem.editImages.length} new image(s) selected</p>
                                              <p className="text-xs text-gray-500">💡 Drag to reorder new images</p>
                                              <div className="grid grid-cols-3 gap-2">
                                                {inventoryEditItem.editImages.map((file, idx) => (
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
                                                        const newImages = [...inventoryEditItem.editImages];
                                                        [newImages[dragIndex], newImages[idx]] = [newImages[idx], newImages[dragIndex]];
                                                        setInventoryEditItem({ ...inventoryEditItem, editImages: newImages });
                                                      }
                                                      (e.currentTarget as HTMLElement).classList.remove('border-2', 'border-green-500');
                                                    }}
                                                    className="relative group cursor-move bg-gray-50 rounded border-2 border-green-500"
                                                  >
                                                    <img 
                                                      src={URL.createObjectURL(file)}
                                                      alt={`New ${idx}`}
                                                      className="w-full h-20 object-cover rounded pointer-events-none"
                                                    />
                                                    <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                                                      New #{idx + 1}
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={() => setInventoryEditItem({ ...inventoryEditItem, editImages: inventoryEditItem.editImages.filter((_, i) => i !== idx) })}
                                                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                                                    >
                                                      <X size={14} />
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {inventoryEditItem.editImages.length > 0 && (
                                            <p className="text-xs text-amber-600">⚠️ Uploading new images will replace all existing images</p>
                                          )}
                                        </div>

                                        {/* Button */}
                                        <Button 
                                          onClick={handleInventorySaveEdit}
                                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                                          disabled={savingProductId === item.id || inventoryEditItem.uploadingImages}
                                        >
                                          {inventoryEditItem.uploadingImages || savingProductId === item.id ? (
                                            <>
                                              <Loader size={16} className="mr-2 animate-spin" />
                                              {inventoryEditItem.uploadingImages ? 'Uploading Images...' : 'Saving...'}
                                            </>
                                          ) : (
                                            'Save Changes'
                                          )}
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  )}
                                </Dialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-red-600"
                                      disabled={savingProductId === item.id}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {item.productName} from inventory?
                                    </AlertDialogDescription>
                                    <div className="flex gap-2">
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-600"
                                        onClick={() => handleDeleteProduct(item.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;
