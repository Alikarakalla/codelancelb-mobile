import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

interface LiquidSheetContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    /**
     * Optional custom material for iOS
     */
    iosMaterial?: 'systemChromeMaterial' | 'systemUltraThinMaterial' | 'thickMaterial' | 'regular' | 'prominent' | 'light' | 'dark' | 'extraLight';
}

/**
 * A reusable container for content inside a Native iOS 26 Sheet.
 * Provides the "Glass" background and safe area handling.
 * Uses expo-blur as fallback.
 */
export function LiquidSheetContainer({ children, style, iosMaterial = 'systemChromeMaterial' }: LiquidSheetContainerProps) {
    const insets = useSafeAreaInsets();

    // Convert system materials to roughly equivalent expo-blur tints
    let tint: any = 'light';
    if (iosMaterial === 'systemChromeMaterial') {
        tint = 'extraLight';
    } else if (iosMaterial === 'systemUltraThinMaterial') {
        tint = 'light';
    } else if (iosMaterial === 'thickMaterial') {
        tint = 'regular';
    } else {
        tint = iosMaterial;
    }

    return (
        <View style={styles.container}>
            {/* Background Layer */}
            {Platform.OS === 'ios' ? (
                <BlurView
                    style={StyleSheet.absoluteFill}
                    tint={tint}
                    intensity={95} // High intensity for sheet background
                />
            ) : (
                // Android fallback: Solid background
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#121212' }]} />
            )}

            {/* Content Layer */}
            <View
                style={[
                    styles.content,
                    {
                        paddingBottom: insets.bottom + 16,
                        paddingTop: 24, // Top padding for cleaner look below grabber
                        paddingHorizontal: 16
                    },
                    style
                ]}
            >
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
    }
});
