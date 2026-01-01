import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, Pressable, StyleSheet, View, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';

// Constants for the Floating Dock
const DOCK_WIDTH = 320;
const DOCK_HEIGHT = 70;
const INDICATOR_SIZE = 56;

const ROUTES = [
    { name: 'index', path: '/', icon: 'house.fill', label: 'Home' },
    { name: 'shop', path: '/shop', icon: 'bag.fill', label: 'Shop' },
    { name: 'explore', path: '/explore', icon: 'paperplane.fill', label: 'Explore' },
    { name: 'profile', path: '/profile', icon: 'person.fill', label: 'Profile' },
];

export function GlobalLiquidTabBar() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const pathname = usePathname();
    const router = useRouter();

    const activeColor = Colors[colorScheme ?? 'light'].tint;
    const inactiveColor = Colors[colorScheme ?? 'light'].icon;

    // Calculate active index based on path
    const getActiveIndex = () => {
        if (pathname === '/') return 0;
        if (pathname.includes('/shop') || pathname.includes('/product')) return 1;
        if (pathname.includes('/explore')) return 2;
        if (pathname.includes('/profile')) return 3;
        return 0;
    };

    const activeIndex = getActiveIndex();
    const tabWidth = DOCK_WIDTH / ROUTES.length;
    const translateX = useSharedValue(activeIndex * tabWidth + (tabWidth - INDICATOR_SIZE) / 2);
    const scale = useSharedValue(1);

    React.useEffect(() => {
        translateX.value = withSpring(activeIndex * tabWidth + (tabWidth - INDICATOR_SIZE) / 2, {
            damping: 15,
            stiffness: 150,
            mass: 0.6,
        });

        scale.value = withSequence(
            withTiming(1.1, { duration: 100 }),
            withSpring(1, { damping: 10, stiffness: 200 })
        );
    }, [activeIndex, tabWidth]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { scale: scale.value }
            ],
        };
    });

    return (
        <View style={[styles.container, { bottom: insets.bottom + 8 }]}>
            <BlurView
                intensity={90}
                tint={Platform.OS === 'ios' ? 'systemThinMaterial' : 'default'}
                style={styles.blurView}
            >
                <View style={styles.tabRow}>
                    <Animated.View
                        style={[
                            styles.activeIndicator,
                            {
                                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                            },
                            animatedStyle,
                        ]}
                    />

                    {ROUTES.map((route, index) => {
                        const isFocused = activeIndex === index;

                        const onPress = () => {
                            if (!isFocused) {
                                if (Platform.OS === 'ios') {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                                router.push(route.path as any);
                            }
                        };

                        return (
                            <Pressable
                                key={route.name}
                                onPress={onPress}
                                style={styles.tabItem}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <IconSymbol
                                    size={24}
                                    name={route.icon as any}
                                    color={isFocused ? activeColor : inactiveColor}
                                    weight="medium"
                                />
                            </Pressable>
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: (Dimensions.get('window').width - DOCK_WIDTH) / 2,
        width: DOCK_WIDTH,
        height: DOCK_HEIGHT,
        borderRadius: 35,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 99,
    },
    blurView: {
        flex: 1,
        borderRadius: 35,
    },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        zIndex: 2,
    },
    activeIndicator: {
        position: 'absolute',
        width: INDICATOR_SIZE,
        height: INDICATOR_SIZE,
        borderRadius: INDICATOR_SIZE / 2,
        top: (DOCK_HEIGHT - INDICATOR_SIZE) / 2,
        left: 0,
        zIndex: 1,
    },
});
