## Admin Panel Integration Guide

### Quick Start

The admin panel has been successfully integrated into your Hazel the Label Store! Here's how to access and use it.

### Accessing the Admin Panel

1. **URL**: Navigate to `http://localhost:5173/admin` (or your production domain + `/admin`)
2. You'll see the admin dashboard with all management features

### Admin Panel Sections

#### 1. **Dashboard**
- **Location**: Click "Dashboard" in the sidebar
- **Features**:
  - Real-time KPIs (Total Revenue, Orders, Products, Customers)
  - Inventory status and low stock alerts
  - Pending vs Completed orders
  - Revenue & orders chart (last 6 months)
  - Category distribution pie chart
  - Daily revenue trend line chart
  
- **What You Can Monitor**:
  ```
  Total Revenue:     $45,250
  Total Orders:      342
  Total Products:    1,205
  Total Customers:   856
  Inventory Count:   5,420
  Low Stock Items:   12
  Pending Orders:    28
  Completed Orders:  314
  ```

#### 2. **Products Management**
- **Location**: Click "Products" in the sidebar
- **Features**:
  - Search products by name or SKU
  - Add new products
  - **Bulk Import via CSV**:
    - Click "Import CSV"
    - Upload file with format: `name,sku,price,stock,category`
    - Example:
      ```
      Summer Dress,SD-001,49.99,45,Dresses
      Classic Blouse,CB-002,39.99,120,Tops
      ```
  - Bulk edit (select multiple → Mark Active/Inactive/Delete)
  - Edit individual products
  - Delete products
  - Filter by status

#### 3. **Orders Management**
- **Location**: Click "Orders" in the sidebar
- **Features**:
  - View all orders with details
  - Search by order number, customer, or email
  - Filter by status:
    - 🟡 Pending (awaiting confirmation)
    - 🔵 Processing (being prepared)
    - 🟣 Shipped (in transit)
    - 🟢 Delivered (completed)
    - ⚫ Cancelled
  - View order details (items, total, customer info)
  - Track estimated delivery dates
  - Monitor order trends

#### 4. **Inventory Management**
- **Location**: Click "Inventory" in the sidebar
- **Features**:
  - Real-time stock level tracking
  - Alerts for:
    - 🟡 Low Stock (below reorder level)
    - 🔴 Out of Stock (0 units)
  - Update stock quantities
  - Set reorder levels
  - Manage warehouse locations
  - Track last restock date
  - Quick stats:
    - Total Units
    - Total Products
    - Low Stock Count
    - Out of Stock Count

#### 5. **Customers Management**
- **Location**: Click "Customers" in the sidebar
- **Features**:
  - View all customers with details
  - Search by name or email
  - Filter by status (Active/Inactive)
  - Customer metrics:
    - Total orders
    - Total spending
    - Join date
    - Last purchase date
  - Send messages to customers
  - View order history
  - Contact information management

#### 6. **Analytics**
- **Location**: Click "Analytics" in the sidebar
- **Features**:
  - Date range selector (Last 30 Days, 90 Days, Last Year)
  - Sales & Revenue trends
  - Visitor conversion rates
  - Top-performing products
  - Detailed metrics view:
    - Daily, Weekly, Monthly reports
    - Unique visitors
    - Transactions
    - Revenue figures
    - Average order value

#### 7. **Settings**
- **Location**: Click "Settings" in the sidebar
- **Tabs**:
  
  **Store Tab**:
  - Store name and contact info
  - Currency settings
  - Return policies
  - Shipping information
  
  **Notifications Tab**:
  - Email notifications (toggle on/off)
  - Order alerts
  - Low stock alerts
  - Review notifications
  - Marketing emails
  
  **Security Tab**:
  - Change password
  - Two-factor authentication
  - Active sessions monitoring
  
  **Integrations Tab**:
  - Payment gateway (Stripe)
  - Email service (SendGrid)
  - Analytics (Google Analytics)
  - Shipping (ShipStation)

### File Structure

```
frontend/src/admin/
├── README.md                      # Detailed documentation
├── pages/
│   ├── Admin.tsx                  # Main container
│   ├── Dashboard.tsx              # Dashboard page
│   ├── Products.tsx               # Products management
│   ├── Orders.tsx                 # Orders management
│   ├── Inventory.tsx              # Inventory management
│   ├── Customers.tsx              # Customer management
│   ├── Analytics.tsx              # Analytics & reporting
│   └── Settings.tsx               # Admin settings
├── components/
│   └── AdminLayout.tsx            # Sidebar + Header layout
├── context/
│   └── AdminContext.tsx           # Global state management
├── hooks/
│   └── useApi.ts                  # API data fetching hook
├── lib/
│   └── (utilities)                # Helper functions
└── assets/                        # Static files
```

### Key Files Modified

1. **App.tsx** - Added admin routes and AdminProvider wrapper
2. **Created entire admin folder structure** with all necessary components

### State Management

The admin panel uses **AdminContext** for state management:

```typescript
// Access admin state
import { useAdmin } from '@/admin/context/AdminContext';

function MyComponent() {
  const { stats, updateStats, isLoading, setIsLoading } = useAdmin();
  
  // stats contains:
  // - totalRevenue
  // - totalOrders
  // - totalProducts
  // - totalCustomers
  // - inventoryCount
  // - lowStockProducts
  // - pendingOrders
  // - completedOrders
}
```

### API Integration Points

The admin panel is ready to connect to backend APIs. Update these calls in the relevant pages:

```typescript
// Products API
GET  /api/products
POST /api/products
PUT  /api/products/:id
DELETE /api/products/:id
POST /api/products/import (CSV bulk upload)

// Orders API
GET  /api/orders
GET  /api/orders/:id
PUT  /api/orders/:id/status

// Inventory API
GET  /api/inventory
PUT  /api/inventory/:id/stock
GET  /api/inventory/low-stock

// Customers API
GET  /api/customers
GET  /api/customers/:id

// Analytics API
GET  /api/analytics/sales
GET  /api/analytics/conversion
GET  /api/analytics/top-products

// Dashboard API
GET  /api/dashboard/stats
```

### Styling & Design

- **Color Scheme**: Purple & Pink gradients
- **Components**: Shadcn UI + Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Responsive**: Mobile-friendly with collapsible sidebar

### Current Features

✅ Complete Dashboard with charts
✅ Products management with bulk import
✅ Orders tracking and filtering
✅ Inventory management with alerts
✅ Customer database
✅ Analytics & reporting
✅ Settings management
✅ Responsive design
✅ State management with Context API
✅ Icon system and navigation

### Next Steps

1. **Connect to Backend APIs**:
   - Replace mock data with real API calls
   - Use the `useApi` hook for data fetching
   - Implement authentication checks

2. **Authentication**:
   - Add login page at `/admin/login`
   - Implement role-based access control
   - Protect routes with authentication middleware

3. **Advanced Features**:
   - Add bulk operation confirmations
   - Implement undo/redo for critical operations
   - Add audit logs
   - Implement user activity tracking

4. **Database Integration**:
   - Set up backend endpoints
   - Implement data validation
   - Add error handling and notifications

### Example: Connecting to Backend

Replace the mock data in Dashboard.tsx:

```typescript
// Before: Using mock data
const { stats } = useAdmin();

// After: Using API
useEffect(() => {
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      updateStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchStats();
}, []);
```

### Demo Data

The admin panel comes with pre-populated demo data:

**Products**:
- Summer Dress (45 units)
- Classic Blouse (12 units - LOW STOCK)
- Denim Jeans (2 units - CRITICAL)

**Orders**:
- 342 total orders
- 28 pending
- Various statuses tracked

**Inventory**:
- 5,420 units total
- 12 low stock items
- Real-time tracking

**Customers**:
- 856 total customers
- $45,250 total revenue
- Purchase history tracking

### Support & Documentation

Full documentation available in: `/frontend/src/admin/README.md`

### Troubleshooting

**Admin panel not showing?**
- Ensure you're at `/admin` route
- Check browser console for errors
- Verify all imports are correct

**Charts not displaying?**
- Ensure recharts is installed
- Check data format matches expected structure

**Styles not applying?**
- Verify Tailwind CSS is configured
- Check shadcn components are installed

---

**Admin Panel Version**: 1.0.0
**Created**: January 2025
**Last Updated**: January 2025
