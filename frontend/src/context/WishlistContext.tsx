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

// Generate UUID for guest sessions
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Initialize or retrieve guest session ID (ensures it persists)
const initializeGuestSession = () => {
  let sessionId = localStorage.getItem('guestSessionId');
  if (!sessionId) {
    sessionId = `guest_${generateUUID()}`;
    localStorage.setItem('guestSessionId', sessionId);
    console.log('🆕 Generated new guest session:', sessionId);
  } else {
    console.log('♻️ Using existing guest session:', sessionId);
  }
  return sessionId;
};

// Get auth token or guest session
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Check for JWT token (check both sessionStorage and localStorage for compatibility)
  let token = sessionStorage.getItem('authToken') || localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Using JWT token for auth');
  } else {
    // Use guest session - always initialized
    const sessionId = localStorage.getItem('guestSessionId') || initializeGuestSession();
    headers['Authorization'] = `Guest ${sessionId}`;
    console.log('👤 Using guest session:', sessionId);
  }

  return headers;
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from API on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        
        // Ensure guest session is initialized first
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          initializeGuestSession();
        }
        
        const headers = getAuthHeaders();
        console.log('📦 Loading wishlist with headers:', headers);
        
        const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
          headers: headers,
        });

        if (response.ok) {
          const data = await response.json();
          // API returns items at root level for GET
          const wishlistItems = data.items || [];
          setItems(wishlistItems);
          console.log('✅ Wishlist loaded:', wishlistItems.length, 'items');
          console.log('📊 Session info:', { sessionId: data.sessionId, userId: data.userId, isGuest: data.isGuest });
        } else {
          console.warn('⚠️ Wishlist fetch returned status:', response.status);
          // Still try to parse the response
          const data = await response.json().catch(() => ({}));
          const wishlistItems = data.items || [];
          setItems(wishlistItems);
        }
      } catch (error) {
        console.error('❌ Failed to load wishlist:', error);
        // Fallback to localStorage only if API fails
        const saved = localStorage.getItem('wishlist');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setItems(parsed);
            console.log('⚠️ Loaded wishlist from localStorage as fallback:', parsed.length, 'items');
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
      
      // Ensure item has timestamp
      const itemToAdd = {
        ...newItem,
        addedAt: typeof newItem.addedAt === 'number' ? newItem.addedAt : Date.now(),
      };
      
      const headers = getAuthHeaders();
      console.log('➕ Adding item to wishlist:', itemToAdd.name, 'with headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/api/wishlist/add`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          id: itemToAdd.id,
          name: itemToAdd.name,
          price: itemToAdd.price,
          image: itemToAdd.image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add to wishlist: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Add response:', data);
      
      // API returns items nested in wishlist object for POST
      const wishlistItems = data.wishlist?.items || [];
      setItems(wishlistItems);
      console.log('💾 Wishlist updated with', wishlistItems.length, 'items after add');
    } catch (error) {
      console.error('❌ Failed to add to wishlist:', error);
      alert(`Failed to add item to wishlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error; // Re-throw so the button component knows it failed
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to remove from wishlist: ${response.status}`);
      }

      const data = await response.json();
      // API returns items nested in wishlist object for DELETE
      const wishlistItems = data.wishlist?.items || [];
      setItems(wishlistItems);
      console.log('✅ Item removed from wishlist:', itemId);
    } catch (error) {
      console.error('❌ Failed to remove from wishlist:', error);
      throw error; // Re-throw so the button component knows it failed
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to clear wishlist: ${response.status}`);
      }

      setItems([]);
      console.log('✅ Wishlist cleared');
    } catch (error) {
      console.error('❌ Failed to clear wishlist:', error);
      throw error; // Re-throw so the component knows it failed
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
