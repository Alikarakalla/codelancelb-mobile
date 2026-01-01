import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/schema';
import { api } from '@/services/apiClient';

// Simply storing full product objects for now, ideally persist IDs
interface WishlistContextType {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        if (loading) return;
        setLoading(true);
        try {
            // TODO: Get sessionId or Auth token
            // const items = await api.getWishlist(sessionId, token);
            // setWishlist(items.map(item => item.product).filter(Boolean) as Product[]);
        } catch (error) {
            console.error('Failed to load wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (product: Product) => {
        // Optimistic update
        const isIn = wishlist.some(p => p.id === product.id);

        setWishlist(prev => {
            if (isIn) {
                return prev.filter(p => p.id !== product.id);
            } else {
                return [...prev, product];
            }
        });

        try {
            // console.log('Toggling wishlist for:', product.id);
            // await api.toggleWishlist(product.id, sessionId, token);
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
            // Revert on error
            setWishlist(prev => {
                if (isIn) {
                    return [...prev, product];
                } else {
                    return prev.filter(p => p.id !== product.id);
                }
            });
        }
    };

    const addToWishlist = (product: Product) => toggleWishlist(product);
    const removeFromWishlist = (productId: number) => {
        const product = wishlist.find(p => p.id === productId);
        if (product) toggleWishlist(product);
    };

    const isInWishlist = (productId: number) => {
        return wishlist.some(p => p.id === productId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
