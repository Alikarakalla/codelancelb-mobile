import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button as NativeLiquidButton, Host as NativeSwiftUIHost } from '@expo/ui/swift-ui';

import { useCartAnimation } from '@/components/cart/CartAnimationProvider';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AddToCartFooterProps {
    onAddToCart: () => void;
    onToggleWishlist?: () => void;
    onNotifyMe?: () => void;
    isJoinedWaitlist?: boolean;
    isWishlisted?: boolean;
    disabled?: boolean;
    price?: number;
    originalPrice?: number;
}

export function AddToCartFooter({
    onAddToCart,
    onToggleWishlist,
    onNotifyMe,
    isJoinedWaitlist,
    isWishlisted,
    disabled,
    price,
    originalPrice
}: AddToCartFooterProps) {
    const [quantity, setQuantity] = React.useState(1);
    const [nativeCtaWidth, setNativeCtaWidth] = React.useState<number | undefined>(undefined);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { triggerCartAnimation } = useCartAnimation();

    const cartButtonRef = React.useRef<View>(null);

    const increment = () => setQuantity(prev => prev + 1);
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const ctaText = disabled
        ? (isJoinedWaitlist ? 'JOINED WAITING LIST' : 'NOTIFY ME WHEN AVAILABLE')
        : 'ADD TO CART';

    const iosMajorVersion = Platform.OS === 'ios'
        ? Number(String(Platform.Version).split('.')[0] || 0)
        : 0;

    const useNativeLiquidGlassCta =
        Platform.OS === 'ios' &&
        iosMajorVersion >= 26 &&
        !disabled;

    const handlePrimaryCtaPress = () => {
        if (disabled) {
            if (!isJoinedWaitlist) onNotifyMe?.();
            return;
        }

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
    };

    const handleNativeCtaLayout = React.useCallback((event: LayoutChangeEvent) => {
        const measuredWidth = Math.round(event.nativeEvent.layout.width);
        setNativeCtaWidth((prev) => (prev === measuredWidth ? prev : measuredWidth));
    }, []);

    return (
        <View style={[styles.outerContainer, isDark && { backgroundColor: '#111' }]}>
            <View style={styles.container}>
                {/* Quantity Selector - Hidden if Out of Stock */}
                {!disabled && (
                    <View style={[styles.quantityBox, isDark && { backgroundColor: '#000', borderColor: '#333' }]}>
                        <Pressable onPress={decrement} style={styles.qtyBtn}>
                            <Ionicons name="remove" size={16} color={isDark ? "#fff" : "#1F2937"} />
                        </Pressable>
                        <Text style={[styles.qtyText, isDark && { color: '#fff' }]}>{quantity}</Text>
                        <Pressable onPress={increment} style={styles.qtyBtn}>
                            <Ionicons name="add" size={16} color={isDark ? "#fff" : "#1F2937"} />
                        </Pressable>
                    </View>
                )}

                {/* Add to Cart / Notify Me Button */}
                {useNativeLiquidGlassCta ? (
                    <View style={styles.nativeGlassButtonWrap} ref={cartButtonRef} onLayout={handleNativeCtaLayout}>
                        <NativeSwiftUIHost style={styles.nativeGlassHost} useViewportSizeMeasurement>
                            <NativeLiquidButton
                                onPress={handlePrimaryCtaPress}
                                variant="glassProminent"
                                color="#000000"
                                controlSize="large"
                                frame={{ width: nativeCtaWidth, minHeight: 48, maxHeight: 48 }}
                            >
                                {ctaText}
                            </NativeLiquidButton>
                        </NativeSwiftUIHost>
                    </View>
                ) : (
                    <Pressable
                        onPress={handlePrimaryCtaPress}
                        disabled={disabled && isJoinedWaitlist}
                        style={({ pressed }) => [
                            styles.cartButton,
                            isDark && { backgroundColor: '#fff' },
                            pressed && (!disabled || !isJoinedWaitlist) && styles.pressedOpacity,
                            disabled && !isJoinedWaitlist && styles.notifyButton,
                            disabled && isJoinedWaitlist && styles.disabledButton,
                            disabled && isJoinedWaitlist && isDark && { backgroundColor: '#333' }
                        ]}
                        ref={cartButtonRef}
                    >
                        <Text style={[
                            styles.cartText,
                            isDark && { color: '#000' },
                            disabled && isJoinedWaitlist && styles.disabledText,
                            disabled && isJoinedWaitlist && isDark && { color: '#666' },
                            disabled && !isJoinedWaitlist && styles.notifyText
                        ]}>
                            {ctaText}
                        </Text>
                    </Pressable>
                )}
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
    nativeGlassButtonWrap: {
        flex: 2,
        height: '100%',
        overflow: 'visible',
        justifyContent: 'center',
    },
    nativeGlassHost: {
        flex: 1,
        width: '100%',
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
    notifyButton: {
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#000',
    },
    notifyText: {
        color: '#fff',
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
