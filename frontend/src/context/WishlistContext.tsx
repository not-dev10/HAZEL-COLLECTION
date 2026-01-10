import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  addedAt: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (itemId: string) => boolean;
  clearWishlist: () => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

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

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from API on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          // API returns items at root level for GET
          const wishlistItems = data.items || [];
          setItems(wishlistItems);
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('wishlist');
        if (saved) {
          try {
            setItems(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse saved wishlist:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  const wishlistCount = items.length;

  const addToWishlist = async (newItem: WishlistItem) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/wishlist/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: newItem.id,
          name: newItem.name,
          price: newItem.price,
          image: newItem.image,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // API returns items nested in wishlist object for POST
        const wishlistItems = data.wishlist?.items || [];
        setItems(wishlistItems);
      } else {
        throw new Error('Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      // Fallback to local update
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === newItem.id);
        if (existingItem) {
          return prevItems;
        }
        const itemWithTimestamp = {
          ...newItem,
          addedAt: typeof newItem.addedAt === 'number' ? newItem.addedAt : Date.now(),
        };
        return [...prevItems, itemWithTimestamp];
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/wishlist/remove/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        // API returns items nested in wishlist object for DELETE
        const wishlistItems = data.wishlist?.items || [];
        setItems(wishlistItems);
      } else {
        throw new Error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      // Fallback to local update
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (itemId: string) => {
    return items.some((item) => item.id === itemId);
  };

  const clearWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/wishlist/clear`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setItems([]);
      } else {
        throw new Error('Failed to clear wishlist');
      }
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      // Fallback to local clear
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
