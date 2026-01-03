import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/schema';
import { api } from '@/services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_STORAGE_KEY = 'user_wishlist';

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
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load
    useEffect(() => {
        const loadInitialWishlist = async () => {
            try {
                const savedWishlist = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
                if (savedWishlist) {
                    setWishlist(JSON.parse(savedWishlist));
                }
            } catch (e) {
                console.warn('Failed to load wishlist:', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadInitialWishlist();
    }, []);

    // Save on Change
    useEffect(() => {
        if (isLoaded) {
            AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
                .catch(e => console.warn('Failed to save wishlist:', e));
        }
    }, [wishlist, isLoaded]);

    // Removal of legacy loadWishlist function as it's now handled by the persistent useEffect above.

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
