// Dynamic API Configuration - automatically finds backend
const getApiBaseUrl = () => {
  // Try environment variable first (VITE_API_URL takes precedence)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on current location
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    
    // If running on localhost, try to detect backend port dynamically
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Try ports in order of preference: 5000, 5001, 5002, 3000, 3001
      const commonPorts = [5000, 5001, 5002, 3000, 3001];
      
      // For now, default to 5000 (the dynamic server will find available port)
      // In production, this should be replaced with actual backend URL
      return `${protocol}//${hostname}:5000`;
    }
    
    // For production (same domain), use relative path to /api
    // This avoids hardcoding localhost and works with any domain
    return '';
  }
  
  // Server-side fallback (for SSR or tests)
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to detect backend port dynamically
export const detectBackendPort = async (): Promise<number> => {
  const commonPorts = [5000, 5001, 5002, 3000, 3001];
  
  for (const port of commonPorts) {
    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:${port}/api/products`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(1000), // 1 second timeout
      });
      
      if (response.ok) {
        console.log(`✅ Backend detected on port ${port}`);
        return port;
      }
    } catch (error) {
      // Port not available, try next one
      continue;
    }
  }
  
  // Default to 5000 if no port found
  console.warn('⚠️ Could not detect backend port, defaulting to 5000');
  return 5000;
};

// Helper function to get dynamic API URL
export const getDynamicApiUrl = async (): Promise<string> => {
  if (typeof window === 'undefined') {
    return API_BASE_URL;
  }
  
  const { protocol, hostname } = window.location;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const port = await detectBackendPort();
    return `${protocol}//${hostname}:${port}`;
  }
  
  return `${protocol}//${hostname}`;
};

console.log('🔗 API Base URL:', API_BASE_URL);

// Test API connection on load
const testApiConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(1000),
    });
  } catch (error) {
    if (error.message.includes('fetch')) {
      console.warn('⚠️ Backend connection failed. Make sure backend is running.');
    }
  }
};

// Test connection when module loads
testApiConnection();

export const api = {
  auth: {
    signup: async (data: { email: string; password: string; fullName: string; phone?: string; dateOfBirth: string; gender: string }) => {
      console.log('API: Attempting signup to:', `${API_BASE_URL}/api/auth/signup`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('API: Signup response:', { status: response.status, result });
      
      if (!response.ok) {
        throw new Error(result.message || 'Signup failed');
      }
      return result;
    },

    login: async (data: { email: string; password: string }) => {
      console.log('API: Attempting login to:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('API: Login response:', { status: response.status, result });
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      return result;
    },
  },
  cart: {
    getCart: async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch cart');
      }
      return result;
    },
    add: async (token: string, item: { id: string; name: string; price: number; quantity: number; image?: string; size?: string; color?: string; }) => {
      const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to add to cart');
      }
      return result;
    },
    remove: async (token: string, itemId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/cart/remove/${encodeURIComponent(itemId)}` , {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to remove from cart');
      }
      return result;
    },
    update: async (token: string, itemId: string, quantity: number) => {
      const response = await fetch(`${API_BASE_URL}/api/cart/update/${encodeURIComponent(itemId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update quantity');
      }
      return result;
    },
    clear: async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to clear cart');
      }
      return result;
    },
  },
  wishlist: {
    getWishlist: async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch wishlist');
      }
      return result;
    },
    add: async (token: string, item: { id: string; name: string; price?: number; image?: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to add to wishlist');
      }
      return result;
    },
    remove: async (token: string, itemId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/remove/${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to remove from wishlist');
      }
      return result;
    },
    clear: async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to clear wishlist');
      }
      return result;
    },
  },
};
