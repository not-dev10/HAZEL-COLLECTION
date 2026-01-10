# Didi Fashion E-commerce

A modern monorepo structure for a fashion e-commerce platform with separate frontend and backend.

## 📁 Project Structure

```
didi-ecommerce/
├── frontend/           # React + Vite + TypeScript
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/            # Node.js API (Ready for setup)
│   ├── src/
│   ├── package.json
│   └── README.md
├── package.json        # Root package.json with scripts
└── README.md
```

## 🚀 Quick Start

### Install all dependencies:
```bash
npm run install:all
```

### Run Frontend (Development):
```bash
npm run frontend:dev
```
Runs on: `http://localhost:5173/`

### Build Frontend (Production):
```bash
npm run frontend:build
npm run frontend:preview
```
Runs on: `http://localhost:4173/`

### Run Backend (Development):
```bash
npm run backend:dev
```

### Start Backend (Production):
```bash
npm run backend:start
```

## 📦 Available Scripts

### Frontend Scripts
- `npm run frontend:dev` - Start development server with HMR
- `npm run frontend:build` - Build for production
- `npm run frontend:preview` - Preview production build
- `npm run frontend:install` - Install frontend dependencies

### Backend Scripts
- `npm run backend:dev` - Start backend with nodemon
- `npm run backend:start` - Start backend server
- `npm run backend:install` - Install backend dependencies

### Monorepo Scripts
- `npm run install:all` - Install all dependencies (root, frontend, backend)
- `npm run dev` - Start frontend dev server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

## 🎯 Admin Panel Features

The admin panel is **fully functional** with complete CRUD operations:

### 📦 Products Management
- ✅ Add, Edit, Delete products
- ✅ Bulk operations (delete, status change)
- ✅ CSV Import/Export
- ✅ Real-time search and filtering
- ✅ Status management (Active/Inactive)

### 📋 Orders Management
- ✅ View order details
- ✅ Update order status (Pending → Processing → Shipped → Delivered)
- ✅ Delete orders
- ✅ CSV Export
- ✅ Search and filter by status

### ⭐ Support & Reviews Management (NEW!)
- ✅ Moderate customer reviews (Approve/Reject)
- ✅ Delete reviews
- ✅ Manage support tickets
- ✅ Real-time conversation with customers
- ✅ Update ticket status
- ✅ Search and filter by status/category

### 📊 Dashboard & Analytics
- ✅ KPI overview (Revenue, Orders, Products, Customers)
- ✅ Sales charts and trends
- ✅ Top products and categories
- ✅ Order status tracking
- ✅ Customer metrics

### Access Admin Panel
Navigate to `http://localhost:5173/admin` to access the fully functional admin dashboard.

**Documentation:**
- [Admin Panel Setup Guide](./ADMIN_QUICK_START.md)
- [Admin Panel Updates](./ADMIN_PANEL_UPDATES.md)
- [Admin Architecture](./ADMIN_ARCHITECTURE.md)
- [Testing Checklist](./ADMIN_TESTING_CHECKLIST.md)

## 🎨 UI Components Library

Built with Shadcn UI - includes 50+ pre-configured components:
- Forms, Cards, Dialogs, Tables
- Dropdowns, Modals, Alerts
- Badges, Buttons, Inputs
- And many more...

All fully styled with Tailwind CSS and responsive design.

### Frontend
- React 18+
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Router

### Backend
- Node.js (Ready for Express, Fastify, etc.)
- Environment: Ready for database setup

## 📝 Next Steps

1. **Frontend**: Already configured and ready to use
2. **Backend**: Set up your preferred framework (Express, Fastify, etc.) and add API endpoints

## 🔗 Useful Links

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

---

Happy coding! 🎉
