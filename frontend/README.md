# 🎨 Hazel the Label - Frontend

Modern React + TypeScript + Vite frontend for luxury fashion e-commerce platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file:
```
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm run dev
```

Frontend runs on: **http://localhost:8080**

### 4. Access Admin Panel
Navigate to: **http://localhost:8080/admin**

Login with:
```
Email: hazellabel@gmail.com
Password: hazellabel@2026
```

---

## 📦 Project Structure

```
frontend/
├── src/
│   ├── pages/               # Public pages
│   │   ├── Home.tsx
│   │   ├── Shop.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── About.tsx
│   │   └── Admin/
│   │       ├── AdminLogin.tsx
│   │       ├── Dashboard.tsx
│   │       ├── Products.tsx
│   │       ├── Orders.tsx
│   │       ├── Customers.tsx
│   │       ├── Analytics.tsx
│   │       ├── HomePageEditor.jsx
│   │       └── TechStackHealth.tsx
│   ├── components/          # Reusable components
│   │   ├── home/           # Home page components
│   │   ├── navigation/      # Nav components
│   │   ├── products/        # Product components
│   │   └── ui/              # Shadcn UI components
│   ├── utils/              # Utilities
│   │   ├── tokenManager.ts  # Token storage
│   │   └── apiInterceptor.ts # Auto token refresh
│   ├── lib/                # Libraries
│   │   ├── api.ts          # API configuration
│   │   └── cloudinary.ts   # Cloudinary setup
│   └── App.tsx             # Root component
├── public/                 # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

---

## 🎯 Features

### 🏪 Public Pages
- ✅ **Home Page** - Hero carousel, featured products, bridal section
- ✅ **Shop** - Browse all products with filters
- ✅ **Product Detail** - Full product info, image gallery, reviews
- ✅ **Cart** - Add/remove items, checkout
- ✅ **About** - Company information

### 🔐 Authentication
- ✅ User registration and login
- ✅ Password reset functionality
- ✅ Auto token refresh (silent, transparent)
- ✅ Session persistence

### 👤 Admin Panel
- ✅ **Dashboard** - Real-time KPIs and charts
- ✅ **Products** - Add/edit/delete with image upload
- ✅ **Orders** - Manage order status
- ✅ **Customers** - View customer details
- ✅ **Analytics** - Sales reports and trends
- ✅ **Home Editor** - Manage carousel, sections, banners
- ✅ **Tech Health** - Monitor system status

---

## 📚 Key Technologies

### Core
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool & dev server
- **React Router** - Page navigation

### Styling
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library

### API & State
- **Fetch API** - HTTP requests
- **TokenManager** - Token management
- **apiInterceptor** - Auto token refresh on 401

### Data Visualization
- **Recharts** - Charts and graphs
- **React Table** - Data tables

---

## 🔌 Available Scripts

### Development
```bash
npm run dev              # Start dev server with HMR
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

### Production
```bash
# Build
npm run build

# Preview before deployment
npm run preview

# Deploy to hosting (Vercel, Netlify, etc.)
```

---

## 🔐 Authentication System

### Token Management
The frontend uses a sophisticated token refresh system:

1. **Login**: User provides email/password
2. **Storage**: 
   - `accessToken` (15 min) → localStorage
   - `refreshToken` (7 days) → HTTP-only cookie
3. **API Calls**: Every request includes `Authorization: Bearer <token>`
4. **Expiration**: 401 response triggers silent refresh
5. **Refresh**: `/api/auth/refresh-token` gets new access token
6. **Retry**: Original request retried with new token

### Files
- `src/utils/tokenManager.ts` - Token storage/retrieval utilities
- `src/utils/apiInterceptor.ts` - Automatic token refresh interceptor

### Usage
```typescript
import { TokenManager } from '@/utils/tokenManager';
import { apiCall, apiCallJson } from '@/utils/apiInterceptor';

// Get token
const token = TokenManager.getAccessToken();

// API call with auto refresh
const data = await apiCallJson(`/api/products`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${TokenManager.getAccessToken()}`
  }
});

// Token automatically refreshes on 401
```

---

## 📸 Image Handling

### Cloudinary Integration
All product images are hosted on Cloudinary CDN:

- **Automatic Optimization**: Images auto-converted to WebP/optimal format
- **Responsive**: Tailored sizes for different devices
- **Fast**: Global CDN delivery
- **Transformation**: Automatic cropping, resizing

### Image URLs
```
https://res.cloudinary.com/{cloud-name}/image/upload/
  v{version}/{folder}/{public-id}.{format}

Example:
https://res.cloudinary.com/didi-fashion/image/upload/
  didi-fashion/products/507f1f77bcf86cd799439011/image-1.jpg
```

---

## 🏠 Home Page Editor

### Features
- **Carousel Slides**: Edit hero slides with images and CTAs
- **Bridal Section**: Manage bridal collection content
- **New Arrivals**: Configure new products section
- **Collections**: Edit collection banners

### Admin Access
Navigate to: `http://localhost:8080/admin/home-page`

### Real-time Updates
Frontend automatically fetches updates every 5 seconds.

---

## 📊 Admin Dashboard

### Widgets
- **KPI Cards**: Revenue, Orders, Products, Customers
- **Sales Chart**: Monthly sales trend
- **Top Products**: Best selling items
- **Recent Orders**: Latest order activity

### Charts
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distribution

---

## 🏥 Tech Stack Health Monitor

### Features
- **System Status**: MongoDB, Cloudinary, Email, Server
- **Storage Metrics**: Database and Cloudinary usage
- **Security Insights**: Threat analysis and recommendations
- **Performance**: Server uptime and metrics

### Access
Admin Panel → "Tech Stack Health" tab

---

## 🚀 Environment Variables

Create `.env.local`:
```
# API
VITE_API_BASE_URL=http://localhost:5000

# Optional: Cloudinary (for direct uploads)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=your-id
```

---

## 🎨 Component Library (Shadcn UI)

50+ pre-configured components available:

### Common Components
- **Button** - Clickable button with variants
- **Input** - Text input field
- **Card** - Content container
- **Dialog** - Modal dialog
- **Sheet** - Slide-out panel
- **Tabs** - Tab interface
- **Table** - Data table with sorting
- **Badge** - Label/tag element
- **Alert** - Alert message
- **Toast** - Notification message

### Forms
- **Form** - Form builder
- **Select** - Dropdown selection
- **Checkbox** - Boolean input
- **Radio** - Radio button group
- **Textarea** - Multi-line text input
- **Combobox** - Search dropdown
- **Date Picker** - Calendar date selection

### Data Display
- **DataTable** - Advanced table with filtering
- **Pagination** - Page navigation
- **Charts** - Data visualization

### Navigation
- **Menu** - Dropdown menu
- **Sidebar** - Side navigation
- **Breadcrumb** - Navigation path
- **Pagination** - Page navigation

---

## 📱 Responsive Design

All components are fully responsive:
- **Mobile** (< 640px): Single column, stacked layout
- **Tablet** (640px - 1024px): 2-column grid
- **Desktop** (> 1024px): 3+ column grid

---

## 🔗 API Integration

### Base URL
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

### Common Patterns
```typescript
// GET request
const data = await apiCall(`${API_BASE_URL}/api/products`);

// POST request with token
const response = await apiCall(`${API_BASE_URL}/api/products`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TokenManager.getAccessToken()}`
  },
  body: JSON.stringify(productData)
});

// Error handling (401 auto-refreshes)
try {
  const result = await response.json();
} catch (error) {
  console.error('API error:', error);
}
```

---

## 🛠️ Development Tips

### Hot Module Replacement (HMR)
Vite provides instant updates as you edit:
```bash
npm run dev
# Edit src files → Changes appear instantly
```

### TypeScript
All components use TypeScript for type safety:
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

const MyComponent: React.FC<{product: Product}> = ({product}) => {
  return <div>{product.name}</div>;
};
```

### Debugging
1. Open DevTools: `F12`
2. **Console**: View logs and errors
3. **Network**: Check API calls
4. **Application**: View stored tokens
5. **React DevTools**: Inspect component tree

---

## 📦 Building & Deployment

### Production Build
```bash
npm run build
```

Creates optimized `dist` folder ready for deployment.

### Deployment Options
- **Vercel** - Recommended, automatic deployments
- **Netlify** - Easy setup, automatic builds
- **AWS Amplify** - Scalable, integrated
- **GitHub Pages** - Free, static hosting
- **Your own server** - Full control

### Deployment Steps
```bash
# 1. Build
npm run build

# 2. Test production build
npm run preview

# 3. Deploy dist folder to your hosting
```

---

## 🆘 Troubleshooting

### Token Not Refreshing
- Check browser localStorage for tokens
- Verify backend `/api/auth/refresh-token` endpoint
- Check Network tab for 401 responses
- Clear cache and reload

### Images Not Loading
- Verify Cloudinary credentials
- Check image URLs in database
- Verify CORS configuration on backend
- Check browser console for errors

### API Calls Failing
- Check `VITE_API_BASE_URL` environment variable
- Verify backend is running on correct port
- Check browser console for 401/403 errors
- Test endpoint with Postman/Insomnia

### Build Issues
- Clear `node_modules`: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite && npm run build`
- Check Node version: `node --version` (should be 16+)
- Try different npm version: `npm install -g npm@latest`

---

## 📞 Support

For issues:
1. Check browser console (F12)
2. Check backend logs
3. Verify environment variables
4. Review token storage in localStorage
5. Test API with Postman

---

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: January 2026
