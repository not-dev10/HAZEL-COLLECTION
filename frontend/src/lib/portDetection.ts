/**
 * Dynamic Port Detection Utility
 * Automatically detects and connects to backend server on any available port
 */

interface PortDetectionConfig {
  preferredPorts?: number[];
  timeout?: number;
  retries?: number;
}

const DEFAULT_CONFIG: PortDetectionConfig = {
  preferredPorts: [5000, 5001, 5002, 3000, 3001, 8000, 8001],
  timeout: 1000,
  retries: 1,
};

/**
 * Test if a port is accessible
 */
export const testPort = async (
  hostname: string,
  port: number,
  timeout: number = 1000
): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`http://${hostname}:${port}/api/products`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Detect backend port by testing common ports
 */
export const detectBackendPort = async (
  config: PortDetectionConfig = DEFAULT_CONFIG
): Promise<number | null> => {
  const { preferredPorts = DEFAULT_CONFIG.preferredPorts, timeout = 1000 } = config;

  if (typeof window === 'undefined') {
    return null;
  }

  const { hostname } = window.location;

  for (const port of preferredPorts) {
    const isAccessible = await testPort(hostname, port, timeout);
    if (isAccessible) {
      console.log(`✅ Backend detected on port ${port}`);
      return port;
    }
  }

  console.warn('⚠️ Could not detect backend port');
  return null;
};

/**
 * Get dynamic API URL based on detected port
 */
export const getDynamicApiUrl = async (
  config: PortDetectionConfig = DEFAULT_CONFIG
): Promise<string> => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const { protocol, hostname } = window.location;

  // For localhost, try to detect port
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const port = await detectBackendPort(config);
    if (port) {
      return `${protocol}//${hostname}:${port}`;
    }
    // Fallback to default port
    return `${protocol}//${hostname}:5000`;
  }

  // For production, use same domain
  return `${protocol}//${hostname}`;
};

/**
 * Get frontend port from window location
 */
export const getFrontendPort = (): number => {
  if (typeof window === 'undefined') {
    return 8080;
  }

  const port = window.location.port;
  return port ? parseInt(port) : (window.location.protocol === 'https:' ? 443 : 80);
};

/**
 * Get frontend URL
 */
export const getFrontendUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:8080';
  }

  const { protocol, hostname, port } = window.location;
  
  if (port) {
    return `${protocol}//${hostname}:${port}`;
  }
  
  return `${protocol}//${hostname}`;
};

/**
 * Initialize port detection and return API URL
 * This should be called once on app startup
 */
export const initializePortDetection = async (
  config: PortDetectionConfig = DEFAULT_CONFIG
): Promise<string> => {
  const apiUrl = await getDynamicApiUrl(config);
  console.log(`🔗 API URL: ${apiUrl}`);
  console.log(`🌐 Frontend URL: ${getFrontendUrl()}`);
  return apiUrl;
};

/**
 * Retry logic for API calls with port fallback
 */
export const fetchWithPortFallback = async (
  path: string,
  options: RequestInit = {},
  config: PortDetectionConfig = DEFAULT_CONFIG
): Promise<Response> => {
  const { preferredPorts = DEFAULT_CONFIG.preferredPorts, retries = 1 } = config;

  if (typeof window === 'undefined') {
    throw new Error('fetchWithPortFallback can only be used in browser');
  }

  const { protocol, hostname } = window.location;

  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const port of preferredPorts) {
      try {
        const url = `${protocol}//${hostname}:${port}${path}`;
        const response = await fetch(url, options);
        
        if (response.ok) {
          return response;
        }
      } catch (error) {
        // Continue to next port
        continue;
      }
    }
  }

  // If all attempts fail, throw error
  throw new Error(
    `Failed to fetch ${path} from any available port. Tried ports: ${preferredPorts.join(', ')}`
  );
};
