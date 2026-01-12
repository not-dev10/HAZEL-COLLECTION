# 🔌 Home Page Editor - API Contract

## Overview

All endpoints are at `/api/home-page` prefix.  
All write operations require admin authentication.  
All responses follow a standard format.

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    // Operation specific data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details"
}
```

---

## 📥 GET /api/home-page

**Purpose:** Fetch all home page configuration  
**Auth:** Public (no auth required)  
**Method:** GET

### Response
```json
{
  "success": true,
  "data": {
    "_id": "home-content",
    "carousel": {
      "slides": [
        {
          "id": 1,
          "image": "hero-bridal",
          "collection": "Studio Portraits",
          "subtitle": "Hezal the Label Bridal 2025",
          "cta": "LIVE NOW",
          "order": 1
        },
        {
          "id": 2,
          "image": "hero-festive",
          "collection": "Winter Luxe",
          "subtitle": "Festive Collection 2025",
          "cta": "SHOP NOW",
          "order": 2
        },
        {
          "id": 3,
          "image": "hero-unstitched",
          "collection": "Ethereal Dreams",
          "subtitle": "Ready To Wear Collection",
          "cta": "EXPLORE",
          "order": 3
        }
      ]
    },
    "newArrivals": {
      "heading": "New Arrivals",
      "subheading": "Discover Our Collection",
      "limit": 8,
      "visible": true
    },
    "bridalSection": {
      "visible": true,
      "heading": "Bridal Collection 2025",
      "subheading": "The Art of Craftsmanship",
      "description": "Each piece is meticulously handcrafted...",
      "buttonText": "Explore Collection",
      "buttonLink": "/collection/bridals",
      "image": "editorial-bridal"
    },
    "collectionBanner": {
      "visible": true,
      "collections": [
        {
          "id": 1,
          "title": "Ready To Wear",
          "subtitle": "Effortless Elegance",
          "image": "collection-rtw",
          "link": "/collection/ready-to-wear",
          "order": 1
        },
        {
          "id": 2,
          "title": "Unstitched",
          "subtitle": "Create Your Own",
          "image": "collection-unstitched",
          "link": "/collection/unstitched",
          "order": 2
        }
      ]
    },
    "createdAt": "2026-01-10T00:00:00Z",
    "updatedAt": "2026-01-10T12:34:56Z"
  }
}
```

### Example cURL
```bash
curl http://localhost:5000/api/home-page
```

### Example JavaScript
```javascript
const response = await fetch('/api/home-page');
const data = await response.json();
console.log(data.data.carousel.slides);
```

---

## 📤 PUT /api/home-page/carousel

**Purpose:** Update carousel slides  
**Auth:** Required (admin only)  
**Method:** PUT  
**Header:** `Authorization: Bearer <token>`  
**Header:** `Content-Type: application/json`

### Request Body
```json
{
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
}
```

### Response
```json
{
  "success": true,
  "message": "Carousel slides updated successfully",
  "data": {
    "carousel": {
      "slides": [...]
    }
  }
}
```

### Example cURL
```bash
curl -X PUT http://localhost:5000/api/home-page/carousel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

---

## 📤 PUT /api/home-page/new-arrivals

**Purpose:** Update New Arrivals section  
**Auth:** Required (admin only)  
**Method:** PUT

### Request Body
```json
{
  "heading": "New Arrivals",
  "subheading": "Discover Our Collection",
  "limit": 8,
  "visible": true
}
```

### Response
```json
{
  "success": true,
  "message": "New Arrivals section updated successfully",
  "data": {
    "newArrivals": {
      "heading": "New Arrivals",
      "subheading": "Discover Our Collection",
      "limit": 8,
      "visible": true
    }
  }
}
```

### Example cURL
```bash
curl -X PUT http://localhost:5000/api/home-page/new-arrivals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "heading": "New Arrivals",
    "subheading": "Discover Our Collection",
    "limit": 6,
    "visible": true
  }'
```

---

## 📤 PUT /api/home-page/bridal-section

**Purpose:** Update Bridal Collection section  
**Auth:** Required (admin only)  
**Method:** PUT

### Request Body
```json
{
  "visible": true,
  "heading": "Bridal Collection 2025",
  "subheading": "The Art of Craftsmanship",
  "description": "Each piece is meticulously handcrafted by our master artisans...",
  "buttonText": "Explore Collection",
  "buttonLink": "/collection/bridals",
  "image": "editorial-bridal"
}
```

### Response
```json
{
  "success": true,
  "message": "Bridal section updated successfully",
  "data": {
    "bridalSection": {...}
  }
}
```

### Example cURL
```bash
curl -X PUT http://localhost:5000/api/home-page/bridal-section \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

## 📤 PUT /api/home-page/collection-banner

**Purpose:** Update Collection Banner section  
**Auth:** Required (admin only)  
**Method:** PUT

### Request Body
```json
{
  "visible": true,
  "collections": [
    {
      "id": 1,
      "title": "Ready To Wear",
      "subtitle": "Effortless Elegance",
      "image": "collection-rtw",
      "link": "/collection/ready-to-wear",
      "order": 1
    },
    {
      "id": 2,
      "title": "Unstitched",
      "subtitle": "Create Your Own",
      "image": "collection-unstitched",
      "link": "/collection/unstitched",
      "order": 2
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "message": "Collection banner updated successfully",
  "data": {
    "collectionBanner": {...}
  }
}
```

### Example cURL
```bash
curl -X PUT http://localhost:5000/api/home-page/collection-banner \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "visible": true,
    "collections": [...]
  }'
```

---

## 📤 PUT /api/home-page/content

**Purpose:** Update entire home page content at once  
**Auth:** Required (admin only)  
**Method:** PUT  
**Note:** Use for bulk updates

### Request Body
```json
{
  "carousel": {...},
  "newArrivals": {...},
  "bridalSection": {...},
  "collectionBanner": {...}
}
```

### Response
```json
{
  "success": true,
  "message": "Home page content updated successfully",
  "data": {
    // Full home page object
  }
}
```

---

## 🔐 Authentication Header

All admin endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

Token obtained from login endpoint and stored in localStorage.

### Example with token
```javascript
const token = localStorage.getItem('adminToken');

const response = await fetch('/api/home-page/carousel', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    slides: [...]
  })
});
```

---

## ❌ Error Responses

### Missing Authentication
```json
{
  "success": false,
  "message": "Authentication required"
}
```
Status: 401

### Insufficient Permissions
```json
{
  "success": false,
  "message": "Admin access required"
}
```
Status: 403

### Validation Error
```json
{
  "success": false,
  "message": "Slides must be provided as an array",
  "error": "Validation failed"
}
```
Status: 400

### Server Error
```json
{
  "success": false,
  "message": "Failed to update carousel slides",
  "error": "Database connection error"
}
```
Status: 500

---

## 🧪 Testing Endpoints

### Test with Postman

1. **GET Home Page Content**
   - URL: `http://localhost:5000/api/home-page`
   - Method: GET
   - No auth needed

2. **Update Carousel**
   - URL: `http://localhost:5000/api/home-page/carousel`
   - Method: PUT
   - Headers: 
     - `Authorization: Bearer {token}`
     - `Content-Type: application/json`
   - Body: Raw JSON with slides array

3. **Update New Arrivals**
   - URL: `http://localhost:5000/api/home-page/new-arrivals`
   - Method: PUT
   - Headers: Auth + Content-Type
   - Body: New arrivals object

### Test with JavaScript
```javascript
// Get home page content
async function getHomePageContent() {
  const response = await fetch('/api/home-page');
  return await response.json();
}

// Update carousel
async function updateCarousel(slides) {
  const token = localStorage.getItem('adminToken');
  const response = await fetch('/api/home-page/carousel', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ slides })
  });
  return await response.json();
}

// Usage
const content = await getHomePageContent();
console.log('Carousel slides:', content.data.carousel.slides);

// Update carousel
await updateCarousel([
  {
    id: 1,
    image: "hero-bridal",
    collection: "Updated Title",
    subtitle: "Updated Subtitle",
    cta: "NEW BUTTON",
    order: 1
  }
]);
```

---

## 📊 Data Validation Rules

### Carousel Slides
- `id`: Required, number
- `image`: Required, string (image key)
- `collection`: Required, string
- `subtitle`: Required, string
- `cta`: Required, string
- `order`: Required, number (1-based)

### New Arrivals
- `heading`: Optional, string
- `subheading`: Optional, string
- `limit`: Optional, number (1-100)
- `visible`: Optional, boolean

### Bridal Section
- `visible`: Optional, boolean
- `heading`: Optional, string
- `subheading`: Optional, string
- `description`: Optional, string
- `buttonText`: Optional, string
- `buttonLink`: Optional, string (must start with /)
- `image`: Optional, string (image key)

### Collections
- `id`: Required, number
- `title`: Required, string
- `subtitle`: Required, string
- `image`: Required, string (image key)
- `link`: Required, string (must start with /)
- `order`: Required, number (1-based)

---

## 🔗 Integration Examples

### React Frontend
```typescript
// Fetch home page content
useEffect(() => {
  fetch('/api/home-page')
    .then(r => r.json())
    .then(data => setHomeData(data.data));
}, []);

// Update carousel
const handleSaveCarousel = async (slides) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch('/api/home-page/carousel', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ slides })
  });
  const data = await response.json();
  if (data.success) {
    alert('Saved!');
  }
};
```

### Node.js Backend
```javascript
// Make admin API call from backend
const updateHomePageContent = async (content) => {
  const response = await fetch('http://localhost:5000/api/home-page/content', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(content)
  });
  return await response.json();
};
```

---

## 📝 Notes

- All timestamps are ISO 8601 format
- Slides/collections are auto-sorted by order
- Changes are applied immediately
- No caching - always fresh data
- Database updates are atomic
- Failed requests don't partially update

---

## ✅ Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (validation failed) |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (not admin) |
| 500 | Server error |

---

## 🚀 Ready to Integrate!

Use these endpoints to build your own home page management system or integrate with existing tools.

For more examples, see `HOME_PAGE_EDITOR_IMPLEMENTATION.md`
