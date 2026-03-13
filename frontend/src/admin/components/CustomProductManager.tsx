import React, { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface CustomProductManagerProps {
  variant: CustomProductVariant | null;
  onVariantChange: (variant: CustomProductVariant | null) => void;
}

const PREDEFINED_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const CustomProductManager: React.FC<CustomProductManagerProps> = ({ 
  variant, 
  onVariantChange 
}) => {
  const [showParameterForm, setShowParameterForm] = useState(false);
  const [paramName, setParamName] = useState('');
  const [paramValue, setParamValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingParamName, setEditingParamName] = useState('');
  const [editingParamValue, setEditingParamValue] = useState('');

  const createVariant = () => {
    const newVariant: CustomProductVariant = {
      id: `${Date.now()}-${Math.random()}`,
      parameters: [],
      sizes: PREDEFINED_SIZES.map(size => ({ size, stock: 0 }))
    };
    onVariantChange(newVariant);
  };

  const addParameter = () => {
    if (!variant || !paramName.trim() || !paramValue.trim()) return;
    
    onVariantChange({
      ...variant,
      parameters: [...variant.parameters, { name: paramName, value: paramValue }]
    });
    setParamName('');
    setParamValue('');
    setShowParameterForm(false);
  };

  const updateParameter = (index: number) => {
    if (!variant || !editingParamName.trim() || !editingParamValue.trim()) return;
    
    const updatedParams = [...variant.parameters];
    updatedParams[index] = { name: editingParamName, value: editingParamValue };
    
    onVariantChange({
      ...variant,
      parameters: updatedParams
    });
    setEditingIndex(null);
    setEditingParamName('');
    setEditingParamValue('');
  };

  const removeParameter = (index: number) => {
    if (!variant) return;
    onVariantChange({
      ...variant,
      parameters: variant.parameters.filter((_, i) => i !== index)
    });
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
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Custom Product Variant</h3>
        <p className="text-xs text-gray-600 mb-4">Add parameters and sizes with stock levels</p>
      </div>

      {/* Create Variant Button */}
      {!variant ? (
        <Button
          type="button"
          variant="outline"
          onClick={createVariant}
          className="w-full"
        >
          <Plus size={16} className="mr-2" />
          Create Variant
        </Button>
      ) : null}

      {/* Variant Display */}
      {variant && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          {/* Parameters Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Parameters</h4>
              <button
                type="button"
                onClick={() => removeVariant()}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete variant"
              >
                <X size={16} />
              </button>
            </div>

            {/* Parameters List */}
            {variant.parameters.length > 0 && (
              <div className="space-y-2 mb-3">
                {variant.parameters.map((param, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                    {editingIndex === idx ? (
                      <div className="flex gap-2 flex-1">
                        <Input
                          placeholder="Parameter name"
                          value={editingParamName}
                          onChange={(e) => setEditingParamName(e.target.value)}
                          className="h-8 text-sm flex-1"
                        />
                        <Input
                          placeholder="Value"
                          value={editingParamValue}
                          onChange={(e) => setEditingParamValue(e.target.value)}
                          className="h-8 text-sm flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => updateParameter(idx)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save size={14} />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingIndex(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{param.name}</p>
                          <p className="text-xs text-gray-600">{param.value}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIndex(idx);
                              setEditingParamName(param.name);
                              setEditingParamValue(param.value);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-1"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeParameter(idx)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Parameter Form */}
            {!showParameterForm ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowParameterForm(true)}
                className="w-full"
              >
                <Plus size={14} className="mr-2" />
                Add Parameter
              </Button>
            ) : (
              <div className="space-y-2 p-2 bg-white rounded border border-gray-200">
                <Input
                  placeholder="Parameter name (e.g., Material, Pattern)"
                  value={paramName}
                  onChange={(e) => setParamName(e.target.value)}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Value (e.g., Cotton, Striped)"
                  value={paramValue}
                  onChange={(e) => setParamValue(e.target.value)}
                  className="h-8 text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={addParameter}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowParameterForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sizes Section */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Sizes & Stock</h4>
              <Badge variant="secondary" className="text-xs">
                Total: {getTotalStock()}
              </Badge>
            </div>
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
          </div>

          {/* Info Box */}
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>Custom Product:</strong> Add parameters like material, pattern, etc. Stock is managed per size.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomProductManager;
