import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Truck, CheckCircle2, AlertCircle, Clock, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import AnnouncementBar from '@/components/common/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';

interface Order {
  _id: string;
  orderNumber?: string;
  items: any[];
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
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTimeline = (status: string) => {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const cancelledStatuses = ['cancelled'];
    
    if (cancelledStatuses.includes(status)) {
      return {
        completed: ['pending'],
        current: 'cancelled',
        pending: ['confirmed', 'processing', 'shipped', 'delivered'],
        isCancelled: true
      };
    }

    const currentIndex = statuses.indexOf(status);
    return {
      completed: currentIndex >= 0 ? statuses.slice(0, currentIndex + 1) : [],
      current: status,
      pending: currentIndex >= 0 ? statuses.slice(currentIndex + 1) : statuses,
      isCancelled: false
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AnnouncementBar />
        <Header />
        <main className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track your orders and their status</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No orders yet</p>
              <p className="text-gray-500 text-sm mt-2">Start shopping to see your orders here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const timeline = getStatusTimeline(order.status);
              const isExpanded = expandedOrder === order._id;
              
              return (
                <Card key={order._id} className="hover:shadow-lg transition overflow-hidden">
                  {/* Main Order Summary */}
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                        {/* Order Number */}
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Order Number</p>
                          <p className="text-lg font-semibold text-purple-600">{order.orderNumber || '#' + order._id.slice(-8)}</p>
                        </div>

                        {/* Date */}
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Order Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Amount */}
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Total Amount</p>
                          <p className="text-lg font-semibold text-gray-900">
                            £{order.totals.grandTotal.toFixed(2)}
                          </p>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(order.status)}
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                        className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        <ChevronDown
                          size={20}
                          className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Status Timeline */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-600 font-medium mb-4">Order Status Timeline</p>
                        <div className="flex items-center gap-4">
                          {/* Timeline visualization */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status, idx) => {
                                const isCompleted = timeline.completed.includes(status);
                                const isCurrent = timeline.current === status;
                                const isPending = timeline.pending.includes(status);
                                
                                return (
                                  <div key={status} className="flex items-center flex-1">
                                    {/* Status Circle */}
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs transition-all ${
                                        timeline.isCancelled && status !== 'pending'
                                          ? 'bg-red-100 text-red-700'
                                          : isCompleted
                                          ? 'bg-green-100 text-green-700'
                                          : isCurrent
                                          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                                          : 'bg-gray-100 text-gray-400'
                                      }`}
                                    >
                                      {timeline.isCancelled && status !== 'pending' ? '✕' : isCompleted ? '✓' : status.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Connecting Line */}
                                    {idx < 4 && (
                                      <div
                                        className={`flex-1 h-1 mx-2 transition-colors ${
                                          timeline.isCancelled && timeline.completed.includes(status)
                                            ? 'bg-red-300'
                                            : timeline.completed.includes(status)
                                            ? 'bg-green-300'
                                            : 'bg-gray-200'
                                        }`}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Status Labels */}
                            <div className="flex items-center gap-2 mt-4 text-xs">
                              {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status) => (
                                <div key={status} className="flex-1 text-center">
                                  <p className="text-gray-600 capitalize font-medium">{status}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Cancelled Status */}
                        {timeline.isCancelled && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">
                              This order has been cancelled
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-600 font-medium mb-4">Order Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-600">Customer</p>
                            <p className="font-semibold">{order.personalInfo.firstName} {order.personalInfo.lastName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Email</p>
                            <p className="font-semibold">{order.personalInfo.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Phone</p>
                            <p className="font-semibold">{order.personalInfo.phone}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Items</p>
                            <p className="font-semibold">{order.items.length} item(s)</p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mb-6">
                          <p className="text-sm text-gray-600 font-medium mb-3">Products Ordered</p>
                          <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex gap-4 pb-3 last:pb-0 border-b last:border-b-0">
                                {/* Product Image */}
                                {(item.image || item.images?.[0]) && (
                                  <div className="w-16 h-20 bg-gray-100 rounded flex-shrink-0">
                                    <img
                                      src={item.image || item.images?.[0]}
                                      alt={item.name}
                                      className="w-full h-full object-cover rounded"
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/80?text=No+Image';
                                      }}
                                    />
                                  </div>
                                )}
                                
                                {/* Product Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                    {item.category && (
                                      <p className="text-xs text-gray-500 mt-1">Category: {item.category}</p>
                                    )}
                                    {/* Variant Information */}
                                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                                      {item.color && (
                                        <p>Color: <span className="font-medium">{item.color}</span></p>
                                      )}
                                      {item.size && (
                                        <p>Size: <span className="font-medium">{item.size}</span></p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <div className="text-gray-600">
                                      Qty: <span className="font-semibold">{item.quantity}</span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">£{(item.price || 0).toFixed(2)} each</p>
                                      <p className="font-semibold">£{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-semibold">£{order.totals.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-semibold">£{order.totals.shipping.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-semibold">£{order.totals.tax.toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between">
                            <span className="font-semibold">Grand Total</span>
                            <span className="font-semibold text-lg">£{order.totals.grandTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Last Updated */}
                        {order.updatedAt && (
                          <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                            Last updated: {new Date(order.updatedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
