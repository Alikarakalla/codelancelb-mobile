import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/hooks/use-cart-context';
import { useAuth } from '@/hooks/use-auth-context';
import { useCartAnimation } from '@/components/cart/CartAnimationProvider';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Share08Icon, FavouriteIcon } from '@/components/ui/icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

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
    const RouteStack = Stack as any;
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { cartCount } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { setCartTargetPoint } = useCartAnimation();
    const cartIconRef = React.useRef<View>(null);
    const [imageError, setImageError] = React.useState(false);

    // Reset error when avatar changes
    React.useEffect(() => {
        setImageError(false);
    }, [user?.avatar]);

    const isDark = colorScheme === 'dark';
    const textColor = isDark ? '#fff' : '#18181B';
    const iosMajorVersion = Platform.OS === 'ios'
        ? Number(String(Platform.Version).split('.')[0] || 0)
        : 0;
    const stackToolbar = (RouteStack as any)?.Toolbar;
    const isStackNavigationContext = navigation?.getState?.()?.type === 'stack';
    const supportsNativeTopToolbar =
        Platform.OS === 'ios' &&
        iosMajorVersion >= 26 &&
        isStackNavigationContext &&
        !!stackToolbar &&
        !!stackToolbar.View;

    // If back button is enabled, we assume a "Product/Detail" header style
    const isDetailMode = showBack;
    const shouldShowCart = showCart || !isDetailMode;
    const shouldUseNativeToolbarHeader =
        supportsNativeTopToolbar &&
        !isDetailMode &&
        !showShare &&
        !showWishlist;

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    const avatarSource = React.useMemo(() => {
        if (user?.avatar &&
            typeof user.avatar === 'string' &&
            user.avatar.length > 4 &&
            !user.avatar.includes('default') &&
            !user.avatar.includes('placeholder') &&
            user.avatar !== 'null'
        ) {
            if (user.avatar.startsWith('http')) return { uri: user.avatar };
            return { uri: `https://codelanclb.com/storage/${user.avatar}` };
        }
        return null;
    }, [user?.avatar]);

    const handleProfilePress = () => {
        if (isAuthenticated) {
            router.push('/(tabs)/profile');
        } else {
            router.push('/login');
        }
    };

    const renderProfileAvatar = () => {
        if (isAuthenticated) {
            if (!imageError && avatarSource) {
                return (
                    <Image
                        source={avatarSource}
                        style={{ width: 32, height: 32, borderRadius: 16 }}
                        contentFit="cover"
                        onError={() => setImageError(true)}
                    />
                );
            }

            return (
                <LinearGradient
                    colors={['#18181b', '#000000']}
                    style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{getInitials(user?.name)}</Text>
                </LinearGradient>
            );
        }

        return (
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? '#333' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="user" size={18} color={textColor} />
            </View>
        );
    };

    const renderCartButton = (buttonStyle: any = styles.iconButton) => (
        <Pressable
            style={buttonStyle}
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
            <IconSymbol
                name="bag"
                color={textColor}
                size={24}
                weight="medium"
            />
            {cartCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {cartCount}
                    </Text>
                </View>
            )}
        </Pressable>
    );

    if (shouldUseNativeToolbarHeader) {
        return (
            <>
                <RouteStack.Screen
                    options={{
                        headerShown: true,
                        headerTransparent: true,
                        headerTitle: '',
                        headerBackVisible: false,
                        ...(Platform.OS === 'ios' ? {
                            unstable_nativeHeaderOptions: {
                                headerBackground: {
                                    material: 'glass',
                                },
                            }
                        } : {})
                    } as any}
                />

                <RouteStack.Toolbar asChild placement="left">
                    <View style={styles.nativeToolbarLeftGroup}>
                        <Pressable onPress={handleProfilePress} style={styles.nativeToolbarProfileButton}>
                            {renderProfileAvatar()}
                        </Pressable>

                        {title === 'LUXE' ? (
                            <Image
                                source={require('@/assets/images/logo.png')}
                                style={styles.nativeToolbarLogo}
                                contentFit="contain"
                            />
                        ) : (
                            <Text style={[styles.title, styles.nativeToolbarTitle, { color: textColor }]}>
                                {title}
                            </Text>
                        )}
                    </View>
                </RouteStack.Toolbar>

                {shouldShowCart && (
                    <RouteStack.Toolbar asChild placement="right">
                        {renderCartButton(styles.nativeToolbarCartButton)}
                    </RouteStack.Toolbar>
                )}
            </>
        );
    }

    return (
        <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <View style={styles.content}>
                {/* Left Section */}
                <View style={styles.leftSection}>
                    {showBack ? (
                        <Pressable onPress={() => router.back()} style={styles.iconButton}>
                            <Feather name="chevron-left" size={28} color={textColor} />
                        </Pressable>
                    ) : (
                        <Pressable
                            onPress={handleProfilePress}
                            style={[styles.iconButton, { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }]}
                        >
                            {renderProfileAvatar()}
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

                    {shouldShowCart && renderCartButton()}
                </View>
            </View>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        overflow: 'hidden',
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
    iconButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#000',
        minWidth: 16,
        height: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
        paddingHorizontal: 2,
    },
    nativeToolbarLeftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 36,
    },
    nativeToolbarProfileButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nativeToolbarLogo: {
        width: 60,
        height: 28,
        marginLeft: 8,
    },
    nativeToolbarTitle: {
        marginLeft: 8,
        letterSpacing: 1,
        textTransform: 'none',
    },
    nativeToolbarCartButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
