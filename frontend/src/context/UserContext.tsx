import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role?: string;
  createdAt?: string;
  // Optional extended profile fields
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  joinDate?: string;
}

interface UserContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserProfile | null>(() => {
    // Load from sessionStorage if token exists
    const token = sessionStorage.getItem('authToken');
    if (token) {
      // Try to load user data from sessionStorage
      const savedUser = sessionStorage.getItem('user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      // Store user data in sessionStorage
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      // Clear user data if logged out
      sessionStorage.removeItem('user');
    }
  }, [user]);

  const updateProfile = (profileData: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      setUserState(updatedUser);
    }
  };

  const logout = () => {
    setUserState(null);
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    
    // Clear cart and wishlist data from localStorage
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
  };

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser);
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn: !!user, updateProfile, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
