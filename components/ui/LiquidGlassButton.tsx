import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform, ViewStyle, DimensionValue } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
// Use @expo/ui for REAL native glass. If not installed, run: npx expo install @expo/ui
import { GlassEffectContainer } from '@expo/ui/swift-ui';

interface LiquidGlassButtonProps {
    text?: string;
    onPress?: () => void;
    route?: string;
    width?: DimensionValue;
    height?: DimensionValue;
    style?: ViewStyle;
}

export function LiquidGlassButton({
    text = 'Get',
    onPress,
    route,
    width = '100%',
    height = 56,
    style,
}: LiquidGlassButtonProps) {
    const scale = useSharedValue(1);
    const router = useRouter();

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        if (onPress) onPress();
        else if (route) router.push(route as any);
    };

    return (
        <Animated.View style={[styles.wrapper, { width, height }, style, animatedStyle]}>
            <Pressable
                onPress={handlePress}
                onPressIn={() => (scale.value = withSpring(0.95))}
                onPressOut={() => (scale.value = withSpring(1))}
                style={styles.pressable}
            >
                {Platform.OS === 'ios' ? (
                    /* THE NATIVE GLASS LAYER */
                    /* 
                       NOTE: GlassEffectContainer requires a Development Build (npx expo run:ios).
                       It is NOT supported in Expo Go. 
                       Using a synthetic fallback to prevent crash.
                    */
                    // <GlassEffectContainer
                    //     style={StyleSheet.absoluteFill}
                    //     material="systemUltraThinMaterial"
                    // />
                    <View style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(255, 255, 255, 0.65)' }
                    ]} />
                ) : (
                    <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
                )}

                {/* Light reflection tint */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

                <View style={styles.content}>
                    <Text style={styles.text}>{text}</Text>
                </View>

                {/* 3D Glass Edge */}
                <View style={styles.borderOverlay} />
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: { borderRadius: 999, overflow: 'hidden', backgroundColor: 'transparent' },
    pressable: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    androidBackground: { backgroundColor: '#007AFF' },
    borderOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 999,
    },
    content: { zIndex: 10 },
    text: {
        fontSize: 17,
        fontWeight: '700',
        color: '#007AFF',
        letterSpacing: -0.4,
    }
});