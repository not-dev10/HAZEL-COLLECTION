import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAdmin } from '../context/AdminContext';
import Dashboard from './Dashboard';
import Products from './Products';
import Orders from './Orders';
import Inventory from './Inventory';
import Customers from './Customers';
import Analytics from './Analytics';
import SupportReviews from './SupportReviews';
import Settings from './Settings';
import TechStackHealth from './TechStackHealth';

const Admin: React.FC = () => {
  const { selectedTab } = useAdmin();

  const renderContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'orders':
        return <Orders />;
      case 'inventory':
        return <Inventory />;
      case 'customers':
        return <Customers />;
      case 'analytics':
        return <Analytics />;
      case 'supportreviews':
        return <SupportReviews />;
      case 'settings':
        return <Settings />;
      case 'techstack':
        return <TechStackHealth />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;
