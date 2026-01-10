import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 45250,
    totalOrders: 342,
    totalProducts: 1205,
    totalCustomers: 856,
    inventoryCount: 5420,
    lowStockProducts: 12,
    pendingOrders: 28,
    completedOrders: 314,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('dashboard');

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
