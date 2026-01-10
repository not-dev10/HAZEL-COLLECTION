import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Lock, User, CreditCard, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const Settings: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  const [settings, setSettings] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    storeDescription: '',
    currency: 'PKR',
    taxRate: 0,
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    twitter: '',
    linkedin: '',
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`);
      const data = await response.json();
      if (data.success && data.data) {
        setSettings(prev => ({
          ...prev,
          storeName: data.data.storeInfo?.storeName || '',
          storeEmail: data.data.storeInfo?.storeEmail || '',
          storePhone: data.data.storeInfo?.storePhone || '',
          storeAddress: data.data.storeInfo?.storeAddress || '',
          storeDescription: data.data.storeInfo?.storeDescription || '',
          currency: data.data.currency?.code || 'PKR',
          taxRate: data.data.currency?.taxRate || 0,
          instagram: data.data.socialMedia?.instagram || '',
          facebook: data.data.socialMedia?.facebook || '',
          tiktok: data.data.socialMedia?.tiktok || '',
          youtube: data.data.socialMedia?.youtube || '',
          twitter: data.data.socialMedia?.twitter || '',
          linkedin: data.data.socialMedia?.linkedin || '',
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showMessage('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
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
        body: JSON.stringify({
          storeName: settings.storeName,
          storeEmail: settings.storeEmail,
          storePhone: settings.storePhone,
          storeAddress: settings.storeAddress,
          storeDescription: settings.storeDescription
        })
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
        body: JSON.stringify({
          instagram: settings.instagram,
          facebook: settings.facebook,
          tiktok: settings.tiktok,
          youtube: settings.youtube,
          twitter: settings.twitter,
          linkedin: settings.linkedin
        })
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
        body: JSON.stringify({
          code: settings.currency,
          taxRate: settings.taxRate
        })
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

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your admin panel and store settings.</p>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Update your store details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {message && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{message.text}</span>
                </div>
              )}
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Store Name</label>
                      <Input
                        value={settings.storeName}
                        onChange={(e) => setSettings(prev => ({...prev, storeName: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Currency</label>
                      <Input
                        value={settings.currency}
                        onChange={(e) => setSettings(prev => ({...prev, currency: e.target.value}))}
                        placeholder="PKR"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        type="email"
                        value={settings.storeEmail}
                        onChange={(e) => setSettings(prev => ({...prev, storeEmail: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <Input
                        value={settings.storePhone}
                        onChange={(e) => setSettings(prev => ({...prev, storePhone: e.target.value}))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <textarea
                        value={settings.storeAddress}
                        onChange={(e) => setSettings(prev => ({...prev, storeAddress: e.target.value}))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={settings.storeDescription}
                        onChange={(e) => setSettings(prev => ({...prev, storeDescription: e.target.value}))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={saveStoreInfo}
                    disabled={saving}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Store Info
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Instagram</label>
                <Input
                  type="url"
                  value={settings.instagram}
                  onChange={(e) => setSettings(prev => ({...prev, instagram: e.target.value}))}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Facebook</label>
                <Input
                  type="url"
                  value={settings.facebook}
                  onChange={(e) => setSettings(prev => ({...prev, facebook: e.target.value}))}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">TikTok</label>
                <Input
                  type="url"
                  value={settings.tiktok}
                  onChange={(e) => setSettings(prev => ({...prev, tiktok: e.target.value}))}
                  placeholder="https://tiktok.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">YouTube</label>
                <Input
                  type="url"
                  value={settings.youtube}
                  onChange={(e) => setSettings(prev => ({...prev, youtube: e.target.value}))}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Twitter</label>
                <Input
                  type="url"
                  value={settings.twitter}
                  onChange={(e) => setSettings(prev => ({...prev, twitter: e.target.value}))}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                <Input
                  type="url"
                  value={settings.linkedin}
                  onChange={(e) => setSettings(prev => ({...prev, linkedin: e.target.value}))}
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <Button 
                onClick={saveSocialMedia}
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Social Media
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Currency & Tax</CardTitle>
              <CardDescription>Configure currency and tax settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Currency Code</label>
                <Input
                  value={settings.currency}
                  onChange={(e) => setSettings(prev => ({...prev, currency: e.target.value}))}
                  placeholder="PKR"
                  maxLength="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                <Input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings(prev => ({...prev, taxRate: parseFloat(e.target.value)}))}
                  placeholder="17"
                  step="0.1"
                />
              </div>
              <Button 
                onClick={saveCurrency}
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Currency Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Control which emails you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-600" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive email notifications</p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-gray-600" />
                  <div>
                    <p className="font-medium">Order Alerts</p>
                    <p className="text-sm text-gray-600">Get notified for new orders</p>
                  </div>
                </div>
                <Switch
                  checked={settings.orderAlerts}
                  onCheckedChange={() => handleToggle('orderAlerts')}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-gray-600" />
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-gray-600">Get notified when stock is low</p>
                  </div>
                </div>
                <Switch
                  checked={settings.lowStockAlerts}
                  onCheckedChange={() => handleToggle('lowStockAlerts')}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-gray-600" />
                  <div>
                    <p className="font-medium">Review Notifications</p>
                    <p className="text-sm text-gray-600">Get notified for new reviews</p>
                  </div>
                </div>
                <Switch
                  checked={settings.reviewNotifications}
                  onCheckedChange={() => handleToggle('reviewNotifications')}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-600" />
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-gray-600">Receive marketing communications</p>
                  </div>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={() => handleToggle('marketingEmails')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Secure your admin account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={() => handleToggle('twoFactorAuth')}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Active Sessions</h4>
                <div className="space-y-2">
                  <div className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-600">Chrome on Windows • 127.0.0.1</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>Connect external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Gateway</p>
                  <p className="text-sm text-gray-600">Stripe Integration</p>
                </div>
                <Badge variant="default">Connected</Badge>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Service</p>
                  <p className="text-sm text-gray-600">SendGrid Integration</p>
                </div>
                <Button variant="outline">Connect</Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-gray-600">Google Analytics</p>
                </div>
                <Button variant="outline">Connect</Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">Shipping</p>
                  <p className="text-sm text-gray-600">ShipStation Integration</p>
                </div>
                <Button variant="outline">Connect</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

