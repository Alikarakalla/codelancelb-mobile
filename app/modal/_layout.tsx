import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function ModalLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                presentation: 'modal',
                // iOS Native Sheet Options (Expo Router / Native Stack)
                ...Platform.select({
                    ios: {
                        presentation: 'modal',
                        headerTransparent: true,
                        headerBlurEffect: 'systemUltraThinMaterial',
                        // Crucial for glass effect to show through white content background
                        contentStyle: { backgroundColor: 'transparent' },
                        // iOS 26 Native Sheet Controls
                        unstable_sheetAllowedDetents: [0.6, 0.9],
                        unstable_sheetCornerRadius: 40,
                        unstable_sheetGrabberVisible: true,
                    },
                    android: {
                        // Android specific fallback already handled by 'modal' presentation usually
                        animation: 'slide_from_bottom',
                    }
                })
            }}
        />
    );
}
