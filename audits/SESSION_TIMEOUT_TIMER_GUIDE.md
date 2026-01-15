# 🕐 Session Timeout Timer - User Guide

## Overview

The Session Timeout Timer is a visual countdown that shows admins how much time they have left before being automatically logged out due to inactivity.

---

## Features

### ✅ **Real-time Countdown**
- Displays time remaining in `HH:MM:SS` format
- Updates every second
- Syncs with backend 2-hour timeout

### ✅ **Color-Coded Status**
- **Green:** More than 15 minutes remaining (safe)
- **Yellow:** 5-15 minutes remaining (caution)
- **Red:** Less than 5 minutes remaining (warning)

### ✅ **Activity Tracking**
Resets timer on any user activity:
- Mouse clicks
- Keyboard input
- Scrolling
- Touch events

### ✅ **Warning System**
- Shows warning at 5 minutes remaining
- Displays "Extend" button to reset timer
- Tooltip explains session status

### ✅ **Auto-Logout**
- Automatically logs out when timer reaches 00:00:00
- Clears all session data
- Redirects to login page

---

## Visual States

### Normal State (Green)
```
┌─────────────────────┐
│ 🕐 01:45:30         │
└─────────────────────┘
```
- Timer shows green
- No warning
- Normal operation

### Caution State (Yellow)
```
┌─────────────────────┐
│ 🕐 00:12:45         │
└─────────────────────┘
```
- Timer shows yellow
- 5-15 minutes remaining
- Consider saving work

### Warning State (Red)
```
┌──────────────────────────┐
│ 🕐 00:04:30  [Extend]   │
└──────────────────────────┘
```
- Timer shows red
- Less than 5 minutes
- "Extend" button appears
- Background changes to red

---

## How It Works

### 1. **Activity Tracking**
```javascript
User Activity → Reset Timer → 2 Hours Countdown
```

### 2. **Countdown**
```
Start: 02:00:00
After 1 hour: 01:00:00
After 1h 55m: 00:05:00 (Warning appears)
After 2 hours: 00:00:00 (Auto-logout)
```

### 3. **Reset Methods**
- Click anywhere in admin panel
- Type on keyboard
- Scroll the page
- Click "Extend" button (when warning shows)

---

## Location

The timer appears in the **top-right corner** of the admin panel header:

```
┌─────────────────────────────────────────────────┐
│ Dashboard    🕐 01:45:30  🔔  👤  🚪           │
└─────────────────────────────────────────────────┘
```

Between the page title and action buttons.

---

## User Actions

### Extend Session
**When:** Warning appears (< 5 minutes)
**How:** 
1. Click the "Extend" button
2. OR perform any activity (click, type, scroll)
**Result:** Timer resets to 02:00:00

### Check Time Remaining
**How:** Hover over the timer
**Shows:**
- Session timeout info
- Warning message (if applicable)
- Instructions to extend

### Manual Logout
**How:** Click the logout button (🚪)
**Result:** Immediate logout, timer stops

---

## Technical Details

### Configuration
```typescript
SESSION_TIMEOUT = 2 hours (7,200,000 ms)
WARNING_THRESHOLD = 5 minutes (300,000 ms)
UPDATE_INTERVAL = 1 second (1,000 ms)
```

### Syncs With Backend
- Backend tracks session independently
- Backend also enforces 2-hour timeout
- If backend session expires, frontend timer is irrelevant
- Both systems work together for security

### Activity Events Tracked
```typescript
- mousedown
- keydown
- scroll
- touchstart
- click
```

---

## Troubleshooting

### Timer Not Resetting
**Issue:** Timer continues counting down despite activity
**Solution:** 
1. Check if events are being captured
2. Ensure component is mounted
3. Check browser console for errors

### Timer Shows Wrong Time
**Issue:** Timer doesn't match expected time
**Solution:**
1. Refresh the page
2. Check system clock
3. Verify backend session timeout setting

### Auto-Logout Too Early
**Issue:** Logged out before 2 hours
**Solution:**
1. Check backend `SESSION_TIMEOUT` setting
2. Verify no other logout triggers
3. Check network connectivity

### Warning Doesn't Appear
**Issue:** No warning at 5 minutes
**Solution:**
1. Check `WARNING_THRESHOLD` setting
2. Verify component is rendering
3. Check CSS/styling

---

## Best Practices

### For Admins
1. ✅ **Save work frequently** - Don't rely on timer
2. ✅ **Watch the timer** - Especially during long tasks
3. ✅ **Extend when warned** - Click "Extend" if you need more time
4. ✅ **Logout manually** - When done working

### For Developers
1. ✅ **Test timeout behavior** - Ensure it works correctly
2. ✅ **Monitor console** - Check for timer-related errors
3. ✅ **Sync with backend** - Keep timeouts consistent
4. ✅ **Handle edge cases** - Network issues, tab switching, etc.

---

## Customization

### Change Timeout Duration
**File:** `frontend/src/components/common/SessionTimeoutTimer.tsx`
```typescript
// Change from 2 hours to 4 hours
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000;
```

**Also update backend:**
**File:** `backend/src/middleware/sessionManagement.js`
```javascript
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000;
```

### Change Warning Threshold
```typescript
// Show warning at 10 minutes instead of 5
const WARNING_THRESHOLD = 10 * 60 * 1000;
```

### Change Update Frequency
```typescript
// Update every 5 seconds instead of 1
const UPDATE_INTERVAL = 5000;
```

---

## Integration

### Already Integrated In:
- ✅ Admin Layout (all admin pages)
- ✅ Header component

### To Add Elsewhere:
```typescript
import { SessionTimeoutTimer } from '@/components/common/SessionTimeoutTimer';

// Full version
<SessionTimeoutTimer />

// Compact version (for mobile/small spaces)
import { SessionTimeoutBadge } from '@/components/common/SessionTimeoutTimer';
<SessionTimeoutBadge />
```

---

## Security Benefits

1. **Prevents Unauthorized Access**
   - Auto-logout protects unattended sessions
   - Reduces risk of session hijacking

2. **User Awareness**
   - Visual countdown keeps users informed
   - Warning system prevents unexpected logouts

3. **Compliance**
   - Meets security requirements for session management
   - Audit trail of session activity

4. **Synced Protection**
   - Frontend and backend both enforce timeout
   - Double layer of security

---

## Screenshots

### Normal State
```
🕐 01:45:30 (green)
```

### Warning State
```
🕐 00:04:30 [Extend] (red background)
⚠️ Session expiring soon!
```

### Tooltip
```
┌─────────────────────────────┐
│ Session Timeout             │
│ Auto-logout after 2 hours   │
│ of inactivity               │
└─────────────────────────────┘
```

---

## FAQ

**Q: What happens if I close the tab?**
A: Timer resets when you reopen. Backend session continues.

**Q: Can I disable the timer?**
A: Not recommended. It's a security feature.

**Q: Does the timer work offline?**
A: Yes, but backend session may expire independently.

**Q: Can I extend indefinitely?**
A: Yes, as long as you stay active or click "Extend".

**Q: What if I have multiple tabs open?**
A: Each tab has its own timer. Backend tracks the actual session.

---

## Related Files

- **Component:** `frontend/src/components/common/SessionTimeoutTimer.tsx`
- **Layout:** `frontend/src/admin/components/AdminLayout.tsx`
- **Backend:** `backend/src/middleware/sessionManagement.js`
- **Documentation:** `audits/SECURITY_HARDENING_COMPLETE.md`

---

**Last Updated:** January 15, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
