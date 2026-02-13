import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Loader2 } from 'lucide-react';
import TokenManager from '@/utils/tokenManager';

const Analytics: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);
  const [period, setPeriod] = useState('daily');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const adminToken = TokenManager.getAccessToken();

      if (!adminToken) {
        console.error('No admin token');
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      };

      // Fetch all data in parallel
      const [salesRes, conversionRes, productsRes, metricsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/analytics/sales-revenue?days=${dateRange}`, { headers }),
        fetch(`${API_BASE_URL}/api/analytics/conversion`, { headers }),
        fetch(`${API_BASE_URL}/api/analytics/top-products?limit=5`, { headers }),
        fetch(`${API_BASE_URL}/api/analytics/metrics?period=${period}`, { headers })
      ]);

      const salesData = await salesRes.json();
      const conversionData = await conversionRes.json();
      const productsData = await productsRes.json();
      const metricsData = await metricsRes.json();

      if (salesData.success) setSalesData(salesData.data || []);
      if (conversionData.success) setConversionData(conversionData.data || []);
      if (productsData.success) setTopProducts(productsData.data || []);
      if (metricsData.success) setMetrics(metricsData.data || {});

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600 mt-1">Deep dive into your business metrics and performance.</p>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button 
              variant={dateRange === 30 ? "default" : "outline"} 
              className="gap-2"
              onClick={() => setDateRange(30)}
            >
              <Calendar size={18} /> Last 30 Days
            </Button>
            <Button 
              variant={dateRange === 90 ? "default" : "ghost"}
              onClick={() => setDateRange(90)}
            >
              Last 90 Days
            </Button>
            <Button 
              variant={dateRange === 365 ? "default" : "ghost"}
              onClick={() => setDateRange(365)}
            >
              Last Year
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center py-8">
            <Loader2 className="animate-spin mr-2" size={24} />
            <p>Loading analytics...</p>
          </CardContent>
        </Card>
      )}

      {!loading && (
      <>
      <Card>
        <CardHeader>
          <CardTitle>Sales & Revenue Trend</CardTitle>
          <CardDescription>Daily sales and revenue metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" fill="#9333ea" stroke="#9333ea" />
              <Area type="monotone" dataKey="sales" fill="#ec4899" stroke="#ec4899" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Conversion</CardTitle>
            <CardDescription>Weekly conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visitors" fill="#3b82f6" />
                <Bar dataKey="conversion" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products by sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">£{product.revenue}</p>
                    <div className="w-20 h-2 bg-gray-200 rounded mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded"
                        style={{ width: `${(product.sales / topProducts[0].sales) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="daily" className="w-full" onValueChange={(value) => setPeriod(value)}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Unique Visitors</p>
                  <p className="text-2xl font-bold text-blue-600">{(metrics.uniqueVisitors || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Estimated daily visitors</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.transactions || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Daily orders</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">£{(metrics.revenue || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Daily revenue</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-orange-600">£{(metrics.avgOrderValue || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Average per order</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Unique Visitors</p>
                  <p className="text-2xl font-bold text-blue-600">{((metrics.uniqueVisitors || 0) * 7).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Weekly visitors</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-green-600">{(metrics.transactions || 0) * 7}</p>
                  <p className="text-xs text-gray-500 mt-1">Weekly orders</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">£{((metrics.revenue || 0) * 7).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Weekly revenue</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-orange-600">£{(metrics.avgOrderValue || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Average per order</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Unique Visitors</p>
                  <p className="text-2xl font-bold text-blue-600">{((metrics.uniqueVisitors || 0) * 30).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Monthly visitors</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-green-600">{(metrics.transactions || 0) * 30}</p>
                  <p className="text-xs text-gray-500 mt-1">Monthly orders</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">£{((metrics.revenue || 0) * 30).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Monthly revenue</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-orange-600">£{(metrics.avgOrderValue || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Average per order</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </>
      )}
    </div>
  );
};

export default Analytics;
