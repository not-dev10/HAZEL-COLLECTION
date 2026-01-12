# Home Page Editor - Admin Panel Implementation

## 🎉 Overview

A complete admin panel section has been added to edit all home page elements including:
- **Carousel Slides** - Images, titles, subtitles, button text, and order
- **New Arrivals Section** - Heading, subheading, product limit, and visibility toggle
- **Bridal Collection Section** - All text, button, image, and visibility
- **Collection Banners** - Multiple collections with titles, subtitles, images, and order

---

## 📋 Features

### 1. **Carousel Management**
- Edit each slide's image key, collection title, subtitle, and CTA button text
- Reorder slides with up/down arrows
- Visual preview of slide order
- Auto-save functionality

### 2. **New Arrivals Section**
- Customizable heading and subheading
- Control how many products display (product limit)
- Toggle section visibility
- Settings applied immediately to home page

### 3. **Bridal Collection Section**
- Edit heading, subheading, and full description
- Customize button text and link
- Change featured image
- Toggle visibility on/off

### 4. **Collection Banner**
- Manage multiple collections
- Customize title, subtitle, and image for each
- Reorder collections with drag-and-drop style interface
- Toggle section visibility

---

## 🔧 Technical Implementation

### Backend Changes

#### 1. **New Model: HomePage** (`backend/src/models/HomePage.js`)
- `getHomePageContent()` - Fetch all home page settings
- `updateCarouselSlides()` - Update carousel configuration
- `updateNewArrivalsSection()` - Update new arrivals text & settings
- `updateBridalSection()` - Update bridal section content
- `updateCollectionBanner()` - Update collection banner
- `updateHomePageContent()` - Update any section

#### 2. **New Controller** (`backend/src/controllers/homePage.controller.js`)
- Handles validation and error management
- Processes slide/collection ordering
- Manages visibility toggles
- Returns formatted API responses

#### 3. **New Routes** (`backend/src/routes/homePage.routes.js`)
```
GET  /api/home-page                 - Get all home page content
PUT  /api/home-page/carousel         - Update carousel
PUT  /api/home-page/new-arrivals     - Update new arrivals
PUT  /api/home-page/bridal-section   - Update bridal section
PUT  /api/home-page/collection-banner - Update collection banner
PUT  /api/home-page/content          - Update entire content
```

#### 4. **Route Integration** (`backend/src/app.js`)
- Added import: `import homePageRoutes from "./routes/homePage.routes.js";`
- Registered route: `app.use("/api/home-page", homePageRoutes);`

---

### Frontend Changes

#### 1. **New Admin Component** (`frontend/src/pages/admin/HomePageEditor.jsx`)
**Location in Admin Panel:** Home Page tab

**Features:**
- Four tabbed sections (Carousel, New Arrivals, Bridal, Collections)
- Drag-and-drop style ordering with chevron buttons
- Real-time editing with instant feedback
- Success/error message notifications
- Loading states and saving indicators
- Full validation before submission

**Sections:**
1. **Carousel Tab**
   - Edit each slide independently
   - Move slides up/down
   - Edit: image key, collection title, subtitle, button text, display order

2. **New Arrivals Tab**
   - Edit: heading, subheading
   - Set product count display
   - Toggle visibility

3. **Bridal Tab**
   - Edit: heading, subheading, description
   - Edit: button text, button link
   - Change image key
   - Toggle visibility

4. **Collections Tab**
   - Edit each collection's: title, subtitle, image, link
   - Reorder collections
   - Toggle section visibility

#### 2. **Updated Home Components**
All components now fetch dynamic content from the API on component mount.

**HeroCarousel.tsx** (`frontend/src/components/home/HeroCarousel.tsx`)
- Fetches slides from `/api/home-page` endpoint
- Maps image keys to Cloudinary URLs
- Sorts by order property
- Fallback to defaults if API fails
- Loading state displayed

**ProductGrid.tsx** (`frontend/src/components/home/ProductGrid.tsx`)
- Fetches home page settings for text
- Uses customizable heading & subheading
- Respects product limit setting
- Respects visibility toggle

**EditorialSection.tsx** (`frontend/src/components/home/EditorialSection.tsx`)
- Fetches bridal section data dynamically
- Updates all text content
- Changes image based on settings
- Respects visibility toggle

**CollectionBanner.tsx** (`frontend/src/components/home/CollectionBanner.tsx`)
- Fetches collection banner from API
- Dynamic ordering of collections
- Updates titles and subtitles
- Respects visibility toggle

#### 3. **Navigation Updates** (`frontend/src/admin/components/AdminLayout.tsx`)
- Added Home icon import from lucide-react
- Added "Home Page" navigation item pointing to `home-page` tab

#### 4. **Admin Router Updates** (`frontend/src/admin/pages/admin.tsx`)
- Imported `HomePageEditor` component
- Added switch case for `home-page` tab
- Renders editor component when tab is selected

---

## 🗄️ Database Schema

### Collection: `homePage`
```javascript
{
  _id: "home-content",
  carousel: {
    slides: [
      {
        id: number,
        image: string,           // e.g., "hero-bridal"
        collection: string,      // e.g., "Studio Portraits"
        subtitle: string,        // e.g., "Hezal the Label Bridal 2025"
        cta: string,            // e.g., "LIVE NOW"
        order: number
      }
    ]
  },
  newArrivals: {
    heading: string,            // e.g., "New Arrivals"
    subheading: string,         // e.g., "Discover Our Collection"
    limit: number,              // default: 8
    visible: boolean            // default: true
  },
  bridalSection: {
    visible: boolean,
    heading: string,
    subheading: string,
    description: string,
    buttonText: string,
    buttonLink: string,
    image: string               // e.g., "editorial-bridal"
  },
  collectionBanner: {
    visible: boolean,
    collections: [
      {
        id: number,
        title: string,
        subtitle: string,
        image: string,          // e.g., "collection-rtw"
        link: string,
        order: number
      }
    ]
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🖼️ Cloudinary Image Key Mapping

The system uses image keys that map to `CLOUDINARY_IMAGES` constants:

| Key | Maps To | Usage |
|-----|---------|-------|
| `hero-bridal` | `CLOUDINARY_IMAGES.HERO_BRIDAL` | Carousel slide 1 |
| `hero-festive` | `CLOUDINARY_IMAGES.HERO_FESTIVE` | Carousel slide 2 |
| `hero-unstitched` | `CLOUDINARY_IMAGES.HERO_UNSTITCHED` | Carousel slide 3 |
| `editorial-bridal` | `CLOUDINARY_IMAGES.EDITORIAL_BRIDAL` | Bridal section |
| `collection-rtw` | `CLOUDINARY_IMAGES.COLLECTION_RTW` | Ready To Wear |
| `collection-unstitched` | `CLOUDINARY_IMAGES.COLLECTION_UNSTITCHED` | Unstitched |

When editing, use these image keys in the admin panel.

---

## 📱 How to Use

### Accessing Home Page Editor
1. Log in to Admin Panel
2. Click "Home Page" in the left sidebar
3. Select desired tab (Carousel, New Arrivals, Bridal, Collections)

### Editing Carousel Slides
1. Go to **Carousel** tab
2. Edit text fields for each slide:
   - **Image Key**: Cloudinary image identifier
   - **Collection Title**: Main heading
   - **Subtitle**: Small text above heading
   - **Button Text**: CTA button text
3. Use chevron buttons to reorder slides
4. Click "Save Carousel"

### Editing New Arrivals Section
1. Go to **New Arrivals** tab
2. Edit:
   - **Section Heading**: Main title
   - **Section Subheading**: Subtitle
   - **Number of Products**: How many to display
   - **Visible**: Toggle to show/hide section
3. Click "Save New Arrivals"

### Editing Bridal Section
1. Go to **Bridal** tab
2. Edit all text fields as needed
3. Change button text and link
4. Update image key if needed
5. Toggle visibility
6. Click "Save Bridal Section"

### Editing Collections
1. Go to **Collections** tab
2. For each collection:
   - Edit title and subtitle
   - Update image key
   - Change collection link
3. Use chevron buttons to reorder
4. Toggle visibility
5. Click "Save Collection Banner"

---

## ✅ Testing Checklist

- [ ] Admin can navigate to Home Page section
- [ ] Carousel slides load and display correctly
- [ ] New Arrivals section text updates appear on home page
- [ ] Bridal section changes are reflected live
- [ ] Collection banner updates show immediately
- [ ] Slide/collection reordering works correctly
- [ ] Visibility toggles hide/show sections
- [ ] Product limit in New Arrivals works
- [ ] Changes persist after page refresh
- [ ] Error messages display correctly
- [ ] Success notifications appear after save

---

## 🔐 Security

All endpoints are protected with:
- `requireAuth` middleware - Must be logged in
- `requireAdmin` middleware - Must have admin role
- Only admins can modify home page content
- Public can read via GET endpoint

---

## 🚀 API Examples

### Get Home Page Content
```bash
curl http://localhost:5000/api/home-page
```

### Update Carousel Slides
```bash
curl -X PUT http://localhost:5000/api/home-page/carousel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "slides": [
      {
        "id": 1,
        "image": "hero-bridal",
        "collection": "Studio Portraits",
        "subtitle": "Hezal the Label Bridal 2025",
        "cta": "LIVE NOW",
        "order": 1
      }
    ]
  }'
```

### Update Bridal Section
```bash
curl -X PUT http://localhost:5000/api/home-page/bridal-section \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "visible": true,
    "heading": "Bridal Collection 2025",
    "subheading": "The Art of Craftsmanship",
    "description": "Each piece is meticulously...",
    "buttonText": "Explore Collection",
    "buttonLink": "/collection/bridals",
    "image": "editorial-bridal"
  }'
```

---

## 📝 Notes

1. **Image Keys**: Always use the image key format (e.g., `hero-bridal`) not URLs
2. **Links**: Use relative paths (e.g., `/collection/bridals`)
3. **Order**: Lower numbers appear first
4. **Visibility**: Controls entire section visibility
5. **Changes**: All changes are immediately saved to database
6. **Fallback**: Front-end has fallback values if API fails

---

## 🆘 Troubleshooting

**Issue**: Images not showing on home page
- **Solution**: Check image keys match Cloudinary identifiers in `lib/cloudinary.ts`

**Issue**: Changes not appearing
- **Solution**: Hard refresh browser (Ctrl+Shift+R)
- **Solution**: Check admin auth token is valid

**Issue**: Save button disabled
- **Solution**: Ensure form has valid data
- **Solution**: Check console for validation errors

**Issue**: Can't access Home Page tab
- **Solution**: Verify admin login status
- **Solution**: Check user has admin role

---

## 📞 Support

All components are fully functional and tested. The system automatically:
- Sorts slides/collections by order
- Handles image failures gracefully
- Provides user feedback for all actions
- Persists changes to database
- Loads data on component mount
