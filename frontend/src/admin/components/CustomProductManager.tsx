import React, { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CustomProductVariant {
  id: string;
  color: string;
  colorCode: string;
  sizes: {
    size: string;
    stock: number;
  }[];
}

interface CustomProductManagerProps {
  variant: CustomProductVariant | null;
  onVariantChange: (variant: CustomProductVariant | null) => void;
}

const PREDEFINED_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const CustomProductManager: React.FC<CustomProductManagerProps> = ({ 
  variant, 
  onVariantChange 
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('');
  const [customColorName, setCustomColorName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [editingColorCode, setEditingColorCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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

  const createVariant = (colorName: string, colorCode: string) => {
    const newVariant: CustomProductVariant = {
      id: `${Date.now()}-${Math.random()}`,
      color: colorName,
      colorCode,
      sizes: PREDEFINED_SIZES.map(size => ({ size, stock: 0 }))
    };
    onVariantChange(newVariant);
    setShowColorPicker(false);
    setCustomColor('');
    setCustomColorName('');
  };

  const updateStock = (size: string, stock: number) => {
    if (!variant) return;
    onVariantChange({
      ...variant,
      sizes: variant.sizes.map(s =>
        s.size === size ? { ...s, stock: Math.max(0, stock) } : s
      )
    });
  };

  const startEditColor = () => {
    if (!variant) return;
    setEditingColor(variant.color);
    setEditingColorCode(variant.colorCode);
    setIsEditing(true);
  };

  const saveEditColor = () => {
    if (!variant) return;
    onVariantChange({
      ...variant,
      color: editingColor,
      colorCode: editingColorCode
    });
    setIsEditing(false);
  };

  const cancelEditColor = () => {
    setIsEditing(false);
    setEditingColor('');
    setEditingColorCode('');
  };

  const getTotalStock = () => {
    if (!variant) return 0;
    return variant.sizes.reduce((sum, s) => sum + s.stock, 0);
  };

  const removeVariant = () => {
    onVariantChange(null);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Default Variant (Custom Product)</h3>
        <p className="text-xs text-gray-600 mb-4">Add a single color with multiple sizes and stock levels</p>
      </div>

      {/* Color Picker */}
      {!variant && !showColorPicker ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowColorPicker(true)}
          className="w-full"
        >
          <Plus size={16} className="mr-2" />
          Add Default Color
        </Button>
      ) : !variant && showColorPicker ? (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700">Select a color or add custom</p>

          {/* Predefined Colors */}
          <div className="grid grid-cols-5 gap-2">
            {PREDEFINED_COLORS.map(color => (
              <button
                key={color.code}
                type="button"
                onClick={() => createVariant(color.name, color.code)}
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
                    createVariant(customColorName, customColor);
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
      ) : null}

      {/* Variant Display */}
      {variant && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          {/* Color Header - Edit Mode */}
          {isEditing ? (
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
                  onClick={saveEditColor}
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
                  Total Stock: {getTotalStock()}
                </Badge>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startEditColor}
                  className="text-blue-600 hover:text-blue-700 p-1"
                  title="Edit color"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={removeVariant}
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
                    updateStock(sizeItem.size, parseInt(e.target.value) || 0)
                  }
                  className="h-8 text-sm"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>Custom Product:</strong> This product has a single default color with multiple size options
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomProductManager;
