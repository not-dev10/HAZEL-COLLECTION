/**
 * Dashboard API Service
 * Fetches real analytics and dashboard data from the backend
 */

import { API_BASE_URL } from '@/lib/api';
import TokenManager from '@/utils/tokenManager';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  inventoryCount: number;
  lowStockProducts: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface ChartData {
  date?: string;
  month?: string;
  day?: string;
  week?: string;
  revenue?: number;
  sales?: number;
  orders?: number;
  name?: string;
  value?: number;
  visitors?: number;
  conversion?: number;
}

export interface AnalyticsData {
  revenueData: ChartData[];
  categoryData: ChartData[];
  trendData: ChartData[];
}

/**
 * Fetch dashboard stats (total counts, inventory, orders)
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const accessToken = TokenManager.getAccessToken();
    
    if (!accessToken) {
      console.warn('❌ No access token found. Returning default stats.');
      // Return default stats instead of throwing
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        inventoryCount: 0,
        lowStockProducts: 0,
        pendingOrders: 0,
        completedOrders: 0,
      };
    }

    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('📊 Fetching dashboard stats with token:', accessToken.substring(0, 20) + '...');
    console.log(`   Date range: ${startDateStr} to ${endDateStr}`);
    
    const [orderStats, customerStats, productCount] = await Promise.all([
      fetch(`${API_BASE_URL}/api/orders-management/admin/stats?startDate=${startDateStr}&endDate=${endDateStr}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }).then(async r => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Orders stats failed: ${r.status} ${text}`);
        }
        return r.json();
      }),
      fetch(`${API_BASE_URL}/api/customers/stats`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }).then(async r => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Customer stats failed: ${r.status} ${text}`);
        }
        return r.json();
      }),
      fetch(`${API_BASE_URL}/api/products?limit=1&offset=0`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }).then(async r => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Products count failed: ${r.status} ${text}`);
        }
        return r.json();
      })
    ]);

    // Extract revenue from orders
    const totalRevenue = orderStats.data?.totalRevenue || 0;
    const totalOrders = orderStats.data?.totalOrders || 0;
    const pendingOrders = orderStats.data?.pendingOrders || 0;
    const completedOrders = orderStats.data?.completedOrders || 0;

    // Extract customer data
    const totalCustomers = customerStats.data?.total || 0;

    // Extract product count
    const totalProducts = productCount.pagination?.total || 0;

    // Mock inventory for now (will be replaced with real inventory count)
    const inventoryCount = 5420;
    const lowStockProducts = 12;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      inventoryCount,
      lowStockProducts,
      pendingOrders,
      completedOrders,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetch analytics data (charts)
 */
export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.warn('No access token found. Returning default analytics data.');
      // Return default data instead of throwing
      return {
        revenueData: getDefaultRevenueData(),
        categoryData: getDefaultCategoryData(),
        trendData: getDefaultTrendData()
      };
    }

    const [salesData, conversionData, topProducts] = await Promise.all([
      fetch(`${API_BASE_URL}/api/analytics/sales-revenue?days=30`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }).then(async r => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Analytics failed: ${r.status} ${text}`);
        }
        return r.json();
      }),
      fetch(`${API_BASE_URL}/api/analytics/conversion`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }).then(async r => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Conversion data failed: ${r.status} ${text}`);
        }
        return r.json();
      }),
      fetch(`${API_BASE_URL}/api/analytics/top-products?limit=5`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }).then(async r => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Top products failed: ${r.status} ${text}`);
        }
        return r.json();
      })
    ]);

    // Format revenue data (last 6 months equivalent)
    const revenueData = (salesData.data || []).slice(-6).map((item: any) => ({
      month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
      revenue: Math.round(item.revenue),
      orders: item.sales || 0
    }));

    // Format category data from top products
    const categoryData = (topProducts.data || []).slice(0, 5).map((item: any) => ({
      name: item.name || 'Unknown',
      value: item.sales || 0
    }));

    // Format trend data (daily revenue for current month)
    const trendData = (salesData.data || []).slice(-30).map((item: any, index: number) => ({
      day: `Day ${index + 1}`,
      revenue: Math.round(item.revenue)
    }));

    return {
      revenueData: revenueData.length > 0 ? revenueData : getDefaultRevenueData(),
      categoryData: categoryData.length > 0 ? categoryData : getDefaultCategoryData(),
      trendData: trendData.length > 0 ? trendData : getDefaultTrendData()
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    // Return default data on error
    return {
      revenueData: getDefaultRevenueData(),
      categoryData: getDefaultCategoryData(),
      trendData: getDefaultTrendData()
    };
  }
};

/**
 * Default fallback data
 */
const getDefaultRevenueData = () => [
  { month: 'Jan', revenue: 4000, orders: 240 },
  { month: 'Feb', revenue: 3000, orders: 221 },
  { month: 'Mar', revenue: 2000, orders: 229 },
  { month: 'Apr', revenue: 2780, orders: 200 },
  { month: 'May', revenue: 1890, orders: 229 },
  { month: 'Jun', revenue: 2390, orders: 200 },
];

const getDefaultCategoryData = () => [
  { name: 'Dresses', value: 35 },
  { name: 'Accessories', value: 25 },
  { name: 'Tops', value: 20 },
  { name: 'Bottoms', value: 15 },
  { name: 'Others', value: 5 },
];

const getDefaultTrendData = () => [
  { day: 'Day 1', revenue: 1200 },
  { day: 'Day 5', revenue: 2100 },
  { day: 'Day 10', revenue: 1800 },
  { day: 'Day 15', revenue: 2500 },
  { day: 'Day 20', revenue: 2200 },
  { day: 'Day 25', revenue: 3100 },
  { day: 'Day 30', revenue: 3500 },
];
