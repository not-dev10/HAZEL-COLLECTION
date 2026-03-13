# Variant Selection Popup Implementation Guide

## Overview
When users click "Add to Cart" on products with color/size variants, a modal popup should appear asking them to select color and size before adding to cart. For products without variants, it should add directly to cart.

---

## Current State

### CartItem Interface (Already Supports Variants)
```typescript
export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  size?: string;           // ✓ Already here
  color?: string;          // ✓ Already here
  variantId?: string;      // ✓ Already here
}
```

### Product Page (Already Handles Variants)
**File:** `frontend/src/pages/Product.tsx`

The Product page already has:
- ✓ ProductVariants component for selection
- ✓ Captures selectedColor and selectedSize
- ✓ Includes variantId in cart item
- ✓ Validates that both color and size are selected

---

## What Needs to Be Implemented

### 1. ProductCard Component - Add Variant Selection Modal
**File:** `frontend/src/components/catalog/ProductCard.tsx`

**Current Issue:** ProductCard doesn't know about variants, so it can't show the selection popup.

**What Needs to Change:**
```typescript
// BEFORE: Simple cartItem without variants
const cartItem: CartItem = {
  id: id.toString(),
  name,
  price,
  quantity: 1,
  image,
};

// AFTER: Need to:
// 1. Fetch product details to check if it has variants
// 2. If variants exist, show modal for selection
// 3. If no variants, add directly to cart
```

**Implementation Approach:**
```typescript
interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
  category?: string;
  variants?: Array<{  // ← ADD THIS
    id: string;
    color: string;
    colorCode: string;
    sizes: Array<{ size: string; stock: number }>;
  }>;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  images,
  isNew,
  isSale,
  originalPrice,
  category,
  variants,  // ← ADD THIS
}: ProductCardProps) => {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);

  const handleAddToCartClick = () => {
    // If product has variants, show modal
    if (variants && variants.length > 0) {
      setShowVariantModal(true);
    } else {
      // No variants, add directly
      handleAddDirectly();
    }
  };

  const handleAddDirectly = () => {
    const cartItem: CartItem = {
      id: id.toString(),
      name,
      price,
      quantity: 1,
      image,
    };
    addToCart(cartItem);
  };

  const handleConfirmVariant = () => {
    if (!selectedColor || !selectedSize || !selectedVariant) {
      alert('Please select both color and size');
      return;
    }

    const cartItem: CartItem = {
      id: id.toString(),
      productId: id.toString(),
      name,
      price,
      quantity: 1,
      image,
      color: selectedColor,
      size: selectedSize,
      variantId: selectedVariant.id,
    };
    
    addToCart(cartItem);
    setShowVariantModal(false);
    setSelectedColor(null);
    setSelectedSize(null);
  };

  return (
    <>
      {/* Existing ProductCard JSX */}
      {/* ... */}
      
      {/* Variant Selection Modal */}
      {showVariantModal && variants && variants.length > 0 && (
        <VariantSelectionModal
          variants={variants}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          onColorSelect={(color, variant) => {
            setSelectedColor(color);
            setSelectedVariant(variant);
            setSelectedSize(null); // Reset size when color changes
          }}
          onSizeSelect={setSelectedSize}
          onConfirm={handleConfirmVariant}
          onCancel={() => setShowVariantModal(false)}
        />
      )}
    </>
  );
};
```

---

### 2. Collection Component - Pass Variants to ProductCard
**File:** `frontend/src/pages/Collection.tsx`

**Current Issue:** Collection fetches products but doesn't pass variants to ProductCard.

**What Needs to Change:**
```typescript
// BEFORE:
const normalizedProducts = data.products.map((product: any) => ({
  id: product._id || product.id,
  name: product.name,
  price: product.price,
  originalPrice: product.originalPrice,
  image: product.image || product.imageUrl,
  images: product.images || product.imageUrls || [product.image || product.imageUrl],
  category: product.category,
}));

// AFTER:
const normalizedProducts = data.products.map((product: any) => ({
  id: product._id || product.id,
  name: product.name,
  price: product.price,
  originalPrice: product.originalPrice,
  image: product.image || product.imageUrl,
  images: product.images || product.imageUrls || [product.image || product.imageUrl],
  category: product.category,
  variants: product.variants || [],  // ← ADD THIS
}));

// Then pass to ProductCard:
<ProductCard
  key={product.id}
  id={product.id}
  name={product.name}
  price={product.price}
  image={product.image}
  images={product.images}
  originalPrice={product.originalPrice}
  category={product.category}
  variants={product.variants}  // ← ADD THIS
/>
```

---

### 3. Wishlist Component - Handle Variants
**File:** `frontend/src/pages/Wishlist.tsx`

**Current Issue:** Wishlist doesn't handle variants when adding to cart.

**What Needs to Change:**
```typescript
// BEFORE:
const handleAddToCart = (item: any) => {
  addToCart({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: 1,
    image: item.image,
  });
};

// AFTER:
const [showVariantModal, setShowVariantModal] = useState(false);
const [selectedWishlistItem, setSelectedWishlistItem] = useState<any | null>(null);
const [selectedColor, setSelectedColor] = useState<string | null>(null);
const [selectedSize, setSelectedSize] = useState<string | null>(null);
const [selectedVariant, setSelectedVariant] = useState<any | null>(null);

const handleAddToCart = (item: any) => {
  // If item has variants, show modal
  if (item.variants && item.variants.length > 0) {
    setSelectedWishlistItem(item);
    setShowVariantModal(true);
  } else {
    // No variants, add directly
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
  }
};

const handleConfirmVariant = () => {
  if (!selectedColor || !selectedSize || !selectedVariant) {
    alert('Please select both color and size');
    return;
  }

  addToCart({
    id: selectedWishlistItem.id,
    productId: selectedWishlistItem.id,
    name: selectedWishlistItem.name,
    price: selectedWishlistItem.price,
    quantity: 1,
    image: selectedWishlistItem.image,
    color: selectedColor,
    size: selectedSize,
    variantId: selectedVariant.id,
  });

  setShowVariantModal(false);
  setSelectedWishlistItem(null);
  setSelectedColor(null);
  setSelectedSize(null);
  setSelectedVariant(null);
};
```

---

### 4. Create VariantSelectionModal Component
**File:** `frontend/src/components/catalog/VariantSelectionModal.tsx` (NEW)

```typescript
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface VariantSelectionModalProps {
  variants: Array<{
    id: string;
    color: string;
    colorCode: string;
    sizes: Array<{ size: string; stock: number }>;
  }>;
  selectedColor: string | null;
  selectedSize: string | null;
  onColorSelect: (color: string, variant: any) => void;
  onSizeSelect: (size: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({
  variants,
  selectedColor,
  selectedSize,
  onColorSelect,
  onSizeSelect,
  onConfirm,
  onCancel,
}) => {
  const selectedVariant = variants.find(v => v.color === selectedColor);
  const availableSizes = selectedVariant?.sizes || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Select Options</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">Color</label>
          <div className="grid grid-cols-4 gap-3">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onColorSelect(variant.color, variant)}
                className={`p-3 rounded border-2 transition-all ${
                  selectedColor === variant.color
                    ? 'border-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="w-full h-8 rounded mb-2"
                  style={{ backgroundColor: variant.colorCode }}
                />
                <span className="text-xs text-center block">{variant.color}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        {selectedVariant && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Size</label>
            <div className="grid grid-cols-4 gap-2">
              {availableSizes.map((sizeItem) => (
                <button
                  key={sizeItem.size}
                  onClick={() => onSizeSelect(sizeItem.size)}
                  disabled={sizeItem.stock === 0}
                  className={`p-2 rounded border transition-all text-sm font-medium ${
                    selectedSize === sizeItem.size
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${sizeItem.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={sizeItem.stock === 0 ? 'Out of stock' : `${sizeItem.stock} in stock`}
                >
                  {sizeItem.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedColor || !selectedSize}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### 5. Update Cart Display Components
**Files:** 
- `frontend/src/components/layout/CartMini.tsx`
- `frontend/src/pages/Cart.tsx`
- `frontend/src/pages/Checkout.tsx`

**What Needs to Display:**
```typescript
// In cart items, show:
{item.color && <span className="text-sm text-gray-600">Color: {item.color}</span>}
{item.size && <span className="text-sm text-gray-600">Size: {item.size}</span>}

// Example in CartMini:
<div className="space-y-1">
  <p className="font-medium">{item.name}</p>
  {item.color && <p className="text-xs text-gray-600">Color: {item.color}</p>}
  {item.size && <p className="text-xs text-gray-600">Size: {item.size}</p>}
  <p className="text-sm">£{item.price} x {item.quantity}</p>
</div>
```

---

## Summary of Changes

| Component | Change | Purpose |
|-----------|--------|---------|
| ProductCard | Add variant modal | Show selection popup for products with variants |
| Collection | Pass variants to ProductCard | Enable variant selection in collection view |
| Wishlist | Add variant modal | Show selection popup when adding from wishlist |
| VariantSelectionModal | NEW | Modal for color/size selection |
| CartMini | Display color/size | Show selected variants in cart preview |
| Cart | Display color/size | Show selected variants in full cart |
| Checkout | Display color/size | Show selected variants in order summary |

---

## User Flow

### For Products WITH Variants:
```
User clicks "Add to Cart"
  ↓
Modal appears asking for color & size
  ↓
User selects color
  ↓
Available sizes for that color appear
  ↓
User selects size
  ↓
User clicks "Add to Cart" button in modal
  ↓
Item added with color, size, variantId
  ↓
Item appears in cart with color/size info
  ↓
Checkout shows color/size in order summary
```

### For Products WITHOUT Variants:
```
User clicks "Add to Cart"
  ↓
Item added directly to cart
  ↓
No modal shown
```

---

## Data Flow

```
ProductCard (has variants)
  ↓
VariantSelectionModal (user selects)
  ↓
CartItem { id, name, price, color, size, variantId }
  ↓
CartContext (stores with variants)
  ↓
CartMini (displays color/size)
  ↓
Cart Page (displays color/size)
  ↓
Checkout (displays color/size in summary)
  ↓
Order (stored with color/size info)
```

---

## Key Points

1. **Backward Compatible**: Products without variants work as before
2. **Consistent**: Same variant selection logic across all pages
3. **Stock Aware**: Modal shows stock availability per size
4. **Persistent**: Variants stored in cart and displayed everywhere
5. **Order Tracking**: Variants included in order summary and history
