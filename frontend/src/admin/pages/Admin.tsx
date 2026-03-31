import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAdmin } from '../context/AdminContext';
import Products from './Products';
import Orders from './Orders';
import Customers from './Customers';
import SupportReviews from './SupportReviews';
import Settings from './Settings';
import TechStackHealth from './TechStackHealth';
import HomePageEditor from '@/pages/admin/HomePageEditor';

const Admin: React.FC = () => {
  const { selectedTab } = useAdmin();

  const renderContent = () => {
    switch (selectedTab) {
      case 'home-page':
        return <HomePageEditor />;
      case 'products':
        return <Products />;
      case 'orders':
        return <Orders />;
      case 'customers':
        return <Customers />;
      case 'supportreviews':
        return <SupportReviews />;
      case 'settings':
        return <Settings />;
      case 'techstack':
        return <TechStackHealth />;
      default:
        return <HomePageEditor />;
    }
  };

  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;
