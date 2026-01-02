import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useWishlistAnimation } from '@/components/wishlist/WishlistAnimationProvider';
import { useCartAnimation } from '@/components/cart/CartAnimationProvider';

interface AddToCartFooterProps {
    onAddToCart: () => void;
    onToggleWishlist?: () => void;
    isWishlisted?: boolean;
    disabled?: boolean;
    price?: number;
}

export function AddToCartFooter({ onAddToCart, onToggleWishlist, isWishlisted, disabled, price }: AddToCartFooterProps) {
    const [quantity, setQuantity] = React.useState(1);
    const insets = useSafeAreaInsets();
    const { triggerAnimation } = useWishlistAnimation();
    const { triggerCartAnimation } = useCartAnimation();
    const favButtonRef = React.useRef<View>(null);
    const cartButtonRef = React.useRef<View>(null);

    const increment = () => setQuantity(prev => prev + 1);
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    return (
        <View style={styles.outerContainer}>
            <View style={styles.container}>
                {/* Quantity Selector */}
                <View style={styles.quantityBox}>
                    <Pressable onPress={decrement} style={styles.qtyBtn}>
                        <Ionicons name="remove" size={16} color="#1F2937" />
                    </Pressable>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <Pressable onPress={increment} style={styles.qtyBtn}>
                        <Ionicons name="add" size={16} color="#1F2937" />
                    </Pressable>
                </View>

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
                        pressed && !disabled && styles.pressedOpacity,
                        disabled && styles.disabledButton
                    ]}
                    ref={cartButtonRef}
                >
                    <Text style={[styles.cartText, disabled && styles.disabledText]}>
                        {disabled ? 'OUT OF STOCK' : 'ADD TO CART'}
                    </Text>
                </Pressable>

                {/* Wishlist Button */}
                <Pressable
                    onPress={() => {
                        if (isWishlisted) {
                            onToggleWishlist?.();
                        } else if (favButtonRef.current) {
                            requestAnimationFrame(() => {
                                favButtonRef.current?.measure((x, y, w, h, px, py) => {
                                    triggerAnimation(
                                        { x: px + w / 2, y: py + h / 2 },
                                        () => onToggleWishlist?.()
                                    );
                                });
                            });
                        } else {
                            onToggleWishlist?.();
                        }
                    }}
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                    ref={favButtonRef}
                >
                    <Ionicons
                        name={isWishlisted ? "heart" : "heart-outline"}
                        size={20}
                        color={isWishlisted ? "#ef4444" : "#1F2937"}
                    />
                </Pressable>

                {/* Compare Button */}
                <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
                    <Ionicons name="swap-horizontal" size={20} color="#1F2937" />
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
