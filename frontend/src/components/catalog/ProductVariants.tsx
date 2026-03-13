import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Variant {
  id: string;
  color: string;
  colorCode: string;
  sizes: {
    size: string;
    stock: number;
  }[];
}

interface ProductVariantsProps {
  variants: Variant[];
  onVariantSelect?: (variant: Variant, size: string) => void;
  onColorSelect?: (color: string) => void;
  onSizeSelect?: (size: string) => void;
}

export const ProductVariants: React.FC<ProductVariantsProps> = ({ variants, onVariantSelect, onColorSelect, onSizeSelect }) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(variants.length > 0 ? variants[0].id : null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (!variants || variants.length === 0) {
    return null;
  }

  const currentVariant = variants.find(v => v.id === selectedColor);

  const handleColorSelect = (variantId: string) => {
    setSelectedColor(variantId);
    setSelectedSize(null); // Reset size when color changes
    const variant = variants.find(v => v.id === variantId);
    if (variant && onColorSelect) {
      onColorSelect(variant.color);
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    if (onSizeSelect) {
      onSizeSelect(size);
    }
    if (currentVariant && onVariantSelect) {
      onVariantSelect(currentVariant, size);
    }
  };

  const getTotalStock = (variant: Variant) => {
    return variant.sizes.reduce((sum, s) => sum + s.stock, 0);
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Color Selection */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Color</h3>
        <div className="flex flex-wrap gap-3">
          {variants.map(variant => (
            <button
              key={variant.id}
              onClick={() => handleColorSelect(variant.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded border-2 transition-all ${
                selectedColor === variant.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="w-5 h-5 rounded-full border border-gray-300"
                style={{ backgroundColor: variant.colorCode }}
                title={variant.color}
              />
              <span className="text-sm font-medium">{variant.color}</span>
              <Badge variant="secondary" className="text-xs ml-1">
                {getTotalStock(variant)}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      {currentVariant && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Size</h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {currentVariant.sizes.map(sizeItem => {
              const isAvailable = sizeItem.stock > 0;
              const isSelected = selectedSize === sizeItem.size;

              return (
                <button
                  key={sizeItem.size}
                  onClick={() => isAvailable && handleSizeSelect(sizeItem.size)}
                  disabled={!isAvailable}
                  className={`py-2 px-3 rounded border-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isAvailable
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  title={isAvailable ? `${sizeItem.stock} in stock` : 'Out of stock'}
                >
                  {sizeItem.size}
                  {!isAvailable && <span className="text-xs ml-1">✕</span>}
                </button>
              );
            })}
          </div>
          
          {/* Stock Info */}
          {selectedSize && (
            <div className="mt-3 text-sm">
              {currentVariant.sizes.find(s => s.size === selectedSize)?.stock === 0 ? (
                <p className="text-red-600">Out of stock in this size</p>
              ) : (
                <p className="text-green-600">
                  ✓ {currentVariant.sizes.find(s => s.size === selectedSize)?.stock} in stock
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Availability Summary */}
      <div className="p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-xs text-blue-900">
          <strong>{variants.length}</strong> color option(s) available with multiple sizes
        </p>
      </div>
    </div>
  );
};

export default ProductVariants;
