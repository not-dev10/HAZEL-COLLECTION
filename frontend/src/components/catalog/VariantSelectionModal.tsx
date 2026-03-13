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

export default VariantSelectionModal;
