# Frontend-Backend Connection Setup ✅

## Configuration Summary

### Backend Server (Port 5000)
- **URL**: http://localhost:5000
- **CORS Configured**: Allows frontend ports 5173, 4173, and 8080
- **Endpoints Available**:
  - POST /api/auth/signup
  - POST /api/auth/login
  - GET /api/orders
  - POST /api/orders
  - GET/POST/PUT/DELETE /api/cart/*

### Frontend Configuration
- **Dev Server Port**: 8080 (configured in vite.config.ts)
- **API Base URL**: http://localhost:5000 (from .env.local)
- **Environment Variable**: VITE_API_URL=http://localhost:5000

## Changes Made

### 1. Updated Frontend Environment
```bash
# frontend/.env.local
VITE_API_URL=http://localhost:5000
```

### 2. Updated API Configuration
```typescript
// frontend/src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### 3. Updated Backend CORS
```javascript
// backend/src/app.js
app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:4173", "http://localhost:8080"],
  credentials: true 
}));
```

### 4. Added Debug Logging
- Added console.log statements to API calls for debugging
- Shows request URLs and response status

## Testing Steps

### 1. Restart Backend Server
```bash
cd backend
npm run dev  # or npm start
```

### 2. Start Frontend Server
```bash
cd frontend
npm run dev  # Should start on port 8080
```

### 3. Test Authentication
1. Go to http://localhost:8080/signup
2. Create a new account
3. Check browser console for API logs
4. Should redirect to /account on success

### 4. Test Login
1. Go to http://localhost:8080/login
2. Use the account you just created
3. Should redirect to /account on success

## Troubleshooting

### If "Failed to Fetch" Error Persists:

1. **Check Backend is Running**:
   ```bash
   curl http://localhost:5000/api/auth/login
   # Should return: {"message":"No token provided"}
   ```

2. **Check Frontend Port**:
   - Frontend should be on http://localhost:8080
   - Check browser network tab for actual requests

3. **Check CORS Headers**:
   - In browser dev tools, check if CORS headers are present
   - Look for Access-Control-Allow-Origin header

4. **Clear Browser Cache**:
   - Hard refresh (Ctrl+F5)
   - Clear localStorage/sessionStorage

### Common Issues:
- ❌ Backend not running on port 5000
- ❌ Frontend trying to connect to wrong port
- ❌ CORS not allowing frontend origin
- ❌ Environment variables not loaded (restart dev server)

## Success Indicators:
- ✅ No CORS errors in browser console
- ✅ API requests show in Network tab
- ✅ Console logs show correct URLs
- ✅ Authentication redirects work
- ✅ User data stored in sessionStorage

## Next Steps:
Once authentication works, you can:
1. Connect cart functionality
2. Connect orders functionality  
3. Connect product management
4. Remove debug console.log statements