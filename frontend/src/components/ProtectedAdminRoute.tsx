import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      setIsAuthorized(false);
      navigate('/admin-login', { replace: true });
      return;
    }

    setIsAuthorized(true);
  }, [navigate, location.pathname]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return null;
};
