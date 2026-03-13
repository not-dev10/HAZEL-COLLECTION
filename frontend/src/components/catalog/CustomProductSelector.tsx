import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface CustomProductVariant {
  id: string;
  parameters: {
    name: string;
    value: string;
  }[];
  sizes: {
    size: string;
    stock: number;
  }[];
}

interface CustomProductSelectorProps {
  variant: CustomProductVariant;
  onSizeSelect?: (size: string, stock: number) => void;
}

export const CustomProductSelector: React.FC<CustomProductSelectorProps> = ({ 
  variant, 
  onSizeSelect 
}) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleSizeSelect = (size: string, stock: number) => {
    setSelectedSize(size);
    if (onSizeSelect) {
      onSizeSelect(size, stock);
    }
  };

  const getTotalStock = () => {
    return variant.sizes.reduce((sum, s) => sum + s.stock, 0);
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Parameters Display */}
      {variant.parameters && variant.parameters.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Product Details</h3>
          <div className="space-y-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
            {variant.parameters.map((param, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-sm text-gray-600">{param.name}:</span>
                <span className="text-sm font-medium text-gray-900">{param.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Select Size</h3>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {variant.sizes.map(sizeItem => {
            const isAvailable = sizeItem.stock > 0;
            const isSelected = selectedSize === sizeItem.size;

            return (
              <button
                key={sizeItem.size}
                onClick={() => isAvailable && handleSizeSelect(sizeItem.size, sizeItem.stock)}
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
            {variant.sizes.find(s => s.size === selectedSize)?.stock === 0 ? (
              <p className="text-red-600">Out of stock in this size</p>
            ) : (
              <p className="text-green-600">
                ✓ {variant.sizes.find(s => s.size === selectedSize)?.stock} in stock
              </p>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-xs text-blue-900">
          <strong>Custom Product:</strong> Select your preferred size from the available options
        </p>
      </div>
    </div>
  );
};

export default CustomProductSelector;
