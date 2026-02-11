import React from 'react';
import {
    Insets,
    Pressable,
    StyleProp,
    StyleSheet,
    ViewStyle,
    GestureResponderEvent,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

interface WishlistHeartButtonProps {
    isWishlisted: boolean;
    isDark?: boolean;
    onPress: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    size?: number;
    iconSize?: number;
    hitSlop?: number | Insets;
}

export function WishlistHeartButton({
    isWishlisted,
    isDark = false,
    onPress,
    style,
    size = 32,
    iconSize = 20,
    hitSlop = 12,
}: WishlistHeartButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            hitSlop={hitSlop}
            style={({ pressed }) => [
                styles.base,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                isDark ? styles.dark : styles.light,
                pressed && styles.pressed,
                style,
            ]}
        >
            <IconSymbol
                name={isWishlisted ? 'heart.fill' : 'heart'}
                size={iconSize}
                color={isWishlisted ? '#EF4444' : (isDark ? '#F8FAFC' : '#111827')}
                weight="medium"
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    light: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderColor: 'rgba(226,232,240,0.9)',
    },
    dark: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        borderColor: 'rgba(71,85,105,0.8)',
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.96 }],
    },
});
