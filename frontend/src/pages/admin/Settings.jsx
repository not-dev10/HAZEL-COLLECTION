import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

import { API_BASE_URL } from '@/lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    storeInfo: {
      storeName: '',
      storeDescription: '',
      storeEmail: '',
      storePhone: '',
      storeAddress: ''
    },
    socialMedia: {
      instagram: '',
      facebook: '',
      tiktok: '',
      youtube: '',
      twitter: '',
      linkedin: ''
    },
    paymentMethods: {
      methods: []
    },
    shippingRates: {
      rates: []
    },
    businessHours: {
      hours: {}
    },
    currency: {
      code: 'PKR',
      symbol: '₨',
      taxRate: 0
    }
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/settings`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          storeInfo: data.data.storeInfo || prev.storeInfo,
          socialMedia: data.data.socialMedia || prev.socialMedia,
          paymentMethods: data.data.paymentMethods || prev.paymentMethods,
          shippingRates: data.data.shippingRates || prev.shippingRates,
          businessHours: data.data.businessHours || prev.businessHours,
          currency: data.data.currency || prev.currency
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showMessage('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleStoreInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      storeInfo: { ...prev.storeInfo, [name]: value }
    }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [name]: value }
    }));
  };

  const handlePaymentMethodsChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      paymentMethods: {
        methods: checked
          ? [...prev.paymentMethods.methods, { name: value, enabled: true }]
          : prev.paymentMethods.methods.filter(m => m.name !== value)
      }
    }));
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      currency: { ...prev.currency, [name]: name === 'taxRate' ? parseFloat(value) : value }
    }));
  };

  const saveStoreInfo = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/settings/store-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData.storeInfo)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Store info updated successfully');
      } else {
        showMessage(data.message || 'Failed to update', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error updating store info', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveSocialMedia = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/settings/social-media`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData.socialMedia)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Social media links updated successfully');
      } else {
        showMessage(data.message || 'Failed to update', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error updating social media', 'error');
    } finally {
      setSaving(false);
    }
  };

  const savePaymentMethods = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/settings/payment-methods`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData.paymentMethods)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Payment methods updated successfully');
      } else {
        showMessage(data.message || 'Failed to update', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error updating payment methods', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveCurrency = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/settings/currency`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData.currency)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Currency settings updated successfully');
      } else {
        showMessage(data.message || 'Failed to update', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error updating currency settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const paymentOptions = ['Credit Card', 'Bank Transfer', 'Cash on Delivery', 'Digital Wallet'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-600 mt-2">Manage store information, contact details, and business configuration</p>
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

      {/* Tabs */}
      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="store">Store Info</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
        </TabsList>

        {/* Store Info Tab */}
        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <Input
                  type="text"
                  name="storeName"
                  value={formData.storeInfo.storeName}
                  onChange={handleStoreInfoChange}
                  placeholder="Hezal the Label"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  name="storeDescription"
                  value={formData.storeInfo.storeDescription}
                  onChange={handleStoreInfoChange}
                  placeholder="Store description..."
                  className="w-full"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="storeEmail"
                  value={formData.storeInfo.storeEmail}
                  onChange={handleStoreInfoChange}
                  placeholder="contact@hezalthelabel.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  name="storePhone"
                  value={formData.storeInfo.storePhone}
                  onChange={handleStoreInfoChange}
                  placeholder="+92-300-1234567"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Textarea
                  name="storeAddress"
                  value={formData.storeInfo.storeAddress}
                  onChange={handleStoreInfoChange}
                  placeholder="Store address..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <Button
                onClick={saveStoreInfo}
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Store Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(formData.socialMedia).map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {key}
                  </label>
                  <Input
                    type="url"
                    name={key}
                    value={formData.socialMedia[key]}
                    onChange={handleSocialMediaChange}
                    placeholder={`https://${key}.com/hezalthelabel`}
                    className="w-full"
                  />
                </div>
              ))}

              <Button
                onClick={saveSocialMedia}
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Social Media
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Enable/disable payment methods:</p>
              {paymentOptions.map(method => (
                <div key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    id={method}
                    value={method}
                    checked={formData.paymentMethods.methods.some(m => m.name === method)}
                    onChange={handlePaymentMethodsChange}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <label htmlFor={method} className="ml-2 text-sm text-gray-700">
                    {method}
                  </label>
                </div>
              ))}

              <Button
                onClick={savePaymentMethods}
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Payment Methods
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Tab */}
        <TabsContent value="currency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currency & Tax Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Code
                </label>
                <Input
                  type="text"
                  name="code"
                  value={formData.currency.code}
                  onChange={handleCurrencyChange}
                  placeholder="PKR"
                  maxLength="3"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Symbol
                </label>
                <Input
                  type="text"
                  name="symbol"
                  value={formData.currency.symbol}
                  onChange={handleCurrencyChange}
                  placeholder="₨"
                  maxLength="3"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <Input
                  type="number"
                  name="taxRate"
                  value={formData.currency.taxRate}
                  onChange={handleCurrencyChange}
                  placeholder="17"
                  step="0.1"
                  className="w-full"
                />
              </div>

              <Button
                onClick={saveCurrency}
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Currency Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

