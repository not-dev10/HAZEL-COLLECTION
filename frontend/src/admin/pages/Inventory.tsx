import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Plus, Edit2, Trash2, AlertCircle, TrendingDown, Package, Loader, Upload, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TokenManager from '@/utils/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log('Fetched products for inventory:', data);

        // Map API products to inventory items
        const inventoryItems = (data.products || []).map((p: any) => {
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

        setInventory(inventoryItems);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState({ currentStock: 0, reorderLevel: 20, maxStock: 100, editImages: [] as File[], currentImages: [] as string[], originalImageOrder: [] as string[], uploadingImages: false });
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const filteredInventory = inventory.filter(item =>
    (item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (!filterStatus || item.status === filterStatus)
  );

  const stats = {
    totalItems: inventory.reduce((sum, item) => sum + item.currentStock, 0),
    lowStock: inventory.filter(item => item.status === 'low-stock').length,
    outOfStock: inventory.filter(item => item.status === 'out-of-stock').length,
    totalProducts: inventory.length,
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      setSavingItemId(id);
      const item = inventory.find(i => i.id === id);
      if (!item) return;

      console.log('🔄 Updating stock for product:', item.productId || id);
      console.log('📊 New stock value:', newStock);

      // Use the productId field for the API call
      const productIdToUse = item.productId || id;
      
      // Use the correct productAttributes endpoint with authentication
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

      // Update local state
      let status: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
      const reorderLevel = item.reorderLevel || 20;
      if (newStock === 0) status = 'out-of-stock';
      else if (newStock < reorderLevel) status = 'low-stock';

      setInventory(inventory.map(invItem =>
        invItem.id === id
          ? {
              ...invItem,
              currentStock: newStock,
              stock: newStock,
              status,
              lastRestocked: new Date().toISOString().split('T')[0],
            }
          : invItem
      ));
      console.log('✅ Stock updated successfully');
    } catch (err) {
      console.error('❌ Error updating stock:', err);
      alert('Failed to update stock: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSavingItemId(null);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Delete this inventory item?')) return;

    try {
      setSavingItemId(id);
      const token = TokenManager.getAccessToken();
      if (!token) {
        alert('Admin authentication required. Please log in again.');
        setSavingItemId(null);
        return;
      }

      // Get the item to find the productId
      const item = inventory.find(i => i.id === id);
      if (!item) {
        throw new Error('Item not found');
      }

      // Use productId for the API call, just like stock updates do
      const productIdToUse = item.productId || id;
      
      const response = await fetch(`${API_BASE_URL}/api/products/${productIdToUse}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(responseData.message || `Failed to delete product (${response.status})`);
      }

      setInventory(inventory.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete product: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSavingItemId(null);
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    const currentImages = item.images || (item.image ? [item.image] : []);
    setEditItem({
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel || 20,
      maxStock: item.maxStock || 100,
      editImages: [],
      currentImages: currentImages,
      originalImageOrder: [...currentImages],
      uploadingImages: false,
    });
    setEditingId(item.id);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      setSavingItemId(editingId);
      const token = TokenManager.getAccessToken();
      if (!token) {
        alert('Admin authentication required. Please log in again.');
        setSavingItemId(null);
        return;
      }

      // Update stock via API
      const item = inventory.find(i => i.id === editingId);
      if (!item) return;

      await fetch(`${API_BASE_URL}/api/products-attributes/${editingId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: editItem.currentStock,
        }),
      });

      // Upload images if any new ones were selected
      if (editItem.editImages && editItem.editImages.length > 0) {
        setEditItem(prev => ({ ...prev, uploadingImages: true }));
        try {
          // Compress images using canvas (same logic as Products)
          const imageDataPromises = editItem.editImages.map((file) => {
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
              productId: editingId,
              images: imageData,
            }),
          });

          if (!uploadResponse.ok) {
            console.warn('Image upload failed but inventory updated');
          } else {
            const uploadResult = await uploadResponse.json();
            if (uploadResult.data && uploadResult.data.product) {
              const updatedProductData = uploadResult.data.product;
              
              setInventory(inventory.map(invItem =>
                invItem.id === editingId
                  ? {
                      ...invItem,
                      image: updatedProductData.image,
                      images: updatedProductData.images,
                      currentStock: editItem.currentStock,
                      stock: editItem.currentStock,
                      reorderLevel: editItem.reorderLevel,
                      maxStock: editItem.maxStock,
                    }
                  : invItem
              ));
            }
          }
        } catch (error) {
          console.error('Image upload error:', error);
        } finally {
          setEditItem(prev => ({ ...prev, uploadingImages: false }));
        }
      }

      // Check if images have been reordered
      if (editItem.currentImages.length > 0 && 
          editItem.originalImageOrder.length > 0 &&
          JSON.stringify(editItem.currentImages) !== JSON.stringify(editItem.originalImageOrder)) {
        console.log('🔄 Image order has changed, sending reorder request...');
        try {
          const imageOrder = editItem.currentImages.map(imgUrl => 
            editItem.originalImageOrder.indexOf(imgUrl)
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
            console.error('❌ Reorder failed');
          } else {
            const reorderData = await reorderResponse.json();
            console.log('✅ Images reordered successfully');
            
            if (reorderData.product) {
              setInventory(inventory.map(invItem =>
                invItem.id === editingId
                  ? {
                      ...invItem,
                      images: reorderData.product.images,
                      image: reorderData.product.image,
                    }
                  : invItem
              ));
            }
          }
        } catch (error) {
          console.error('Reorder request failed:', error);
        }
      } else {
        // No image upload, just update stock
        setInventory(inventory.map(invItem =>
          invItem.id === editingId
            ? {
                ...invItem,
                currentStock: editItem.currentStock,
                stock: editItem.currentStock,
                reorderLevel: editItem.reorderLevel,
                maxStock: editItem.maxStock,
              }
            : invItem
        ));
      }

      setEditingId(null);
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating inventory:', err);
      alert('Failed to update inventory');
    } finally {
      setSavingItemId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
        <p className="text-gray-600 mt-1">Track and manage stock levels across all locations.</p>
      </div>

      {/* Sync Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-900 font-medium">📦 Synced with Products</p>
          <p className="text-blue-700 text-sm">Stock levels are automatically synced between Inventory and Products. Update here or in the Products panel, and both will reflect the change.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Total Units</p>
              <div className="text-3xl font-bold mt-2">{stats.totalItems}</div>
              <p className="text-xs text-gray-500 mt-1">Across all products</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <div className="text-3xl font-bold mt-2">{stats.totalProducts}</div>
              <p className="text-xs text-gray-500 mt-1">In inventory</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.lowStock}</div>
              <p className="text-xs text-gray-500 mt-1">Requires attention</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <div className="text-3xl font-bold text-red-600 mt-2">{stats.outOfStock}</div>
              <p className="text-xs text-gray-500 mt-1">Needs restocking</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                placeholder="Search by product name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Plus size={18} className="mr-2" /> Add to Inventory
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Inventory Item</DialogTitle>
                  <DialogDescription>
                    Add a new item to your inventory system
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4">
                  <Input placeholder="Product Name" />
                  <Input placeholder="SKU" />
                  <Input placeholder="Current Stock" type="number" />
                  <Input placeholder="Reorder Level" type="number" />
                  <Input placeholder="Warehouse Location" />
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                    Add Item
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Tabs value={filterStatus || 'all'} onValueChange={(val) => setFilterStatus(val === 'all' ? null : val)} className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Items
          </TabsTrigger>
          <TabsTrigger value="in-stock">
            In Stock
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            Low Stock
          </TabsTrigger>
          <TabsTrigger value="out-of-stock">
            Out of Stock
          </TabsTrigger>
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
                          <Dialog open={editDialogOpen && editingId === item.id} onOpenChange={setEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditItem(item)}
                                disabled={savingItemId === item.id}
                              >
                                <Edit2 size={16} />
                              </Button>
                            </DialogTrigger>
                            {editingId === item.id && (
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
                                      value={editItem.currentStock}
                                      onChange={(e) => setEditItem({ ...editItem, currentStock: parseInt(e.target.value) || 0 })}
                                      disabled={savingItemId === item.id || editItem.uploadingImages}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Reorder Level</label>
                                    <Input
                                      type="number"
                                      value={editItem.reorderLevel}
                                      onChange={(e) => setEditItem({ ...editItem, reorderLevel: parseInt(e.target.value) || 0 })}
                                      disabled={savingItemId === item.id || editItem.uploadingImages}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Max Stock</label>
                                    <Input
                                      type="number"
                                      value={editItem.maxStock}
                                      onChange={(e) => setEditItem({ ...editItem, maxStock: parseInt(e.target.value) || 0 })}
                                      disabled={savingItemId === item.id || editItem.uploadingImages}
                                    />
                                  </div>

                                  {/* Current Images Display */}
                                  {editItem.currentImages && editItem.currentImages.length > 0 && (
                                    <div className="mb-4">
                                      <p className="text-xs text-gray-600 mb-2">Current Images ({editItem.currentImages.length})</p>
                                      <p className="text-xs text-gray-500 mb-2">💡 Drag to reorder existing images</p>
                                      <div className="grid grid-cols-3 gap-2">
                                        {editItem.currentImages.map((imageUrl, idx) => (
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
                                                  const newImages = [...editItem.currentImages];
                                                  [newImages[dragIndex], newImages[idx]] = [newImages[idx], newImages[dragIndex]];
                                                  setEditItem({ ...editItem, currentImages: newImages });
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
                                    <label className="block text-sm font-medium text-gray-700">Upload New Images (optional)</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition">
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setEditItem({ ...editItem, editImages: Array.from(e.target.files || []) })}
                                        disabled={editItem.uploadingImages || savingItemId === item.id}
                                        className="hidden"
                                        id={`inventory-images-${item.id}`}
                                      />
                                      <label htmlFor={`inventory-images-${item.id}`} className="cursor-pointer">
                                        <p className="text-sm text-gray-600">Click to upload new images</p>
                                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                                      </label>
                                    </div>
                                    {editItem.editImages.length > 0 && (
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium text-green-700">{editItem.editImages.length} new image(s) selected</p>
                                        <p className="text-xs text-gray-500">💡 Drag to reorder new images</p>
                                        <div className="grid grid-cols-3 gap-2">
                                          {editItem.editImages.map((file, idx) => (
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
                                                  const newImages = [...editItem.editImages];
                                                  [newImages[dragIndex], newImages[idx]] = [newImages[idx], newImages[dragIndex]];
                                                  setEditItem({ ...editItem, editImages: newImages });
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
                                                onClick={() => setEditItem({ ...editItem, editImages: editItem.editImages.filter((_, i) => i !== idx) })}
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
                                    onClick={handleSaveEdit}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                                    disabled={savingItemId === item.id || editItem.uploadingImages}
                                  >
                                    {editItem.uploadingImages || savingItemId === item.id ? (
                                      <>
                                        <Loader size={16} className="mr-2 animate-spin" />
                                        {editItem.uploadingImages ? 'Uploading Images...' : 'Saving...'}
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
                                disabled={savingItemId === item.id}
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
                                  onClick={() => handleDeleteItem(item.id)}
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
    </div>
  );
};

export default Inventory;
