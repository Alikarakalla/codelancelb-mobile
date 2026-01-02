import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/hooks/use-cart-context';
import { useDrawer } from '@/hooks/use-drawer-context';
import { useCartAnimation } from '@/components/cart/CartAnimationProvider';
import { Share08Icon, FavouriteIcon, ShoppingBag01Icon, SearchCustomIcon } from '@/components/ui/icons';
import { HugeiconsIcon } from '@hugeicons/react-native';

interface GlobalHeaderProps {
    title?: string;
    showBack?: boolean;
    showShare?: boolean;
    showWishlist?: boolean;
    showCart?: boolean;
    isWishlisted?: boolean;
    onWishlistPress?: () => void;
    alwaysShowTitle?: boolean;
}

export function GlobalHeader({
    title = 'LUXE',
    showBack,
    showShare,
    showWishlist,
    showCart,
    isWishlisted,
    onWishlistPress,
    alwaysShowTitle
}: GlobalHeaderProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { cartCount } = useCart();
    const { openDrawer } = useDrawer();
    const { setCartTargetPoint } = useCartAnimation();
    const cartIconRef = React.useRef<View>(null);

    const isDark = colorScheme === 'dark';
    const textColor = isDark ? '#fff' : '#18181B';
    const bgColor = isDark ? '#000' : '#fff';

    // If back button is enabled, we assume a "Product/Detail" header style
    const isDetailMode = showBack;

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: bgColor }]}>
            <View style={styles.content}>
                {/* Left Section */}
                <View style={styles.leftSection}>
                    {showBack ? (
                        <Pressable onPress={() => router.back()} style={styles.iconButton}>
                            <Feather name="chevron-left" size={28} color={textColor} />
                        </Pressable>
                    ) : (
                        <Pressable onPress={openDrawer} style={styles.iconButton}>
                            <Feather name="menu" size={24} color={textColor} />
                        </Pressable>
                    )}
                </View>

                {/* Center Section - Hidden in detail mode unless forced */}
                <View style={styles.centerSection}>
                    {(!isDetailMode || alwaysShowTitle) && (
                        title === 'LUXE' ? (
                            <Image
                                source={require('@/assets/images/logo.png')}
                                style={{ width: 60, height: 28 }}
                                contentFit="contain"
                            />
                        ) : (
                            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                        )
                    )}
                </View>

                {/* Right Section */}
                <View style={styles.rightSection}>
                    {showWishlist && (
                        <Pressable
                            style={styles.iconButton}
                            onPress={onWishlistPress ? onWishlistPress : () => router.push('/wishlist')}
                        >
                            <HugeiconsIcon
                                icon={FavouriteIcon}
                                size={24}
                                color={textColor}
                            />
                        </Pressable>
                    )}

                    {showShare && (
                        <Pressable style={styles.iconButton}>
                            <HugeiconsIcon icon={Share08Icon} size={24} color={textColor} />
                        </Pressable>
                    )}

                    {!isDetailMode && (
                        <Pressable style={styles.iconButton}>
                            <HugeiconsIcon icon={SearchCustomIcon} size={20} color={textColor} />
                        </Pressable>
                    )}

                    {(showCart || !isDetailMode) && (
                        <Pressable
                            style={styles.iconButton}
                            onPress={() => router.push('/cart')}
                            ref={cartIconRef}
                            onLayout={() => {
                                cartIconRef.current?.measure((x, y, width, height, px, py) => {
                                    setCartTargetPoint({
                                        x: px + width / 2,
                                        y: py + height / 2
                                    });
                                });
                            }}
                        >
                            <HugeiconsIcon icon={ShoppingBag01Icon} size={24} color={textColor} />
                            {cartCount > 0 && (
                                <View style={[styles.badge, isDark && { backgroundColor: '#fff', borderColor: '#000' }]}>
                                    <Text style={[styles.badgeText, isDark && { color: '#000' }]}>{cartCount}</Text>
                                </View>
                            )}
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 8,
        height: 56,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 2,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontFamily: Platform.select({ ios: 'Inter', android: 'Roboto' }),
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    centerSection: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    langButton: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginRight: 4,
    },
    langText: {
        fontSize: 12,
        fontWeight: '700',
    },
    iconButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#000',
        minWidth: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
    },
});
