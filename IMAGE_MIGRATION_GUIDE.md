# Product Image Migration Guide

## Overview
Migrate existing product images to use the new `sizeReferenceImage` field. Since size reference images are always last in the image order, this script extracts the last image from each product and moves it to the dedicated `sizeReferenceImage` field.

---

## What This Does

### Before Migration
```
Product: "Summer Dress"
images: [
  "https://cloudinary.com/image1.jpg",  // Product image 1
  "https://cloudinary.com/image2.jpg",  // Product image 2
  "https://cloudinary.com/image3.jpg",  // Product image 3
  "https://cloudinary.com/size-chart.jpg" ← Size reference (LAST)
]
sizeReferenceImage: null
```

### After Migration
```
Product: "Summer Dress"
images: [
  "https://cloudinary.com/image1.jpg",  // Product image 1
  "https://cloudinary.com/image2.jpg",  // Product image 2
  "https://cloudinary.com/image3.jpg"   // Product image 3
]
sizeReferenceImage: "https://cloudinary.com/size-chart.jpg" ← Extracted
```

---

## How to Run

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Run Migration Script
```bash
node scripts/migrateProductImages.js
```

### Step 3: Review Output
The script will show:
- ✅ Number of products migrated
- ⏭️ Number of products skipped
- 📋 Detailed results for each product

---

## What Gets Skipped

The script automatically skips:
1. **Products without images** - No images to migrate
2. **Products with 1 or fewer images** - Not enough images to extract
3. **Products already migrated** - Already have `sizeReferenceImage` set
4. **Products with errors** - Logged for manual review

---

## Example Output

```
🔍 Starting product image migration...

📦 Found 15 products with images

✅ Migrated "Summer Dress"
   - Size Reference: https://cloudinary.com/didi-fashion/products/...
   - Remaining images: 3

✅ Migrated "Winter Coat"
   - Size Reference: https://cloudinary.com/didi-fashion/products/...
   - Remaining images: 2

⏭️  Skipping "T-Shirt" - only 1 image(s)

============================================================
MIGRATION SUMMARY
============================================================
✅ Migrated: 13
⏭️  Skipped: 2
📦 Total: 15
============================================================

✨ Migration complete!
```

---

## Verification After Migration

### Check in Admin Panel
1. Go to Products page
2. Edit any product
3. Verify:
   - ✓ Product images are displayed (without size chart)
   - ✓ Size Reference Image field shows the extracted image
   - ✓ Image count is reduced by 1

### Check in Database
```javascript
// MongoDB query to verify
db.products.findOne({ name: "Summer Dress" })

// Should show:
{
  _id: ObjectId(...),
  name: "Summer Dress",
  images: [...],  // 3 images (size chart removed)
  sizeReferenceImage: "https://...",  // Size chart here
  ...
}
```

### Check on Product Page
1. Go to product detail page
2. Verify:
   - ✓ Product images display correctly (without size chart)
   - ✓ Size reference image is available for display (if implemented)

---

## Rollback (If Needed)

If you need to undo the migration:

```javascript
// MongoDB query to restore
db.products.updateMany(
  { sizeReferenceImage: { $exists: true, $ne: null } },
  [
    {
      $set: {
        images: {
          $concatArrays: [
            "$images",
            ["$sizeReferenceImage"]
          ]
        },
        sizeReferenceImage: null
      }
    }
  ]
)
```

---

## Important Notes

### ⚠️ Before Running
- **Backup your database** - Always backup before running migrations
- **Test on staging first** - Run on a test environment first
- **No data loss** - Images are moved, not deleted

### ✓ Safe to Run
- **Idempotent** - Can be run multiple times safely
- **Non-destructive** - Only moves data, doesn't delete
- **Atomic** - Each product update is atomic
- **Reversible** - Can be rolled back if needed

### 📝 After Running
- **Update product images** - If you want to re-add size charts, use the new field
- **Verify display** - Check that products display correctly
- **Monitor** - Watch for any issues in production

---

## Next Steps

### 1. Display Size Reference Image on Product Page
Once migration is complete, you can display the size reference image:

```typescript
// In Product.tsx or ProductVariants.tsx
{product.sizeReferenceImage && (
  <div className="mt-8 border-t pt-8">
    <h3 className="text-lg font-semibold mb-4">Size Reference</h3>
    <img 
      src={product.sizeReferenceImage}
      alt="Size Reference Chart"
      className="w-full max-w-md"
    />
  </div>
)}
```

### 2. Update Admin Edit Form
The size reference image field is already in the edit form. After migration:
- Users can view the migrated size reference image
- Users can replace it with a new one
- Users can remove it if not needed

### 3. Monitor Product Display
- Check that product images display correctly
- Verify size reference images are accessible
- Ensure no broken image links

---

## Troubleshooting

### Issue: Script fails to connect to database
**Solution**: Ensure MongoDB is running and connection string is correct in `.env`

### Issue: Some products not migrated
**Solution**: Check the detailed results output for specific errors

### Issue: Size reference image not showing
**Solution**: Verify the image URL is accessible and not corrupted

### Issue: Product images missing after migration
**Solution**: Check that `images` array still contains the remaining images

---

## FAQ

**Q: Will this affect product display?**
A: Yes, product pages will no longer show the size chart in the image gallery. You can display it separately using the new `sizeReferenceImage` field.

**Q: Can I run this multiple times?**
A: Yes, it's safe to run multiple times. Products already migrated will be skipped.

**Q: What if I have products with only 1 image?**
A: They will be skipped. You can manually add a size reference image for these products.

**Q: Can I undo this?**
A: Yes, use the rollback query provided above to restore the original structure.

**Q: Will this affect orders?**
A: No, orders are not affected. Only product images are modified.

---

## Support

If you encounter any issues:
1. Check the detailed output for specific product errors
2. Verify database connection
3. Ensure all images are accessible
4. Check MongoDB logs for any errors
5. Review the rollback section if needed
