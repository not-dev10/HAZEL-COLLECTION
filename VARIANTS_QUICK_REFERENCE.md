# 🎨 Color & Size Variants - Quick Reference

---

## Admin Panel Usage

### Add Product with Variants

```
1. Click "Add Product"
2. Fill: Name, Price, Category, Description
3. Scroll to "Color & Size Variants"
4. Click "Add Color"
5. Select color (predefined or custom)
6. Enter stock for each size (XS-XXXL)
7. Repeat for more colors
8. Upload images
9. Click "Add Product"
```

### Edit Product Variants

```
1. Click edit icon on product
2. Scroll to "Color & Size Variants"
3. Modify stock levels
4. Add new colors (click "Add Color")
5. Remove colors (click X)
6. Click "Save Changes"
```

### View Variants in Table

```
Variants Column Shows:
- Color swatches (visual circles)
- Color names
- Example: 🔴 Red 🔵 Blue 🟢 Green
```

---

## Frontend Product Page

### Customer View

```
1. Open product page
2. See "Color" section with swatches
3. Click color to select
4. See "Size" section with available sizes
5. Click size to select
6. See stock availability
7. Add to cart
```

### Stock Display

```
✅ In Stock (5 available)  - Green
❌ Out of Stock           - Red
🔴 Color Swatch          - Visual preview
📊 Total Stock Badge     - Per color
```

---

## Predefined Colors

| Color | Hex | Visual |
|-------|-----|--------|
| Red | #EF4444 | 🔴 |
| Blue | #3B82F6 | 🔵 |
| Green | #10B981 | 🟢 |
| Yellow | #FBBF24 | 🟡 |
| Purple | #A855F7 | 🟣 |
| Pink | #EC4899 | 🩷 |
| Black | #1F2937 | ⚫ |
| White | #F3F4F6 | ⚪ |
| Gray | #9CA3AF | ⚫ |
| Brown | #92400E | 🟤 |

**Custom**: Use color picker for any hex color

---

## Sizes

```
XS   - Extra Small
S    - Small
M    - Medium
L    - Large
XL   - Extra Large
XXL  - 2X Large
XXXL - 3X Large
```

---

## API Examples

### Create Product with Variants

```bash
POST /api/products
Content-Type: application/json

{
  "name": "Summer Dress",
  "price": 49.99,
  "category": "Dresses",
  "variants": [
    {
      "id": "var-1",
      "color": "Red",
      "colorCode": "#EF4444",
      "sizes": [
        { "size": "XS", "stock": 5 },
        { "size": "S", "stock": 10 },
        { "size": "M", "stock": 8 }
      ]
    }
  ]
}
```

### Update Product Variants

```bash
PUT /api/products/:id
Content-Type: application/json

{
  "variants": [
    {
      "id": "var-1",
      "color": "Red",
      "colorCode": "#EF4444",
      "sizes": [
        { "size": "XS", "stock": 5 },
        { "size": "S", "stock": 10 }
      ]
    }
  ]
}
```

### Get Product with Variants

```bash
GET /api/products/:id

Response:
{
  "success": true,
  "product": {
    "id": "...",
    "name": "Summer Dress",
    "variants": [...]
  }
}
```

---

## Files Changed

### Backend
- `backend/src/models/Product.js` - Schema update
- `backend/src/controllers/product.controller.js` - Endpoint update

### Frontend - Admin
- `frontend/src/admin/components/ColorSizeManager.tsx` - NEW
- `frontend/src/admin/pages/Products.tsx` - Integration

### Frontend - Customer
- `frontend/src/components/catalog/ProductVariants.tsx` - NEW
- `frontend/src/pages/Product.tsx` - Integration

---

## Common Tasks

### Add Red Color with Stock

```
1. Click "Add Color"
2. Click red swatch (predefined)
3. Enter stock for each size:
   XS: 5, S: 10, M: 8, L: 6, XL: 3, XXL: 2, XXXL: 0
4. Click "Add"
```

### Add Custom Navy Blue

```
1. Click "Add Color"
2. Click color picker
3. Enter hex: #001F3F
4. Enter name: Navy Blue
5. Enter stock for sizes
6. Click "Add"
```

### Update Stock for Size

```
1. Click edit product
2. Find color section
3. Change stock number for size
4. Click "Save Changes"
```

### Remove Color

```
1. Click edit product
2. Find color section
3. Click X button on color
4. Click "Save Changes"
```

---

## Validation Rules

### Admin Panel
- ✅ Color name required
- ✅ Color code required (hex)
- ✅ Stock must be number ≥ 0
- ✅ At least one size per color

### Frontend
- ✅ Only available sizes shown
- ✅ Out-of-stock sizes disabled
- ✅ Stock display updates in real-time

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Variants not showing | Refresh page, check console |
| Stock not updating | Verify number input, save product |
| Colors not displaying | Check product has variants |
| Size not available | Check stock > 0 for that size |

---

## Performance

- ✅ No additional API calls
- ✅ Variants loaded with product
- ✅ Client-side filtering
- ✅ Efficient database storage

---

## Backward Compatibility

- ✅ Old products still work
- ✅ Legacy fields supported
- ✅ No data loss
- ✅ Can mix old and new

---

**Status**: ✅ Ready to Use  
**Last Updated**: March 13, 2026
