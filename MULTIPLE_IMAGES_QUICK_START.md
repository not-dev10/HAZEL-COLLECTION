# Multiple Product Images - Quick Start Guide

## For Admin Users

### Adding a Product with Multiple Images

1. **Navigate to Admin Panel**
   - Go to `/admin`
   - Click on "Products Management" tab

2. **Click "Add Product" Button**
   - Opens dialog with product form

3. **Fill in Product Details**
   - Product Name (required)
   - Description (optional)
   - Price (required)
   - Stock Quantity (required)
   - Category (required)

4. **Upload Images**
   - Click "Upload Images" section
   - Select multiple image files (PNG, JPG, up to 10MB each)
   - Images appear as thumbnails
   - Remove individual images by clicking the trash icon

5. **Submit**
   - Click "Add Product"
   - Product is created first
   - Images upload to Cloudinary automatically
   - Success message confirms operation

### Uploading Images to Existing Product

**Option 1: Using API**
```bash
curl -X POST http://localhost:5000/api/upload/product-images \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-id-here",
    "images": [
      { "url": "data:image/png;base64,..." },
      { "url": "https://example.com/image.jpg" }
    ]
  }'
```

**Option 2: Using Frontend**
- Edit product and re-add with images (product updated)
- Images array replaces previous images

### Deleting a Product Image

**API Request**:
```bash
curl -X DELETE http://localhost:5000/api/upload/product-image/{productId}/{imageIndex} \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

- `imageIndex`: 0 for first image, 1 for second, etc.
- Removes image from Cloudinary and database
- If primary image (index 0) deleted, second image becomes primary

---

## For Customers

### Viewing Product Images

#### On Home Page
- Hover over product card
- Use left/right arrows to navigate images
- Click product to view details

#### On Product Detail Page
- Main image displayed in center
- Thumbnails shown below
- Click any thumbnail to change main image
- See all product images in high resolution

#### On Collection Page
- Similar to home page
- Image carousel on hover
- Smooth transitions

---

## Database Schema

### Product Document Structure
```javascript
{
  _id: ObjectId("..."),
  productId: "unique-string-id",
  
  // Images
  image: "https://res.cloudinary.com/.../main-image.jpg",  // Primary image
  images: [
    "https://res.cloudinary.com/.../image-1.jpg",
    "https://res.cloudinary.com/.../image-2.jpg",
    "https://res.cloudinary.com/.../image-3.jpg"
  ],
  
  // Basic Info
  name: "Product Name",
  description: "Product description",
  price: 99.99,
  originalPrice: 129.99,
  category: "Dresses",
  
  // Other fields remain unchanged
  stock: 50,
  color: ["Red", "Blue"],
  size: ["S", "M", "L"],
  isNew: true,
  isSale: false,
  
  // Timestamps
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## API Endpoints Reference

### Upload Images
- **POST** `/api/upload/product-images`
- **Auth**: Admin required
- **Body**: `{ productId, images: [{url: "..."}, ...] }`
- **Returns**: Updated product with image URLs

### Get Cloudinary Signature
- **POST** `/api/upload/cloudinary-signature`
- **Auth**: Admin required
- **Body**: `{ productId }`
- **Returns**: Upload credentials for client-side uploads

### Delete Image
- **DELETE** `/api/upload/product-image/:productId/:imageIndex`
- **Auth**: Admin required
- **Returns**: Updated product document

### Create Product (Updated)
- **POST** `/api/products`
- **Auth**: Admin required
- **Body**: `{ name, price, stock, category, ..., images: ["url1", "url2"] }`
- **Returns**: Created product with image array

---

## Cloudinary Folder Structure

All product images organized as:
```
didi-fashion/
└── products/
    ├── product-id-1/
    │   ├── image-1.jpg
    │   ├── image-2.jpg
    │   └── image-3.jpg
    ├── product-id-2/
    │   └── image-1.jpg
    └── ...
```

- **Organization**: By product ID for easy management
- **Naming**: Sequential numbering (image-1, image-2, etc.)
- **Overwrite**: Enabled to prevent duplicates
- **Auto-optimization**: Cloudinary automatically optimizes format and quality
- **CDN**: All images served through Cloudinary's global CDN

---

## Troubleshooting

### Images Not Uploading
1. Check admin authentication token
2. Verify product exists in database
3. Check Cloudinary credentials in `.env`
4. Ensure image files < 10MB

### Images Not Displaying
1. Check Cloudinary folder structure
2. Verify image URLs in database
3. Check browser console for errors
4. Ensure Cloudinary account active

### Slow Image Loading
- Cloudinary auto-optimizes, but initial upload takes time
- Subsequent loads use CDN cache
- Consider optimizing images locally before upload

### Delete Image Not Working
1. Verify correct imageIndex (0-based)
2. Confirm admin authentication
3. Check product ID is valid
4. Ensure image exists at that index

---

## Performance Tips

1. **Optimize Images Locally**
   - Resize to ~1200x1600px for main image
   - Use PNG for quality, JPG for size
   - Compress before uploading

2. **Upload Best Practices**
   - Limit to 5-10 images per product
   - Use consistent aspect ratio (3:4 recommended)
   - Include varied angles (front, side, back, detail)

3. **Caching**
   - Cloudinary CDN caches images globally
   - Clear cache if image needs updating
   - Use versioning for significant changes

---

## FAQ

**Q: Can I reorder images?**
A: Currently no, but delete and re-upload to change order.

**Q: What image formats are supported?**
A: JPEG, PNG, GIF, WebP, HEIC, and more. Cloudinary auto-converts.

**Q: Is there a limit on image count?**
A: No hard limit, but 10+ images may slow page load.

**Q: Are old single-image products supported?**
A: Yes, they automatically use the single image as primary.

**Q: Can customers upload images?**
A: No, currently admin-only. This is by design for quality control.

**Q: How much storage do images use?**
A: Cloudinary provides free tier with storage limits. Check your plan.

---

## Support

For issues or questions:
1. Check error logs in browser console
2. Review Cloudinary dashboard for failed uploads
3. Verify MongoDB connection for database issues
4. Check backend logs for API errors
