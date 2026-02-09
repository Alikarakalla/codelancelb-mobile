import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, ProductVariant, CartItem } from '@/types/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCartItemPricing } from '@/utils/cartPricing';

const CART_STORAGE_KEY = 'shopping_cart';

// Mock initial data or empty
const INITIAL_CART: CartItem[] = [];

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, variant?: ProductVariant | null, quantity?: number, options?: any) => void;
    removeFromCart: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    updateItemPrice: (itemId: number, unitPrice: number) => void;
    recalculateCartPrices: () => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load
    useEffect(() => {
        const loadCart = async () => {
            try {
                const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (savedCart) {
                    setItems(JSON.parse(savedCart));
                }
            } catch (e) {
                console.warn('Failed to load cart from storage:', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadCart();
    }, []);

    // Save on Change
    useEffect(() => {
        if (isLoaded) {
            AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
                .catch(e => console.warn('Failed to save cart:', e));
        }
    }, [items, isLoaded]);

    // Calculate derived state
    const cartCount = items.reduce((sum, item) => sum + item.qty, 0);
    const cartTotal = items.reduce((sum, item) => {
        const pricing = getCartItemPricing(item);
        return sum + (pricing.unitPrice * item.qty);
    }, 0);

    const addToCart = (product: Product, variant?: ProductVariant | null, quantity: number = 1, options?: any) => {
        setItems(prev => {
            // NEW: Use variant_id from the selected variant
            const variantId = variant?.id || null;

            // Unique key logic: ProductID + VariantID (if exists)
            // For Bundle, we might need a unique key based on selections if we want to allow multiple bundles with different options.
            const variantKey = variant ? variant?.slug : (product.type === 'bundle' ? 'bundle-' + Date.now() : null);
            const computedUnitPrice = getCartItemPricing({
                id: Date.now(),
                product_id: product.id,
                variant_id: variantId,
                variant_key: variantKey || null,
                options: options || (variant ? { ...variant.option_values } : null),
                qty: quantity,
                price: variant ? (variant.price || product.price || 0) : (product.price || 0),
                product
            }).unitPrice;

            // Check if item already exists (Skip for bundles to allow multiple configs)
            const existingIndex = product.type === 'bundle' ? -1 : prev.findIndex(item =>
                item.product_id === product.id &&
                item.variant_id === variantId
            );

            if (existingIndex >= 0) {
                // Update quantity
                const newItems = [...prev];
                newItems[existingIndex].qty += quantity;
                newItems[existingIndex].price = computedUnitPrice;
                return newItems;
            } else {
                // Add new item
                const newItem: CartItem = {
                    id: Date.now(), // Mock ID for local storage
                    product_id: product.id,
                    variant_id: variantId, // NEW
                    variant_key: variantKey || null, // Keep for backward compatibility
                    options: options || (variant ? { ...variant.option_values } : null),
                    qty: quantity,
                    price: computedUnitPrice,
                    product: product // Store full product for UI display
                };
                return [...prev, newItem];
            }
        });
        console.log(`Added to cart: ${product.name} (Variant ID: ${variant?.id || 'None'}) x${quantity}`);
    };

    const removeFromCart = (itemId: number) => {
        setItems(prev => prev.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, qty: quantity } : item
        ));
    };

    const updateItemPrice = useCallback((itemId: number, unitPrice: number) => {
        const normalizedPrice = Math.round(Math.max(unitPrice, 0) * 100) / 100;
        setItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, price: normalizedPrice } : item
        ));
    }, []);

    const recalculateCartPrices = useCallback(() => {
        setItems(prev => {
            let changed = false;
            const next = prev.map(item => {
                const recalculated = getCartItemPricing(item).unitPrice;
                if (Math.abs((item.price || 0) - recalculated) > 0.009) {
                    changed = true;
                    return { ...item, price: recalculated };
                }
                return item;
            });
            return changed ? next : prev;
        });
    }, []);

    const clearCart = () => {
        setItems([]);
    };

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            updateItemPrice,
            recalculateCartPrices,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
