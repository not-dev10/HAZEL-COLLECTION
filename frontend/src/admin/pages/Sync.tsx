import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TokenManager from '@/utils/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface SyncStatus {
  id: string;
  productName: string;
  productStock: number;
  inventoryStock: number;
  lastSyncedAt?: string;
  isInSync: boolean;
}

const Sync: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [globalSyncing, setGlobalSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial sync status
  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/sync/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sync status');
      }

      const data = await response.json();
      setSyncStatus(data.syncStatus || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching sync status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sync status');
    } finally {
      setLoading(false);
    }
  };

  const syncProductToInventory = async (productId: string) => {
    try {
      setSyncing(productId);
      const response = await fetch(`${API_BASE_URL}/api/sync/product-to-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync product to inventory');
      }

      const data = await response.json();
      console.log('✅ Synced product to inventory:', data);
      
      // Update the status
      await fetchSyncStatus();
    } catch (err) {
      console.error('Error syncing:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const syncInventoryToProduct = async (productId: string) => {
    try {
      setSyncing(productId);
      const response = await fetch(`${API_BASE_URL}/api/sync/inventory-to-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync inventory to product');
      }

      const data = await response.json();
      console.log('✅ Synced inventory to product:', data);
      
      // Update the status
      await fetchSyncStatus();
    } catch (err) {
      console.error('Error syncing:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const syncAll = async () => {
    try {
      setGlobalSyncing(true);
      const response = await fetch(`${API_BASE_URL}/api/sync/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TokenManager.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync all');
      }

      const data = await response.json();
      console.log('✅ All items synced:', data);
      
      // Update the status
      await fetchSyncStatus();
    } catch (err) {
      console.error('Error syncing all:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setGlobalSyncing(false);
    }
  };

  const outOfSyncCount = syncStatus.filter(item => !item.isInSync).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory & Products Sync</h1>
          <p className="text-gray-600 mt-2">Synchronize stock levels between Products and Inventory</p>
        </div>
        <Button
          onClick={syncAll}
          disabled={globalSyncing || outOfSyncCount === 0}
          className="bg-gradient-to-r from-green-600 to-emerald-600"
        >
          {globalSyncing ? (
            <>
              <Loader size={18} className="mr-2 animate-spin" />
              Syncing All...
            </>
          ) : (
            <>
              <RefreshCw size={18} className="mr-2" />
              Sync All Items
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sync Status</CardTitle>
          <CardDescription>
            {outOfSyncCount > 0 ? (
              <span className="text-amber-600 flex items-center gap-2">
                <AlertTriangle size={16} />
                {outOfSyncCount} item{outOfSyncCount !== 1 ? 's' : ''} out of sync
              </span>
            ) : (
              <span className="text-green-600 flex items-center gap-2">
                <CheckCircle size={16} />
                All items are in sync
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size={24} className="animate-spin text-purple-600" />
            </div>
          ) : syncStatus.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No products found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Products Stock</TableHead>
                    <TableHead className="text-right">Inventory Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncStatus.map((item) => (
                    <TableRow key={item.id} className={!item.isInSync ? 'bg-amber-50' : ''}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.productStock > 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.productStock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.inventoryStock > 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.inventoryStock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isInSync ? 'default' : 'destructive'}>
                          {item.isInSync ? '✓ In Sync' : '✗ Out of Sync'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncProductToInventory(item.id)}
                            disabled={syncing === item.id}
                            title="Update inventory from product stock"
                          >
                            {syncing === item.id ? (
                              <Loader size={14} className="animate-spin" />
                            ) : (
                              <>P → I</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncInventoryToProduct(item.id)}
                            disabled={syncing === item.id}
                            title="Update product from inventory stock"
                          >
                            {syncing === item.id ? (
                              <Loader size={14} className="animate-spin" />
                            ) : (
                              <>I → P</>
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

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How Sync Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>P → I (Product to Inventory):</strong> Updates inventory stock with product stock value
          </p>
          <p>
            <strong>I → P (Inventory to Product):</strong> Updates product stock with inventory stock value
          </p>
          <p>
            <strong>Status:</strong> Items show "Out of Sync" when product and inventory stock levels differ
          </p>
          <p>
            <strong>Sync All:</strong> Synchronizes all items at once using the "P → I" direction (Products → Inventory)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sync;
