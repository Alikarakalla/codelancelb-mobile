# Quick Reference: Dynamic Variants Migration

## 🎯 What Changed in Your Backend

Your backend APIs now support **any custom attribute** (Material, Weight, Style, etc.), not just Color and Size.

### Key API Changes

| Endpoint | Old Behavior | New Behavior |
|----------|-------------|--------------|
| `GET /products/{id}` | Returns `variants` array with `color` and `size` | Returns `product_options` + `variant_matrix` for dynamic attributes |
| `POST /cart` | Accepts `product_id` + `options` | Now accepts `variant_id` for precise tracking |
| `POST /checkout` | Generic option storage | Generates descriptive labels like "Red - XL - Silk" |
| `GET /orders` | Basic order items | Shows full dynamic option labels |

---

## 📱 What You Need to Update in Mobile App

### 1. Type Definitions (`types/schema.ts`)

**Add these new interfaces:**

```typescript
export interface ProductOptionValue {
    value: string;
    hex?: string; // For colors
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
```

**Update Product interface:**

```typescript
export interface Product {
    // ... existing fields ...
    product_options?: DynamicProductOption[];  // NEW
    variant_matrix?: Record<string, VariantMatrixEntry>;  // NEW
}
```

**Update CartItem interface:**

```typescript
export interface CartItem {
    // ... existing fields ...
    variant_id?: number | null;  // NEW - replaces variant_key
}
```

---

### 2. Product Selectors Component

**Old Approach (Hardcoded):**
```typescript
// ❌ Only works for Color and Size
const colorOption = options.find(o => o.name === 'color');
const sizeOption = options.find(o => o.name === 'size');
```

**New Approach (Dynamic):**
```typescript
// ✅ Works for ANY attribute
{productOptions.map((option) => {
    const isColorOption = option.name.toLowerCase() === 'color';
    
    return (
        <View key={option.name}>
            <Text>Select {option.name}</Text>
            {isColorOption ? (
                <ColorSelector values={option.values} />
            ) : (
                <ChipSelector values={option.values} />
            )}
        </View>
    );
})}
```

---

### 3. Variant Selection Logic

**Old Approach (Manual Matching):**
```typescript
// ❌ Only works for 2 attributes
const variant = variants.find(v => 
    v.color === selectedColor && v.size === selectedSize
);
```

**New Approach (Matrix Lookup):**
```typescript
// ✅ Works for ANY number of attributes
const matrixKey = `${selectedColor}|${selectedSize}|${selectedMaterial}`;
const variantData = variantMatrix[matrixKey];
// Returns: { variant_id: 123, price: 49.99, stock: 10 }
```

---

### 4. Add to Cart

**Old Approach:**
```typescript
// ❌ Uses variant slug/key
addToCart(product, variant, quantity);
// Stores: variant_key: "red-large"
```

**New Approach:**
```typescript
// ✅ Uses variant ID
addToCart(product, variant, quantity);
// Stores: variant_id: 123
```

---

## 🔄 Migration Steps (In Order)

### Step 1: Update Types ✅ Safe
```bash
# Edit: types/schema.ts
# Add: ProductOptionValue, DynamicProductOption, VariantMatrixEntry
# Update: Product, CartItem, OrderItem interfaces
```

### Step 2: Update API Client ✅ Safe
```bash
# Edit: services/apiClient.ts
# Update: transformProduct() to include product_options and variant_matrix
# Update: addToCart() to accept variant_id
```

### Step 3: Rewrite ProductSelectors ⚠️ Breaking Change
```bash
# Edit: components/product/ProductSelectors.tsx
# Replace: Hardcoded color/size logic
# With: Dynamic option rendering
```

### Step 4: Update Cart Context ✅ Safe
```bash
# Edit: hooks/use-cart-context.tsx
# Change: variant_key → variant_id
```

### Step 5: Update Product Screen ✅ Safe
```bash
# Edit: app/product/[id].tsx
# Pass: product_options and variant_matrix to ProductSelectors
# Handle: variant_id in state
```

---

## 🧪 Testing Checklist

- [ ] **Legacy Product Test**: Product with only Color + Size still works
- [ ] **New Product Test**: Product with Color + Size + Material displays correctly
- [ ] **Stock Test**: Selecting "Silk" shows only available sizes
- [ ] **Price Test**: Price updates when selecting different material
- [ ] **Cart Test**: Adding to cart stores correct variant_id
- [ ] **Checkout Test**: Order shows "Red - L - Silk" label
- [ ] **Order History Test**: Past orders display full option labels

---

## 🎨 UI Examples

### Color Option (with hex codes)
```json
{
  "name": "Color",
  "values": [
    { "value": "Red", "hex": "#FF0000" },
    { "value": "Blue", "hex": "#0000FF" }
  ]
}
```
**Renders as:** Horizontal pills with colored dots

### Size Option (simple strings)
```json
{
  "name": "Size",
  "values": ["S", "M", "L", "XL"]
}
```
**Renders as:** Chip buttons in a grid

### Material Option (simple strings)
```json
{
  "name": "Material",
  "values": ["Cotton", "Silk", "Polyester"]
}
```
**Renders as:** Chip buttons in a grid

---

## 🚨 Common Pitfalls

### ❌ Don't Do This:
```typescript
// Hardcoding option names
const color = variant.color;
const size = variant.size;
```

### ✅ Do This Instead:
```typescript
// Use dynamic option_values
const optionValues = variant.option_values;
// { "Color": "Red", "Size": "L", "Material": "Silk" }
```

---

## 📊 Data Flow Summary

```
1. User selects: Color=Red, Size=L, Material=Silk
                 ↓
2. Build matrix key: "Red|L|Silk"
                 ↓
3. Lookup in variant_matrix: { variant_id: 123, price: 49.99, stock: 10 }
                 ↓
4. Add to cart with variant_id: 123
                 ↓
5. Backend calculates price and creates order
                 ↓
6. Order shows label: "Red - L - Silk"
```

---

## 🆘 Need Help?

**If ProductSelectors shows blank:**
- Check if `product_options` is populated in API response
- Verify `variant_matrix` has entries
- Console.log the product object to inspect data

**If stock availability is wrong:**
- Verify `variant_matrix` entries have correct stock values
- Check if matrix keys match exactly (case-sensitive)

**If add to cart fails:**
- Ensure `variant_id` is being passed correctly
- Check backend logs for validation errors
- Verify cart API accepts `variant_id` parameter

---

## 📝 Example API Response

```json
{
  "id": 1,
  "name": "Premium T-Shirt",
  "price": 29.99,
  "product_options": [
    {
      "name": "Color",
      "values": [
        { "value": "Red", "hex": "#FF0000" },
        { "value": "Blue", "hex": "#0000FF" }
      ]
    },
    {
      "name": "Size",
      "values": ["S", "M", "L", "XL"]
    },
    {
      "name": "Material",
      "values": ["Cotton", "Silk"]
    }
  ],
  "variant_matrix": {
    "Red|L|Cotton": {
      "variant_id": 123,
      "price": 29.99,
      "stock": 10,
      "sku": "TSHIRT-RED-L-COT"
    },
    "Red|L|Silk": {
      "variant_id": 124,
      "price": 49.99,
      "stock": 5,
      "sku": "TSHIRT-RED-L-SILK"
    }
  }
}
```

---

**Ready to start? Begin with Step 1: Update Types** ✨
