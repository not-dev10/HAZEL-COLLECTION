# Admin Panel Documentation

## Overview

The Hazel the Label Admin Panel is a comprehensive management system designed to help administrators efficiently manage all aspects of the e-commerce business. It provides real-time insights, powerful tools for inventory management, order tracking, and business analytics.

## Features

### 1. **Dashboard** 📊
- Real-time business metrics and KPIs
- Revenue tracking and trends
- Order status overview (Pending, Processing, Shipped, Delivered)
- Inventory alerts
- Interactive charts and visualizations
- Quick access to critical information

### 2. **Products Management** 📦
- View and search product catalog
- Add new products with detailed information
- Edit product details (name, price, SKU, stock, category)
- Bulk import products via CSV
- Bulk edit and delete operations
- Product status management (Active/Inactive)
- Category organization

**CSV Import Format:**
```
name,sku,price,stock,category
Summer Dress,SD-001,49.99,45,Dresses
Classic Blouse,CB-002,39.99,120,Tops
```

### 3. **Orders Management** 📋
- Track all customer orders
- Filter orders by status (Pending, Processing, Shipped, Delivered, Cancelled)
- Search orders by order number, customer name, or email
- View detailed order information
- Monitor shipping status
- Estimated delivery tracking
- Order history and customer purchase patterns

**Order Statuses:**
- **Pending**: Awaiting confirmation
- **Processing**: Being prepared for shipment
- **Shipped**: In transit
- **Delivered**: Successfully delivered
- **Cancelled**: Order cancelled

### 4. **Inventory Management** 📊
- Real-time stock level tracking
- Low stock alerts
- Out of stock notifications
- Reorder level management
- Warehouse location tracking
- Bulk stock updates
- Inventory history and restocking dates

**Inventory Alerts:**
- Low Stock: Stock below reorder level
- Out of Stock: Zero units available

### 5. **Customer Management** 👥
- Comprehensive customer database
- View customer purchase history
- Track total spending
- Customer status (Active/Inactive)
- Contact information management
- Customer segmentation
- Email and communication tracking

### 6. **Analytics** 📈
- Advanced business metrics
- Daily, weekly, and monthly reports
- Sales and revenue trends
- Visitor conversion rates
- Top-performing products
- Time-based analytics
- Custom date range selection

**Key Metrics:**
- Total Revenue
- Number of Transactions
- Average Order Value
- Visitor Analytics
- Conversion Rates

### 7. **Settings** ⚙️
- **Store Information**
  - Store name and contact details
  - Currency configuration
  - Return policies
  - Shipping information

- **Notification Preferences**
  - Email notifications toggle
  - Order alerts
  - Low stock alerts
  - Review notifications
  - Marketing emails

- **Security**
  - Password management
  - Two-factor authentication
  - Active session monitoring
  - Security logs

- **Integrations**
  - Payment gateway (Stripe)
  - Email service (SendGrid)
  - Analytics (Google Analytics)
  - Shipping (ShipStation)

## File Structure

```
frontend/src/admin/
├── pages/
│   ├── Admin.tsx                 # Main admin container
│   ├── Dashboard.tsx             # Dashboard page
│   ├── Products.tsx              # Products management
│   ├── Orders.tsx                # Orders management
│   ├── Inventory.tsx             # Inventory management
│   ├── Customers.tsx             # Customer management
│   ├── Analytics.tsx             # Analytics page
│   └── Settings.tsx              # Settings page
├── components/
│   └── AdminLayout.tsx           # Main layout with sidebar & header
├── context/
│   └── AdminContext.tsx          # Admin state management
├── hooks/
│   └── useApi.ts                 # API hook for data fetching
├── lib/
│   └── (utilities)               # Helper functions
└── assets/
    └── (images & icons)          # Static assets
```

## Getting Started

### Access the Admin Panel

1. Navigate to `/admin` route in your application
2. The admin panel requires authentication (to be implemented)
3. You'll be presented with the dashboard

### Usage Examples

#### Dashboard
- View real-time sales metrics
- Monitor low stock products
- Track order fulfillment
- See revenue trends

#### Managing Products
1. Click "Products" in the sidebar
2. Search for products using name or SKU
3. Click "Add Product" to create new products
4. Use "Import CSV" for bulk product upload
5. Select products and use bulk actions to edit or delete
6. Update product status (Active/Inactive)

#### Managing Orders
1. Navigate to "Orders" section
2. Use filters to find specific orders
3. View order details including items and customer info
4. Track shipment status
5. Monitor estimated delivery dates

#### Inventory Management
1. Go to "Inventory" section
2. Monitor stock levels and alerts
3. Update stock quantities
4. Set reorder levels
5. Manage warehouse locations
6. Receive notifications for low stock

#### Customer Management
1. Access "Customers" section
2. View customer details and purchase history
3. Filter by active/inactive status
4. Monitor customer lifetime value
5. Send messages to customers

#### Analytics
1. Select date range (Last 30 Days, Last 90 Days, etc.)
2. View sales trends and revenue
3. Analyze conversion rates
4. Identify top-performing products
5. Access daily, weekly, monthly reports

## Styling

The admin panel uses:
- **Tailwind CSS** for styling
- **Shadcn UI** components for consistency
- **Lucide Icons** for icons
- **Recharts** for data visualization
- Gradient color scheme (Purple & Pink)

## Context API

### AdminContext
Manages global admin state including:
- Dashboard statistics
- Selected navigation tab
- Loading states
- User preferences

```typescript
const { stats, updateStats, isLoading, setIsLoading } = useAdmin();
```

## Hooks

### useApi
Custom hook for API calls:
```typescript
const { data, error, isLoading, fetchData } = useApi<T>();
await fetchData('/api/endpoint');
```

## Backend Integration

The admin panel expects the following API endpoints:

```
GET  /api/dashboard/stats
GET  /api/products
POST /api/products
PUT  /api/products/:id
DELETE /api/products/:id
POST /api/products/import (CSV)

GET  /api/orders
GET  /api/orders/:id
PUT  /api/orders/:id

GET  /api/inventory
PUT  /api/inventory/:id

GET  /api/customers
GET  /api/customers/:id

GET  /api/analytics/sales
GET  /api/analytics/conversion
```

## Future Enhancements

- [ ] Multi-user admin accounts with roles
- [ ] Advanced reporting and custom date ranges
- [ ] Automated inventory reordering
- [ ] Customer segmentation and targeting
- [ ] Discount and promotion management
- [ ] Return/Refund management
- [ ] Advanced search and filtering
- [ ] Data export (PDF, Excel)
- [ ] Email marketing integration
- [ ] API rate limiting and caching
- [ ] Audit logs for all actions
- [ ] Dark mode support

## Performance Tips

1. Use pagination for large data sets
2. Cache API responses with React Query
3. Lazy load charts and analytics
4. Optimize images for dashboard
5. Implement search debouncing

## Security Considerations

1. Protect admin routes with authentication
2. Implement role-based access control (RBAC)
3. Use HTTPS for all admin communications
4. Add CSRF protection for forms
5. Implement rate limiting on API endpoints
6. Log all admin actions for audit trail
7. Require strong passwords
8. Enable two-factor authentication

## Support

For issues or feature requests, please contact the development team.

---

**Last Updated:** January 2025
**Version:** 1.0.0
