import { createContext, useState, useEffect, useCallback } from 'react';

export const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('adminUser');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setAdminToken(token);
        setAdminUser(userData);
        setIsAdmin(userData.role === 'admin');
      } catch (error) {
        console.error('Failed to parse admin user:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.data.token) {
        const user = data.data.user;
        
        // Check if user is admin
        if (user.role !== 'admin') {
          throw new Error('User is not an admin');
        }

        // Save to localStorage and state
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        setAdminToken(data.data.token);
        setAdminUser(user);
        setIsAdmin(true);

        return { success: true, message: 'Admin logged in successfully' };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminToken(null);
    setAdminUser(null);
    setIsAdmin(false);
  }, []);

  // Verify token is still valid
  const verifyToken = useCallback(async () => {
    if (!adminToken) return false;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      return false;
    }
  }, [adminToken, logout]);

  const value = {
    adminUser,
    adminToken,
    loading,
    isAdmin,
    login,
    logout,
    verifyToken,
    isAuthenticated: !!adminToken && !!adminUser
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}
