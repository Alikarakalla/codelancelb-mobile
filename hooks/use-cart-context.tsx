import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem } from '@/types/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = 'shopping_cart';

// Mock initial data or empty
const INITIAL_CART: CartItem[] = [];

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, variant?: ProductVariant | null, quantity?: number, options?: any) => void;
    removeFromCart: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
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
    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const addToCart = (product: Product, variant?: ProductVariant | null, quantity: number = 1, options?: any) => {
        setItems(prev => {
            // Unique key logic: ProductID + VariantSlug (if exists)
            // For Bundle, we might need a unique key based on selections if we want to allow multiple bundles with different options.
            // For now, let's keep it simple.
            const variantKey = variant ? variant?.slug : (product.type === 'bundle' ? 'bundle-' + Date.now() : null);

            // Check if item already exists (Skip for bundles to allow multiple configs, or implement deep compare of options)
            const existingIndex = product.type === 'bundle' ? -1 : prev.findIndex(item =>
                item.product_id === product.id &&
                item.variant_key === variantKey
            );

            if (existingIndex >= 0) {
                // Update quantity
                const newItems = [...prev];
                newItems[existingIndex].qty += quantity;
                return newItems;
            } else {
                // Add new item
                const newItem: CartItem = {
                    id: Date.now(), // Mock ID
                    product_id: product.id,
                    variant_key: variantKey || null,
                    options: options || (variant ? { ...variant.option_values } : null),
                    qty: quantity,
                    price: variant ? (variant.price || product.price || 0) : (product.price || 0),
                    product: product // Store full product for UI display
                };
                return [...prev, newItem];
            }
        });
        console.log(`Added to cart: ${product.name} (Variant: ${variant?.slug || 'None'}) x${quantity}`);
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

    const clearCart = () => {
        setItems([]);
    };

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
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
