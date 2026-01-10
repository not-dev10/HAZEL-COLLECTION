# Backend Integration Setup

## ✅ Completed
- Frontend Sign In/Sign Up pages connected to backend API
- API utility file created at `frontend/src/lib/api.ts`
- UserContext updated to sync with authentication
- Header component updated to use UserContext
- Backend auth controller ready with JWT token generation

## Configuration Details

### Frontend API Endpoint
- **Base URL:** `http://localhost:3000/api`
- **Signup:** `POST /api/auth/signup`
- **Login:** `POST /api/auth/login`

### Data Flow
1. User fills out Sign Up/Login form
2. Frontend calls backend API via `api.auth.signup()` or `api.auth.login()`
3. Backend validates credentials and returns JWT token + user data
4. Frontend stores token in `sessionStorage.authToken`
5. Frontend updates UserContext with user data
6. Header component reads from UserContext and shows Account icon + Logout button
7. On logout, sessionStorage is cleared and user is redirected to home

### Storage
- **Token:** Stored in `sessionStorage.authToken` (cleared on browser close)
- **User Data:** Stored in `sessionStorage.user` (cleared on browser close)
- **Context:** UserContext syncs with sessionStorage

## To Test

### 1. Start Backend Server
```bash
cd backend
npm run dev
# Should run on http://localhost:3000
```

### 2. Start Frontend Dev Server
```bash
cd frontend
npm run dev
# Should run on http://localhost:5173
```

### 3. Test Sign Up
- Go to http://localhost:5173/signup
- Fill in name, email, password
- Click "Sign Up"
- Should redirect to Account page and show logout button in header

### 4. Test Login
- Go to http://localhost:5173/login
- Use credentials from signup
- Should redirect to Account page

### 5. Test Logout
- Click logout button (icon in header)
- Should redirect to home and show Sign In/Sign Up buttons again

## Backend Requirements
- MongoDB running
- `.env` file in backend with `JWT_SECRET` set
- CORS configured to accept `http://localhost:5173`

## Frontend Requirements
- All dependencies installed
- Build completed successfully
