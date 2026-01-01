import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';

// Constants for the Floating Dock
const DOCK_WIDTH = 320;
const DOCK_HEIGHT = 70;
const INDICATOR_SIZE = 56;

export function LiquidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const activeColor = Colors[colorScheme ?? 'light'].tint;
    const inactiveColor = Colors[colorScheme ?? 'light'].icon;

    // Calculate tab width based on fixed dock size
    const tabWidth = DOCK_WIDTH / state.routes.length;
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);

    React.useEffect(() => {
        // Animate the indicator position
        translateX.value = withSpring(state.index * tabWidth + (tabWidth - INDICATOR_SIZE) / 2, {
            damping: 15,
            stiffness: 150,
            mass: 0.6,
        });

        // Optional "Liquid" Squish effect
        scale.value = withSequence(
            withTiming(1.1, { duration: 100 }),
            withSpring(1, { damping: 10, stiffness: 200 })
        );

    }, [state.index, tabWidth]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { scale: scale.value }
            ],
        };
    });

    return (
        <View style={[styles.container, { bottom: insets.bottom - 20 }]}>
            <BlurView
                intensity={90}
                tint={Platform.OS === 'ios' ? 'systemThinMaterial' : 'default'}
                style={styles.blurView}
            >
                <View style={styles.tabRow}>
                    {/* Active Liquid Indicator */}
                    <Animated.View
                        style={[
                            styles.activeIndicator,
                            {
                                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                            },
                            animatedStyle,
                        ]}
                    />

                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                if (Platform.OS === 'ios') {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                                navigation.navigate(route.name, route.params);
                            }
                        };

                        // Fix Icon Mapping
                        let iconName = 'questionmark';
                        if (route.name === 'index') iconName = 'house.fill';
                        if (route.name === 'shop') iconName = 'bag.fill';
                        if (route.name === 'explore') iconName = 'paperplane.fill';
                        if (route.name === 'profile') iconName = 'person.fill';

                        const validIconName = (iconName === 'house.fill' || iconName === 'bag.fill' || iconName === 'paperplane.fill' || iconName === 'person.fill') ? iconName : 'questionmark';

                        return (
                            <Pressable
                                key={route.key}
                                onPress={onPress}
                                style={styles.tabItem}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <IconSymbol
                                    size={24}
                                    name={validIconName as any}
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
        alignSelf: 'center',
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
