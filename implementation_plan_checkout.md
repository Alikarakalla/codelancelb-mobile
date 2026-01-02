# Implementation Plan - Checkout Refinements

## Objective
Refine the checkout experience by integrating real cart data and discount code functionality.

## Changes Implemented

### 1. Schema Updates (`types/schema.ts`)
- Added `Coupon` interface to define the structure of discount codes, matching the database schema (id, code, type, value, etc.).

### 2. API Services (`services/apiClient.ts`)
- Added `validateCoupon` method to the `api` object.
- Implemented mock validation logic for development:
  - Code `rrTest`: Free Shipping
  - Code `TEST20`: 20% Off
- Fallback to real API endpoint `/coupons/validate` in production.

### 3. Checkout Screen (`app/(tabs)/checkout.tsx`)
- **Real Cart Data Integration**:
  - Imported `useCart` hook.
  - Replaced hardcoded `cartItems` and `subtotal` with `items` and `cartTotal` from the context.
  - Dynamic rendering of cart items in the "Order Summary" section, including variant details (color/size).
- **Discount Code Functionality**:
  - Added state for `discountCode`, `appliedCoupon`, and `isValidatingCoupon`.
  - Created `handleApplyCoupon` to validate codes using `apiClient`.
  - Implemented logic to calculate `discountAmount` based on coupon type (percentage, fixed, free shipping).
  - Updated `total` calculation to strictly follow: `Subtotal - Discount + Shipping + Tax`.
  - Added UI for the discount input field, "Apply" button, and a "Chip" to show/remove the applied coupon.
- **UI Enhancements**:
  - Maintained dark mode compatibility for new elements (input fields, buttons, text).
  - Added loading state for the apply button.

## Verification Steps
1. Add items to the cart.
2. Navigate to Checkout.
3. Open "Show order summary" to verify items match the cart.
4. Enter code `rrTest` -> Verify "Success" alert and Shipping becomes "Free".
5. Enter code `TEST20` -> Verify "Success" alert and 20% discount is applied to subtotal.
6. Verify Total calculation updates correctly.
