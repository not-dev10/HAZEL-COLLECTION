import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  total: number;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Get auth token or guest session
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Check for JWT token (check both sessionStorage and localStorage for compatibility)
  let token = sessionStorage.getItem('authToken') || localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Use guest session
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
      sessionId = `guest_${generateUUID()}`;
      localStorage.setItem('guestSessionId', sessionId);
    }
    headers['Authorization'] = `Guest ${sessionId}`;
  }

  return headers;
};

// Generate UUID for guest sessions
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart from API on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
          headers: getAuthHeaders(),
        });
        
        if (response.ok) {
          const data = await response.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('cart');
        if (saved) {
          setItems(JSON.parse(saved));
        }
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = async (newItem: CartItem) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.cart.items || []);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Fallback to local update
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === newItem.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        }
        return [...prevItems, newItem];
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.cart.items || []);
      } else {
        throw new Error('Failed to remove from cart');
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      // Fallback to local update
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.cart.items || []);
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Fallback to local update
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setItems([]);
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      // Fallback to local clear
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
