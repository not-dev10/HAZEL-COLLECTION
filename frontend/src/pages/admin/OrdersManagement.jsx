import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader2, Eye, Download, Printer } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { API_BASE_URL } from '@/lib/api';

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10
  });

  const [orderModal, setOrderModal] = useState({
    show: false,
    status: '',
    trackingNumber: '',
    carrier: '',
    trackingUrl: '',
    estimatedDelivery: '',
    note: '',
    refundAmount: '',
    refundReason: '',
    cancellationReason: ''
  });

  // Fetch orders on mount and filter change
  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const query = new URLSearchParams();
      if (filters.status) query.append('status', filters.status);
      query.append('page', filters.page);
      query.append('limit', filters.limit);

      const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/list?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      showMessage('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !orderModal.status) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: orderModal.status })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Order status updated');
        setSelectedOrder(data.data);
        fetchOrders();
      } else {
        showMessage(data.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error updating status', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateTrackingInfo = async () => {
    if (!selectedOrder) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/${selectedOrder._id}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trackingNumber: orderModal.trackingNumber,
          carrier: orderModal.carrier,
          trackingUrl: orderModal.trackingUrl,
          estimatedDelivery: orderModal.estimatedDelivery
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Tracking info updated');
        setSelectedOrder(data.data);
      } else {
        showMessage(data.message || 'Failed to update tracking', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error updating tracking', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addOrderNote = async () => {
    if (!selectedOrder || !orderModal.note) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/${selectedOrder._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          note: orderModal.note,
          noteType: 'admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Note added successfully');
        setSelectedOrder(data.data);
        setOrderModal(prev => ({ ...prev, note: '' }));
      } else {
        showMessage(data.message || 'Failed to add note', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error adding note', 'error');
    } finally {
      setSaving(false);
    }
  };

  const generateInvoice = async () => {
    if (!selectedOrder) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/${selectedOrder._id}/invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Invoice generated: ' + data.data.invoiceNumber);
        setSelectedOrder(data.data);
      } else {
        showMessage(data.message || 'Failed to generate invoice', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error generating invoice', 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/${selectedOrder._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: orderModal.cancellationReason || 'Admin cancelled'
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Order cancelled successfully');
        setSelectedOrder(data.data);
        fetchOrders();
      } else {
        showMessage(data.message || 'Failed to cancel order', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error cancelling order', 'error');
    } finally {
      setSaving(false);
    }
  };

  const processRefund = async () => {
    if (!selectedOrder || !orderModal.refundAmount) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/${selectedOrder._id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(orderModal.refundAmount),
          reason: orderModal.refundReason || 'Refund processed',
          transactionId: `TXN-${Date.now()}`
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Refund processed successfully');
        setSelectedOrder(data.data);
        setOrderModal(prev => ({ ...prev, refundAmount: '', refundReason: '' }));
      } else {
        showMessage(data.message || 'Failed to process refund', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error processing refund', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && orders.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-2">Track, manage, and process orders</p>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={fetchOrders}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[700px] overflow-y-auto">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-sm">No orders found</p>
                ) : (
                  orders.map(order => (
                    <button
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedOrder?._id === order._id
                          ? 'bg-purple-100 border-2 border-purple-600'
                          : 'bg-gray-50 border-2 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <p className="font-medium text-sm">Order #{order._id?.slice(-8)}</p>
                      <p className="text-xs text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                      <div className="flex gap-1 items-center mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-semibold mt-1">₨{order.totals?.grandTotal || 0}</p>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Details */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="space-y-4">
              {/* Status & Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Order #{selectedOrder._id?.slice(-8)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Order Date</p>
                      <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Status</p>
                      <span className={`inline-block text-xs px-3 py-1 rounded font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="font-medium">₨{selectedOrder.totals?.grandTotal || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Payment Method</p>
                      <p className="font-medium">{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>

                  {selectedOrder.invoiceNumber && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-600">Invoice</p>
                      <p className="font-medium text-green-700">{selectedOrder.invoiceNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Update Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={orderModal.status} onValueChange={(value) => setOrderModal(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={updateOrderStatus}
                    disabled={saving || !orderModal.status}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Update Status
                  </Button>
                </CardContent>
              </Card>

              {/* Tracking Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Tracking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Tracking Number"
                    value={orderModal.trackingNumber}
                    onChange={(e) => setOrderModal(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  />
                  <Input
                    placeholder="Carrier (e.g., DHL, FedEx)"
                    value={orderModal.carrier}
                    onChange={(e) => setOrderModal(prev => ({ ...prev, carrier: e.target.value }))}
                  />
                  <Input
                    placeholder="Tracking URL"
                    value={orderModal.trackingUrl}
                    onChange={(e) => setOrderModal(prev => ({ ...prev, trackingUrl: e.target.value }))}
                  />
                  <Input
                    type="date"
                    value={orderModal.estimatedDelivery}
                    onChange={(e) => setOrderModal(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  />
                  <Button
                    onClick={updateTrackingInfo}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Update Tracking
                  </Button>

                  {selectedOrder.tracking && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
                      <p className="text-xs text-gray-600">Current Tracking</p>
                      <p className="font-medium">{selectedOrder.tracking.carrier}: {selectedOrder.tracking.trackingNumber}</p>
                      <p className="text-xs text-gray-600 mt-1">Est. Delivery: {selectedOrder.tracking.estimatedDelivery}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={generateInvoice}
                  disabled={saving || selectedOrder.invoiceNumber}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Invoice
                </Button>
                <Button
                  onClick={cancelOrder}
                  disabled={saving || selectedOrder.status === 'cancelled'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Cancel
                </Button>
              </div>

              {/* Refund */}
              <Card>
                <CardHeader>
                  <CardTitle>Process Refund</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    type="number"
                    placeholder="Refund Amount"
                    value={orderModal.refundAmount}
                    onChange={(e) => setOrderModal(prev => ({ ...prev, refundAmount: e.target.value }))}
                  />
                  <Input
                    placeholder="Refund Reason"
                    value={orderModal.refundReason}
                    onChange={(e) => setOrderModal(prev => ({ ...prev, refundReason: e.target.value }))}
                  />
                  <Button
                    onClick={processRefund}
                    disabled={saving || !orderModal.refundAmount}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Process Refund
                  </Button>
                </CardContent>
              </Card>

              {/* Add Note */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Order Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    placeholder="Add a note about this order..."
                    value={orderModal.note}
                    onChange={(e) => setOrderModal(prev => ({ ...prev, note: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  <Button
                    onClick={addOrderNote}
                    disabled={saving || !orderModal.note}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Add Note
                  </Button>

                  {selectedOrder.notes && selectedOrder.notes.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                      {selectedOrder.notes.map((note, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded text-xs border-l-2 border-purple-600">
                          <p className="font-medium text-gray-700">{note.noteType}</p>
                          <p className="text-gray-600">{note.text}</p>
                          <p className="text-gray-500 text-xs mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500 text-center">Select an order from the left to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

