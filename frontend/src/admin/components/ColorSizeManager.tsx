import React, { useState } from 'react';
import { Plus, X, Palette, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface ColorSizeManagerProps {
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
}

const PREDEFINED_COLORS = [
  { name: 'Red', code: '#EF4444' },
  { name: 'Blue', code: '#3B82F6' },
  { name: 'Green', code: '#10B981' },
  { name: 'Yellow', code: '#FBBF24' },
  { name: 'Purple', code: '#A855F7' },
  { name: 'Pink', code: '#EC4899' },
  { name: 'Black', code: '#1F2937' },
  { name: 'White', code: '#F3F4F6' },
  { name: 'Gray', code: '#9CA3AF' },
  { name: 'Brown', code: '#92400E' },
];

const PREDEFINED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const ColorSizeManager: React.FC<ColorSizeManagerProps> = ({ variants, onVariantsChange }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('');
  const [customColorName, setCustomColorName] = useState('');
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingColor, setEditingColor] = useState('');
  const [editingColorCode, setEditingColorCode] = useState('');

  const addColor = (colorName: string, colorCode: string) => {
    const newVariant: Variant = {
      id: `${Date.now()}-${Math.random()}`,
      color: colorName,
      colorCode,
      sizes: PREDEFINED_SIZES.map(size => ({ size, stock: 0 }))
    };
    onVariantsChange([...variants, newVariant]);
    setShowColorPicker(false);
    setCustomColor('');
    setCustomColorName('');
  };

  const removeColor = (variantId: string) => {
    onVariantsChange(variants.filter(v => v.id !== variantId));
  };

  const updateStock = (variantId: string, size: string, stock: number) => {
    onVariantsChange(
      variants.map(v =>
        v.id === variantId
          ? {
              ...v,
              sizes: v.sizes.map(s =>
                s.size === size ? { ...s, stock: Math.max(0, stock) } : s
              )
            }
          : v
      )
    );
  };

  const startEditColor = (variant: Variant) => {
    setEditingVariantId(variant.id);
    setEditingColor(variant.color);
    setEditingColorCode(variant.colorCode);
  };

  const saveEditColor = (variantId: string) => {
    onVariantsChange(
      variants.map(v =>
        v.id === variantId
          ? {
              ...v,
              color: editingColor,
              colorCode: editingColorCode
            }
          : v
      )
    );
    setEditingVariantId(null);
    setEditingColor('');
    setEditingColorCode('');
  };

  const cancelEditColor = () => {
    setEditingVariantId(null);
    setEditingColor('');
    setEditingColorCode('');
  };

  const getTotalStock = (variant: Variant) => {
    return variant.sizes.reduce((sum, s) => sum + s.stock, 0);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Color & Size Variants</h3>
        <p className="text-xs text-gray-600 mb-4">Add colors and manage stock for each size</p>
      </div>

      {/* Color Palette Selector */}
      {!showColorPicker ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowColorPicker(true)}
          className="w-full"
        >
          <Plus size={16} className="mr-2" />
          Add Color
        </Button>
      ) : (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700">Select a color or add custom</p>

          {/* Predefined Colors */}
          <div className="grid grid-cols-5 gap-2">
            {PREDEFINED_COLORS.map(color => (
              <button
                key={color.code}
                type="button"
                onClick={() => addColor(color.name, color.code)}
                className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white transition"
                title={color.name}
              >
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                  style={{ backgroundColor: color.code }}
                />
                <span className="text-xs text-gray-600">{color.name}</span>
              </button>
            ))}
          </div>

          {/* Custom Color */}
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-gray-700">Custom Color</p>
            <div className="flex gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <Input
                placeholder="Color name (e.g., Navy Blue)"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                className="flex-1 text-sm"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (customColor && customColorName) {
                    addColor(customColorName, customColor);
                  }
                }}
                disabled={!customColor || !customColorName}
              >
                Add
              </Button>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowColorPicker(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Variants List */}
      {variants.length > 0 && (
        <div className="space-y-3">
          {variants.map(variant => (
            <div key={variant.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              {/* Color Header - Edit Mode */}
              {editingVariantId === variant.id ? (
                <div className="space-y-3 mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingColorCode}
                      onChange={(e) => setEditingColorCode(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      placeholder="Color name"
                      value={editingColor}
                      onChange={(e) => setEditingColor(e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => saveEditColor(variant.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save size={14} className="mr-1" />
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={cancelEditColor}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* Color Header - View Mode */
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: variant.colorCode }}
                    />
                    <span className="font-medium text-sm text-gray-900">{variant.color}</span>
                    <Badge variant="secondary" className="text-xs">
                      Total: {getTotalStock(variant)}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditColor(variant)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Edit color"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeColor(variant.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete color"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Size Stock Grid */}
              <div className="grid grid-cols-2 gap-2">
                {variant.sizes.map(sizeItem => (
                  <div key={sizeItem.size} className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-700 w-8">{sizeItem.size}</label>
                    <Input
                      type="number"
                      min="0"
                      value={sizeItem.stock}
                      onChange={(e) =>
                        updateStock(variant.id, sizeItem.size, parseInt(e.target.value) || 0)
                      }
                      className="h-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {variants.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>{variants.length}</strong> color(s) with <strong>{variants.reduce((sum, v) => sum + v.sizes.length, 0)}</strong> size options
          </p>
        </div>
      )}
    </div>
  );
};

export default ColorSizeManager;
