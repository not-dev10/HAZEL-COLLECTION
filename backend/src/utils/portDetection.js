/**
 * Dynamic Port Detection Utility for Backend
 * Automatically finds available ports and manages port configuration
 */

import net from 'net';
import os from 'os';

/**
 * Check if a port is available
 */
export const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
};

/**
 * Find available port starting from preferred port
 */
export const findAvailablePort = async (startPort = 5000, maxAttempts = 10) => {
  for (let port = startPort; port <= startPort + maxAttempts; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found starting from ${startPort}`);
};

/**
 * Get preferred port from environment or use default
 */
export const getPreferredPort = () => {
  if (process.env.PORT) {
    return parseInt(process.env.PORT);
  }
  if (process.env.BACKEND_PORT) {
    return parseInt(process.env.BACKEND_PORT);
  }
  return 5000;
};

/**
 * Get all local IP addresses
 */
export const getLocalIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }

  return ips;
};

/**
 * Get server URLs for all interfaces
 */
export const getServerUrls = (port) => {
  const urls = {
    localhost: `http://localhost:${port}`,
    loopback: `http://127.0.0.1:${port}`,
    ips: [],
  };

  const ips = getLocalIPs();
  for (const ip of ips) {
    urls.ips.push(`http://${ip}:${port}`);
  }

  return urls;
};

/**
 * Log server startup information
 */
export const logServerStartup = (port) => {
  const urls = getServerUrls(port);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🚀 BACKEND SERVER STARTED');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n📍 Server URLs:`);
  console.log(`   Localhost: ${urls.localhost}`);
  console.log(`   Loopback:  ${urls.loopback}`);

  if (urls.ips.length > 0) {
    console.log(`   Network IPs:`);
    for (const ip of urls.ips) {
      console.log(`      ${ip}`);
    }
  }

  console.log(`\n📡 API Base URL: ${urls.localhost}/api`);
  console.log(`\n🔧 Environment:`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   PORT: ${port}`);
  console.log('═══════════════════════════════════════════════════════════\n');
};

/**
 * Validate port configuration
 */
export const validatePortConfig = (port) => {
  if (!Number.isInteger(port)) {
    throw new Error('Port must be an integer');
  }
  if (port < 1 || port > 65535) {
    throw new Error('Port must be between 1 and 65535');
  }
  return true;
};

/**
 * Get port configuration from environment
 */
export const getPortConfig = () => {
  const preferredPort = getPreferredPort();
  
  return {
    preferred: preferredPort,
    min: preferredPort,
    max: preferredPort + 10,
    fallback: 5000,
  };
};

/**
 * Initialize port and return configuration
 */
export const initializePort = async () => {
  const config = getPortConfig();
  
  try {
    const port = await findAvailablePort(config.preferred, config.max - config.min);
    validatePortConfig(port);
    return port;
  } catch (error) {
    console.error('❌ Error finding available port:', error.message);
    console.log(`⚠️  Falling back to port ${config.fallback}`);
    return config.fallback;
  }
};
