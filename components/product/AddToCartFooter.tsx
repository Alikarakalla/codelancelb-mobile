import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useWishlistAnimation } from '@/components/wishlist/WishlistAnimationProvider';
import { useCartAnimation } from '@/components/cart/CartAnimationProvider';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AddToCartFooterProps {
    onAddToCart: () => void;
    onToggleWishlist?: () => void;
    isWishlisted?: boolean;
    disabled?: boolean;
    price?: number;
    originalPrice?: number;
}

export function AddToCartFooter({ onAddToCart, onToggleWishlist, isWishlisted, disabled, price, originalPrice }: AddToCartFooterProps) {
    const [quantity, setQuantity] = React.useState(1);
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { triggerAnimation } = useWishlistAnimation();
    const { triggerCartAnimation } = useCartAnimation();
    const favButtonRef = React.useRef<View>(null);
    const cartButtonRef = React.useRef<View>(null);

    const increment = () => setQuantity(prev => prev + 1);
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    return (
        <View style={[styles.outerContainer, isDark && { backgroundColor: '#111' }]}>
            <View style={styles.container}>
                {/* Quantity Selector */}
                <View style={[styles.quantityBox, isDark && { backgroundColor: '#000', borderColor: '#333' }]}>
                    <Pressable onPress={decrement} style={styles.qtyBtn}>
                        <Ionicons name="remove" size={16} color={isDark ? "#fff" : "#1F2937"} />
                    </Pressable>
                    <Text style={[styles.qtyText, isDark && { color: '#fff' }]}>{quantity}</Text>
                    <Pressable onPress={increment} style={styles.qtyBtn}>
                        <Ionicons name="add" size={16} color={isDark ? "#fff" : "#1F2937"} />
                    </Pressable>
                </View>

                {/* Optional Price Display (if layout allows, else keeping strictly buttons)
                   User requested "handle discount price in product page", usually Top Info handles this.
                   But if footer is sticky, showing price here helps. 
                   Checking layout: It's a row. Adding text might crowd it.
                   ProductInfo already shows price.
                   I will keep the interface update to fix the TS error, and maybe just use price for logic if needed later.
                   But wait, user said "handle the discount price in product page".
                   The calculation in [id].tsx already updates <ProductInfo />.
                   So visually it is handled there.
                   I am just fixing the TS error here by adding the prop to the interface (DONE).
                   I won't clutter the footer unless asked specifically.
                   Actually, let's pass originalPrice to destructured props to be clean.
                */}

                {/* Add to Cart Button */}
                <Pressable
                    onPress={() => {
                        if (disabled) return;
                        if (cartButtonRef.current) {
                            requestAnimationFrame(() => {
                                cartButtonRef.current?.measure((x, y, w, h, px, py) => {
                                    triggerCartAnimation(
                                        { x: px + w / 2, y: py + h / 2 },
                                        () => onAddToCart?.()
                                    );
                                });
                            });
                        } else {
                            onAddToCart?.();
                        }
                    }}
                    disabled={disabled}
                    style={({ pressed }) => [
                        styles.cartButton,
                        isDark && { backgroundColor: '#fff' },
                        pressed && !disabled && styles.pressedOpacity,
                        disabled && styles.disabledButton,
                        disabled && isDark && { backgroundColor: '#333' }
                    ]}
                    ref={cartButtonRef}
                >
                    <Text style={[
                        styles.cartText,
                        isDark && { color: '#000' },
                        disabled && styles.disabledText,
                        disabled && isDark && { color: '#666' }
                    ]}>
                        {disabled ? 'OUT OF STOCK' : 'ADD TO CART'}
                    </Text>
                </Pressable>



                {/* Compare Button */}
                <Pressable style={({ pressed }) => [
                    styles.iconBtn,
                    isDark && { backgroundColor: '#000', borderColor: '#333' },
                    pressed && styles.pressed,
                    pressed && isDark && { backgroundColor: '#222' }
                ]}>
                    <Ionicons name="swap-horizontal" size={20} color={isDark ? "#fff" : "#1F2937"} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: '#fff',
        paddingBottom: 20,
        paddingVertical: 12,
        paddingTop: 30,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 8,
        height: 48,
    },
    quantityBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
        height: '100%',
        backgroundColor: '#fff',
    },
    qtyBtn: {
        width: 32,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        width: 30,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    cartButton: {
        flex: 2,
        height: '100%',
        backgroundColor: '#1F2937',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressedOpacity: {
        opacity: 0.8,
    },
    disabledButton: {
        backgroundColor: '#F3F4F6',
    },
    cartText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 1,
    },
    disabledText: {
        color: '#9CA3AF',
    },
    iconBtn: {
        width: 48,
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    pressed: {
        backgroundColor: '#F9FAFB',
    },
});
