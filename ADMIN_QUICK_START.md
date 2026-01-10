# Admin Panel - Quick Start Guide

## 🚀 Getting Started

The admin panel now has fully functional buttons and a new Support & Reviews management system. Here's how to use each feature.

---

## 📦 Products Page

### Adding a Product
1. Click the **"Add Product"** button at the top
2. Fill in the form:
   - Product Name
   - SKU (e.g., "PROD-001")
   - Price (e.g., "99.99")
   - Stock Quantity (e.g., "50")
   - Category (e.g., "Dresses")
3. Click **"Add Product"** button
4. See success message ✅

### Editing a Product
1. Find the product in the table
2. Click the **pencil icon** in Actions column
3. Update the fields in the modal
4. Click **"Save Changes"**
5. See success message ✅

### Deleting a Product
1. Find the product in the table
2. Click the **trash icon** in Actions column
3. Confirm deletion
4. Product removed from list

### Bulk Operations
**Select Multiple Products:**
1. Check the checkbox next to each product (or use header checkbox to select all)
2. Use buttons that appear at the top:
   - **Bulk Delete**: Delete all selected products
   - **Change Status**: Mark as Active or Inactive

### Import Products from CSV
1. Click **"Import CSV"** button
2. Select a CSV file with columns:
   ```
   name, sku, price, stock, category
   Dress, PROD-001, 99.99, 50, Dresses
   Shirt, PROD-002, 49.99, 100, Shirts
   ```
3. Products added automatically

### Export Products
1. Click **"Export CSV"** button
2. File downloads: `products-YYYY-MM-DD.csv`
3. Contains all current products

---

## 📋 Orders Page

### Viewing Order Details
1. Find the order in the table
2. Click the **eye icon** in Actions
3. See order information:
   - Customer details
   - Items breakdown
   - Total cost
   - Status dropdown

### Updating Order Status
1. Click **eye icon** to open order details
2. Select new status from dropdown:
   - **Pending** → **Processing** → **Shipped** → **Delivered**
   - Can also set to **Cancelled**
3. Status updates immediately
4. See success message ✅

### Deleting an Order
1. Find the order in the table
2. Click **trash icon**
3. Confirm deletion
4. Order removed from list

### Exporting Orders
1. Click **"Export CSV"** button
2. File downloads: `orders-YYYY-MM-DD.csv`
3. Contains: Order #, Customer, Email, Items, Total, Status, Date, Delivery Date

### Searching Orders
1. Use the search box at the top
2. Search by:
   - Order number (e.g., "ORD-2024-001")
   - Customer name (e.g., "Sarah")
   - Email address

---

## ⭐ Support & Reviews Page (NEW)

### Reviews Tab

#### View Reviews
1. Click **Support & Reviews** in sidebar
2. Click **"Reviews"** tab
3. See all customer reviews with:
   - Product name
   - Customer name
   - Star rating (1-5 stars)
   - Review title
   - Status badge

#### Search Reviews
1. Use search box: Search by product name or customer
2. Results filter in real-time

#### Filter by Status
1. Use Status dropdown:
   - **All Status** - Show all reviews
   - **Pending** - Reviews awaiting approval
   - **Approved** - Published reviews
   - **Rejected** - Rejected reviews

#### Review Details Modal
1. Click **eye icon** next to review
2. See full review with:
   - Product name
   - Customer name
   - Star rating
   - Review title
   - Full comment text
   - Helpful count (how many users found helpful)

#### Approve/Reject Pending Reviews
1. Click **eye icon** on pending review
2. In modal, see **Approve** and **Reject** buttons
3. Click to change status
4. Status updates immediately

#### Delete Review
1. Click **trash icon** next to review
2. Confirm deletion
3. Review permanently removed

---

### Support Queries Tab

#### View All Tickets
1. Click **Support & Reviews** in sidebar
2. Click **"Support Queries"** tab
3. See all support tickets with:
   - Ticket ID (e.g., "TKT-001")
   - Customer name
   - Category (Billing, Shipping, Product, General, Return)
   - Subject line
   - Status (Open, In Progress, Resolved, Closed)
   - Priority (Low, Medium, High)
   - Creation date

#### Search Tickets
1. Use search box
2. Search by:
   - Ticket ID
   - Customer name
   - Subject

#### Filter by Status
1. Use Status dropdown:
   - **All Status** - All tickets
   - **Open** - New tickets needing attention
   - **In Progress** - Currently being handled
   - **Resolved** - Issue resolved, waiting customer confirmation
   - **Closed** - Completed and closed

#### Open Ticket Details
1. Click **message icon** on ticket row
2. Modal opens showing:
   - Original customer message
   - Conversation history
   - All responses (color-coded: blue for admin, gray for customer)
   - Timestamps on each message

#### Send Response to Customer
1. In ticket modal, scroll to bottom
2. Type message in **"Send Response"** text area
3. Click **"Send Response"** button
4. Message appears in conversation
5. Success message shows ✅

#### Update Ticket Status
1. In ticket modal, find **"Update Status"** dropdown
2. Select new status:
   - **Open** → **In Progress** → **Resolved** → **Closed**
3. Status updates immediately
4. If status is "Closed", response box disappears

#### Delete Ticket
1. Click **trash icon** on ticket row
2. Confirm deletion
3. Ticket permanently removed

---

## 📊 Dashboard Stats

The Support & Reviews page shows these statistics:
- **Total Reviews**: Count of all reviews
- **Pending Reviews**: Reviews awaiting moderation
- **Average Rating**: Star rating average (1-5)
- **Total Queries**: Total support tickets
- **Open Tickets**: Tickets needing attention

---

## 💡 Tips & Tricks

### Time Savers
- **Bulk Operations**: Select all products at once using header checkbox
- **Search**: Use search to quickly find what you need
- **Export**: Download data for backup or external reporting
- **Quick Filter**: Click status tabs to filter instantly

### Best Practices
- **Before Deleting**: Use the confirmation dialog to double-check
- **Support Responses**: Clear, helpful responses increase customer satisfaction
- **Review Moderation**: Approve legitimate reviews quickly to build trust
- **Status Updates**: Keep orders updated so customers can track delivery
- **Bulk Imports**: Test CSV format with a small file first

### Common Issues
- **CSV Import Not Working**: Ensure columns are in correct order: name, sku, price, stock, category
- **Changes Not Saving**: The app uses local storage, check browser developer tools
- **Slow Load**: Large CSV files might take a moment to process

---

## 🎨 Visual Indicators

### Badges & Colors
- **Green**: Active, Approved, Delivered, Resolved
- **Blue**: Processing, In Progress
- **Yellow**: Pending, Cautionary status
- **Red**: Cancelled, Rejected, Critical, Delete
- **Purple**: Shipped

### Icons Used
- **👁️ Eye**: View details
- **✏️ Pencil**: Edit
- **🗑️ Trash**: Delete
- **📥 Download**: Export
- **📤 Upload**: Import
- **💬 Message**: View ticket

---

## 📈 Features by Page

| Feature | Products | Orders | Support |
|---------|----------|--------|---------|
| Add/Create | ✅ | ❌ | ❌ |
| Edit | ✅ | ❌ | ✅ (Ticket) |
| Delete | ✅ | ✅ | ✅ |
| Bulk Operations | ✅ | ❌ | ❌ |
| Import CSV | ✅ | ❌ | ❌ |
| Export CSV | ✅ | ✅ | ❌ |
| Status Change | ❌ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ |
| Filter | ✅ | ✅ | ✅ |
| Modal View | ✅ | ✅ | ✅ |
| Respond/Interact | ❌ | ❌ | ✅ |

---

## 🔗 Navigation

All features accessible from the sidebar:
1. **Dashboard** - Overview stats
2. **Products** - Product management
3. **Orders** - Order tracking
4. **Inventory** - Stock management (coming soon)
5. **Customers** - Customer management (coming soon)
6. **Analytics** - Charts and reports
7. **Support & Reviews** - NEW! Customer support & reviews
8. **Settings** - Configuration

---

## ✅ Success Indicators

After any action, you'll see a green success message:
```
✅ Operation completed successfully!
```

This message appears for 3 seconds then disappears automatically.

---

## 🆘 Need Help?

- All buttons have hover effects to show they're interactive
- All destructive actions require confirmation
- Modal dialogs explain what action you're about to take
- Form fields have placeholder text explaining what to enter

---

**Happy Managing! 🎉**
