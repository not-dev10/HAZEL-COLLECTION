import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  joinDate: string;
  profileImage?: string;
}

interface UserContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Generate a customer ID
const generateCustomerId = () => {
  return 'CUST' + Date.now().toString().slice(-8);
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default user for demo
    return {
      id: generateCustomerId(),
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma.wilson@example.com',
      phone: '+44 (0) 20 7946 0958',
      dateOfBirth: '1990-05-15',
      gender: 'Female',
      billingAddress: {
        street: '123 Oxford Street',
        city: 'London',
        state: 'England',
        zip: 'W1D 1BS',
        country: 'United Kingdom',
      },
      shippingAddress: {
        street: '123 Oxford Street',
        city: 'London',
        state: 'England',
        zip: 'W1D 1BS',
        country: 'United Kingdom',
      },
      joinDate: '2024-01-15',
      profileImage: undefined,
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
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
    localStorage.removeItem('user');
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
