# Support Tickets Edit Feature - Future Implementation

## Overview
Add full edit and management capabilities to support tickets in the admin SupportReviews panel.

## Current Status
- ❌ No edit functionality exists
- ⏳ Backend integration placeholder only
- 📍 File: `frontend/src/admin/pages/SupportReviews.tsx` (lines 740-790)

## Features to Implement

### Frontend
1. **Edit Ticket Details Dialog**
   - Edit subject, description, category, priority
   - Change status (open → in-progress → resolved → closed)
   - Modal/dialog form with validation

2. **Response/Reply System**
   - Add admin responses to tickets
   - Thread-based conversation view
   - Timestamp and sender tracking

3. **Ticket Actions**
   - Status update buttons/dropdown
   - Priority management
   - Delete ticket with confirmation

### Backend
1. **Support Ticket Model** (MongoDB)
   - Fields: ticketId, customerId, customerName, category, subject, message, status, priority, responses array, timestamps
   - Indexes: ticketId, customerId, status

2. **Controller Functions**
   - `getAllTickets()` - Admin view all
   - `getCustomerTickets()` - Customer view own
   - `createTicket()` - Create new ticket
   - `updateTicket()` - Edit ticket details
   - `addResponse()` - Add admin response
   - `updateStatus()` - Change ticket status
   - `deleteTicket()` - Remove ticket

3. **API Routes**
   - GET /api/support-tickets (admin)
   - GET /api/support-tickets/customer/:customerId
   - POST /api/support-tickets (create)
   - PUT /api/support-tickets/:ticketId (update)
   - POST /api/support-tickets/:ticketId/response (add response)
   - DELETE /api/support-tickets/:ticketId

## Implementation Steps
1. Create backend model for support tickets
2. Create controller with CRUD operations
3. Create API routes with auth middleware
4. Update SupportReviews component with full UI
5. Add fetch/create/update/delete handlers
6. Integrate with admin panel
7. Add logging for all operations
8. Test end-to-end

## Notes
- Follow existing Review model pattern for consistency
- Use same auth middleware approach
- Implement emoji-prefixed logging
- Support for categories: billing, shipping, product, general, return
- Priority levels: low, medium, high

---
Created: January 10, 2026
