import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

const Analytics: React.FC = () => {
  const salesData = [
    { date: 'Jan 1', sales: 4000, revenue: 2400 },
    { date: 'Jan 5', sales: 3000, revenue: 1398 },
    { date: 'Jan 10', sales: 2000, revenue: 9800 },
    { date: 'Jan 15', sales: 2780, revenue: 3908 },
    { date: 'Jan 20', sales: 1890, revenue: 4800 },
    { date: 'Jan 25', sales: 2390, revenue: 3800 },
    { date: 'Jan 30', sales: 3490, revenue: 4300 },
  ];

  const conversionData = [
    { week: 'Week 1', visitors: 4000, conversion: 240 },
    { week: 'Week 2', visitors: 3000, conversion: 221 },
    { week: 'Week 3', visitors: 2000, conversion: 229 },
    { week: 'Week 4', visitors: 2780, conversion: 200 },
  ];

  const topProducts = [
    { name: 'Summer Dress', sales: 234, revenue: 11700 },
    { name: 'Classic Blouse', sales: 189, revenue: 7551 },
    { name: 'Denim Jeans', sales: 156, revenue: 9324 },
    { name: 'T-Shirt', sales: 145, revenue: 4350 },
    { name: 'Accessories', sales: 98, revenue: 2450 },
  ];

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
            <Button variant="outline" className="gap-2">
              <Calendar size={18} /> Last 30 Days
            </Button>
            <Button variant="ghost">Last 90 Days</Button>
            <Button variant="ghost">Last Year</Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales & Revenue */}
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
                    <p className="font-semibold">${product.revenue}</p>
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
      <Tabs defaultValue="daily" className="w-full">
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
                  <p className="text-2xl font-bold text-blue-600">2,458</p>
                  <p className="text-xs text-gray-500 mt-1">+12% from yesterday</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-green-600">184</p>
                  <p className="text-xs text-gray-500 mt-1">+8% from yesterday</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">$4,250</p>
                  <p className="text-xs text-gray-500 mt-1">+15% from yesterday</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-orange-600">$73.26</p>
                  <p className="text-xs text-gray-500 mt-1">+2% from yesterday</p>
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
                  <p className="text-2xl font-bold text-blue-600">18,452</p>
                  <p className="text-xs text-gray-500 mt-1">+5% from last week</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-green-600">1,342</p>
                  <p className="text-xs text-gray-500 mt-1">+12% from last week</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">$31,890</p>
                  <p className="text-xs text-gray-500 mt-1">+18% from last week</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-orange-600">$73.78</p>
                  <p className="text-xs text-gray-500 mt-1">+3% from last week</p>
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
                  <p className="text-2xl font-bold text-blue-600">89,234</p>
                  <p className="text-xs text-gray-500 mt-1">+22% from last month</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-green-600">5,892</p>
                  <p className="text-xs text-gray-500 mt-1">+18% from last month</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">$145,250</p>
                  <p className="text-xs text-gray-500 mt-1">+25% from last month</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-orange-600">$74.32</p>
                  <p className="text-xs text-gray-500 mt-1">+1.5% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
