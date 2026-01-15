import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { fetchDashboardStats } from '../services/dashboardApi';
import TokenManager from '@/utils/tokenManager';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  inventoryCount: number;
  lowStockProducts: number;
  pendingOrders: number;
  completedOrders: number;
}

interface AdminContextType {
  stats: DashboardStats;
  updateStats: (stats: Partial<DashboardStats>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  refreshStats: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Default fallback stats
const DEFAULT_STATS: DashboardStats = {
  totalRevenue: 0,
  totalOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
  inventoryCount: 0,
  lowStockProducts: 0,
  pendingOrders: 0,
  completedOrders: 0,
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  // Fetch real dashboard stats
  const refreshStats = async () => {
    try {
      // Check if user is authenticated before fetching
      const isAuth = TokenManager.isAuthenticated();
      const token = TokenManager.getAccessToken();
      
      console.log('🔐 Token Check:', { isAuth, hasToken: !!token });
      
      if (!isAuth || !token) {
        console.warn('❌ User not authenticated. Skipping dashboard stats fetch.');
        setIsLoading(false);
        return;
      }

      console.log('✅ User authenticated. Fetching stats...');
      setIsLoading(true);
      const realStats = await fetchDashboardStats();
      setStats(realStats);
      console.log('📊 Stats fetched:', realStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Keep existing stats on error
    } finally {
      setIsLoading(false);
    }
  };

  // Load stats on mount
  useEffect(() => {
    refreshStats();
  }, []);

  const updateStats = (newStats: Partial<DashboardStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  return (
    <AdminContext.Provider
      value={{
        stats,
        updateStats,
        isLoading,
        setIsLoading,
        selectedTab,
        setSelectedTab,
        refreshStats,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
