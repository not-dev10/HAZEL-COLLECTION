import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '../context/AdminContext';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Dashboard: React.FC = () => {
  const { stats } = useAdmin();

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4000, orders: 240 },
    { month: 'Feb', revenue: 3000, orders: 221 },
    { month: 'Mar', revenue: 2000, orders: 229 },
    { month: 'Apr', revenue: 2780, orders: 200 },
    { month: 'May', revenue: 1890, orders: 229 },
    { month: 'Jun', revenue: 2390, orders: 200 },
  ];

  const categoryData = [
    { name: 'Dresses', value: 35 },
    { name: 'Accessories', value: 25 },
    { name: 'Tops', value: 20 },
    { name: 'Bottoms', value: 15 },
    { name: 'Others', value: 5 },
  ];

  const COLORS = ['#9333ea', '#ec4899', '#f97316', '#3b82f6', '#10b981'];

  const StatCard = ({ 
    title, 
    value, 
    change, 
    isPositive, 
    icon: Icon 
  }: { 
    title: string; 
    value: number | string; 
    change: number; 
    isPositive: boolean;
    icon?: React.ElementType;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            <div className={`flex items-center gap-1 mt-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}% from last month</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`£${(stats.totalRevenue / 1000).toFixed(1)}K`}
          change={12}
          isPositive={true}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders}
          change={8}
          isPositive={true}
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts}
          change={-2}
          isPositive={false}
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers}
          change={15}
          isPositive={true}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inventoryCount}</div>
            <p className="text-xs text-gray-600 mt-1">Total units in stock</p>
            <Badge variant="destructive" className="mt-3">
              <AlertCircle size={14} className="mr-1" /> {stats.lowStockProducts} low stock
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pendingOrders}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting shipment</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
            <p className="text-xs text-gray-600 mt-1">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Orders Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Orders</CardTitle>
            <CardDescription>Last 6 months performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#9333ea" name="Revenue (£)" />
                <Bar dataKey="orders" fill="#ec4899" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Sales by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue for the current month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                { day: 'Day 1', revenue: 1200 },
                { day: 'Day 5', revenue: 2100 },
                { day: 'Day 10', revenue: 1800 },
                { day: 'Day 15', revenue: 2500 },
                { day: 'Day 20', revenue: 2200 },
                { day: 'Day 25', revenue: 3100 },
                { day: 'Day 30', revenue: 3500 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#9333ea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
