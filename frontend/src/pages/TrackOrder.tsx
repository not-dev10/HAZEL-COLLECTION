import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Package, Truck, CheckCircle2, AlertCircle, Clock, Lock } from 'lucide-react';
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
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt?: string;
}

type TrackingStep = 'request' | 'verify' | 'view';

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<TrackingStep>('request');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // Request step
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
  const [email, setEmail] = useState('');

  // Verify step
  const [otp, setOtp] = useState('');

  const requestOTP = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!orderNumber.trim() || !email.trim()) {
      setError('Please enter both order number and email');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/orders/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to request OTP');
        return;
      }

      setStep('verify');
      setOtpTimer(600); // 10 minutes
      setOtp('');
      setError('');
    } catch (error) {
      console.error('Failed to request OTP:', error);
      setError('Error requesting OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/orders/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber,
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to verify OTP');
        return;
      }

      setOrder(data.order);
      setStep('view');
      setOtp('');
      setError('');
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      setError('Error verifying OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('request');
    setOrder(null);
    setOrderNumber('');
    setEmail('');
    setOtp('');
    setError('');
    setOtpTimer(0);
  };

  // OTP timer countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    
    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskEmail = (emailStr: string) => {
    const [localPart, domain] = emailStr.split('@');
    if (!domain) return emailStr;
    
    const maskedLocal = localPart.length > 2 
      ? localPart.substring(0, 2) + '*'.repeat(Math.max(1, localPart.length - 2))
      : '*'.repeat(localPart.length);
    
    return `${maskedLocal}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) return '*'.repeat(digits.length);
    
    const first2 = digits.substring(0, 2);
    const last2 = digits.substring(digits.length - 2);
    const masked = '*'.repeat(digits.length - 4);
    
    return `${first2}${masked}${last2}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <AnnouncementBar />
      <Header />
      <ScrollToTop />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
            <p className="text-gray-600">Verify your order with OTP sent to your email.</p>
          </div>

          {/* Step 1: Request OTP */}
          {step === 'request' && (
            <Card className="mb-8 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Request Verification Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={requestOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Number</label>
                    <Input
                      type="text"
                      placeholder="e.g., ORD-4BB719DD"
                      value={orderNumber}
                      onChange={(e) => {
                        setOrderNumber(e.target.value);
                        setError('');
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className="w-full"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>

                  <p className="text-sm text-gray-600 text-center">
                    We'll send a 6-digit code to your email.
                  </p>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'verify' && (
            <Card className="mb-8 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Enter Verification Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={verifyOTP} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-blue-800 text-sm">
                      Code sent to <strong>{maskEmail(email)}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">6-Digit Code</label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setError('');
                      }}
                      maxLength={6}
                      className="w-full text-center text-2xl tracking-widest"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Code expires in:</span>
                    <span className={`font-semibold ${otpTimer < 120 ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatTime(otpTimer)}
                    </span>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & View Order'
                    )}
                  </Button>

                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep('request')}
                  >
                    Back
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Order Details */}
          {step === 'view' && order && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="border-b border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">Order {order.orderNumber}</CardTitle>
                      <p className="text-sm text-green-700">Verified on {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Recipient</p>
                      <p className="font-semibold">{order.personalInfo.firstName} {order.personalInfo.lastName}</p>
                      <p className="text-sm text-gray-600">{maskEmail(order.personalInfo.email)}</p>
                      <p className="text-sm text-gray-600">{maskPhone(order.personalInfo.phone)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Order Total</p>
                      <p className="text-2xl font-bold text-purple-600">₹{order.totals.grandTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Truck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-blue-900">Your package is on the way</p>
                        <p className="text-sm text-blue-800 mt-1">Tracking Number: <span className="font-mono font-bold">{order.trackingNumber}</span></p>
                        {order.estimatedDelivery && (
                          <p className="text-sm text-blue-800 mt-2">Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                          {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{order.totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>₹{order.totals.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span>₹{order.totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>₹{order.totals.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={resetForm}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Track Another Order
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
