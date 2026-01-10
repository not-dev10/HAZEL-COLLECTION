# 🔧 Unified Port Configuration Guide

## Problem Solved ✅
Different npm commands were using different ports, causing API connection issues.

## New Unified Configuration

### Frontend (Always Port 8080)
- `npm run dev` → http://localhost:8080 (development)
- `npm run preview` → http://localhost:8080 (preview built files)
- `npm run start` → http://localhost:8080 (alias for preview)

### Backend (Always Port 5000)
- `npm run dev` → http://localhost:5000
- `npm start` → http://localhost:5000

## Configuration Changes Made

### 1. Vite Config (`frontend/vite.config.ts`)
```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,  // Dev server
  },
  preview: {
    host: "::",
    port: 8080,  // Preview server (same port!)
  },
  // ... rest of config
}));
```

### 2. Package.json Scripts (`frontend/package.json`)
```json
{
  "scripts": {
    "dev": "vite --port 8080",
    "build": "vite build", 
    "preview": "vite preview --port 8080",
    "start": "vite preview --port 8080",
    "lint": "eslint ."
  }
}
```

### 3. Smart API Configuration (`frontend/src/lib/api.ts`)
```typescript
// Automatically detects the right backend URL
const getApiBaseUrl = () => {
  // Environment variable (preferred)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on current location
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:5000`;  // Local backend
    }
    
    return `${protocol}//${hostname}`;  // Production
  }
  
  return 'http://localhost:5000';  // Fallback
};
```

### 4. Flexible CORS (`backend/src/app.js`)
```javascript
// Supports all common development ports
const getAllowedOrigins = () => [
  'http://localhost:8080',    // Primary frontend port
  'http://localhost:5173',    // Vite default
  'http://localhost:4173',    // Vite preview default
  'http://127.0.0.1:8080',    // Alternative localhost
  // ... more fallbacks
];
```

## Usage Guide

### Development Workflow
```bash
# Terminal 1: Start Backend
cd backend
npm run dev  # → http://localhost:5000

# Terminal 2: Start Frontend  
cd frontend
npm run dev  # → http://localhost:8080
```

### Testing Built Version
```bash
# Build and preview
cd frontend
npm run build
npm run preview  # → http://localhost:8080 (same port!)
```

### Production Deployment
```bash
# Build for production
npm run build

# The built files will automatically connect to:
# - http://localhost:5000 (if running locally)
# - https://your-domain.com (if deployed)
```

## Benefits

### ✅ **Consistent Ports**
- Frontend always on 8080
- Backend always on 5000
- No more port confusion!

### ✅ **Smart API Detection**
- Automatically finds backend
- Works in development and production
- No manual URL changes needed

### ✅ **Flexible CORS**
- Supports all common development scenarios
- Easy to add production domains

### ✅ **Simple Commands**
- `npm run dev` - development
- `npm run preview` - test built version
- `npm run start` - serve built version

## Environment Variables

### Development (`.env.local`)
```bash
VITE_API_URL=http://localhost:5000
```

### Production (`.env.production`)
```bash
VITE_API_URL=https://your-backend-api.com
```

## Troubleshooting

### If API Still Fails:
1. Check both servers are running
2. Verify ports in browser address bar
3. Check browser console for API URL logs
4. Clear browser cache/storage

### Port Already in Use:
```bash
# Kill process on port 8080
npx kill-port 8080

# Kill process on port 5000  
npx kill-port 5000
```

## Next Steps
1. Restart both servers to apply changes
2. Test signup/login functionality
3. All API calls should now work consistently! 🎉