import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import net from "net";

// Function to check if port is available
const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
};

// Function to find available port starting from preferred port
const findAvailablePort = async (startPort = 8080): Promise<number> => {
  for (let port = startPort; port <= startPort + 10; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found starting from ${startPort}`);
};

// Get port from environment or find available one
const getPort = async (): Promise<number> => {
  const preferredPort = process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 8080;
  return await findAvailablePort(preferredPort);
};

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const port = await getPort();
  
  return {
    server: {
      host: "::",
      port: port,
      middlewareMode: false,
    },
    preview: {
      host: "::",
      port: port,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-accordion'],
            'vendor-icons': ['lucide-react'],
            'vendor-charts': ['recharts'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-forms': ['@hookform/resolvers', 'react-hook-form'],
            
            // Admin panel chunks
            'admin-pages': [
              './src/admin/pages/Dashboard',
              './src/admin/pages/Products',
              './src/admin/pages/Orders',
              './src/admin/pages/Inventory',
              './src/admin/pages/Customers',
              './src/admin/pages/Analytics',
              './src/admin/pages/Settings',
            ],
            'admin-core': [
              './src/admin/components/AdminLayout',
              './src/admin/context/AdminContext',
              './src/admin/hooks/useApi',
            ],
            
            // Main app pages
            'app-pages': [
              './src/pages/Home',
              './src/pages/Collection',
              './src/pages/Product',
              './src/pages/Cart',
              './src/pages/Checkout',
              './src/pages/Account',
              './src/pages/Wishlist',
              './src/pages/SearchProducts',
            ],
          },
        },
      },
      // Increase chunk size warning limit to 600 kB (from default 500 kB)
      chunkSizeWarningLimit: 600,
    },
  };
});
