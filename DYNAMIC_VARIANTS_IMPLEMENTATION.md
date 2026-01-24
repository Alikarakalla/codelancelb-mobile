# Mobile App Updates for Dynamic Variant System

## Overview
Your backend APIs have been updated to support a fully dynamic variant system. This document outlines all the changes needed in your mobile app to take advantage of these new features.

---

## 🎯 Key Backend Changes You Need to Support

### 1. **Product Details API** (`GET /v1/products/{id}`)
**New Fields:**
- `product_options`: Structured list of all attributes (Color, Size, Material, Weight, etc.) with their values
  - Each color value includes a `hex` code for UI rendering
  - Example:
    ```json
    "product_options": [
      {
        "name": "Color",
        "values": [
          { "value": "Red", "hex": "#FF0000" },
          { "value": "Blue", "hex": "#0000FF" }
        ]
      },
      {
        "name": "Material",
        "values": ["Cotton", "Silk", "Polyester"]
      }
    ]
    ```

- `variant_matrix`: Lookup table for finding variants by their option combinations
  - Example:
    ```json
    "variant_matrix": {
      "Red|Large|Cotton": {
        "variant_id": 123,
        "price": 49.99,
        "stock": 10,
        "sku": "SHIRT-RED-L-COT"
      }
    }
    ```

**Backward Compatibility:**
- Legacy products (with only `color` and `size` columns) are automatically synthesized into the new format
- Your app won't crash on old products

### 2. **Cart Management API** (`POST /v1/cart`)
**New Behavior:**
- Now accepts `variant_id` instead of just product_id
- Automatically calculates correct price (checking variant overrides and product-level discounts)
- Creates separate cart rows for same product with different variants

### 3. **Checkout & Orders API** (`POST /v1/checkout`)
**New Behavior:**
- Generates descriptive labels like "Red - XL - Silk" for order items
- Deducts stock from specific variants
- Uses variant SKU when available

### 4. **Order History**
**New Behavior:**
- Both user and admin views show full dynamic option labels
- You can see exactly which "Material" or "Style" was purchased

---

## 📱 Required Mobile App Changes

### **Phase 1: Update Type Definitions**

#### File: `types/schema.ts`

**Current Issues:**
1. `ProductVariant` still uses hardcoded `color` and `size` fields
2. No support for `product_options` with hex codes
3. No `variant_matrix` type

**Required Changes:**

```typescript
// Add new interfaces for dynamic options
export interface ProductOptionValue {
    value: string;
    hex?: string; // For color options
}

export interface DynamicProductOption {
    name: string;
    values: (string | ProductOptionValue)[];
}

export interface VariantMatrixEntry {
    variant_id: number;
    price: number | null;
    stock: number;
    sku?: string | null;
}

// Update Product interface
export interface Product {
    // ... existing fields ...
    
    // NEW: Dynamic options from API
    product_options?: DynamicProductOption[];
    
    // NEW: Variant lookup matrix
    variant_matrix?: Record<string, VariantMatrixEntry>;
    
    // Keep existing for backward compatibility
    variants?: ProductVariant[];
    options?: ProductOption[];
}

// Update ProductVariant to support dynamic options
export interface ProductVariant {
    id: number;
    product_id: number;
    slug: string;
    
    // DEPRECATED but keep for backward compatibility
    color?: string | null;
    size?: string | null;
    
    // NEW: Dynamic option values (replaces color/size)
    option_values?: Record<string, any> | null;
    
    // ... rest of existing fields ...
}

// Update CartItem to use variant_id
export interface CartItem {
    id: number;
    user_id?: number | null;
    session_id?: string | null;
    product_id: number;
    
    // NEW: Use variant_id instead of variant_key
    variant_id?: number | null;
    
    // DEPRECATED: Keep for migration
    variant_key?: string | null;
    
    options?: any;
    qty: number;
    price: number;
    product?: Product;
}

// Update OrderItem to include option labels
export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    variant_id?: number | null; // NEW
    quantity: number;
    price: number;
    options?: any;
    option_label?: string; // NEW: "Red - XL - Silk"
    product?: Product;
}
```

---

### **Phase 2: Update API Client**

#### File: `services/apiClient.ts`

**Changes Needed:**

1. **Update `transformProduct` function** to handle new fields:

```typescript
function transformProduct(p: any): Product {
    const product = {
        ...p,
        price: p.price ? parseFloat(p.price) : null,
        compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
        cost_price: p.cost_price ? parseFloat(p.cost_price) : null,
        discount_amount: p.discount_amount ? parseFloat(p.discount_amount) : null,
        main_image: fixUrl(p.main_image),
        
        // Transform Relations
        variants: Array.isArray(p.variants) ? p.variants.map(transformVariant) : [],
        images: Array.isArray(p.images) ? p.images.map(transformImage) : [],
        brand: p.brand ? { ...p.brand, logo: fixUrl(p.brand.logo) } : p.brand,
        bundle_items: Array.isArray(p.bundle_items) ? p.bundle_items.map(transformProduct) : [],
        
        // NEW: Transform dynamic options
        product_options: p.product_options || [],
        variant_matrix: p.variant_matrix || {},
    };

    // Ensure options values are parsed
    if (Array.isArray(product.options)) {
        product.options = product.options.map((opt: any) => ({
            ...opt,
            values: Array.isArray(opt.values) ? opt.values : 
                   (typeof opt.values === 'string' ? JSON.parse(opt.values) : opt.values)
        }));
    }

    return product;
}
```

2. **Update `addToCart` to use `variant_id`**:

```typescript
async addToCart(sessionId: string, productId: number, qty: number, variantId?: number | null, options?: any) {
    const res = await fetchWithTimeout(`${BASE_URL}/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': sessionId
        },
        body: JSON.stringify({ 
            product_id: productId, 
            quantity: qty, 
            variant_id: variantId, // NEW
            options 
        })
    });
    return handleResponse(res);
}
```

---

### **Phase 3: Update Product Selector Component**

#### File: `components/product/ProductSelectors.tsx`

**Current Issues:**
- Hardcoded to only handle "Color" and "Size"
- Uses `variant.color` and `variant.size` which are deprecated
- Cannot handle "Material", "Weight", or other custom attributes

**Required Rewrite:**

```typescript
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { DynamicProductOption, ProductVariant, VariantMatrixEntry } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProductSelectorsProps {
    productOptions?: DynamicProductOption[];
    variantMatrix?: Record<string, VariantMatrixEntry>;
    onVariantChange?: (variantId: number | null, variantData: VariantMatrixEntry | null) => void;
}

export function ProductSelectors({ 
    productOptions = [], 
    variantMatrix = {}, 
    onVariantChange 
}: ProductSelectorsProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // State: Store selected value for each option
    const [selections, setSelections] = React.useState<Record<string, string>>({});

    // Pre-select first value for each option
    useEffect(() => {
        const initialSelections: Record<string, string> = {};
        productOptions.forEach(option => {
            if (option.values.length > 0) {
                const firstValue = option.values[0];
                initialSelections[option.name] = typeof firstValue === 'string' 
                    ? firstValue 
                    : firstValue.value;
            }
        });
        setSelections(initialSelections);
    }, [productOptions]);

    // Build variant matrix key from current selections
    const buildMatrixKey = (selections: Record<string, string>) => {
        return productOptions
            .map(opt => selections[opt.name] || '')
            .filter(Boolean)
            .join('|');
    };

    // Get available values for an option based on current selections
    const getAvailableValues = (optionName: string, optionValues: (string | { value: string; hex?: string })[]) => {
        // Create a temporary selection without this option
        const tempSelections = { ...selections };
        delete tempSelections[optionName];

        // Find all variants that match the other selections
        const availableSet = new Set<string>();

        Object.entries(variantMatrix).forEach(([key, entry]) => {
            if (entry.stock <= 0) return; // Skip out of stock

            const keyParts = key.split('|');
            const keyMap: Record<string, string> = {};
            
            productOptions.forEach((opt, idx) => {
                if (keyParts[idx]) {
                    keyMap[opt.name] = keyParts[idx];
                }
            });

            // Check if this variant matches our temp selections
            const matches = Object.entries(tempSelections).every(
                ([name, value]) => keyMap[name] === value
            );

            if (matches && keyMap[optionName]) {
                availableSet.add(keyMap[optionName]);
            }
        });

        return optionValues.filter(val => {
            const valueStr = typeof val === 'string' ? val : val.value;
            return availableSet.has(valueStr);
        });
    };

    // Notify parent when selections change
    useEffect(() => {
        const matrixKey = buildMatrixKey(selections);
        const variantData = variantMatrix[matrixKey];
        
        if (variantData) {
            onVariantChange?.(variantData.variant_id, variantData);
        } else {
            onVariantChange?.(null, null);
        }
    }, [selections, variantMatrix]);

    // Helper to get hex code for color
    const getColorHex = (value: string | { value: string; hex?: string }) => {
        if (typeof value === 'object' && value.hex) {
            return value.hex;
        }
        // Fallback colors
        const fallbackMap: Record<string, string> = {
            'Black': '#111827', 'White': '#ffffff', 'Red': '#ef4444',
            'Blue': '#3b82f6', 'Navy': '#1e3a8a', 'Beige': '#d6cbb6'
        };
        const valueStr = typeof value === 'string' ? value : value.value;
        return fallbackMap[valueStr] || '#ccc';
    };

    return (
        <View style={styles.container}>
            {productOptions.map((option) => {
                const isColorOption = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour';
                const availableValues = getAvailableValues(option.name, option.values);
                const selectedValue = selections[option.name];

                return (
                    <View key={option.name} style={styles.section}>
                        <Text style={[styles.heading, isDark && { color: '#fff' }]}>
                            Select {option.name}
                        </Text>

                        {isColorOption ? (
                            // Color Selector (Horizontal Pills with Color Dots)
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false} 
                                contentContainerStyle={styles.colorsRow}
                            >
                                {option.values.map((colorValue) => {
                                    const valueStr = typeof colorValue === 'string' ? colorValue : colorValue.value;
                                    const isSelected = selectedValue === valueStr;
                                    const isAvailable = availableValues.some(av => 
                                        (typeof av === 'string' ? av : av.value) === valueStr
                                    );
                                    const hex = getColorHex(colorValue);
                                    const isWhite = hex.toLowerCase() === '#ffffff';

                                    return (
                                        <Pressable
                                            key={valueStr}
                                            onPress={() => isAvailable && setSelections(prev => ({ 
                                                ...prev, 
                                                [option.name]: valueStr 
                                            }))}
                                            style={[
                                                styles.colorPill,
                                                isDark && { backgroundColor: '#111', borderColor: '#333' },
                                                isSelected && { borderColor: isDark ? '#fff' : hex, borderWidth: 1.5 },
                                                !isAvailable && { opacity: 0.4 }
                                            ]}
                                            disabled={!isAvailable}
                                        >
                                            <View style={[
                                                styles.innerDot,
                                                { backgroundColor: hex },
                                                (isWhite || isDark) && styles.dotBorder
                                            ]} />
                                            <Text style={[
                                                styles.colorName,
                                                isDark && { color: '#fff' },
                                                isSelected && styles.colorNameSelectedBold,
                                                !isAvailable && { textDecorationLine: 'line-through' }
                                            ]}>
                                                {valueStr}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        ) : (
                            // Generic Option Selector (Chips)
                            <View style={styles.sizesRow}>
                                {option.values.map((value) => {
                                    const valueStr = typeof value === 'string' ? value : value.value;
                                    const isSelected = selectedValue === valueStr;
                                    const isAvailable = availableValues.some(av => 
                                        (typeof av === 'string' ? av : av.value) === valueStr
                                    );

                                    return (
                                        <Pressable
                                            key={valueStr}
                                            onPress={() => isAvailable && setSelections(prev => ({ 
                                                ...prev, 
                                                [option.name]: valueStr 
                                            }))}
                                            style={[
                                                styles.sizeBox,
                                                { width: 'auto', paddingHorizontal: 12, minWidth: 64 },
                                                isDark && { backgroundColor: '#111', borderColor: '#333' },
                                                isSelected && styles.sizeBoxSelected,
                                                isSelected && isDark && { borderColor: '#fff' },
                                                !isAvailable && styles.sizeBoxDisabled,
                                                !isAvailable && isDark && { backgroundColor: '#222', borderColor: '#333' }
                                            ]}
                                            disabled={!isAvailable}
                                        >
                                            <Text style={[
                                                styles.sizeText,
                                                isDark && { color: '#94A3B8' },
                                                isSelected && styles.sizeTextSelected,
                                                isSelected && isDark && { color: '#fff' },
                                                !isAvailable && styles.sizeTextDisabled
                                            ]}>
                                                {valueStr}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}

                        {availableValues.length === 0 && (
                            <Text style={styles.outOfStockText}>
                                Out of stock for current selection
                            </Text>
                        )}
                    </View>
                );
            })}
        </View>
    );
}

// ... Keep existing styles ...
```

---

### **Phase 4: Update Cart Context**

#### File: `hooks/use-cart-context.tsx`

**Changes:**

```typescript
const addToCart = (product: Product, variant?: ProductVariant | null, quantity: number = 1, options?: any) => {
    setItems(prev => {
        // NEW: Use variant_id instead of variant_key
        const variantId = variant?.id || null;

        // Check if item already exists
        const existingIndex = product.type === 'bundle' ? -1 : prev.findIndex(item =>
            item.product_id === product.id &&
            item.variant_id === variantId // Changed from variant_key
        );

        if (existingIndex >= 0) {
            // Update quantity
            const newItems = [...prev];
            newItems[existingIndex].qty += quantity;
            return newItems;
        } else {
            // Add new item
            const newItem: CartItem = {
                id: Date.now(),
                product_id: product.id,
                variant_id: variantId, // NEW
                variant_key: variant?.slug || null, // Keep for backward compatibility
                options: options || (variant ? { ...variant.option_values } : null),
                qty: quantity,
                price: variant ? (variant.price || product.price || 0) : (product.price || 0),
                product: product
            };
            return [...prev, newItem];
        }
    });
    console.log(`Added to cart: ${product.name} (Variant ID: ${variant?.id || 'None'}) x${quantity}`);
};
```

---

### **Phase 5: Update Product Detail Screen**

#### File: `app/product/[id].tsx`

**Changes:**

```typescript
// Update state to store variant data from matrix
const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
const [selectedVariantData, setSelectedVariantData] = useState<VariantMatrixEntry | null>(null);

// Update the variant change handler
const handleVariantChange = (variantId: number | null, variantData: VariantMatrixEntry | null) => {
    setSelectedVariantData(variantData);
    
    // Find the full variant object if needed
    if (variantId && product?.variants) {
        const fullVariant = product.variants.find(v => v.id === variantId);
        setSelectedVariant(fullVariant || null);
    } else {
        setSelectedVariant(null);
    }
};

// Update ProductSelectors usage
<ProductSelectors
    productOptions={product.product_options}
    variantMatrix={product.variant_matrix}
    onVariantChange={handleVariantChange}
/>

// Update price display to use variant data
const displayPrice = selectedVariantData?.price || product.price || 0;
const stockQuantity = selectedVariantData?.stock || product.stock_quantity || 0;
```

---

## 🧪 Testing Checklist

### Test Case 1: Legacy Product (Color + Size only)
- [ ] Product displays correctly
- [ ] Can select color and size
- [ ] Stock availability works
- [ ] Add to cart works
- [ ] Checkout works

### Test Case 2: New Product with Material
- [ ] Product displays Color, Size, and Material selectors
- [ ] Material selector shows available options
- [ ] Selecting "Silk" updates available sizes
- [ ] Price updates based on variant
- [ ] Add to cart includes variant_id

### Test Case 3: Custom Attributes
- [ ] Product with "Weight" attribute displays correctly
- [ ] Can select weight options
- [ ] Stock deduction works for specific variant

### Test Case 4: Order History
- [ ] Past orders show "Red - XL - Silk" labels
- [ ] Order details display all selected options

---

## 🚀 Migration Strategy

### Step 1: Update Types (Safe)
- Update `types/schema.ts` with new interfaces
- Keep old fields for backward compatibility

### Step 2: Update API Client (Safe)
- Add support for new fields
- Keep old endpoints working

### Step 3: Update ProductSelectors (Breaking)
- **This is the main change**
- Test thoroughly with both old and new products

### Step 4: Update Cart & Checkout (Safe)
- Use `variant_id` instead of `variant_key`
- Backend handles both for now

### Step 5: Test Everything
- Test with legacy products
- Test with new dynamic products
- Test checkout flow
- Test order history

---

## 📝 Notes

1. **Backward Compatibility**: The API automatically synthesizes old products into the new format, so your app won't crash
2. **Future-Proof**: Any new attribute added in the admin panel will automatically work in your app
3. **Performance**: The `variant_matrix` allows instant lookups without complex filtering
4. **Stock Management**: Stock is now tracked per specific variant combination

---

## 🆘 Support

If you encounter issues:
1. Check that your API is returning `product_options` and `variant_matrix`
2. Verify that `variant_id` is being sent to cart/checkout endpoints
3. Ensure color hex codes are included in `product_options`
4. Test with a simple 2-option product first (Color + Size)
