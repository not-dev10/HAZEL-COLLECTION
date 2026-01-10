import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Package, Truck, Clock, CheckCircle2, AlertCircle, Eye, Download, Filter, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { API_BASE_URL } from '@/lib/api';

interface Order {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    grandTotal: number;
  };
  items?: any[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed';
  createdAt: string;
  updatedAt?: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [pendingStatusChanges, setPendingStatusChanges] = useState<Record<string, Order['status']>>({});
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('🔍 Fetching orders from:', `${API_BASE_URL}/api/orders-management/admin/list`);
      console.log('🔐 Using token:', token ? 'Yes' : 'No');
      
      const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      // Admin API returns data.data.orders (nested structure)
      if (data.success && data.data?.orders) {
        console.log('✅ Orders loaded:', data.data.orders.length);
        console.log('📋 First order structure:', data.data.orders[0]);
        console.log('🔑 First order _id:', data.data.orders[0]?._id);
        setOrders(data.data.orders);
      } else {
        console.warn('⚠️ No orders found or invalid response structure:', data);
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const customerName = `${order.personalInfo.firstName} ${order.personalInfo.lastName}`.toLowerCase();
    const email = order.personalInfo.email;
    const orderId = order._id;
    
    return (
      customerName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm) ||
      orderId.includes(searchTerm)
    );
  });

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { color: 'bg-blue-100 text-blue-800', icon: Package },
    processing: { color: 'bg-blue-100 text-blue-800', icon: Package },
    shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setSavingStatus(orderId);
      const token = localStorage.getItem('adminToken');
      console.log('🔄 Updating order status:', { orderId, orderId_type: typeof orderId, orderId_length: orderId.length, newStatus });
      console.log('📝 Full order ID:', orderId);
      
      const url = `${API_BASE_URL}/api/orders-management/admin/${orderId}/status`;
      console.log('🌐 API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      console.log('📡 Response:', { status: response.status, data });
      
      if (response.ok) {
        console.log('✅ Status updated successfully');
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        // Clear pending change for this order
        setPendingStatusChanges(prev => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
        setShowSuccessMsg(true);
        setTimeout(() => setShowSuccessMsg(false), 3000);
      } else {
        console.error('❌ Failed to update status:', data);
        alert(`Failed to update status: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error updating order:', error);
      alert(`Error updating order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingStatus(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setOrders(orders.filter(order => order._id !== orderId));
        setShowSuccessMsg(true);
        setTimeout(() => setShowSuccessMsg(false), 3000);
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const handleExportOrders = () => {
    const csvContent = [
      ['Order Number', 'Customer', 'Email', 'Total', 'Status', 'Date'],
      ...filteredOrders.map(o => [
        o._id.slice(-8),
        `${o.personalInfo.firstName} ${o.personalInfo.lastName}`,
        o.personalInfo.email,
        o.totals.grandTotal.toFixed(2),
        o.status,
        new Date(o.createdAt).toLocaleDateString()
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} />
          Operation completed successfully!
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Orders Management</h2>
        <p className="text-gray-600 mt-1">Track and manage all customer orders.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="mx-auto mb-2 text-yellow-600" size={24} />
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-gray-600 mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="mx-auto mb-2 text-blue-600" size={24} />
              <div className="text-2xl font-bold">{stats.processing}</div>
              <p className="text-xs text-gray-600 mt-1">Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Truck className="mx-auto mb-2 text-purple-600" size={24} />
              <div className="text-2xl font-bold">{stats.shipped}</div>
              <p className="text-xs text-gray-600 mt-1">Shipped</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-2 text-green-600" size={24} />
              <div className="text-2xl font-bold">{stats.delivered}</div>
              <p className="text-xs text-gray-600 mt-1">Delivered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                placeholder="Search by order number, customer, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={fetchOrders}>
              <Filter size={18} className="mr-2" /> Refresh
            </Button>
            <Button variant="outline" onClick={handleExportOrders}>
              <Download size={18} className="mr-2" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => {
                    const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <TableRow key={order._id}>
                        <TableCell className="font-semibold">{order._id.slice(-8)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.personalInfo.firstName} {order.personalInfo.lastName}</p>
                            <p className="text-xs text-gray-500">{order.personalInfo.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">£{order.totals.grandTotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            <StatusIcon size={14} className="mr-1" />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Order Details</DialogTitle>
                                <DialogDescription>
                                  {order._id}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Customer</p>
                                    <p className="font-semibold">{order.personalInfo.firstName} {order.personalInfo.lastName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Email</p>
                                    <p className="font-semibold">{order.personalInfo.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Order Date</p>
                                    <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Status</p>
                                    <Badge className={statusConfig[order.status as keyof typeof statusConfig].color}>
                                      {order.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="border-t pt-4">
                                  <label className="text-sm font-semibold block mb-2">Update Status</label>
                                  <div className="flex gap-2">
                                    <select 
                                      value={pendingStatusChanges[order._id] ?? order.status}
                                      onChange={(e) => setPendingStatusChanges(prev => ({
                                        ...prev,
                                        [order._id]: e.target.value as Order['status']
                                      }))}
                                      className="flex-1 px-3 py-2 border rounded-md"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="confirmed">Confirmed</option>
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                    <Button 
                                      onClick={() => handleUpdateOrderStatus(order._id, pendingStatusChanges[order._id] ?? order.status)}
                                      disabled={!pendingStatusChanges[order._id] || pendingStatusChanges[order._id] === order.status || savingStatus === order._id}
                                      className="min-w-[80px]"
                                    >
                                      {savingStatus === order._id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        'Save'
                                      )}
                                    </Button>
                                  </div>
                                  {pendingStatusChanges[order._id] && pendingStatusChanges[order._id] !== order.status && (
                                    <p className="text-xs text-orange-600 mt-1">
                                      Unsaved changes - click Save to update
                                    </p>
                                  )}
                                </div>
                                <div className="border-t pt-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Subtotal</span>
                                      <span className="font-semibold">£{order.totals.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Shipping</span>
                                      <span className="font-semibold">£{order.totals.shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Tax</span>
                                      <span className="font-semibold">£{order.totals.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                      <span className="font-semibold">Total</span>
                                      <span className="font-bold text-lg">£{order.totals.grandTotal.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this order? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="flex gap-2">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteOrder(order._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
