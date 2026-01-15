import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenManager from '@/utils/tokenManager';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is authenticated and is admin
    const isAuth = TokenManager.isAuthenticated();
    const token = TokenManager.getAccessToken();
    const user = TokenManager.getAdminUser();

    console.log('🔐 ProtectedAdminRoute Check:', {
      isAuth,
      hasToken: !!token,
      hasUser: !!user,
      userRole: user?.role
    });

    if (!isAuth || !token || !user || user.role !== 'admin') {
      console.warn('❌ User not authorized for admin route');
      setIsAuthorized(false);
      navigate('/admin-login', { replace: true });
      return;
    }

    console.log('✅ User authorized for admin route');
    setIsAuthorized(true);
  }, [navigate]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return null;
};
