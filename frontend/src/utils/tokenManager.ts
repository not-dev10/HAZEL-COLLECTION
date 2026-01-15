/**
 * Centralized Token Manager
 * Handles getting, setting, and refreshing tokens from localStorage
 */

export const TokenManager = {
  /**
   * Get access token from localStorage
   */
  getAccessToken: (): string | null => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('⚠️ No access token found in localStorage');
    }
    return token;
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken: (): string | null => {
    const token = localStorage.getItem('refreshToken');
    if (!token) {
      console.warn('⚠️ No refresh token found in localStorage');
    }
    return token;
  },

  /**
   * Get admin user info from localStorage
   */
  getAdminUser: () => {
    try {
      const user = localStorage.getItem('adminUser');
      if (!user) {
        console.warn('⚠️ No admin user found in localStorage');
        return null;
      }
      return JSON.parse(user);
    } catch (error) {
      console.error('❌ Error parsing admin user:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const accessToken = localStorage.getItem('accessToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!accessToken || !adminUser) {
      return false;
    }

    try {
      const user = JSON.parse(adminUser);
      return user.role === 'admin';
    } catch {
      return false;
    }
  },

  /**
   * Store tokens and user info after login
   */
  setTokens: (accessToken: string, refreshToken: string, user: any): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('adminUser', JSON.stringify(user));
    
    console.log('✅ Tokens stored successfully:', {
      accessToken: accessToken?.substring(0, 20) + '...',
      refreshToken: refreshToken?.substring(0, 20) + '...',
      user: user.email
    });
  },

  /**
   * Clear all tokens (logout)
   */
  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('adminUser');
    console.log('✅ Tokens cleared');
  },

  /**
   * Get authorization header for API requests
   */
  getAuthHeader: (): { Authorization: string } | null => {
    const token = TokenManager.getAccessToken();
    if (!token) {
      console.warn('⚠️ Cannot create auth header - no token available');
      return null;
    }
    return {
      Authorization: `Bearer ${token}`
    };
  }
};

export default TokenManager;
