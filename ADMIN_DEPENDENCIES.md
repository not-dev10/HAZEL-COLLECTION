# Admin Panel Dependencies

The admin panel uses the following packages that should already be installed in your project:

## Required Dependencies (Already in package.json)

### Core Libraries
- **react**: ^18.3.1 - UI framework
- **react-router-dom**: Router for navigation (to be installed if not present)
- **@tanstack/react-query**: ^5.83.0 - Data fetching and caching

### UI Components & Styling
- **@radix-ui**: Component libraries (already installed)
- **tailwindcss**: Utility-first CSS
- **class-variance-authority**: ^0.7.1 - CSS utilities
- **clsx**: ^2.1.1 - Class name utilities

### Visualization
- **recharts**: ^0.23.0+ - Charts and graphs (may need installation)
- **lucide-react**: ^0.462.0 - Icons library (already installed)

### Form Handling
- **@hookform/resolvers**: ^3.10.0 - Form resolution
- **react-hook-form**: Form state management (may need installation)

## Installation Commands

If you need to install missing dependencies:

```bash
# Navigate to frontend directory
cd frontend

# Install recharts for charts
npm install recharts

# Install react-router-dom if not present
npm install react-router-dom

# Install react-hook-form if not present
npm install react-hook-form

# Or install all at once
npm install recharts react-router-dom react-hook-form
```

## Verification

To verify all dependencies are installed, check your `package.json`:

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.x.x",
    "recharts": "^2.x.x",
    "lucide-react": "^0.462.0",
    "@radix-ui/react-*": "^1.x.x",
    "@tanstack/react-query": "^5.83.0",
    "tailwindcss": "^3.x.x",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1"
  }
}
```

## Feature Dependencies

### For CSV Import/Export
- Built-in browser APIs (no additional packages needed)
- Use for future enhancement: `papaparse` (npm install papaparse)

### For PDF Export
- `pdfkit` or `jspdf` (optional, for future use)

### For Advanced Charts
- `victory` or `nivo` (alternative to recharts, optional)

## Run Development Server

After installing dependencies:

```bash
cd frontend
npm run dev
```

Then navigate to: `http://localhost:5173/admin`

## Troubleshooting Installation

### Issue: Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Recharts not working
```bash
# Reinstall recharts specifically
npm uninstall recharts
npm install recharts@^2.10.0
```

### Issue: Tailwind styles not applying
```bash
# Ensure tailwind is properly configured
npm run build
# or
npm run dev
```

## Production Build

Before deploying to production:

```bash
cd frontend
npm run build
```

This will create an optimized build with proper code splitting and minification.

---

**Last Updated**: January 2025
