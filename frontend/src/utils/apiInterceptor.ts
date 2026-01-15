import { TokenManager } from './tokenManager';
import { API_BASE_URL } from '@/lib/api';

/**
 * Enhanced fetch wrapper that automatically handles token refresh on 401
 * Prevents multiple simultaneous refresh requests using a flag
 */
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const refreshAccessTokenSilently = async (): Promise<string | null> => {
  try {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      console.warn('⚠️ No refresh token available for token refresh');
      return null;
    }

    console.log('🔄 Attempting silent token refresh...');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      console.error('❌ Token refresh failed with status:', response.status);
      // Token refresh failed - clear tokens and force re-login
      TokenManager.clearTokens();
      window.location.href = '/admin/login';
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.accessToken) {
      console.log('✅ Token refreshed successfully');
      // Update the access token while keeping the refresh token
      const refreshToken = TokenManager.getRefreshToken();
      const adminUser = TokenManager.getAdminUser();
      
      if (refreshToken && adminUser) {
        TokenManager.setTokens(data.accessToken, refreshToken, adminUser);
      }
      
      return data.accessToken;
    } else {
      console.error('❌ Token refresh response invalid:', data);
      TokenManager.clearTokens();
      window.location.href = '/admin/login';
      return null;
    }
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    TokenManager.clearTokens();
    window.location.href = '/admin/login';
    return null;
  }
};

/**
 * Enhanced fetch function that handles 401 errors by refreshing tokens
 * Automatically retries failed requests after token refresh
 */
export const apiCall = async (
  url: string,
  options: RequestInit = {},
  retried: boolean = false
): Promise<Response> => {
  // Get current access token
  const accessToken = TokenManager.getAccessToken();

  // Add authorization header if token exists and not already present
  const headers = {
    ...options.headers,
    ...(accessToken && !options.headers?.['Authorization'] 
      ? { 'Authorization': `Bearer ${accessToken}` } 
      : {})
  } as Record<string, string>;

  const response = await fetch(url, { ...options, headers });

  // Handle 401 Unauthorized
  if (response.status === 401 && !retried) {
    console.log('🔐 Got 401 response - attempting token refresh');
    
    // Only refresh once per request
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessTokenSilently();
    }

    // Wait for refresh to complete
    if (refreshPromise) {
      const newToken = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      if (newToken) {
        // Retry the request with new token
        console.log('🔄 Retrying request with new token');
        const newHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        };
        return apiCall(url, { ...options, headers: newHeaders }, true);
      }
    }
  }

  return response;
};

/**
 * Wrapper around apiCall that parses JSON response
 * Handles token refresh automatically
 */
export const apiCallJson = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const response = await apiCall(url, options);
  
  if (!response.ok && response.status !== 401) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json();
};
